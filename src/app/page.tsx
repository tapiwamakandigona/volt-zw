import Link from "next/link";
import {
  Zap,
  Wallet,
  Calculator,
  Map,
  Bell,
  Search,
  ArrowRight,
  Check,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Token vault",
    desc: "Store every ZESA token you buy. Copy a code in one tap, even months later.",
  },
  {
    icon: Calculator,
    title: "Tariff calculator",
    desc: "See exactly how many units $10 buys you — and why buying on the 1st gets you more.",
  },
  {
    icon: Search,
    title: "Token recovery",
    desc: "Paid but the token went missing? Step-by-step recovery so you never lose money.",
  },
  {
    icon: Bell,
    title: "Low-balance alerts",
    desc: "Get a heads-up before you go dark, based on how fast you actually use power.",
  },
  {
    icon: Map,
    title: "Outage map",
    desc: "See real-time outages reported by your neighbours across Zimbabwe.",
  },
  {
    icon: Zap,
    title: "Multi-meter",
    desc: "Landlords & families: track every flat and home from one place.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-ink text-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </span>
          <span className="text-lg font-bold tracking-tight">VoltZW</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 text-center md:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-600/20 blur-[100px]" />
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 text-xs font-medium text-primary-400">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          Built for Zimbabwe · Actually maintained
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
          Never run out of{" "}
          <span className="text-primary-500">ZESA tokens</span> unexpectedly.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted md:text-lg">
          Track, manage and understand your prepaid electricity. Store your
          tokens, know how many units your money buys, and get alerts before
          you&apos;re left in the dark.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-6 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">
          Free forever for the basics · Premium $1/month or $3 lifetime
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-panel p-5 transition-colors hover:border-primary-700"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-600/15 text-primary-400">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-panel p-6">
            <h3 className="text-lg font-bold">Free</h3>
            <p className="mt-1 text-sm text-muted">Everything you need to start.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "1 meter",
                "Unlimited token vault",
                "Tariff & usage calculator",
                "Token recovery",
                "Load-shedding schedule",
              ].map((i) => (
                <li key={i} className="flex items-center gap-2 text-white/90">
                  <Check className="h-4 w-4 text-primary-500" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-primary-600 bg-gradient-to-b from-primary-600/10 to-panel p-6">
            <h3 className="text-lg font-bold text-primary-400">
              Premium <span className="text-white">· $1/mo</span>
            </h3>
            <p className="mt-1 text-sm text-muted">For landlords & power users.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Up to 10 meters",
                "Spend tracker & charts",
                "Usage history graphs",
                "Low-balance push alerts",
                "Community outage map",
                "PDF export",
              ].map((i) => (
                <li key={i} className="flex items-center gap-2 text-white/90">
                  <Check className="h-4 w-4 text-primary-500" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-center text-xs text-muted">
        <p>
          VoltZW · ZESA prepaid token tracker for Zimbabwe ·{" "}
          <span className="text-white/70">zesa.tapiwa.me</span>
        </p>
        <p className="mt-1">
          Not affiliated with ZESA Holdings or ZETDC. Tariff data is indicative.
        </p>
      </footer>
    </main>
  );
}
