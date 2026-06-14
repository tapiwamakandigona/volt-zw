"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Plus, Trash2, Copy, Check, Loader2, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/appStore";
import { listMeters, listTokens, createToken, deleteToken } from "@/lib/database";
import { calculateUnits } from "@/lib/tariff";
import { usd, kwh, formatTokenCode, isValidTokenCode } from "@/lib/utils";
import type { Token } from "@/types";

const SOURCES = ["EcoCash", "OneMoney", "FBC", "CBZ", "CABS", "Other"];

export default function TokensPage() {
  const { meters, setMeters, activeMeterId, setActiveMeter } = useAppStore();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      const [ms, ts] = await Promise.all([listMeters(), listTokens()]);
      setMeters(ms);
      setTokens(ts);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // Auto-open the add form when arriving from a "?add=1" quick action.
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add")) {
      setShowForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = activeMeterId ? tokens.filter((t) => t.meterId === activeMeterId) : tokens;
  const totalSpent = visible.reduce((s, t) => s + (t.amountPaid || 0), 0);
  const totalUnits = visible.reduce((s, t) => s + (t.unitsReceived || 0), 0);

  async function onDelete(id: string) {
    if (!confirm("Delete this token from your vault?")) return;
    await deleteToken(id);
    refresh();
  }

  return (
    <AppShell title="Token Vault">
      <section className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">Token Vault</h1>
              <p className="text-xs text-muted">Every token, safe and searchable.</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={meters.length === 0}
            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {/* Meter filter */}
        {meters.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <Chip active={!activeMeterId} onClick={() => setActiveMeter(null)} label="All meters" />
            {meters.map((m) => (
              <Chip
                key={m.$id}
                active={activeMeterId === m.$id}
                onClick={() => setActiveMeter(m.$id)}
                label={m.nickname}
              />
            ))}
          </div>
        )}

        {/* Summary */}
        {visible.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-panel p-4 text-center">
            <Stat label="Tokens" value={String(visible.length)} />
            <Stat label="Units" value={kwh(totalUnits)} accent />
            <Stat label="Spent" value={usd(totalSpent)} />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="mt-5 h-24 animate-pulse rounded-2xl bg-panel" />
        ) : meters.length === 0 ? (
          <EmptyState
            title="Add a meter first"
            text="Head to My Meters to add your prepaid meter, then come back to log tokens."
          />
        ) : visible.length === 0 ? (
          <EmptyState title="No tokens yet" text="Tap Add to log your first token purchase." />
        ) : (
          <ul className="mt-5 space-y-2">
            {visible.map((t) => (
              <TokenRow key={t.$id} token={t} meterName={meters.find((m) => m.$id === t.meterId)?.nickname} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </section>

      {showForm && (
        <TokenForm
          meters={meters}
          defaultMeterId={activeMeterId ?? meters.find((m) => m.isDefault)?.$id ?? meters[0]?.$id}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </AppShell>
  );
}

function TokenRow({
  token,
  meterName,
  onDelete,
}: {
  token: Token;
  meterName?: string;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(token.tokenCode.replace(/\D/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <li className="rounded-2xl border border-border bg-panel p-3">
      <div className="flex items-center justify-between gap-2">
        <button onClick={copy} className="group flex min-w-0 items-center gap-2 text-left">
          <span className="truncate font-mono text-sm">{formatTokenCode(token.tokenCode)}</span>
          {copied ? (
            <Check className="h-4 w-4 shrink-0 text-primary-400" />
          ) : (
            <Copy className="h-4 w-4 shrink-0 text-muted group-hover:text-white" />
          )}
        </button>
        <button
          onClick={() => onDelete(token.$id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span>
          {new Date(token.purchaseDate).toLocaleDateString()}
          {meterName ? ` · ${meterName}` : ""}
          {token.source ? ` · ${token.source}` : ""}
        </span>
        <span className="font-semibold text-white">
          {usd(token.amountPaid)}
          {token.unitsReceived ? <span className="text-primary-400"> · {kwh(token.unitsReceived)}</span> : null}
        </span>
      </div>
    </li>
  );
}

function TokenForm({
  meters,
  defaultMeterId,
  onClose,
  onSaved,
}: {
  meters: { $id: string; nickname: string }[];
  defaultMeterId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [meterId, setMeterId] = useState(defaultMeterId ?? "");
  const [tokenCode, setTokenCode] = useState("");
  const [amount, setAmount] = useState("");
  const [units, setUnits] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("EcoCash");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const suggested = useMemo(() => {
    const a = parseFloat(amount) || 0;
    if (a <= 0) return 0;
    return calculateUnits(a).totalUnits;
  }, [amount]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!meterId) return setError("Choose a meter.");
    if (!isValidTokenCode(tokenCode)) return setError("Token code must be 20 digits.");
    const a = parseFloat(amount);
    if (!a || a <= 0) return setError("Enter the amount you paid.");
    setBusy(true);
    try {
      await createToken({
        meterId,
        tokenCode: tokenCode.replace(/\D/g, ""),
        amountPaid: a,
        unitsReceived: units ? parseFloat(units) : suggested || undefined,
        purchaseDate: new Date(date).toISOString(),
        source,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save token.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/60 p-0 sm:p-5">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-panel p-5 animate-fade-in-up"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add token</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted">Meter</span>
            <select
              value={meterId}
              onChange={(e) => setMeterId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              {meters.map((m) => (
                <option key={m.$id} value={m.$id}>
                  {m.nickname}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted">Token code (20 digits)</span>
            <input
              inputMode="numeric"
              value={tokenCode}
              onChange={(e) => setTokenCode(e.target.value)}
              placeholder="1234 5678 9012 3456 7890"
              className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 font-mono text-sm outline-none focus:border-primary-600"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted">Amount paid ($)</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20"
                className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Units (kWh)</span>
              <input
                inputMode="decimal"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder={suggested ? `~${suggested}` : "auto"}
                className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
              />
            </label>
          </div>
          {suggested > 0 && !units && (
            <p className="text-[11px] text-muted">
              Estimated ~{kwh(suggested)} from the tariff calculator. Enter the exact units from
              your receipt if you have them.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Paid via</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save token
          </button>
        </div>
      </form>
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
        (active ? "bg-primary-600 text-white" : "border border-border bg-panel text-muted hover:text-white")
      }
    >
      {label}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={"mt-0.5 text-sm font-bold " + (accent ? "text-primary-400" : "")}>{value}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-panel/50 p-8 text-center">
      <Wallet className="mx-auto h-8 w-8 text-muted" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="text-xs text-muted">{text}</p>
    </div>
  );
}
