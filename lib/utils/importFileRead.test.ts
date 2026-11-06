import { describe, expect, it } from "vitest";
import { decodeUtf8, importFileReadArgs, mapFileRows } from "./importFileRead";

describe("mapFileRows", () => {
  const mappings = [
    { excelColumn: "First", apiField: "name" },
    { excelColumn: "Last", apiField: "name" },
    { excelColumn: "Mail", apiField: "email" },
    { excelColumn: "Note", apiField: null },
  ];

  it("fills the mapped fields, trimmed, and leaves skipped columns out", () => {
    expect(mapFileRows([{ First: " Budi ", Last: "Santoso", Mail: " b@x.com ", Note: "no" }], mappings)).toEqual([
      { name: "Budi Santoso", email: "b@x.com" },
    ]);
  });

  it("joins the columns mapped to Name, skipping empty ones", () => {
    expect(mapFileRows([{ First: "", Last: "Santoso", Mail: "" }], mappings)).toEqual([{ name: "Santoso", email: "" }]);
  });

  it("a row with no name still has one, empty, so the check can report it", () => {
    expect(mapFileRows([{ Mail: "b@x.com" }], mappings)).toEqual([{ name: "", email: "b@x.com" }]);
  });
});

const bytes = (...parts: (string | number[])[]) => {
  const chunks = parts.map((part) => (typeof part === "string" ? new TextEncoder().encode(part) : Uint8Array.from(part)));
  const all = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const chunk of chunks) {
    all.set(chunk, at);
    at += chunk.length;
  }
  return all.buffer;
};

describe("decodeUtf8", () => {
  it("decodes valid UTF-8 and drops a BOM", () => {
    expect(decodeUtf8(bytes("Email\nbudi@tökö.com\n"))).toBe("Email\nbudi@tökö.com\n");
    expect(decodeUtf8(bytes([0xef, 0xbb, 0xbf], "Name"))).toBe("Name");
  });

  it("null for bytes that are not UTF-8 (an old Windows-1252 CSV)", () => {
    expect(decodeUtf8(bytes("Jos", [0xe9]))).toBeNull();
  });
});

describe("importFileReadArgs", () => {
  it("a UTF-8 CSV goes in as text, every cell kept as text", () => {
    const csv = bytes("Name,Phone Number\nBudi,081234567890\n");
    expect(importFileReadArgs("kontak.CSV", csv)).toEqual({
      data: "Name,Phone Number\nBudi,081234567890\n",
      options: { type: "string", raw: true },
    });
  });

  it("a CSV that is not UTF-8 goes in as bytes, still every cell as text", () => {
    const csv = bytes("Name\nJos", [0xe9]);
    expect(importFileReadArgs("kontak.csv", csv)).toEqual({ data: csv, options: { raw: true } });
  });

  it("an Excel file goes in unchanged", () => {
    const xlsx = bytes("PK");
    expect(importFileReadArgs("kontak.xlsx", xlsx)).toEqual({ data: xlsx, options: {} });
    expect(importFileReadArgs("kontak.xls", xlsx)).toEqual({ data: xlsx, options: {} });
  });
});
