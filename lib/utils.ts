import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCleanPath(pathname: string) {
  const cleanPath = pathname.replace(/^\/+/, "")
  return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1)
}

export function parseNoteDate(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}


export function GetRelativeTime(date: string, time: string): string {
  const target = parseNoteDate(date, time);
  const now = new Date();

  const diffMs = target.getTime() - now.getTime();
  const diffHoursTotal = Math.round(diffMs / (1000 * 60 * 60));

  const isFuture = diffHoursTotal > 0;
  const absHours = Math.abs(diffHoursTotal);

  const days = Math.floor(absHours / 24);
  const hours = absHours % 24;

  if (days === 0) {
    return isFuture
      ? `In ${hours} hour${hours !== 1 ? "s" : ""}`
      : `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  return isFuture
    ? `In ${days} day${days !== 1 ? "s" : ""}`
    : `${days} day${days !== 1 ? "s" : ""} ago`;
}

