import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/recruitment";

export default function PasswordSettings() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || working) return;
    setError("");
    if (password.length < 12 || password !== confirmation) {
      setError(
        "Use at least 12 characters and make sure both passwords match."
      );
      return;
    }
    setWorking(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setPassword("");
      setConfirmation("");
      toast.success(
        "Password saved. Use your email and password next time you sign in."
      );
    } catch (cause) {
      setError(
        errorMessage(
          cause,
          "We couldn't save your password. Please sign in again and retry."
        )
      );
    } finally {
      setWorking(false);
    }
  }
  return (
    <section
      id="settings"
      className="mt-8 border border-[#d5e2d9] bg-[#fbfdfc] p-6"
    >
      <p className="section-kicker">Account settings</p>
      <h2 className="mt-3 font-display text-2xl font-semibold">
        Set or change your password
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#516b5e]">
        If you signed in with an email link, set a password here for your next
        visit. Your session stays signed in on this browser until you sign out
        or need to authenticate again.
      </p>
      <form onSubmit={save} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-semibold">
          New password
          <input
            required
            minLength={12}
            type="password"
            autoComplete="new-password"
            value={password}
            disabled={working}
            onChange={e => setPassword(e.target.value)}
            className="mt-2 w-full border border-[#c4d6cb] px-3 py-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Confirm new password
          <input
            required
            minLength={12}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            disabled={working}
            onChange={e => setConfirmation(e.target.value)}
            className="mt-2 w-full border border-[#c4d6cb] px-3 py-3"
          />
        </label>
        <p className="text-xs text-[#516b5e]">
          Use at least 12 characters. A unique passphrase works well.
        </p>
        <button
          disabled={working}
          className="rounded-full bg-[#27503e] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {working ? "Saving…" : "Save password"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-[#9a4139]">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
