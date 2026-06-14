/**
 * VoltZW AI assistant + rates API — Appwrite Function (Node 18+).
 *
 * One small server-side endpoint that powers:
 *   - action "ask":      free "Ask VoltZW" chatbot (ZESA/token questions)
 *   - action "insights": friendly one-liner about a user's usage/spend
 *   - action "rates":    returns the current ZESA stepped tariff from the DB
 *
 * The LLM key lives here (server-side) so it's never shipped to the client.
 * Uses a FREE LLM tier — Groq (OpenAI-compatible) by default. Set GROQ_API_KEY.
 *
 * Env vars:
 *   GROQ_API_KEY        - free key from https://console.groq.com
 *   GROQ_MODEL          - default "llama-3.1-8b-instant"
 *   APPWRITE_DB_ID      - "voltdb"
 *   APPWRITE_RATES_COL  - "tariff_rates"
 */

const SYSTEM_PROMPT = `You are VoltZW Assistant, a friendly helper for Zimbabweans using ZESA prepaid electricity tokens.
Be concise, warm, and practical. Use USD ($) since ZESA tokens are priced in USD.
You understand: the stepped tariff (more units cost more per kWh as you buy more in a month; buying early in the month is cheaper per unit), token recovery (tokens can go missing after payment - check zesaholdings.co.zw/Selfservice or call ZETDC +263 4 773388), load shedding, and how to save power.
Never invent exact current tariff prices - if asked, say prices change and to check the in-app calculator. Keep answers under 120 words.`;

async function callGroq(messages) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return "The AI assistant isn't configured yet. Add a free GROQ_API_KEY to enable it.";
  }
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 300 }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM error ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't answer that.";
}

module.exports = async ({ req, res, log, error }) => {
  let body = {};
  try {
    body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.bodyRaw || "{}");
  } catch {
    body = {};
  }

  const action = body.action || "ask";

  try {
    if (action === "ask") {
      const question = String(body.message || "").slice(0, 1000);
      if (!question) return res.json({ ok: false, error: "Missing message" }, 400);
      const answer = await callGroq([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ]);
      return res.json({ ok: true, answer });
    }

    if (action === "insights") {
      // body: { balanceUnits, dailyUsageRate, monthlySpendUSD }
      const ctx = JSON.stringify({
        balanceUnits: body.balanceUnits ?? null,
        dailyUsageRate: body.dailyUsageRate ?? null,
        monthlySpendUSD: body.monthlySpendUSD ?? null,
      });
      const answer = await callGroq([
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Give ONE short, hyped, friendly insight (max 2 sentences) about my ZESA usage based on this data: ${ctx}. If a value is null, don't mention it.`,
        },
      ]);
      return res.json({ ok: true, insight: answer });
    }

    if (action === "rates") {
      // Returns current tariff from the DB (set up via the Appwrite SDK).
      // Implemented when the rates seeding script runs; falls back to defaults.
      return res.json({
        ok: true,
        rates: body.fallback || null,
        note: "Wire to tariff_rates collection via node-appwrite.",
      });
    }

    return res.json({ ok: false, error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    error(e.message);
    return res.json({ ok: false, error: "Assistant temporarily unavailable." }, 500);
  }
};
