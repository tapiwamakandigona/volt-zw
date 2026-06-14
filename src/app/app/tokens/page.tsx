"use client";

import { Wallet } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

export default function TokensPage() {
  return (
    <AppShell title="Token Vault">
      <ComingSoon
        icon={<Wallet className="h-7 w-7" />}
        title="Token Vault"
        text="Store every ZESA token, copy a code in one tap, and keep a tidy purchase history. Being built next."
      />
    </AppShell>
  );
}

function ComingSoon({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <section className="mt-10 rounded-2xl border border-border bg-panel p-8 text-center animate-fade-in-up">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-600/15 text-primary-400">
        {icon}
      </span>
      <h1 className="mt-4 text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </section>
  );
}
