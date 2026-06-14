import { OAuthProvider } from "appwrite";
import { account, ID, client } from "@/lib/appwrite";
import type { AppUser } from "@/types";
import {
  isNative,
  webOrigin,
  OAUTH_SUCCESS_DEEPLINK,
  OAUTH_FAILURE_DEEPLINK,
} from "@/lib/platform";

/**
 * Start the Google sign-in flow.
 *
 * - Web/PWA: standard Appwrite OAuth2 session redirect (browser -> Google ->
 *   back to /app/ on our real origin).
 * - Native Android app (Capacitor): the OAuth *token* flow handled INSIDE the
 *   app. We open Google in an in-app browser, and when Appwrite redirects to
 *   our deep link (voltzw://auth-success?userId=&secret=) the app captures it,
 *   creates the session, and lands you on the dashboard — no localhost dead-end.
 */
export async function loginWithGoogle(): Promise<void> {
  if (isNative()) {
    await loginWithGoogleNative();
    return;
  }
  const base = webOrigin();
  await account.createOAuth2Session(
    OAuthProvider.Google,
    `${base}/app/`,
    `${base}/login/`,
  );
}

async function loginWithGoogleNative(): Promise<void> {
  // Lazily import Capacitor plugins so the web bundle never needs them.
  const { Browser } = await import("@capacitor/browser");
  const { App } = await import("@capacitor/app");

  const endpoint = client.config.endpoint;
  const project = client.config.project;
  const url =
    `${endpoint}/account/tokens/oauth2/google` +
    `?project=${encodeURIComponent(project)}` +
    `&success=${encodeURIComponent(OAUTH_SUCCESS_DEEPLINK)}` +
    `&failure=${encodeURIComponent(OAUTH_FAILURE_DEEPLINK)}`;

  // Resolve once we get the deep-link callback (or the browser is dismissed).
  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      urlListener.then((l) => l.remove()).catch(() => {});
      Browser.removeAllListeners().catch(() => {});
      fn();
    };

    const urlListener = App.addListener("appUrlOpen", async ({ url: incoming }) => {
      if (!incoming.startsWith("voltzw://")) return;
      try {
        await Browser.close();
      } catch {
        /* ignore */
      }
      try {
        const parsed = new URL(incoming);
        const userId = parsed.searchParams.get("userId");
        const secret = parsed.searchParams.get("secret");
        if (!userId || !secret) {
          finish(() => reject(new Error("Google sign-in was cancelled.")));
          return;
        }
        await account.createSession(userId, secret);
        finish(resolve);
      } catch (e) {
        finish(() => reject(e instanceof Error ? e : new Error("Sign-in failed.")));
      }
    });

    Browser.open({ url, presentationStyle: "popover" }).catch((e) =>
      finish(() => reject(e instanceof Error ? e : new Error("Could not open Google."))),
    );
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AppUser> {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function login(email: string, password: string): Promise<AppUser> {
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function logout(): Promise<void> {
  try {
    await account.deleteSession("current");
  } catch {
    // ignore — session may already be gone
  }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function sendPasswordRecovery(email: string): Promise<void> {
  const url = `${webOrigin()}/reset-password`;
  await account.createRecovery(email, url);
}
