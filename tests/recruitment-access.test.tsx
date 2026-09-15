// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import RecruitmentAccess, {
  LoginState,
} from "../client/src/components/RecruitmentAccess";
const mock = vi.hoisted(() => ({
  callback: null as null | ((event: string, session: any) => void),
  getUser: vi.fn(),
  rpc: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOtp: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (callback: typeof mock.callback) => {
        mock.callback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      getUser: mock.getUser,
      signInWithPassword: mock.signInWithPassword,
      signInWithOtp: mock.signInWithOtp,
      signOut: mock.signOut,
    },
    rpc: mock.rpc,
  },
}));
const session = {
  access_token: "token-one",
  user: { id: "founder", email: "info@callcarebpo.com" },
};
beforeEach(() => {
  vi.clearAllMocks();
  mock.getUser.mockResolvedValue({ data: { user: session.user }, error: null });
  mock.rpc.mockResolvedValue({ data: true, error: null });
  mock.signInWithPassword.mockResolvedValue({ error: null });
  mock.signInWithOtp.mockResolvedValue({ error: null });
  mock.signOut.mockResolvedValue({ error: null });
});
afterEach(cleanup);
function mount() {
  return render(
    <RecruitmentAccess>
      {({ signOut }) => (
        <div>
          Private candidate details<button onClick={signOut}>Sign out</button>
        </div>
      )}
    </RecruitmentAccess>
  );
}
it("restores a saved session only after server user and recruiter verification", async () => {
  mount();
  expect(screen.queryByText("Private candidate details")).toBeNull();
  act(() => mock.callback!("INITIAL_SESSION", session));
  await screen.findByText("Private candidate details");
  expect(mock.getUser).toHaveBeenCalled();
  expect(mock.rpc).toHaveBeenCalledWith("is_recruiter");
});
it("immediately clears private content on sign-out and on an account change", async () => {
  mount();
  act(() => mock.callback!("INITIAL_SESSION", session));
  await screen.findByText("Private candidate details");
  fireEvent.click(screen.getByText("Sign out"));
  expect(screen.queryByText("Private candidate details")).toBeNull();
  await waitFor(() =>
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" })
  );
  mock.getUser.mockResolvedValue({
    data: { user: { id: "outsider", email: "outsider@example.invalid" } },
    error: null,
  });
  act(() =>
    mock.callback!("SIGNED_IN", {
      access_token: "other-token",
      user: { id: "outsider", email: "outsider@example.invalid" },
    })
  );
  await screen.findByText("Access unavailable");
  expect(screen.queryByText("Private candidate details")).toBeNull();
});
it("ignores a slow authorization response after the user signs out", async () => {
  let resolve!: (result: any) => void;
  mock.getUser.mockReturnValue(
    new Promise(r => {
      resolve = r;
    })
  );
  mount();
  act(() => mock.callback!("INITIAL_SESSION", session));
  act(() => mock.callback!("SIGNED_OUT", null));
  await act(async () => {
    resolve({ data: { user: session.user }, error: null });
  });
  expect(screen.queryByText("Private candidate details")).toBeNull();
});
it("reauthorizes even when an auth event reuses the same session object", async () => {
  mount();
  act(() => mock.callback!("INITIAL_SESSION", session));
  await screen.findByText("Private candidate details");
  mock.rpc.mockResolvedValue({ data: false, error: null });
  act(() => mock.callback!("SIGNED_IN", session));
  await screen.findByText("Access unavailable");
  expect(screen.queryByText("Private candidate details")).toBeNull();
});
it("uses password login by default and disables account creation in magic fallback", async () => {
  render(<LoginState />);
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "correct horse battery staple" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Sign in" }).closest("form")!
  );
  await waitFor(() =>
    expect(mock.signInWithPassword).toHaveBeenCalledWith({
      email: "info@callcarebpo.com",
      password: "correct horse battery staple",
    })
  );
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  fireEvent.click(
    screen.getByText("Forgot or haven't set a password? Use an email link")
  );
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Send secure email link" })
      .closest("form")!
  );
  await waitFor(() =>
    expect(mock.signInWithOtp).toHaveBeenCalledWith({
      email: "info@callcarebpo.com",
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/recruitment-preview`,
      },
    })
  );
});

it("allows Lambert's verified active recruiter session", async () => {
  const lambert = {
    access_token: "lambert-token",
    user: { id: "lambert", email: "lambertelisha732@gmail.com" },
  };
  mock.getUser.mockResolvedValue({ data: { user: lambert.user }, error: null });
  mount();
  act(() => mock.callback!("INITIAL_SESSION", lambert));
  await screen.findByText("Private candidate details");
  expect(mock.rpc).toHaveBeenCalledWith("is_recruiter");
});

it("uses Lambert's entered address for password and magic-link login", async () => {
  render(<LoginState />);
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "lambertelisha732@gmail.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test password only" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Sign in" }).closest("form")!
  );
  await waitFor(() =>
    expect(mock.signInWithPassword).toHaveBeenCalledWith({
      email: "lambertelisha732@gmail.com",
      password: "test password only",
    })
  );
  fireEvent.click(screen.getByRole("button", { name: /Use an email link/ }));
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Send secure email link" })
      .closest("form")!
  );
  await waitFor(() =>
    expect(mock.signInWithOtp).toHaveBeenCalledWith({
      email: "lambertelisha732@gmail.com",
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/recruitment-preview`,
      },
    })
  );
});
