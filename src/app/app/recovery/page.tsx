"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, Copy, Check, RotateCcw, ShieldCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { listTokens, markTokenRecovered } from "@/lib/database";
import { formatTokenCode, usd, kwh } from "@/lib/utils";
import type { Token } from "@/types";

const STEPS = [
  {
    title: "Find your last token",
    body: "Every token you logged in VoltZW is saved below — even if you lost the paper slip or the SMS. Tap a token to copy the 20-digit code and re-enter it on your meter.",
  },
  {
    title: "Re-enter on the meter",
    body: "Punch the 20-digit code into your prepaid meter keypad. A token can be safely re-entered on the same meter — it won't double-charge you.",
  },
  {
    title: "Lost a token you never logged?",
    body: "Dial your vendor's recovery line: EcoCash *151# → ZESA, or call ZETDC on 0242 774 508 / 4. Have your meter number and the EcoCash/bank reference of the purchase ready.",
  },
  {
    title: "Keep it from happening again",
    body: "Log every purchase in VoltZW the moment you buy. Your tokens stay encrypted to your account and searchable forever.",
  },
];

export default function RecoveryPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      setTokens(await listTokens());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleRecovered(t: Token) {
    setTokens((list) =>
      list.map((x) => (x.$id === t.$id ? { ...x, isRecovered: !x.isRecovered } : x)),
    );
    try {
      await markTokenRecovered(t.$id, !t.isRecovered);
    } catch {
      refresh();
    }
  }

  return (
    <AppShell title="Token Recovery">
      <section className="animate-fade-in-up space-y-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Token Recovery</h1>
            <p className="text-xs text-muted">Lost a token? Get it back in minutes.</p>
          </div>
        </div>

        {/* Guide */}
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-border bg-panel p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-600 text-sm font-bold">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Saved tokens to recover */}
        <div>
          <h2 className="mb-2 text-sm font-semibold">Your saved tokens</h2>
          {loading ? (
            <div className="h-20 animate-pulse rounded-2xl bg-panel" />
          ) : tokens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-panel/50 p-6 text-center">
              <ShieldCheck className="mx-auto h-7 w-7 text-muted" />
              <p className="mt-2 text-sm">No tokens logged yet.</p>
              <p className="text-xs text-muted">Add tokens in the vault so they&apos;re never lost.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {tokens.map((t) => (
                <RecoverRow key={t.$id} token={t} onToggle={() => toggleRecovered(t)} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function RecoverRow({ token, onToggle }: { token: Token; onToggle: () => void }) {
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
          onClick={onToggle}
          className={
            "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors " +
            (token.isRecovered
              ? "bg-primary-600/15 text-primary-400"
              : "border border-border text-muted hover:text-white")
          }
        >
          {token.isRecovered ? <Check className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
          {token.isRecovered ? "Recovered" : "Mark recovered"}
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span>{new Date(token.purchaseDate).toLocaleDateString()}</span>
        <span className="font-semibold text-white">
          {usd(token.amountPaid)}
          {token.unitsReceived ? (
            <span className="text-primary-400"> · {kwh(token.unitsReceived)}</span>
          ) : null}
        </span>
      </div>
    </li>
  );
}
