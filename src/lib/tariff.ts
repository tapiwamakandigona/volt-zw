/**
 * ZESA domestic stepped-tariff engine — the core of VoltZW's calculator.
 *
 * The stepped tariff means the price per kWh increases as you buy more units
 * within a calendar month. Buying early in the month (when you're in a lower
 * tier) gets you more units per dollar.
 *
 * NOTE: These default rates are approximate (mid-2024). At runtime the app
 * fetches the current rates from our Appwrite `tariff_rates` store via the
 * rates API, so they can be updated without an app release. These constants
 * are the fallback / seed values.
 */

export interface TariffTier {
  min: number; // kWh lower bound (inclusive)
  max: number; // kWh upper bound (exclusive); use Infinity for the top tier
  rateUSD: number; // price per kWh in USD
  label: string;
}

export const TARIFF_TIERS: TariffTier[] = [
  { min: 0, max: 50, rateUSD: 0.035, label: "Tier 1 (Light Use)" },
  { min: 50, max: 200, rateUSD: 0.085, label: "Tier 2 (Average Use)" },
  { min: 200, max: Infinity, rateUSD: 0.15, label: "Tier 3 (Heavy Use)" },
];

export const MONTHLY_FIXED_CHARGE_USD = 2.0;
export const TARIFF_LAST_UPDATED = "2024-06-01";
export const TARIFF_SOURCE = "zesaholdings.co.zw";

export const BALANCE_THRESHOLDS = {
  safe: 100, // green
  warning: 50, // amber — "consider buying soon"
  critical: 20, // red — "buy tokens now"
};

export interface TierBreakdown {
  label: string;
  units: number; // kWh purchased within this tier
  rateUSD: number;
  costUSD: number;
}

export interface TariffResult {
  totalUnits: number;
  spentOnUnitsUSD: number;
  fixedChargeUSD: number;
  totalCostUSD: number;
  breakdown: TierBreakdown[];
  currentTierLabel: string;
}

/**
 * Calculate how many kWh `amountUSD` will buy, given how many units the user
 * has already bought this month (which determines the starting tier).
 *
 * Algorithm: subtract the fixed charge (once per month — applied only if the
 * user hasn't bought yet this month), then walk up the tiers filling each one
 * at its rate until the money runs out.
 */
export function calculateUnits(
  amountUSD: number,
  unitsAlreadyThisMonth: number = 0,
  tiers: TariffTier[] = TARIFF_TIERS,
  fixedCharge: number = MONTHLY_FIXED_CHARGE_USD,
): TariffResult {
  const breakdown: TierBreakdown[] = [];

  // Fixed charge applies once per month — only on the first purchase.
  const applyFixed = unitsAlreadyThisMonth <= 0 ? fixedCharge : 0;
  let remainingMoney = Math.max(0, amountUSD - applyFixed);

  let position = Math.max(0, unitsAlreadyThisMonth);
  let totalUnits = 0;

  for (const tier of tiers) {
    if (remainingMoney <= 0) break;
    // Where are we relative to this tier?
    if (position >= tier.max) continue; // already past this tier
    const tierStart = Math.max(position, tier.min);
    const tierCapacity = tier.max === Infinity ? Infinity : tier.max - tierStart;
    if (tierCapacity <= 0) continue;

    const affordableUnits = remainingMoney / tier.rateUSD;
    const unitsHere = Math.min(affordableUnits, tierCapacity);
    if (unitsHere <= 0) continue;

    const costHere = unitsHere * tier.rateUSD;
    breakdown.push({
      label: tier.label,
      units: round2(unitsHere),
      rateUSD: tier.rateUSD,
      costUSD: round2(costHere),
    });

    remainingMoney -= costHere;
    totalUnits += unitsHere;
    position += unitsHere;
  }

  const spentOnUnitsUSD = round2(amountUSD - applyFixed - Math.max(0, remainingMoney));

  return {
    totalUnits: round2(totalUnits),
    spentOnUnitsUSD,
    fixedChargeUSD: round2(applyFixed),
    totalCostUSD: round2(spentOnUnitsUSD + applyFixed),
    breakdown,
    currentTierLabel: tierLabelForPosition(unitsAlreadyThisMonth, tiers),
  };
}

/** Which tier label corresponds to a given monthly-units position. */
export function tierLabelForPosition(units: number, tiers: TariffTier[] = TARIFF_TIERS): string {
  for (const tier of tiers) {
    if (units >= tier.min && units < tier.max) return tier.label;
  }
  return tiers[tiers.length - 1].label;
}

/** Estimate days remaining from a balance and a daily usage rate. */
export function daysRemaining(balanceUnits: number, dailyUsageRate: number): number | null {
  if (!dailyUsageRate || dailyUsageRate <= 0) return null;
  return round1(balanceUnits / dailyUsageRate);
}

/** Color status for a unit balance. */
export type BalanceStatus = "safe" | "warning" | "critical" | "unknown";

export function balanceStatus(balanceUnits: number | null | undefined): BalanceStatus {
  if (balanceUnits == null) return "unknown";
  if (balanceUnits >= BALANCE_THRESHOLDS.safe) return "safe";
  if (balanceUnits >= BALANCE_THRESHOLDS.warning) return "warning";
  return "critical";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
