"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Calculator,
  Gauge,
  Plus,
  ArrowRight,
  Sparkles,
  LifeBuoy,
  MapPin,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import BalanceCard from "@/components/BalanceCard";
import SpendChart from "@/components/SpendChart";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { listMeters, listTokens } from "@/lib/database";
import { usd, kwh, formatTokenCode } from "@/lib/utils";
import type { Token, Meter } from "@/types";

const QUICK = [
  { href: "/app/tokens?add=1", label: "Add token", icon: Plus },
  { href: "/app/calculator", label: "Calculator", icon: Calculator },
  { href: "/app/meters", label: "My meters", icon: Gauge },
];

const EXPLORE = [
  {
    href: "/app/recovery",
    label: "Token Recovery",
    desc: "Recover a lost token",
    icon: LifeBuoy,
  },
  {
    href: "/app/outages",
    label: "Outage Map",
    desc: "Live power reports nearby",
    icon: MapPin,
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { meters, setMeters } = useAppStore();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ms, toks] = await Promise.all([listMeters(), listTokens()]);
        setMeters(ms);
        setTokens(toks);
      } catch {
        /* ignore — likely empty state */
      } finally {
        setLoading(false);
      }
    })();
  }, [setMeters]);

  const totalSpent = tokens.reduce((s, t) => s + (t.amountPaid || 0), 0);
  const totalUnits = tokens.reduce((s, t) => s + (t.unitsReceived || 0), 0);
  const defaultMeter: Meter | null =
    meters.find((m) => m.isDefault) ?? meters[0] ?? null;

  return (
    <AppShell title="Home">
      <section className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">
          Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s your electricity at a glance.</p>
      </section>

      {/* Balance + alerts */}
      <section className="mt-5">
        <BalanceCard meter={defaultMeter} />
      </section>

      {/* Stat cards */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-panel p-4">
          <p className="text-xs text-muted">Tokens logged</p>
          <p className="tnum mt-1 text-2xl font-bold">{loading ? "—" : tokens.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-4">
          <p className="text-xs text-muted">Total units</p>
          <p className="tnum mt-1 text-2xl font-bold text-primary-400">
            {loading ? "—" : kwh(totalUnits)}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-gradient-to-br from-primary-600/20 to-panel p-4">
          <p className="text-xs text-muted">Total spent on power</p>
          <p className="tnum mt-1 text-3xl font-bold">{loading ? "—" : usd(totalSpent)}</p>
        </div>
      </section>

      {/* Spend chart */}
      <section className="mt-3">
        <SpendChart tokens={tokens} />
      </section>

      {/* Quick actions */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Quick actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="press flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-panel p-4 text-center text-xs font-medium transition-colors hover:border-primary-600/50 active:border-primary-600/50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Ask VoltZW (live) */}
      <section className="mt-6">
        <Link
          href="/app/assistant"
          className="press flex items-center gap-3 rounded-2xl border border-primary-600/30 bg-gradient-to-br from-primary-600/15 to-panel p-4 transition-colors hover:border-primary-600/60 active:border-primary-600/60"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-600/20 text-primary-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Ask VoltZW</p>
            <p className="truncate text-xs text-muted">
              Free AI helper for ZESA, tokens &amp; saving power.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary-400" />
        </Link>
      </section>

      {/* Explore */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Explore</h2>
        <div className="grid grid-cols-2 gap-3">
          {EXPLORE.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="press rounded-2xl border border-border bg-panel p-4 transition-colors hover:border-primary-600/50 active:border-primary-600/50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-2 text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent tokens */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Recent tokens</h2>
          <Link href="/app/tokens" className="flex items-center gap-1 text-xs text-primary-400">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="h-20 animate-pulse rounded-2xl bg-panel" />
        ) : tokens.length === 0 ? (
          <Link
            href="/app/tokens?add=1"
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-panel/50 p-8 text-center"
          >
            <Wallet className="h-8 w-8 text-muted" />
            <p className="text-sm font-medium">No tokens yet</p>
            <p className="text-xs text-muted">Add your first token to start tracking.</p>
          </Link>
        ) : (
          <ul className="space-y-2">
            {tokens.slice(0, 4).map((t) => (
              <li
                key={t.$id}
                className="flex items-center justify-between rounded-2xl border border-border bg-panel p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{formatTokenCode(t.tokenCode)}</p>
                  <p className="text-xs text-muted">
                    {new Date(t.purchaseDate).toLocaleDateString()} · {t.source || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tnum text-sm font-semibold">{usd(t.amountPaid)}</p>
                  {t.unitsReceived ? (
                    <p className="text-xs text-primary-400">{kwh(t.unitsReceived)}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
