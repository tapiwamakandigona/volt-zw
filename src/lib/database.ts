import { databases, DB_ID, COLLECTIONS, ID, Query, account } from "@/lib/appwrite";
import { Permission, Role } from "appwrite";
import type {
  Meter,
  Token,
  BalanceLog,
  Subscription,
  TariffRates,
  OutageReport,
  OutageType,
} from "@/types";

/**
 * Thin data layer over Appwrite. All collections use document-level security,
 * so we attach per-user read/write/delete permissions on create.
 */

async function ownerPerms() {
  const me = await account.get();
  const role = Role.user(me.$id);
  return {
    userId: me.$id,
    permissions: [
      Permission.read(role),
      Permission.update(role),
      Permission.delete(role),
    ],
  };
}

/* ----------------------------- Meters ----------------------------- */

export async function listMeters(): Promise<Meter[]> {
  const me = await account.get();
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.meters, [
    Query.equal("userId", me.$id),
    Query.orderDesc("isDefault"),
  ]);
  return res.documents as unknown as Meter[];
}

export async function createMeter(
  data: Pick<Meter, "nickname" | "meterNumber" | "address" | "isDefault">,
): Promise<Meter> {
  const { userId, permissions } = await ownerPerms();
  const doc = await databases.createDocument(
    DB_ID,
    COLLECTIONS.meters,
    ID.unique(),
    { ...data, userId, createdAt: new Date().toISOString() },
    permissions,
  );
  return doc as unknown as Meter;
}

export async function updateMeter(id: string, data: Partial<Meter>): Promise<Meter> {
  const { $id, userId, createdAt, ...rest } = data as Meter;
  void $id;
  void userId;
  void createdAt;
  const doc = await databases.updateDocument(DB_ID, COLLECTIONS.meters, id, rest);
  return doc as unknown as Meter;
}

export async function deleteMeter(id: string): Promise<void> {
  await databases.deleteDocument(DB_ID, COLLECTIONS.meters, id);
}

/* ----------------------------- Tokens ----------------------------- */

export async function listTokens(meterId?: string): Promise<Token[]> {
  const me = await account.get();
  const queries = [Query.equal("userId", me.$id), Query.orderDesc("purchaseDate"), Query.limit(100)];
  if (meterId) queries.push(Query.equal("meterId", meterId));
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.tokens, queries);
  return res.documents as unknown as Token[];
}

export async function createToken(
  data: Pick<
    Token,
    "meterId" | "tokenCode" | "amountPaid" | "unitsReceived" | "purchaseDate" | "source" | "notes"
  >,
): Promise<Token> {
  const { userId, permissions } = await ownerPerms();
  const doc = await databases.createDocument(
    DB_ID,
    COLLECTIONS.tokens,
    ID.unique(),
    { ...data, userId, isRecovered: false },
    permissions,
  );
  return doc as unknown as Token;
}

export async function updateToken(id: string, data: Partial<Token>): Promise<Token> {
  const { $id, userId, ...rest } = data as Token;
  void $id;
  void userId;
  const doc = await databases.updateDocument(DB_ID, COLLECTIONS.tokens, id, rest);
  return doc as unknown as Token;
}

export async function markTokenRecovered(id: string, recovered = true): Promise<Token> {
  return updateToken(id, { isRecovered: recovered });
}

export async function deleteToken(id: string): Promise<void> {
  await databases.deleteDocument(DB_ID, COLLECTIONS.tokens, id);
}

/* -------------------------- Balance logs -------------------------- */

export async function listBalanceLogs(meterId: string): Promise<BalanceLog[]> {
  const me = await account.get();
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.balanceLogs, [
    Query.equal("userId", me.$id),
    Query.equal("meterId", meterId),
    Query.orderDesc("logDate"),
    Query.limit(60),
  ]);
  return res.documents as unknown as BalanceLog[];
}

export async function logBalance(
  data: Pick<BalanceLog, "meterId" | "estimatedBalance" | "dailyUsageRate">,
): Promise<BalanceLog> {
  const { userId, permissions } = await ownerPerms();
  const doc = await databases.createDocument(
    DB_ID,
    COLLECTIONS.balanceLogs,
    ID.unique(),
    { ...data, userId, logDate: new Date().toISOString() },
    permissions,
  );
  return doc as unknown as BalanceLog;
}

/** Most recent balance reading per meter, keyed by meterId. */
export async function latestBalances(): Promise<Record<string, BalanceLog>> {
  const me = await account.get();
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.balanceLogs, [
    Query.equal("userId", me.$id),
    Query.orderDesc("logDate"),
    Query.limit(100),
  ]);
  const map: Record<string, BalanceLog> = {};
  for (const d of res.documents as unknown as BalanceLog[]) {
    if (!map[d.meterId]) map[d.meterId] = d;
  }
  return map;
}

/* --------------------------- Outage reports ----------------------- */

export async function listOutages(): Promise<OutageReport[]> {
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.outageReports, [
    Query.orderDesc("timestamp"),
    Query.limit(200),
  ]);
  return res.documents as unknown as OutageReport[];
}

export async function createOutage(
  data: Pick<
    OutageReport,
    "suburb" | "city" | "latitude" | "longitude" | "reportType" | "description"
  >,
): Promise<OutageReport> {
  const me = await account.get();
  const role = Role.user(me.$id);
  // Outage reports are community-visible: anyone can read, only owner edits.
  const doc = await databases.createDocument(
    DB_ID,
    COLLECTIONS.outageReports,
    ID.unique(),
    {
      ...data,
      reporterId: me.$id,
      timestamp: new Date().toISOString(),
      confirmedCount: 0,
      isActive: true,
    },
    [
      Permission.read(Role.any()),
      // Any signed-in user can bump the "confirmed" count; owner can delete.
      Permission.update(Role.users()),
      Permission.delete(role),
    ],
  );
  return doc as unknown as OutageReport;
}

export async function confirmOutage(report: OutageReport): Promise<OutageReport> {
  const doc = await databases.updateDocument(
    DB_ID,
    COLLECTIONS.outageReports,
    report.$id,
    { confirmedCount: (report.confirmedCount || 0) + 1 },
  );
  return doc as unknown as OutageReport;
}

export type { OutageType };

/* -------------------------- Subscription -------------------------- */

export async function getSubscription(): Promise<Subscription | null> {
  const me = await account.get();
  const res = await databases.listDocuments(DB_ID, COLLECTIONS.subscriptions, [
    Query.equal("userId", me.$id),
    Query.limit(1),
  ]);
  return (res.documents[0] as unknown as Subscription) ?? null;
}

export async function submitPaymentRef(paymentRef: string): Promise<Subscription> {
  // Stores the EcoCash reference. The owner manually flips `plan` to premium
  // in the Appwrite console once payment is confirmed (no gateway in V1).
  const existing = await getSubscription();
  if (existing) {
    const doc = await databases.updateDocument(DB_ID, COLLECTIONS.subscriptions, existing.$id, {
      paymentRef,
    });
    return doc as unknown as Subscription;
  }
  const { userId, permissions } = await ownerPerms();
  const doc = await databases.createDocument(
    DB_ID,
    COLLECTIONS.subscriptions,
    ID.unique(),
    { userId, plan: "free", paymentRef },
    permissions,
  );
  return doc as unknown as Subscription;
}

/* ---------------------------- Tariff ------------------------------ */

export async function getCurrentRates(): Promise<TariffRates | null> {
  try {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.tariffRates, [
      Query.equal("isCurrent", true),
      Query.limit(1),
    ]);
    return (res.documents[0] as unknown as TariffRates) ?? null;
  } catch {
    return null;
  }
}
