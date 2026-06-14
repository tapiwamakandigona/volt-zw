# VoltZW AI Assistant (Appwrite Function)

Free, lightweight AI for "Ask VoltZW" + smart usage insights, plus a rates endpoint.

## Deploy
1. Appwrite console → Functions → Create function → Node 18.
2. Function ID: `ai-assistant`. Entry point: `src/main.js`.
3. Connect this repo path `functions/ai-assistant` (or upload).
4. Set env vars:
   - `GROQ_API_KEY` — free key from https://console.groq.com
   - `GROQ_MODEL` (optional) — default `llama-3.1-8b-instant`
   - `APPWRITE_DB_ID=voltdb`, `APPWRITE_RATES_COL=tariff_rates`
5. Execute permission: `users` (any logged-in user).

## Actions (POST JSON body)
- `{ "action": "ask", "message": "why did my token go missing?" }`
- `{ "action": "insights", "balanceUnits": 142, "dailyUsageRate": 15, "monthlySpendUSD": 25 }`
- `{ "action": "rates" }`
