import { account, ID } from "@/lib/appwrite";
import type { AppUser } from "@/types";

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
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/reset-password`
      : "https://zesa.tapiwa.me/reset-password";
  await account.createRecovery(email, url);
}
