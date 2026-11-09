import { describe, expect, it } from "vitest";
import type { BulkJob } from "@/lib/types/email-marketing";
import { dockIntervalMs, importDockCard, importJobActions, isActiveImportJob } from "./importJobState";

const job = (status: string, rows: Partial<BulkJob> = {}): BulkJob =>
  ({
    id: Math.random().toString(),
    status,
    total_rows: 100,
    processed_rows: 0,
    created_rows: 0,
    skipped_rows: 0,
    failed_rows: 0,
    ...rows,
  }) as BulkJob;

describe("isActiveImportJob", () => {
  it("is active while the job can still move, including a duplicate pause", () => {
    for (const status of ["Uploading", "Queued for Processing", "Processing", "Waiting for Review", "Rollback Processing"]) {
      expect(isActiveImportJob({ status } as BulkJob)).toBe(true);
    }
    for (const status of ["Completed", "Failed", "Stopped", "Rolled Back"]) {
      expect(isActiveImportJob({ status } as BulkJob)).toBe(false);
    }
  });
});

describe("importDockCard", () => {
  it("sums the parts of one file into one bar", () => {
    const card = importDockCard(
      [
        job("Completed", { total_rows: 10_000, processed_rows: 10_000, created_rows: 9_900, skipped_rows: 100 }),
        job("Processing", { total_rows: 5_000, processed_rows: 2_400, created_rows: 2_400 }),
      ],
      2,
    );
    expect(card).toMatchObject({ tone: "running", processed: 12_400, total: 15_000, percent: 82 });
    // Numbers in the viewer's locale, like the rest of the app.
    expect(card.summary).toBe(`Created ${(12_300).toLocaleString()} · Skipped 100`);
  });

  it("stays running until every part is loaded", () => {
    expect(importDockCard([job("Completed", { processed_rows: 100 })], 3).tone).toBe("running");
    expect(importDockCard([], 1)).toMatchObject({ tone: "running", percent: null });
  });

  it("is done only when every part is Completed, and then says so instead of a bar", () => {
    const card = importDockCard([job("Completed", { created_rows: 2, skipped_rows: 10 }), job("Completed")], 2);
    expect(card).toMatchObject({ tone: "done", headline: "Import completed", summary: "Created 2 · Skipped 10" });
  });

  it("no headline while the file still moves or waits", () => {
    expect(importDockCard([job("Processing")], 1).headline).toBeNull();
    expect(importDockCard([job("Completed")], 2).headline).toBeNull();
    expect(importDockCard([job("Waiting for Review")], 1).headline).toBeNull();
  });

  it("counts Updated (auto-filled blanks and answers) only when there are any", () => {
    const card = importDockCard(
      [
        job("Completed", { created_rows: 5, updated_rows: 2, skipped_rows: 1 }),
        job("Completed", { created_rows: 1, updated_rows: 1 }),
      ],
      2,
    );
    expect(card.updated).toBe(3);
    expect(card.summary).toBe("Created 6 · Updated 3 · Skipped 1");
    // Older API without the field: no "Updated".
    expect(importDockCard([job("Completed", { created_rows: 4 })], 1).summary).toBe("Created 4 · Skipped 0");
  });

  it("ended: the headline says how, the summary keeps the counts", () => {
    const card = importDockCard([job("Completed"), job("Failed", { failed_rows: 1 })], 2);
    expect(card).toMatchObject({ tone: "ended", headline: "Import failed", summary: "Created 0 · Skipped 0 · Failed 1" });
    expect(importDockCard([job("Stopped")], 1).headline).toBe("Import stopped");
    expect(importDockCard([job("Rolled Back")], 1).headline).toBe("Import rolled back");
    // Parts ending differently are listed.
    expect(importDockCard([job("Failed"), job("Stopped")], 2).headline).toBe("Import ended: Failed, Stopped");
  });

  it("a duplicate pause wins over everything else", () => {
    const one = importDockCard([job("Processing"), job("Waiting for Review")], 2);
    expect(one).toMatchObject({ tone: "review", reviews: 1, summary: "Duplicate found, waiting for your answer" });
    expect(importDockCard([job("Waiting for Review"), job("Waiting for Review")], 2).summary).toBe(
      "Duplicates found in 2 parts",
    );
  });
});

describe("importJobActions", () => {
  it("keeps the buttons every module already had", () => {
    expect(importJobActions("Queued for Processing")).toEqual(["stop"]);
    expect(importJobActions("Processing")).toEqual(["stop"]);
    expect(importJobActions("Stopped")).toEqual(["continue", "rollback"]);
    expect(importJobActions("Completed")).toEqual(["rollback"]);
    expect(importJobActions("Failed")).toEqual(["replay"]);
    expect(importJobActions("Rolled Back")).toEqual(["replay"]);
    for (const status of ["Uploading", "Queued for Rollback", "Rollback Processing"]) {
      expect(importJobActions(status)).toEqual([]);
    }
  });

  it("a Contact job waiting for an answer can be reviewed, stopped or rolled back", () => {
    expect(importJobActions("Waiting for Review")).toEqual(["review", "stop", "rollback"]);
  });
});

describe("dockIntervalMs", () => {
  it("follows the module's Auto-refresh choice; Off or unset is 5 seconds", () => {
    expect(dockIntervalMs("2000")).toBe(2000);
    expect(dockIntervalMs("0")).toBe(5000);
    expect(dockIntervalMs(null)).toBe(5000);
    expect(dockIntervalMs("abc")).toBe(5000);
  });
});
