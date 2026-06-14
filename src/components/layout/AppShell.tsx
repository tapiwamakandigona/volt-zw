"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  Calculator,
  Gauge,
  Settings,
  Sparkles,
  LifeBuoy,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

const NAV = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/tokens", label: "Token Vault", icon: Wallet },
  { href: "/app/calculator", label: "Calculator", icon: Calculator },
  { href: "/app/meters", label: "My Meters", icon: Gauge },
  { href: "/app/assistant", label: "Ask VoltZW", icon: Sparkles },
  { href: "/app/recovery", label: "Token Recovery", icon: LifeBuoy },
  { href: "/app/outages", label: "Outage Map", icon: MapPin },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-sidebar px-3 py-5 md:flex">
        <Link href="/app" className="mb-8 px-2">
          <Logo />
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-600/15 text-primary-300"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main column */}
      <div className="md:pl-60">
        <TopBar title={title} />
        <main className="mx-auto max-w-2xl px-5 pb-24 pt-5 md:pb-10">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
