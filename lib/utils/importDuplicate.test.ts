import { describe, expect, it } from "vitest";
import type { BulkJob } from "@/lib/types/email-marketing";
import {
  canSubmitImportDuplicate,
  fillableValues,
  importDuplicateActionLabel,
  importDuplicateAnswer,
  readImportDuplicateError,
  readPendingDuplicate,
} from "./importDuplicate";

// The shape of `pending_duplicate` on API 1.164.0 (row 4 of kontak_duplikat_20.csv).
const pendingRow = {
  row_number: 4,
  reason: "same_name_email",
  existing_contact: {
    id: "c-4",
    name: "Tes kecil 00004",
    email: "tes.kecil.00004@example.com",
    phone_number: "+628117000004",
    source: "import",
    created_at: "2026-11-05T02:00:00",
  },
  conflicts: [{ field: "phone_number", existing: "+628117000004", incoming: "+628991000004" }],
  incoming: {
    name: "Tes kecil 00004",
    email: "tes.kecil.00004@example.com",
    phone_number: "+628991000004",
    company: "PT Duplikat 4",
    position: null,
    custom_fields: { city: "Bandung" },
  },
  fillable_fields: ["company", "custom_fields.city"],
};

const waiting = (pending: unknown = pendingRow) =>
  ({ status: "Waiting for Review", pending_duplicate: pending }) as Pick<BulkJob, "status" | "pending_duplicate">;

describe("readPendingDuplicate", () => {
  it("reads the row a waiting job holds", () => {
    const pending = readPendingDuplicate(waiting());
    expect(pending).toMatchObject({ row_number: 4, existing_contact: { id: "c-4" } });
    expect(pending?.conflicts).toHaveLength(1);
  });

  it("nothing to answer: another status, no row, or a row without its contact", () => {
    expect(readPendingDuplicate(null)).toBeNull();
    expect(readPendingDuplicate({ status: "Processing", pending_duplicate: pendingRow })).toBeNull();
    expect(readPendingDuplicate(waiting(null))).toBeNull();
    expect(readPendingDuplicate(waiting({ ...pendingRow, row_number: "4" }))).toBeNull();
    expect(readPendingDuplicate(waiting({ ...pendingRow, existing_contact: {} }))).toBeNull();
  });

  it("missing lists become empty ones", () => {
    const pending = readPendingDuplicate(
      waiting({ row_number: 1, reason: "same_phone", existing_contact: { id: "c-1" } }),
    );
    expect(pending?.conflicts).toEqual([]);
    expect(pending?.incoming).toEqual({});
    expect(pending?.fillable_fields).toEqual([]);
  });
});

describe("importDuplicateAnswer", () => {
  it("sends `keep` with Update only", () => {
    const keep = { phone_number: "existing" as const };
    expect(importDuplicateAnswer(4, "update", keep)).toEqual({ row_number: 4, action: "update", keep });
    expect(importDuplicateAnswer(4, "replace", keep)).toEqual({ row_number: 4, action: "replace" });
    expect(importDuplicateAnswer(4, "skip", keep)).toEqual({ row_number: 4, action: "skip" });
  });
});

describe("canSubmitImportDuplicate", () => {
  const pending = readPendingDuplicate(waiting())!;
  const two = {
    conflicts: [
      { field: "name", existing: "A", incoming: "B" },
      { field: "phone_number", existing: "1", incoming: "2" },
    ],
  };

  it("Skip and Replace all are always possible", () => {
    expect(canSubmitImportDuplicate("skip", pending, {})).toBe(true);
    expect(canSubmitImportDuplicate("replace", pending, {})).toBe(true);
  });

  it("Update selected waits for a choice on every conflict", () => {
    expect(canSubmitImportDuplicate("update", two, {})).toBe(false);
    expect(canSubmitImportDuplicate("update", two, { name: "incoming" })).toBe(false);
    expect(canSubmitImportDuplicate("update", two, { name: "incoming", phone_number: "existing" })).toBe(true);
    // A row without conflicts never pauses (Q-1); nothing to update by choice.
    expect(canSubmitImportDuplicate("update", { conflicts: [] }, {})).toBe(false);
  });
});

describe("fillableValues", () => {
  it("each blank field of the contact with the file's value, custom fields included", () => {
    expect(fillableValues(readPendingDuplicate(waiting())!)).toEqual([
      { field: "company", value: "PT Duplikat 4" },
      { field: "custom_fields.city", value: "Bandung" },
    ]);
  });

  it("a value missing from the row shows as -", () => {
    expect(fillableValues({ fillable_fields: ["position", "custom_fields.zip"], incoming: {} })).toEqual([
      { field: "position", value: "-" },
      { field: "custom_fields.zip", value: "-" },
    ]);
  });
});

describe("readImportDuplicateError", () => {
  const apiError = (status: number, details?: unknown, message = "x") =>
    Object.assign(new Error(message), { status, details });

  it("409: the row was answered elsewhere or the job moved on", () => {
    expect(readImportDuplicateError(apiError(409))).toEqual({ kind: "answered" });
  });

  it("422 with missing fields: the contact changed while the job waited", () => {
    expect(readImportDuplicateError(apiError(422, { field: "keep", missing: ["email", "name"] }))).toEqual({
      kind: "changed",
      fields: ["email", "name"],
    });
  });

  it("anything else keeps its message", () => {
    expect(readImportDuplicateError(apiError(422, [{ field: "action", message: "bad" }], "Invalid"))).toEqual({
      kind: "other",
      message: "Invalid",
    });
    expect(readImportDuplicateError(apiError(500, undefined, "Boom"))).toEqual({ kind: "other", message: "Boom" });
    // Only a 422 means "choose again".
    expect(readImportDuplicateError(apiError(400, { missing: ["name"] }, "Bad"))).toEqual({
      kind: "other",
      message: "Bad",
    });
    expect(readImportDuplicateError(null)).toEqual({ kind: "other", message: "Failed to answer the duplicate" });
  });
});

describe("importDuplicateActionLabel", () => {
  it("says all only when the checkbox is ticked", () => {
    expect(importDuplicateActionLabel("skip", false)).toBe("Skip");
    expect(importDuplicateActionLabel("replace", false)).toBe("Replace");
    expect(importDuplicateActionLabel("skip", true)).toBe("Skip all");
    expect(importDuplicateActionLabel("replace", true)).toBe("Replace all");
  });

  it("Update selected always answers this row alone", () => {
    expect(importDuplicateActionLabel("update", false)).toBe("Update selected");
    expect(importDuplicateActionLabel("update", true)).toBe("Update selected");
  });
});

describe("importDuplicateAnswer with apply to all (T1)", () => {
  it("skip and replace carry it when ticked", () => {
    expect(importDuplicateAnswer(4, "skip", {}, true)).toEqual({ row_number: 4, action: "skip", apply_to_all: true });
    expect(importDuplicateAnswer(4, "replace", {}, true)).toEqual({ row_number: 4, action: "replace", apply_to_all: true });
  });

  it("not ticked: the field is left out, the row alone is answered", () => {
    expect(importDuplicateAnswer(4, "skip")).toEqual({ row_number: 4, action: "skip" });
    expect(importDuplicateAnswer(4, "replace", {}, false)).not.toHaveProperty("apply_to_all");
  });

  it("update never sends it: the API answers 422", () => {
    const answer = importDuplicateAnswer(4, "update", { phone_number: "incoming" }, true);
    expect(answer).toEqual({ row_number: 4, action: "update", keep: { phone_number: "incoming" } });
  });
});
