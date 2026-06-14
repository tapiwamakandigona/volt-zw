"use client";

import "leaflet/dist/leaflet.css";
import type * as L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapPin, Plus, Loader2, X, Zap, ZapOff, Clock, ThumbsUp } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { listOutages, createOutage, confirmOutage } from "@/lib/database";
import type { OutageReport, OutageType } from "@/types";

// Harare city centre — default map view.
const DEFAULT_CENTER: [number, number] = [-17.8292, 31.0522];

const TYPE_META: Record<OutageType, { label: string; color: string; Icon: typeof Zap }> = {
  outage: { label: "Power out", color: "#dc2626", Icon: ZapOff },
  restored: { label: "Restored", color: "#16a34a", Icon: Zap },
  planned: { label: "Planned (load-shedding)", color: "#f59e0b", Icon: Clock },
};

export default function OutagesPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      setReports(await listOutages());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  // Init Leaflet (client-only) once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current || leafletMap.current) return;
      const map = L.map(mapRef.current, { zoomControl: true }).setView(DEFAULT_CENTER, 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);
      leafletMap.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      refresh();
    })();
    return () => {
      cancelled = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Re-draw markers whenever reports change.
  useEffect(() => {
    (async () => {
      if (!leafletMap.current || !layerRef.current) return;
      const L = (await import("leaflet")).default;
      layerRef.current.clearLayers();
      for (const r of reports) {
        if (r.latitude == null || r.longitude == null) continue;
        const meta = TYPE_META[r.reportType] ?? TYPE_META.outage;
        L.circleMarker([r.latitude, r.longitude], {
          radius: 9,
          color: meta.color,
          fillColor: meta.color,
          fillOpacity: 0.7,
          weight: 2,
        })
          .bindPopup(
            `<strong>${meta.label}</strong><br/>${escapeHtml(r.suburb)}, ${escapeHtml(
              r.city,
            )}<br/><span style="color:#888">${r.confirmedCount || 0} confirmed</span>`,
          )
          .addTo(layerRef.current);
      }
    })();
  }, [reports]);

  async function onConfirm(r: OutageReport) {
    setReports((list) =>
      list.map((x) => (x.$id === r.$id ? { ...x, confirmedCount: (x.confirmedCount || 0) + 1 } : x)),
    );
    try {
      await confirmOutage(r);
    } catch {
      /* optimistic */
    }
  }

  return (
    <AppShell title="Outage Map">
      <section className="animate-fade-in-up space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">Outage Map</h1>
              <p className="text-xs text-muted">Live community power reports near you.</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> Report
          </button>
        </div>

        <div
          ref={mapRef}
          className="h-72 w-full overflow-hidden rounded-2xl border border-border bg-panel"
        />

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {(Object.keys(TYPE_META) as OutageType[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_META[k].color }} />
              {TYPE_META[k].label}
            </span>
          ))}
        </div>

        {/* Recent list */}
        <div>
          <h2 className="mb-2 text-sm font-semibold">Recent reports</h2>
          {loading ? (
            <div className="h-16 animate-pulse rounded-2xl bg-panel" />
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-panel/50 p-6 text-center text-sm text-muted">
              No reports yet. Be the first to flag an outage in your area.
            </div>
          ) : (
            <ul className="space-y-2">
              {reports.slice(0, 12).map((r) => {
                const meta = TYPE_META[r.reportType] ?? TYPE_META.outage;
                const Icon = meta.Icon;
                return (
                  <li
                    key={r.$id}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-panel p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                        style={{ background: meta.color + "22", color: meta.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {r.suburb}
                          {r.city ? `, ${r.city}` : ""}
                        </p>
                        <p className="text-xs text-muted">
                          {meta.label} · {timeAgo(r.timestamp)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onConfirm(r)}
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:text-white"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> {r.confirmedCount || 0}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {showForm && (
        <OutageForm
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

function OutageForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("Harare");
  const [reportType, setReportType] = useState<OutageType>("outage");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Location isn't available on this device. Enter your suburb instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. You can still report by suburb.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!suburb.trim()) return setError("Enter your suburb or area.");
    setBusy(true);
    try {
      await createOutage({
        suburb: suburb.trim(),
        city: city.trim() || "Harare",
        latitude: coords?.lat ?? DEFAULT_CENTER[0],
        longitude: coords?.lng ?? DEFAULT_CENTER[1],
        reportType,
        description: "",
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-panel p-5 animate-fade-in-up sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Report power status</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_META) as OutageType[]).map((k) => {
              const active = reportType === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setReportType(k)}
                  className={
                    "rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors " +
                    (active ? "border-primary-600 bg-primary-600/10 text-white" : "border-border text-muted")
                  }
                >
                  {TYPE_META[k].label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted">Suburb / area</span>
              <input
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Avondale"
                className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-sm outline-none focus:border-primary-600"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm hover:bg-white/5"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {coords ? "Location pinned ✓" : "Use my location (more accurate)"}
          </button>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit report
          </button>
        </div>
      </form>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c,
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
