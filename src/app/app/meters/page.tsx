"use client";

import { useEffect, useState } from "react";
import { Gauge, Plus, Trash2, Star, Loader2, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/appStore";
import { listMeters, createMeter, updateMeter, deleteMeter } from "@/lib/database";
import { isValidMeterNumber } from "@/lib/utils";
import type { Meter } from "@/types";

export default function MetersPage() {
  const { meters, setMeters } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      setMeters(await listMeters());
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

  async function onDelete(id: string) {
    if (!confirm("Delete this meter? Its tokens will stay in your history.")) return;
    await deleteMeter(id);
    refresh();
  }

  async function onMakeDefault(m: Meter) {
    await Promise.all(
      meters.map((x) =>
        x.$id === m.$id
          ? updateMeter(x.$id, { isDefault: true })
          : x.isDefault
            ? updateMeter(x.$id, { isDefault: false })
            : Promise.resolve(),
      ),
    );
    refresh();
  }

  return (
    <AppShell title="My Meters">
      <section className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
              <Gauge className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">My Meters</h1>
              <p className="text-xs text-muted">Track one or many prepaid meters.</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="press flex min-h-[40px] items-center gap-1 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold hover:bg-primary-700 active:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {loading ? (
          <div className="mt-5 h-24 animate-pulse rounded-2xl bg-panel" />
        ) : meters.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-panel/50 p-8 text-center">
            <Gauge className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-2 text-sm font-medium">No meters yet</p>
            <p className="text-xs text-muted">Add your first meter to start logging tokens.</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {meters.map((m) => (
              <li
                key={m.$id}
                className="flex items-center justify-between rounded-2xl border border-border bg-panel p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{m.nickname}</p>
                    {m.isDefault && (
                      <span className="rounded-full bg-primary-600/15 px-2 py-0.5 text-[10px] font-semibold text-primary-400">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted">{m.meterNumber}</p>
                  {m.address && <p className="truncate text-xs text-muted">{m.address}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!m.isDefault && (
                    <button
                      onClick={() => onMakeDefault(m)}
                      title="Set as default"
                      className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-primary-400"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(m.$id)}
                    title="Delete"
                    className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showForm && (
        <MeterForm
          isFirst={meters.length === 0}
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

function MeterForm({
  isFirst,
  onClose,
  onSaved,
}: {
  isFirst: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nickname, setNickname] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nickname.trim()) return setError("Give your meter a nickname.");
    if (!isValidMeterNumber(meterNumber)) return setError("Enter a valid meter number (8–11 digits).");
    setBusy(true);
    try {
      await createMeter({
        nickname: nickname.trim(),
        meterNumber: meterNumber.replace(/\s/g, ""),
        address: address.trim() || undefined,
        isDefault: isFirst,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save meter.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-t-3xl border border-border bg-panel p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] animate-fade-in-up sm:rounded-3xl sm:pb-5"
      >
        <div className="sheet-grabber mx-auto mb-3 sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add meter</h2>
          <button type="button" onClick={onClose} className="press -mr-1 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Nickname" value={nickname} onChange={setNickname} placeholder="Home, Shop, Mum's house…" />
          <Field
            label="Meter number"
            value={meterNumber}
            onChange={setMeterNumber}
            placeholder="e.g. 04123456789"
            mono
          />
          <Field label="Address (optional)" value={address} onChange={setAddress} placeholder="Suburb, city" />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="press flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 active:bg-primary-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save meter
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          "mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600 " +
          (mono ? "font-mono" : "")
        }
      />
    </label>
  );
}
