"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { register } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import GoogleButton from "@/components/GoogleButton";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      setUser(user);
      router.push("/app");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not create your account.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 py-10">
      <div className="w-full max-w-sm animate-fade-in-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </span>
          <span className="text-xl font-bold">VoltZW</span>
        </Link>

        <h1 className="text-center text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Start tracking your tokens in seconds.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm outline-none focus:border-primary-600"
          />
          <input
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm outline-none focus:border-primary-600"
          />
          <input
            type="password"
            required
            placeholder="Password (8+ characters)"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm outline-none focus:border-primary-600"
          />
          <input
            type="password"
            required
            placeholder="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm outline-none focus:border-primary-600"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton label="Sign up with Google" />

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-400 hover:text-primary-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
