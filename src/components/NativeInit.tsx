"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { isNative } from "@/lib/platform";

/**
 * Native-only bootstrap (no-op on web):
 *  - styles the Android status bar to match the dark theme
 *  - hides the splash screen once the app is interactive
 *  - catches OAuth deep links (voltzw://auth-success?userId=&secret=) globally
 *    so Google sign-in completes the session and lands on the dashboard.
 */
export default function NativeInit() {
  const router = useRouter();

  useEffect(() => {
    if (!isNative()) return;
    let cleanup = () => {};

    (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        try {
          await StatusBar.setBackgroundColor({ color: "#0e0e14" });
        } catch {
          /* setBackgroundColor unsupported on some Android versions */
        }
      } catch {
        /* plugin missing on web */
      }

      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        /* ignore */
      }

      try {
        const { App } = await import("@capacitor/app");
        const sub = await App.addListener("appUrlOpen", async ({ url }) => {
          if (!url.startsWith("voltzw://")) return;
          try {
            const parsed = new URL(url);
            const userId = parsed.searchParams.get("userId");
            const secret = parsed.searchParams.get("secret");
            if (userId && secret) {
              await account.createSession(userId, secret);
              router.replace("/app");
            }
          } catch {
            /* the in-flow listener usually handles it; this is a safety net */
          }
        });
        cleanup = () => sub.remove();
      } catch {
        /* ignore */
      }
    })();

    return () => cleanup();
  }, [router]);

  return null;
}
