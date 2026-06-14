import type { Models } from "appwrite";

export type Plan = "free" | "premium";

export interface Meter {
  $id: string;
  userId: string;
  nickname: string;
  meterNumber: string;
  address?: string;
  isDefault: boolean;
  createdAt?: string;
}

export type PaymentSource =
  | "EcoCash"
  | "FBC"
  | "CBZ"
  | "CABS"
  | "OneMoney"
  | "Other";

export interface Token {
  $id: string;
  userId: string;
  meterId: string;
  tokenCode: string;
  amountPaid: number;
  unitsReceived?: number;
  purchaseDate: string;
  source?: PaymentSource | string;
  notes?: string;
  isRecovered: boolean;
}

export interface BalanceLog {
  $id: string;
  userId: string;
  meterId: string;
  logDate: string;
  estimatedBalance: number;
  dailyUsageRate?: number;
}

export type OutageType = "outage" | "restored" | "planned";

export interface OutageReport {
  $id: string;
  reporterId: string;
  suburb: string;
  city: string;
  latitude?: number;
  longitude?: number;
  reportType: OutageType;
  description?: string;
  timestamp: string;
  confirmedCount: number;
  isActive: boolean;
}

export interface Subscription {
  $id: string;
  userId: string;
  plan: Plan;
  paymentRef?: string;
  activatedAt?: string;
  expiresAt?: string;
}

export interface TariffRates {
  $id: string;
  version: number;
  tiersJson: string;
  fixedChargeUSD: number;
  effectiveDate: string;
  source?: string;
  isCurrent: boolean;
}

export type AppUser = Models.User<Models.Preferences>;
