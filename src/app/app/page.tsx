"use client";

import { Zap, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/lib/auth";

export default function Dashboard() {
  const router = useRouter();
  const { user, reset } = useAuthStore();

  async function onLogout() {
    await logout();
    reset();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-ink px-5 py-6 text-white">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </span>
            <span className="text-lg font-bold">VoltZW</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </header>

        <section className="mt-10 rounded-2xl border border-border bg-panel p-8 text-center animate-fade-in-up">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-600/15 text-primary-400">
            <Zap className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your dashboard is being built. Coming next: balance card, token vault,
            tariff calculator and more.
          </p>
        </section>
      </div>
    </main>
  );
}
