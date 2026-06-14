"use client";

import { Gauge } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

export default function MetersPage() {
  return (
    <AppShell title="My Meters">
      <section className="mt-10 rounded-2xl border border-border bg-panel p-8 text-center animate-fade-in-up">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-600/15 text-primary-400">
          <Gauge className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold">My Meters</h1>
        <p className="mt-2 text-sm text-muted">
          Add and manage multiple meters — perfect for landlords tracking several
          properties. Being built next.
        </p>
      </section>
    </AppShell>
  );
}
