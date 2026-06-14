# VoltZW — Full build

## Native app feel
- [x] Custom app logo (icon-192/512, maskable, apple-touch, favicon)
- [ ] In-app Logo component (SVG bolt) for sidebar/login/splash
- [ ] Capacitor: launcher icon + splash via @capacitor/assets
- [ ] Capacitor plugins: splash-screen, status-bar, app (deep links)
- [ ] Native init (status bar style, hide splash)
- [ ] Service worker for offline (PWA installable)

## Features
- [ ] Ask VoltZW AI chat page + deploy function w/ GROQ key + wire dashboard card
- [ ] Low-balance alerts: balance card, update form, status, notifications + settings toggle
- [ ] Spend chart (recharts) on dashboard
- [ ] Token Recovery page (guide + mark recovered)
- [ ] Outage Map (react-leaflet) page + report outage
- [ ] Google sign-in inside the app (native token flow via @capacitor/browser deep link)

## UX
- [ ] Dashboard "Add token" auto-opens modal (?add=1)
- [ ] Add new routes to sidebar + dashboard Explore section

## Ship
- [ ] typecheck + lint + build pass locally
- [ ] commit + push, watch CI green
- [ ] trigger APK build, download, verify, send to Beth
- [ ] deploy web to Appwrite Sites
