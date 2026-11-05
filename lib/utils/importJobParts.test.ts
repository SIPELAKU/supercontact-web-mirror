import { describe, expect, it } from "vitest";
import { describeUploadError, ImportPartsError, partFileName, uploadImportParts } from "./importJobUpload";

// FE-5: Contacts send every part of up to 10,000 rows as a job of its own.

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Row ${i + 1}` }));

function recorder(failAtCall?: number) {
  const bodies: Record<string, any>[] = [];
  const send = async (body: Record<string, unknown>) => {
    bodies.push(body as Record<string, any>);
    if (bodies.length === failAtCall) {
      const error: any = new Error("Internal Server Error");
      throw error;
    }
    return { job_id: `job-${bodies.length}` };
  };
  return { bodies, send };
}

describe("partFileName", () => {
  it("adds (Part i/n) only when there is more than one part", () => {
    expect(partFileName("kontak.csv", 0, 1)).toBe("kontak.csv");
    expect(partFileName("kontak.csv", 1, 3)).toBe("kontak.csv (Part 2/3)");
  });
});

describe("uploadImportParts", () => {
  it("25,000 rows are 13 complete jobs of 2,000 (FE-9), each finished and named (Part i/13)", async () => {
    const { bodies, send } = recorder();
    const res = await uploadImportParts({ rows: rows(25_000), rowsKey: "contacts", fileName: "kontak.csv", send });

    expect(res.jobIds).toHaveLength(13);
    expect(res.jobIds[12]).toBe("job-13");
    expect(bodies.map((b) => b.contacts.length)).toEqual([...Array(12).fill(2_000), 1_000]);
    expect(bodies.every((b) => b.finished === true)).toBe(true);
    expect(bodies.map((b) => b.file_name)).toEqual(
      Array.from({ length: 13 }, (_, i) => `kontak.csv (Part ${i + 1}/13)`),
    );
    // Each part starts at the row after the previous one.
    expect(bodies[1].contacts[0]).toEqual({ name: "Row 2001" });
  });

  it("one part keeps the plain file name; no name sends no file_name", async () => {
    const named = recorder();
    await uploadImportParts({ rows: rows(3), rowsKey: "contacts", fileName: "a.xlsx", send: named.send });
    expect(named.bodies).toHaveLength(1);
    expect(named.bodies[0]).toMatchObject({ file_name: "a.xlsx", finished: true });

    const unnamed = recorder();
    await uploadImportParts({ rows: rows(3), rowsKey: "contacts", send: unnamed.send });
    expect(unnamed.bodies[0]).not.toHaveProperty("file_name");
  });

  it("stops at the failed part and keeps the jobs already created", async () => {
    const { bodies, send } = recorder(2);
    const error = await uploadImportParts({ rows: rows(5), rowsKey: "contacts", send, chunkSize: 2 }).catch((e) => e);

    expect(error).toBeInstanceOf(ImportPartsError);
    expect(error).toMatchObject({ part: 2, totalParts: 3, jobIds: ["job-1"], message: "Internal Server Error" });
    expect(bodies).toHaveLength(2);
  });

  it("keeps the API's validation details", async () => {
    const send = async () => {
      const error: any = new Error("Validation error");
      error.details = [{ field: "contacts.0.name", message: "too short" }];
      throw error;
    };
    const error = await uploadImportParts({ rows: rows(1), rowsKey: "contacts", send }).catch((e) => e);
    expect(error).toMatchObject({ part: 1, jobIds: [], details: [{ field: "contacts.0.name", message: "too short" }] });
  });
});

describe("describeUploadError for parts", () => {
  it("a later part says which parts were imported", () => {
    expect(describeUploadError(new ImportPartsError("Internal Server Error", 2, 3, ["job-1"]))).toBe(
      "Part 2 of 3 failed: Internal Server Error. Part 1 was imported and is in Import History. Import the remaining rows again.",
    );
    expect(describeUploadError(new ImportPartsError("Timeout", 3, 3, ["job-1", "job-2"]))).toBe(
      "Part 3 of 3 failed: Timeout. Parts 1–2 were imported and are in Import History. Import the remaining rows again.",
    );
  });

  it("the first part: nothing was imported, so only the API's reason", () => {
    const details = [{ field: "contacts.4.email", message: "invalid" }];
    expect(describeUploadError(new ImportPartsError("Validation error", 1, 2, [], details))).toBe(
      "contacts.4.email: invalid",
    );
  });
});
