/** Lightweight browser-notification helpers for low-balance alerts. */

const ALERTS_KEY = "voltzw:alerts-enabled";
const LAST_ALERT_KEY = "voltzw:last-alert";

export function alertsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ALERTS_KEY) === "1";
}

export function setAlertsEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALERTS_KEY, v ? "1" : "0");
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

/** Ask the user for notification permission (returns true if granted). */
export async function requestNotifications(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  try {
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}

/**
 * Fire a low-balance notification at most once per meter per 12h, so the
 * user isn't spammed every time the dashboard loads.
 */
export function maybeNotifyLowBalance(meterName: string, units: number, critical: boolean) {
  if (typeof window === "undefined") return;
  if (!alertsEnabled() || notificationPermission() !== "granted") return;
  const key = `${LAST_ALERT_KEY}:${meterName}`;
  const last = Number(localStorage.getItem(key) || 0);
  if (Date.now() - last < 12 * 60 * 60 * 1000) return;
  try {
    new Notification(critical ? "⚡ Buy electricity now" : "⚡ Electricity running low", {
      body: `${meterName}: about ${units.toFixed(0)} kWh left. Top up to avoid a blackout.`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
    localStorage.setItem(key, String(Date.now()));
  } catch {
    /* ignore */
  }
}
