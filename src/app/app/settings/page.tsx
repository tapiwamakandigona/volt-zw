"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Crown, Smartphone, ShieldCheck, Bell } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/lib/auth";
import { ECOCASH } from "@/lib/appwrite";
import {
  alertsEnabled,
  setAlertsEnabled,
  requestNotifications,
  notificationsSupported,
} from "@/lib/notify";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isPremium, reset } = useAuthStore();

  const [alerts, setAlerts] = useState(false);
  useEffect(() => setAlerts(alertsEnabled()), []);

  async function toggleAlerts() {
    if (!alerts) {
      const granted = await requestNotifications();
      if (!granted) return; // user denied permission
      setAlertsEnabled(true);
      setAlerts(true);
    } else {
      setAlertsEnabled(false);
      setAlerts(false);
    }
  }

  async function onLogout() {
    await logout();
    reset();
    router.replace("/login");
  }

  return (
    <AppShell title="Settings">
      <section className="animate-fade-in-up space-y-4">
        {/* Account */}
        <div className="rounded-2xl border border-border bg-panel p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted">Account</h2>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-600/15 text-lg font-bold uppercase text-primary-400">
              {(user?.name || user?.email || "?").charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.name || "VoltZW user"}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-border bg-panel p-4">
          <div className="mb-2 flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary-400" />
            <h2 className="text-sm font-semibold">
              {isPremium ? "Premium — active" : "Upgrade to Premium"}
            </h2>
          </div>
          {isPremium ? (
            <p className="text-sm text-muted">
              Thanks for supporting VoltZW! You have low-balance alerts, the outage map and
              the spend tracker unlocked. ⚡
            </p>
          ) : (
            <>
              <p className="text-sm text-muted">
                Unlock low-balance push alerts, the community outage map, and the spend
                tracker.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Plan name="Monthly" price="$1" sub="per month" />
                <Plan name="Lifetime" price="$3" sub="one-time" highlight />
              </div>
              <div className="mt-3 rounded-xl border border-border bg-ink p-3 text-sm">
                <p className="text-xs text-muted">Pay via EcoCash, then add your reference:</p>
                <p className="mt-1 font-semibold">
                  {ECOCASH.number} · {ECOCASH.name}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Low-balance alerts */}
        <div className="rounded-2xl border border-border bg-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />
              <div>
                <p className="text-sm font-semibold">Low-balance alerts</p>
                <p className="text-xs text-muted">
                  {notificationsSupported()
                    ? "Get notified when your estimated balance runs low."
                    : "Not supported on this device/browser."}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={alerts}
              onClick={toggleAlerts}
              disabled={!notificationsSupported()}
              className={
                "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 " +
                (alerts ? "bg-primary-600" : "bg-border")
              }
            >
              <span
                className={
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform " +
                  (alerts ? "translate-x-[22px]" : "translate-x-0.5")
                }
              />
            </button>
          </div>
        </div>

        {/* Get the app */}
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-panel p-4">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />
          <div>
            <p className="text-sm font-semibold">Get the Android app</p>
            <p className="text-xs text-muted">
              Install VoltZW as an app for offline access and faster loading.
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-panel/50 p-4 text-xs text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
          <p>
            Your tokens and meters are private to your account. VoltZW is not affiliated with
            ZESA Holdings or ZETDC.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </section>
    </AppShell>
  );
}

function Plan({
  name,
  price,
  sub,
  highlight,
}: {
  name: string;
  price: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border p-3 text-center " +
        (highlight ? "border-primary-600 bg-primary-600/10" : "border-border bg-ink")
      }
    >
      <p className="text-xs text-muted">{name}</p>
      <p className="text-2xl font-extrabold">{price}</p>
      <p className="text-[11px] text-muted">{sub}</p>
    </div>
  );
}
