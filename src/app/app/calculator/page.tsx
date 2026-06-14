"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { calculateUnits, TARIFF_TIERS, MONTHLY_FIXED_CHARGE_USD } from "@/lib/tariff";
import { usd, kwh } from "@/lib/utils";

export default function CalculatorPage() {
  const [amount, setAmount] = useState("20");
  const [already, setAlready] = useState("0");

  const result = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const u = parseFloat(already) || 0;
    return calculateUnits(a, u);
  }, [amount, already]);

  return (
    <AppShell title="Calculator">
      <section className="animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Tariff Calculator</h1>
            <p className="text-xs text-muted">See exactly how many units your money buys.</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-3 rounded-2xl border border-border bg-panel p-4">
          <label className="block">
            <span className="text-xs text-muted">How much are you buying? (USD)</span>
            <div className="mt-1 flex items-center rounded-xl border border-border bg-ink px-3">
              <span className="text-muted">$</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent px-2 py-2.5 text-lg font-semibold outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted">
              Units already bought this month (kWh)
            </span>
            <input
              inputMode="decimal"
              value={already}
              onChange={(e) => setAlready(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-ink px-3 py-2.5 text-sm outline-none"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Leave at 0 if this is your first purchase this month.
            </span>
          </label>
        </div>

        {/* Result */}
        <div className="mt-4 rounded-2xl border border-primary-600/40 bg-gradient-to-br from-primary-600/20 to-panel p-5 text-center">
          <p className="text-xs text-muted">You&apos;ll receive about</p>
          <p className="mt-1 text-4xl font-extrabold text-primary-400">
            {kwh(result.totalUnits)}
          </p>
          <p className="mt-1 text-sm text-muted">
            for {usd(result.totalCostUSD)} · you&apos;re in {result.currentTierLabel}
          </p>
        </div>

        {/* Breakdown */}
        <div className="mt-4 rounded-2xl border border-border bg-panel p-4">
          <h2 className="mb-3 text-sm font-semibold">How it breaks down</h2>
          <div className="space-y-2 text-sm">
            {result.fixedChargeUSD > 0 && (
              <Row label="Monthly fixed charge" value={usd(result.fixedChargeUSD)} muted />
            )}
            {result.breakdown.map((b) => (
              <Row
                key={b.label}
                label={`${b.label} · ${usd(b.rateUSD)}/kWh`}
                value={`${kwh(b.units)} · ${usd(b.costUSD)}`}
              />
            ))}
            <div className="border-t border-border pt-2">
              <Row label="Total" value={`${kwh(result.totalUnits)} · ${usd(result.totalCostUSD)}`} bold />
            </div>
          </div>
        </div>

        {/* Explainer */}
        <div className="mt-4 flex gap-2 rounded-2xl border border-border bg-panel/50 p-4 text-xs text-muted">
          <Info className="h-4 w-4 shrink-0 text-primary-400" />
          <p>
            ZESA uses a <strong className="text-white">stepped tariff</strong>: the more
            units you buy in a month, the higher the price per kWh. Buying earlier in the
            month (lower tier) gives you more units per dollar. A {usd(MONTHLY_FIXED_CHARGE_USD)}{" "}
            fixed charge applies on your first purchase each month. Rates are indicative —
            verify current ZESA prices.
          </p>
        </div>

        {/* Tier reference */}
        <div className="mt-4 rounded-2xl border border-border bg-panel p-4">
          <h2 className="mb-2 text-sm font-semibold">Current tiers</h2>
          <ul className="space-y-1.5 text-sm">
            {TARIFF_TIERS.map((t) => (
              <li key={t.label} className="flex justify-between">
                <span className="text-muted">
                  {t.label} ({t.min}–{t.max === Infinity ? "∞" : t.max} kWh)
                </span>
                <span className="font-medium">{usd(t.rateUSD)}/kWh</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className={muted ? "text-muted" : "text-white/80"}>{label}</span>
      <span className={bold ? "font-bold text-primary-400" : "font-medium"}>{value}</span>
    </div>
  );
}
