import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function diffMinutes(dt2: Date, dt1: Date): number {
  const diff = (dt2.getTime() - dt1.getTime()) / 1000;
  return Math.abs(Math.round(diff / 60));
}