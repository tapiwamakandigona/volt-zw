# VoltZW — Master Build Plan & Handoff Doc

> Read this first if you're picking up the project cold. It captures every
> decision, ID, and the build order so anyone (or a fresh AI session) can
> continue without losing context.

## What VoltZW is

A mobile-first PWA + Android app that helps Zimbabweans track, manage and
understand their **ZESA prepaid electricity tokens**. Fills the gap left by the
abandoned "ZESA Token Viewer" app. Freemium: free basics, **$1/month or $3
lifetime** premium. Lives at **zesa.tapiwa.me**.

Owner: **Tapiwa Makandigona** · GitHub `tapiwamakandigona` · domain `tapiwa.me`.

## Key decisions (locked with the owner)

| Topic | Decision |
|-------|----------|
| **Hosting** | **Appwrite Sites** (NOT Vercel). One platform for auth/DB/hosting. Free on the GitHub Student Pack plan. |
| **Architecture** | Next.js 14 (App Router) **static export** (`output: 'export'`). One build powers BOTH the website (Appwrite Sites) AND the Android APK (Capacitor). SEO from pre-rendered HTML. |
| **Auth** | Appwrite email/password. Route protection = **client-side guards** (no server middleware, because static export). |
| **Android APK** | Capacitor wraps the `out/` static build. GitHub Actions builds the APK. Distributed via GitHub Releases (+ a download page). Play Store later. |
| **Token prices** | No official ZESA API. We run our **own rates API** (Appwrite Function) reading a `tariff_rates` store, plus a **scheduled scraper** that checks ZESA/ZERA and updates + alerts. Not literal real-time — bounded by how often ZESA publishes. |
| **AI feature** | Lightweight, free "Ask VoltZW" assistant + smart usage insights, served by an Appwrite Function using a **free LLM tier (Groq or Gemini Flash)**. Key stays server-side. |
| **Payments** | No gateway in V1. EcoCash manual: user submits a payment ref, owner flips `subscriptions.plan` to `premium` in the Appwrite console. |
| **Design** | Dark-first, Todoist-inspired, **electric-green** accent (`#16a34a`), framer-motion micro-animations, celebratory onboarding. |

## Live infrastructure (already created)

### GitHub
- Repo: `github.com/tapiwamakandigona/volt-zw` (public), default branch `main`.

### Appwrite (region: Frankfurt `fra`)
- Endpoint: `https://fra.cloud.appwrite.io/v1`
- Project ID: **`voltzw`** · Org: "GitHub Student Organization" (team `69e624663a5955cfd2aa`)
- Database: **`voltdb`**
- Web platforms registered: `zesa.tapiwa.me`, `localhost`
- Auth: email/password enabled
- Collections (document-level security, per-user permissions):
  - `meters` — userId, nickname, meterNumber, address, isDefault, createdAt · index userId
  - `tokens` — userId, meterId, tokenCode, amountPaid, unitsReceived, purchaseDate, source, notes, isRecovered · index (userId, meterId)
  - `balance_logs` — userId, meterId, logDate, estimatedBalance, dailyUsageRate · index (userId, meterId)
  - `outage_reports` — reporterId, suburb, city, latitude, longitude, reportType, description, timestamp, confirmedCount, isActive · read("any"), indexes city + isActive
  - `subscriptions` — userId, plan, paymentRef, activatedAt, expiresAt · index userId
  - `tariff_rates` — version, tiersJson, fixedChargeUSD, effectiveDate, source, isCurrent · read("any"), index isCurrent. **Our rates source of truth.**

> A project API key ("setup-key") with full scopes exists for provisioning.
> Rotate/remove it before launch. Manage Appwrite via console session +
> `X-Appwrite-Key`. NOTE: Appwrite Cloud is behind Cloudflare — requests need a
> normal `User-Agent` header (urllib's default gets a 403).

## Tech stack

Next.js 14 · TypeScript · Tailwind + (shadcn-style) UI · Appwrite SDK · Zustand ·
React Hook Form + Zod · Recharts · Leaflet (outage map) · date-fns · lucide-react ·
framer-motion · Capacitor (Android) · next-pwa (to add).

## Folder structure

```
src/
  app/
    (auth)/login, register, forgot-password
    (dashboard)/  layout + page (dashboard), meters, tokens, recovery,
                  calculator, tracker, map, loadshedding, settings
    layout.tsx, globals.css, page.tsx (landing)
  components/ ui, layout (Sidebar, BottomNav, TopBar), dashboard, tokens, calculator, map
  lib/ appwrite.ts, auth.ts, database.ts, tariff.ts, utils.ts, ai.ts
  store/ authStore.ts, appStore.ts
  types/ index.ts
  hooks/ useMeters, useTokens, usePremium
functions/
  ai-assistant/  (Appwrite Function: AI assistant + rates API + scraper)
```

## Build order & status

- [x] Phase 0: GitHub repo, Appwrite project/DB/collections/platforms/auth
- [x] Next.js scaffold + design tokens (tailwind.config) + globals
- [x] Appwrite client (`lib/appwrite.ts`), types, tariff engine (`lib/tariff.ts`, verified), utils
- [x] Auth: login + register pages, auth store, `lib/auth.ts`
- [x] Landing page (SEO)
- [x] Capacitor config + GitHub Actions (CI + APK)
- [ ] Dashboard shell: Sidebar (desktop) + BottomNav (mobile), TopBar
- [ ] Dashboard home (BalanceCard, QuickActions, RecentTokens)
- [ ] Meters CRUD
- [ ] Token Vault (add form + grouped list + copy)
- [ ] Tariff Calculator UI (engine done) + Usage Calculator
- [ ] Token Recovery screen
- [ ] Load Shedding screen (static JSON, owner-updatable)
- [ ] Settings (account, subscription/upgrade with EcoCash, preferences, theme)
- [ ] Premium gate UI (lock modals + payment-ref flow)
- [ ] Spend Tracker (Recharts) + Usage history
- [ ] Outage Map (Leaflet + community reports)
- [ ] AI assistant ("Ask VoltZW") + smart insights via Appwrite Function
- [ ] Rates API + scheduled scraper (Appwrite Function)
- [ ] Push notifications (Appwrite Messaging) for low-balance alerts
- [ ] PWA (next-pwa + icons) — generate ⚡ icons
- [ ] Deploy to Appwrite Sites + connect `zesa.tapiwa.me` DNS (CNAME to Appwrite)
- [ ] Verify current ZESA tariff rates before launch (defaults are mid-2024)

## ZESA reference

Stepped tariff defaults (in `lib/tariff.ts`, also seeded to `tariff_rates`):
- Tier 1: 0–50 kWh @ $0.035 · Tier 2: 50–200 @ $0.085 · Tier 3: 200+ @ $0.15
- Monthly fixed charge $2.00 (applied on first purchase of the month)
- **Verify against zesaholdings.co.zw / ZERA before launch.**

Payment (premium): EcoCash **0774483250 — Tapiwa Makandigona**.

## EcoCash / contact
- EcoCash: 0774483250 (Tapiwa Makandigona)
- Admin email (gates rate-update + subscription activation): mrtapiwamakandigona@gmail.com

## Notes for future sessions
- Build is static export — never use Next server features (API routes, server
  middleware, dynamic SSR). Use Appwrite Functions for any server logic.
- Use named collection IDs (they match the names above), not random IDs.
- Keep the design dark-first with the electric-green accent.
