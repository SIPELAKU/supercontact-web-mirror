"use client";

import { useEffect, useState } from "react";
import type { ImportModule } from "@/lib/api/import-jobs";
import { useImportWatch, watchedView, type WatchedImport } from "@/lib/store/importWatch";
import { useWatchedImportJobs } from "@/lib/hooks/useWatchedImportJobs";
import ImportHistoryModal from "./ImportHistoryModal";
import { ImportDuplicateDialog } from "./ImportDuplicateDialog";
import { ImportProgressCard } from "./ImportProgressCard";
import { importDockCard } from "./importJobState";
import { IMPORT_VIEWS } from "@/lib/utils/importModules";

// FE-1: the imports being followed, bottom right on every signed-in page,
// so a long import stays visible after Import History is closed. Mounted
// once in AuthenticatedLayout. Knows no module: each followed entry says which
// view it came from, and IMPORT_VIEWS says how that view opens Import History.
export const ImportProgressDock = () => {
  const watched = useImportWatch((state) => state.watched);
  const historyOpen = useImportWatch((state) => state.historyOpen);
  const unwatch = useImportWatch((state) => state.unwatch);
  const markDataChanged = useImportWatch((state) => state.markDataChanged);
  const jobs = useWatchedImportJobs();
  const [historyItem, setHistoryItem] = useState<WatchedImport | null>(null);
  // The part whose paused row is being answered (FE-3), read live from `jobs`.
  const [review, setReview] = useState<{ module: ImportModule; jobId: string } | null>(null);
  // Answered elsewhere (another tab or user): close for good, so the dialog
  // does not pop up by itself when the job pauses at its next row.
  const reviewStatus = review ? jobs[review.jobId]?.status : undefined;
  useEffect(() => {
    if (review && reviewStatus !== "Waiting for Review") setReview(null);
  }, [review, reviewStatus]);

  // The list comes from localStorage: render it after hydration only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hidden while that module's Import History is open: it shows the same.
  const visible = watched.filter((item) => !historyOpen[item.module]);
  const historyConfig = historyItem ? IMPORT_VIEWS[watchedView(historyItem)] : undefined;

  return (
    <>
      {mounted && visible.length > 0 && (
        // Below MUI dialogs (1300), above page content.
        <div className="fixed bottom-4 right-4 z-1200 flex flex-col-reverse gap-2">
          {visible.map((item) => {
            // A red card answers its first waiting part; any other opens Import History.
            const waitingId = item.jobIds.find((id) => jobs[id]?.status === "Waiting for Review");
            return (
              <ImportProgressCard
                key={item.id}
                fileName={item.fileName}
                parts={item.jobIds.length}
                card={importDockCard(
                  item.jobIds.map((id) => jobs[id]).filter(Boolean),
                  item.jobIds.length,
                )}
                openLabel={waitingId ? "Review the duplicate" : "Open Import History"}
                onOpen={() =>
                  waitingId ? setReview({ module: item.module, jobId: waitingId }) : setHistoryItem(item)
                }
                onClose={() => unwatch(item.id)}
              />
            );
          })}
        </div>
      )}

      {historyItem && historyConfig && (
        <ImportHistoryModal
          open
          onClose={() => setHistoryItem(null)}
          view={historyConfig.view}
          mailingListIds={historyConfig.view === "mailing_list" ? historyItem.groupIds : undefined}
          onDataChanged={() => markDataChanged(historyConfig.module)}
        />
      )}

      {review && (
        <ImportDuplicateDialog
          module={review.module}
          job={jobs[review.jobId] ?? null}
          onClose={() => setReview(null)}
        />
      )}
    </>
  );
};
