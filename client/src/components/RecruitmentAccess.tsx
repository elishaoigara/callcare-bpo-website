import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Link } from "wouter";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  errorMessage,
  FOUNDER_EMAIL,
  RECRUITER_EMAILS,
} from "@/lib/recruitment";

type Access = { token: string; userId: string; email: string };

export default function RecruitmentAccess({
  children,
}: {
  children: (access: {
    userId: string;
    email: string;
    signOut: () => Promise<void>;
  }) => ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [revision, setRevision] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [access, setAccess] = useState<Access | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setInitialized(true);
      return;
    }
    // Keep this callback synchronous. Auth requests happen in the effect below,
    // outside Supabase's auth lock. INITIAL_SESSION also restores trusted browsers.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setRevision(value => value + 1);
      setAccess(null);
      setError("");
      setSession(nextSession);
      setChecking(Boolean(nextSession));
      setInitialized(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client || !session) return;
    let cancelled = false;
    async function authorize() {
      try {
        const { data, error: userError } = await client!.auth.getUser();
        if (userError) throw userError;
        if (
          data.user?.id !== session!.user.id ||
          !RECRUITER_EMAILS.includes(data.user?.email?.toLowerCase() ?? "")
        ) {
          throw new Error(
            "This workspace is restricted to the authorized CallCare account."
          );
        }
        const { data: allowed, error: roleError } =
          await client!.rpc("is_recruiter");
        if (roleError)
          throw new Error(
            "We could not verify workspace access. Please try signing in again."
          );
        if (!allowed)
          throw new Error(
            "This account has not been granted recruitment access. Please contact the site administrator."
          );
        if (!cancelled)
          setAccess({
            token: session!.access_token,
            userId: data.user.id,
            email: data.user.email!,
          });
      } catch (cause) {
        if (!cancelled)
          setError(errorMessage(cause, "We could not verify your session."));
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    void authorize();
    return () => {
      cancelled = true;
    };
  }, [session, revision]);

  async function signOut() {
    // Unmount every private component before the asynchronous sign-out finishes.
    setAccess(null);
    setSession(null);
    setChecking(false);
    const result = await supabase?.auth.signOut({ scope: "local" });
    if (result?.error)
      setError(
        "Sign-out could not finish. Check your connection and try again."
      );
  }

  if (!supabase)
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold">
          Recruitment is temporarily unavailable.
        </h1>
        <p className="mt-4 text-sm leading-6">
          Please contact info@callcarebpo.com for help.
        </p>
      </Shell>
    );
  if (!initialized || checking)
    return (
      <Shell>
        <div role="status" className="flex items-center gap-3">
          <Loader2 className="animate-spin" /> Checking your secure session…
        </div>
      </Shell>
    );
  if (
    session &&
    access?.token === session.access_token &&
    access.userId === session.user.id
  ) {
    return (
      <div key={`${access.userId}:${access.token}`}>
        {children({ userId: access.userId, email: access.email, signOut })}
      </div>
    );
  }
  if (session)
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold">
          Access unavailable
        </h1>
        <p role="alert" className="mt-4 text-sm leading-6">
          {error || "Please sign in again to continue."}
        </p>
        <button
          onClick={signOut}
          className="mt-6 inline-flex items-center gap-2 font-bold"
        >
          <LogOut size={16} /> Sign out
        </button>
      </Shell>
    );
  return <LoginState externalError={error} />;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f7f4] px-5 py-12 text-[#173226]">
      <div className="w-full max-w-md border border-[#d5e2d9] bg-[#fbfdfc] p-8 shadow-[0_25px_60px_rgba(23,50,38,.08)]">
        <p className="eyebrow mb-5 text-[#7d9e92]">Founder workspace</p>
        {children}
        <Link
          href="/careers"
          className="mt-8 block text-sm font-bold text-[#27503e]"
        >
          ← Back to careers
        </Link>
      </div>
    </main>
  );
}

export function LoginState({ externalError = "" }: { externalError?: string }) {
  const [email, setEmail] = useState(FOUNDER_EMAIL);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || working) return;
    setError("");
    setMessage("");
    const loginEmail = email.trim().toLowerCase();
    if (!RECRUITER_EMAILS.includes(loginEmail)) {
      setError("Use an authorized recruiter email to access this workspace.");
      return;
    }
    setWorking(true);
    try {
      const result =
        mode === "password"
          ? await supabase.auth.signInWithPassword({
              email: loginEmail,
              password,
            })
          : await supabase.auth.signInWithOtp({
              email: loginEmail,
              options: {
                shouldCreateUser: false,
                emailRedirectTo: `${window.location.origin}/recruitment-preview`,
              },
            });
      if (result.error) throw result.error;
      setPassword("");
      if (mode === "magic")
        setMessage(
          "Check your inbox for your secure sign-in link. Once signed in, you can set a password in Account settings."
        );
    } catch (cause) {
      setError(
        mode === "password"
          ? "We couldn't sign you in. Check your password, or use an email link below."
          : errorMessage(
              cause,
              "We couldn't send a sign-in link. Please try again."
            )
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <Shell>
      <h1 className="font-display text-4xl font-semibold tracking-[-.06em]">
        Sign in to review candidates.
      </h1>
      <p className="mt-4 text-sm leading-6 text-[#6c8479]">
        {mode === "password"
          ? "Use your authorized recruiter email and password."
          : "We'll email you a secure link to sign in."}
      </p>
      <form onSubmit={signIn} className="mt-7 space-y-4">
        <label className="block text-sm font-semibold">
          Email
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            disabled={working}
            onChange={e => setEmail(e.target.value)}
            className="mt-2 w-full border border-[#c4d6cb] bg-white px-3 py-3"
          />
        </label>
        {mode === "password" && (
          <label className="block text-sm font-semibold">
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={working}
              onChange={e => setPassword(e.target.value)}
              className="mt-2 w-full border border-[#c4d6cb] bg-white px-3 py-3"
            />
          </label>
        )}
        <p className="text-xs leading-5 text-[#6c8479]">
          Stay signed in on this trusted browser. Sign out when using a shared
          device. You may occasionally be asked to sign in again.
        </p>
        <button
          disabled={working}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {working && <Loader2 size={16} className="animate-spin" />}
          {mode === "password" ? "Sign in" : "Send secure email link"}
        </button>
      </form>
      <button
        disabled={working}
        onClick={() => {
          setMode(mode === "password" ? "magic" : "password");
          setPassword("");
          setError("");
          setMessage("");
        }}
        className="mt-5 text-sm font-bold text-[#27503e] underline underline-offset-4"
      >
        {mode === "password"
          ? "Forgot or haven't set a password? Use an email link"
          : "Sign in with a password instead"}
      </button>
      {message && (
        <p role="status" className="mt-5 bg-[#eaf3ee] p-4 text-sm leading-6">
          {message}
        </p>
      )}
      {(error || externalError) && (
        <p
          role="alert"
          className="mt-5 bg-[#fff5f3] p-4 text-sm text-[#9a4139]"
        >
          {error || externalError}
        </p>
      )}
    </Shell>
  );
}
