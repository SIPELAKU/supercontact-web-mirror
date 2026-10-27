import { isSameDay, startOfDay } from "date-fns";

export const PAST_CLOSE_DATE_MESSAGE = "Pick a close date from today onward";

/**
 * An open deal's close date can't be set in the past: the earliest is today
 * (a past date would make the deal expired straight away). The date the deal
 * already has is the exception, so an expired deal can still be edited
 * without moving its date.
 */
export function isCloseDateAllowed(picked: Date | undefined, saved: Date | undefined, now: Date = new Date()): boolean {
  // A missing date is the "required" check's job.
  if (!picked) return true;
  if (saved && isSameDay(picked, saved)) return true;
  return startOfDay(picked) >= startOfDay(now);
}
