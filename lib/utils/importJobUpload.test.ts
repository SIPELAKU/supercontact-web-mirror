import { describe, expect, it } from "vitest";
import { chunkRows, describeUploadError, ImportUploadError, uploadImportJob } from "./importJobUpload";

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Row ${i + 1}` }));

function recorder(fail?: { atCall: number; message: string }) {
  const calls: { path: string; body: Record<string, any> }[] = [];
  const send = async (path: string, body: Record<string, unknown>) => {
    calls.push({ path, body: body as Record<string, any> });
    if (fail && calls.length === fail.atCall) throw new Error(fail.message);
    return { job_id: "job-1" };
  };
  return { calls, send };
}

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

describe("uploadImportJob", () => {
  it("a small file is one POST that starts and finishes the job", async () => {
    const { calls, send } = recorder();
    const res = await uploadImportJob({
      rows: rows(3),
      rowsKey: "contacts",
      startBody: { file_name: "a.xlsx" },
      send,
      chunkSize: 10,
    });
    expect(res).toEqual({ jobId: "job-1", parts: 1 });
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("");
    expect(calls[0].body).toMatchObject({ file_name: "a.xlsx", finished: true });
    expect(calls[0].body.contacts).toHaveLength(3);
  });

  it("a big file is ONE job: the first part starts it, the rest go to /{job_id}/rows", async () => {
    const { calls, send } = recorder();
    await uploadImportJob({
      rows: rows(5),
      rowsKey: "new_contacts",
      startBody: { file_name: "b.csv", target: "recipient" },
      send,
      chunkSize: 2,
    });
    expect(calls.map((c) => c.path)).toEqual(["", "/job-1/rows", "/job-1/rows"]);
    expect(calls.map((c) => c.body.finished)).toEqual([false, false, true]);
    expect(calls.map((c) => c.body.new_contacts.length)).toEqual([2, 2, 1]);
    // file_name / target only start the job.
    expect(calls[0].body).toMatchObject({ file_name: "b.csv", target: "recipient" });
    expect(calls[1].body).not.toHaveProperty("file_name");
    expect(calls[1].body).not.toHaveProperty("target");
  });

  it("stops at the first failed part and says which one", async () => {
    const { calls, send } = recorder({ atCall: 2, message: "Network error" });
    const error = await uploadImportJob({ rows: rows(5), rowsKey: "contacts", startBody: {}, send, chunkSize: 2 }).catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(ImportUploadError);
    expect(error).toMatchObject({ part: 2, totalParts: 3, message: "Network error" });
    expect(calls).toHaveLength(2);
  });
});

describe("describeUploadError", () => {
  it("a later part: nothing was imported, import again", () => {
    expect(describeUploadError(new ImportUploadError("x", 3, 3))).toBe(
      "Upload stopped at part 3 of 3. Nothing was imported. Please import the file again.",
    );
  });

  it("the first part: the API's validation errors, each field + message once", () => {
    const details = [
      { field: "contacts.0.name", message: "too short" },
      { field: "contacts.0.name", message: "too short" },
      { field: "contacts.3.email", message: "invalid" },
    ];
    expect(describeUploadError(new ImportUploadError("Validation error", 1, 2, details))).toBe(
      "contacts.0.name: too short, contacts.3.email: invalid",
    );
  });

  it("falls back to the message", () => {
    expect(describeUploadError(new ImportUploadError("Server error", 1, 1))).toBe("Server error");
    expect(describeUploadError(new Error("boom"))).toBe("boom");
  });
});

it("a failed part keeps the API's details", async () => {
  const send = async () => {
    const error: any = new Error("Validation error");
    error.details = [{ field: "contacts.0.name", message: "too short" }];
    throw error;
  };
  const error = await uploadImportJob({ rows: rows(1), rowsKey: "contacts", startBody: {}, send }).catch((e) => e);
  expect(error.details).toEqual([{ field: "contacts.0.name", message: "too short" }]);
});
