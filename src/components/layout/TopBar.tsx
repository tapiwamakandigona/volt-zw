"use client";

import { LogoMark } from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";

export default function TopBar({ title }: { title?: string }) {
  const { user, isPremium } = useAuthStore();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-ink/90 px-5 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <LogoMark className="h-8 w-8" />
        <span className="text-base font-bold">{title ?? "VoltZW"}</span>
      </div>
      <div className="flex items-center gap-2">
        {isPremium && (
          <span className="rounded-full bg-primary-600/15 px-2 py-0.5 text-[11px] font-semibold text-primary-400">
            Premium
          </span>
        )}
        <span className="grid h-8 w-8 place-items-center rounded-full bg-panel text-xs font-semibold uppercase text-white/80">
          {(user?.name || user?.email || "?").charAt(0)}
        </span>
      </div>
    </header>
  );
}
