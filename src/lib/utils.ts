import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a USD amount: 5 -> "$5.00". */
export function usd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Format kWh units: 142.34 -> "142.3 kWh". */
export function kwh(units: number): string {
  return `${units.toFixed(1)} kWh`;
}

/** Group a token code into blocks of 5: "12345678901234567890" -> "12345 67890 12345 67890". */
export function formatTokenCode(code: string): string {
  const digits = code.replace(/\D/g, "");
  return digits.replace(/(.{5})/g, "$1 ").trim();
}

/** Validate a ZESA meter number (typically 8 digits). */
export function isValidMeterNumber(value: string): boolean {
  return /^\d{8,11}$/.test(value.replace(/\s/g, ""));
}

/** Validate a 20-digit ZESA token code. */
export function isValidTokenCode(value: string): boolean {
  return /^\d{20}$/.test(value.replace(/\D/g, ""));
}
