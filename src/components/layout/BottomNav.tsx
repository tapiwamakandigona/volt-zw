"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Calculator, Gauge, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { tapLight } from "@/lib/haptics";

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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-panel/85 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                onClick={() => tapLight()}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press relative flex min-h-[52px] flex-col items-center justify-center gap-1 pb-1.5 pt-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary-400" : "text-muted hover:text-white",
                )}
              >
                {/* active indicator pill */}
                <span
                  className={cn(
                    "absolute top-0 h-0.5 w-7 rounded-full bg-primary-400 transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-transform",
                    active && "scale-105 fill-primary-500/15",
                  )}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={cn(active && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
