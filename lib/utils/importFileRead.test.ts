import { describe, expect, it } from "vitest";
import { decodeUtf8, importFileReadArgs } from "./importFileRead";

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
