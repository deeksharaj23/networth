import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseMonthKey(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  return formatMonth(addMonths(parseMonthKey(monthKey), delta));
}

export function formatCurrency(n: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1e7)
    return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5)
    return `₹${(n / 1e5).toFixed(2)} L`;
  if (Math.abs(n) >= 1e3)
    return `₹${(n / 1e3).toFixed(1)}k`;
  return formatCurrency(n);
}

export function formatPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
