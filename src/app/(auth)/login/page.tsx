"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import GoogleButton from "@/components/GoogleButton";
import { LogoMark } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      setUser(user);
      router.push("/app");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not log in. Check your details.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <div className="w-full max-w-sm animate-fade-in-up">
        <Link href="/" className="mb-8 flex flex-col items-center justify-center gap-3">
          <LogoMark className="h-16 w-16" />
          <span className="text-xl font-extrabold tracking-tight">
            Volt<span className="text-primary-400">ZW</span>
          </span>
        </Link>

        <h1 className="text-center text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Log in to your token vault.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
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
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm outline-none focus:border-primary-600"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton />

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-muted hover:text-white">
            Forgot password?
          </Link>
          <Link href="/register" className="text-primary-400 hover:text-primary-300">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
