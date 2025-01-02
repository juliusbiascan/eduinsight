import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function diffMinutes(dt2: Date, dt1: Date): number {
  const diff = (dt2.getTime() - dt1.getTime()) / 1000;
  return Math.abs(Math.round(diff / 60));
}

export function formatDuration(minutes: number): string {
  if (minutes === 0) {
    return '0s';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  const seconds = Math.round((minutes % 1) * 60);

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (remainingMinutes > 0) {
    return `${remainingMinutes}m`;
  } else {
    return `${seconds}s`;
  }
}