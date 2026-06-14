"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Token } from "@/types";

/** Last-6-months spend, derived from the user's logged tokens. */
function monthlySeries(tokens: Token[]) {
  const now = new Date();
  const buckets: { key: string; label: string; spent: number; units: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en", { month: "short" }),
      spent: 0,
      units: 0,
    });
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  for (const t of tokens) {
    const d = new Date(t.purchaseDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const i = idx.get(key);
    if (i != null) {
      buckets[i].spent += t.amountPaid || 0;
      buckets[i].units += t.unitsReceived || 0;
    }
  }
  return buckets.map((b) => ({ ...b, spent: Math.round(b.spent * 100) / 100 }));
}

export default function SpendChart({ tokens }: { tokens: Token[] }) {
  const data = useMemo(() => monthlySeries(tokens), [tokens]);
  const total = data.reduce((s, d) => s + d.spent, 0);
  const hasData = total > 0;

  return (
    <div className="rounded-2xl border border-border bg-panel p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Spend over time</h2>
        <span className="text-xs text-muted">last 6 months</span>
      </div>
      {!hasData ? (
        <p className="py-6 text-center text-xs text-muted">
          Log a few token purchases to see your spending trend here.
        </p>
      ) : (
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: "#8a8a99", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8a8a99", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                cursor={{ stroke: "#26262f" }}
                contentStyle={{
                  background: "#1a1a24",
                  border: "1px solid #26262f",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#fff" }}
                formatter={(value: number, _name, item) => [
                  `$${value.toFixed(2)} · ${(item?.payload?.units || 0).toFixed(0)} kWh`,
                  "Spent",
                ]}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#spendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
