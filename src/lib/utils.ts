import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number): string {
  return "$" + n.toFixed(2);
}

export const FREE_SHIP_THRESHOLD = 150;
export const SHIP_COST = 8.95;
