/**
 * Platform helpers. Lets the app behave differently when running as the
 * native Android app (Capacitor) vs the web/PWA.
 */
import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Custom URL scheme used for native OAuth deep-link callbacks. */
export const APP_SCHEME = "voltzw";
export const OAUTH_SUCCESS_DEEPLINK = `${APP_SCHEME}://auth-success`;
export const OAUTH_FAILURE_DEEPLINK = `${APP_SCHEME}://auth-failure`;

/** Web origin to use for OAuth redirects when running on the web. */
export function webOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://zesa.tapiwa.me";
}
