# ⚡ VoltZW

**Track, manage and understand your ZESA prepaid electricity tokens.** A
mobile-first PWA + Android app for Zimbabweans — never run out unexpectedly.

🌍 Live at **[zesa.tapiwa.me](https://zesa.tapiwa.me)** · Built by Tapiwa Makandigona.

## Features

- 🪙 **Token vault** — store every token, copy a code in one tap
- 🧮 **Tariff calculator** — see how many units your money buys (stepped tariff explained)
- 🔍 **Token recovery** — recover tokens that went missing after payment
- 📅 **Load-shedding schedule** — know when the power goes
- 🔔 **Low-balance alerts** (premium) · 🗺️ **Outage map** (premium) · 📈 **Spend tracker** (premium)
- 🤖 **Ask VoltZW** — a free little AI helper for ZESA questions

## Tech

Next.js 14 (static export) · TypeScript · Tailwind · Appwrite (auth/DB/functions/hosting) ·
Zustand · Recharts · Leaflet · Capacitor (Android APK). **Hosted on Appwrite Sites.**

## Getting started

```bash
npm install
cp .env.example .env.local   # values already point at the live Appwrite project
npm run dev                  # http://localhost:3000
```

## Build

```bash
npm run build     # static export to ./out  (deploys to Appwrite Sites)
npm run cap:sync  # sync the web build into the Android project
```

## Architecture

One Next.js **static export** powers both the website (Appwrite Sites) and the
Android APK (Capacitor). All server logic lives in **Appwrite Functions**.

See **[docs/PLAN.md](docs/PLAN.md)** for the full plan, decisions, infrastructure
IDs, and build status — read it first if you're continuing the project.

---
_Not affiliated with ZESA Holdings or ZETDC. Tariff data is indicative; verify current rates._
