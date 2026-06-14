import { Functions } from "appwrite";
import { client, AI_FUNCTION_ID } from "@/lib/appwrite";

const functions = new Functions(client);

async function execute<T>(payload: object): Promise<T> {
  const exec = await functions.createExecution(
    AI_FUNCTION_ID,
    JSON.stringify(payload),
    false,
  );
  return JSON.parse(exec.responseBody || "{}") as T;
}

/** Ask the free "Ask VoltZW" assistant a question. */
export async function askVolt(message: string): Promise<string> {
  try {
    const res = await execute<{ ok: boolean; answer?: string; error?: string }>({
      action: "ask",
      message,
    });
    return res.answer || res.error || "Sorry, I couldn't answer that right now.";
  } catch {
    return "The assistant is offline right now — please try again later.";
  }
}

/** Get a short, friendly insight about the user's usage. */
export async function getInsight(input: {
  balanceUnits?: number | null;
  dailyUsageRate?: number | null;
  monthlySpendUSD?: number | null;
}): Promise<string | null> {
  try {
    const res = await execute<{ ok: boolean; insight?: string }>({
      action: "insights",
      ...input,
    });
    return res.insight ?? null;
  } catch {
    return null;
  }
}
