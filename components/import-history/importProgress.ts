// components/email-marketing/subscribers/modals/importProgress.ts
//
// Import History shows how far a job has got as a percentage - the boss's ask
// in the 29 Oct meeting: "kalau masih diolah saya cuma perlu tahu ini sudah
// berapa persen".

/** Whole percent of rows processed, clamped to 0-100 and rounded down so a job
 *  only reads 100% once every row is done. null when the job has no rows yet
 *  (or the numbers are missing), which the cell shows as "—". */
export function importProgressPercent(processed: number | null | undefined, total: number | null | undefined): number | null {
  if (!total || total <= 0 || processed == null || Number.isNaN(processed)) return null;
  const percent = Math.floor((processed / total) * 100);
  return Math.min(100, Math.max(0, percent));
}
