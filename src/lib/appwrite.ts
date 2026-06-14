import { Client, Account, Databases, ID, Query } from "appwrite";

/**
 * Appwrite client (browser SDK). All env vars are public (NEXT_PUBLIC_*)
 * because this is a static-exported client app — security is enforced by
 * Appwrite's per-document permissions, not by hiding the project ID.
 */
const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "voltzw";

export const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "voltdb";

export const COLLECTIONS = {
  meters: process.env.NEXT_PUBLIC_COLLECTION_METERS ?? "meters",
  tokens: process.env.NEXT_PUBLIC_COLLECTION_TOKENS ?? "tokens",
  balanceLogs: process.env.NEXT_PUBLIC_COLLECTION_BALANCE_LOGS ?? "balance_logs",
  outageReports:
    process.env.NEXT_PUBLIC_COLLECTION_OUTAGE_REPORTS ?? "outage_reports",
  subscriptions:
    process.env.NEXT_PUBLIC_COLLECTION_SUBSCRIPTIONS ?? "subscriptions",
  tariffRates: process.env.NEXT_PUBLIC_COLLECTION_TARIFF_RATES ?? "tariff_rates",
} as const;

/** Function ID for the AI assistant / rates API (Appwrite Functions). */
export const AI_FUNCTION_ID = process.env.NEXT_PUBLIC_AI_FUNCTION_ID ?? "ai-assistant";

export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "mrtapiwamakandigona@gmail.com";

/** EcoCash details shown on the premium upgrade screen. */
export const ECOCASH = {
  number: process.env.NEXT_PUBLIC_ECOCASH_NUMBER ?? "0774483250",
  name: process.env.NEXT_PUBLIC_ECOCASH_NAME ?? "Tapiwa Makandigona",
};
