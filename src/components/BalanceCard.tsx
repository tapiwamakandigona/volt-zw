"use client";

import { useEffect, useState } from "react";
import { Battery, BatteryWarning, BatteryLow, Plus, Loader2, X, TrendingDown } from "lucide-react";
import { logBalance, latestBalances } from "@/lib/database";
import { balanceStatus, daysRemaining, BALANCE_THRESHOLDS } from "@/lib/tariff";
import { kwh } from "@/lib/utils";
import { alertsEnabled, maybeNotifyLowBalance } from "@/lib/notify";
import type { Meter, BalanceLog } from "@/types";

const STATUS_STYLE = {
  safe: { ring: "border-primary-600/40", text: "text-primary-400", Icon: Battery, label: "Healthy" },
  warning: { ring: "border-amber-500/50", text: "text-amber-400", Icon: BatteryWarning, label: "Running low" },
  critical: { ring: "border-danger/60", text: "text-danger", Icon: BatteryLow, label: "Critical" },
  unknown: { ring: "border-border", text: "text-muted", Icon: Battery, label: "No reading" },
} as const;

export default function BalanceCard({ meter }: { meter: Meter | null }) {
  const [log, setLog] = useState<BalanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    if (!meter) {
      setLoading(false);
      return;
    }
    try {
      const map = await latestBalances();
      setLog(map[meter.$id] ?? null);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meter?.$id]);

  const units = log?.estimatedBalance ?? null;
  const status = balanceStatus(units);
  const style = STATUS_STYLE[status];
  const days = log ? daysRemaining(log.estimatedBalance, log.dailyUsageRate ?? 0) : null;

  // Fire a one-shot low-balance notification when enabled.
  useEffect(() => {
    if (!meter || units == null) return;
    if ((status === "warning" || status === "critical") && alertsEnabled()) {
      maybeNotifyLowBalance(meter.nickname, units, status === "critical");
    }
  }, [meter, units, status]);

  if (loading) return <div className="h-28 animate-pulse rounded-2xl bg-panel" />;

  const Icon = style.Icon;

  return (
    <>
      <div className={`rounded-2xl border bg-panel p-4 ${style.ring}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-xl bg-white/5 ${style.text}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs text-muted">
                Estimated balance{meter ? ` · ${meter.nickname}` : ""}
              </p>
              {units == null ? (
                <p className="text-lg font-bold text-muted">— kWh</p>
              ) : (
                <p className="text-2xl font-extrabold">{kwh(units)}</p>
              )}
              <p className={`text-xs font-medium ${style.text}`}>
                {style.label}
                {days != null ? ` · ~${days} day${days === 1 ? "" : "s"} left` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={!meter}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Update
          </button>
        </div>

        {(status === "warning" || status === "critical") && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
              status === "critical" ? "bg-danger/10 text-danger" : "bg-amber-500/10 text-amber-400"
            }`}
          >
            <TrendingDown className="h-4 w-4 shrink-0" />
            {status === "critical"
              ? "Buy tokens now to avoid a blackout."
              : "Consider topping up soon."}
          </div>
        )}
      </div>

      {showForm && meter && (
        <BalanceForm
          meter={meter}
          previous={log}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </>
  );
}

function BalanceForm({
  meter,
  previous,
  onClose,
  onSaved,
}: {
  meter: Meter;
  previous: BalanceLog | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [balance, setBalance] = useState("");
  const [usage, setUsage] = useState(previous?.dailyUsageRate ? String(previous.dailyUsageRate) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-estimate daily usage from the change since the last reading.
  function estimateUsage(currentBalance: number): number | undefined {
    if (!previous) return usage ? parseFloat(usage) : undefined;
    const days = (Date.now() - new Date(previous.logDate).getTime()) / 86_400_000;
    if (days < 0.5) return usage ? parseFloat(usage) : previous.dailyUsageRate;
    const used = previous.estimatedBalance - currentBalance;
    if (used <= 0) return usage ? parseFloat(usage) : previous.dailyUsageRate;
    return Math.round((used / days) * 10) / 10;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const b = parseFloat(balance);
    if (isNaN(b) || b < 0) return setError("Enter the units showing on your meter.");
    setBusy(true);
    try {
      await logBalance({
        meterId: meter.$id,
        estimatedBalance: b,
        dailyUsageRate: usage ? parseFloat(usage) : estimateUsage(b),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save reading.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-t-3xl border border-border bg-panel p-5 animate-fade-in-up sm:rounded-3xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold">Update balance</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">
          Check the kWh balance on your meter and enter it below — we&apos;ll track it down for you and
          warn you before it runs out.
        </p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted">Current balance (kWh)</span>
            <input
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="e.g. 85"
              className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Daily usage (kWh/day) — optional</span>
            <input
              inputMode="decimal"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder={previous ? "auto from your last reading" : "auto"}
              className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            />
          </label>
          <p className="text-[11px] text-muted">
            Tip: alerts trigger below {BALANCE_THRESHOLDS.warning} kWh. Enable them in Settings.
          </p>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save reading
          </button>
        </div>
      </form>
    </div>
  );
}
