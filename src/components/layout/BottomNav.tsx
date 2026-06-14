"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Calculator, Gauge, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/tokens", label: "Tokens", icon: Wallet },
  { href: "/app/calculator", label: "Calc", icon: Calculator },
  { href: "/app/meters", label: "Meters", icon: Gauge },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-panel/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary-400" : "text-muted hover:text-white",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-primary-500/15")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
