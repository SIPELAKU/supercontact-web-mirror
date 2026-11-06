import { describe, expect, it } from "vitest";
import { chunkRows, describeUploadError, ImportPartsError } from "./importJobUpload";

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Row ${i + 1}` }));

describe("chunkRows", () => {
  it("splits into parts of the chunk size, the last one shorter", () => {
    expect(chunkRows(rows(5), 2).map((c) => c.length)).toEqual([2, 2, 1]);
    expect(chunkRows([], 2)).toEqual([]);
  });

  it("by default sends 2,000 rows per part, for every module (FE-9)", () => {
    expect(chunkRows(rows(4_500)).map((c) => c.length)).toEqual([2_000, 2_000, 500]);
    expect(chunkRows(rows(2_000)).map((c) => c.length)).toEqual([2_000]);
  });
});

describe("describeUploadError", () => {
  it("the first part: the API's validation errors, each field + message once", () => {
    const details = [
      { field: "contacts.0.name", message: "too short" },
      { field: "contacts.0.name", message: "too short" },
      { field: "contacts.3.email", message: "invalid" },
    ];
    expect(describeUploadError(new ImportPartsError("Validation error", 1, 2, [], details))).toBe(
      "contacts.0.name: too short, contacts.3.email: invalid",
    );
  });

  it("falls back to the message", () => {
    expect(describeUploadError(new ImportPartsError("Server error", 1, 1, []))).toBe("Server error");
    expect(describeUploadError(new Error("boom"))).toBe("boom");
  });
});
