/**
 * Lightweight haptics. Fires real device haptics on the native Android app
 * (via @capacitor/haptics) and is a safe no-op on the web/PWA.
 *
 * Imports are dynamic + guarded so the web build never depends on the plugin
 * being present at runtime.
 */
import { isNative } from "./platform";

type ImpactStyle = "Light" | "Medium" | "Heavy";

async function impact(style: ImpactStyle) {
  if (!isNative()) return;
  try {
    const mod = await import("@capacitor/haptics");
    await mod.Haptics.impact({ style: mod.ImpactStyle[style] });
  } catch {
    /* plugin unavailable — ignore */
  }
}

/** Soft tick for taps: nav, toggles, secondary buttons. */
export function tapLight() {
  void impact("Light");
}

/** Slightly firmer tap for primary actions (save, submit). */
export function tapMedium() {
  void impact("Medium");
}

/** Success notification buzz (e.g. token added). */
export async function notifySuccess() {
  if (!isNative()) return;
  try {
    const mod = await import("@capacitor/haptics");
    await mod.Haptics.notification({ type: mod.NotificationType.Success });
  } catch {
    /* ignore */
  }
}
