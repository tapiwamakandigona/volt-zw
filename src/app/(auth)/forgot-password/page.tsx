"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Loader2 } from "lucide-react";
import { sendPasswordRecovery } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await sendPasswordRecovery(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <div className="w-full max-w-sm animate-fade-in-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </span>
          <span className="text-xl font-bold">VoltZW</span>
        </Link>
        <h1 className="text-center text-2xl font-bold">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-center text-sm text-muted">
            If an account exists for {email}, a reset link is on its way. Check
            your inbox.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="press flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 active:bg-primary-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary-400 hover:text-primary-300">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
