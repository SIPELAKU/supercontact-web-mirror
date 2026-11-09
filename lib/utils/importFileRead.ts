// lib/utils/importFileRead.ts
//
// How an import file goes into SheetJS (`XLSX.read(data, options)`), so a CSV
// arrives exactly as written (Contacts, Recipients and Subscribers, 2026-11-05):
// - every CSV cell stays text (`raw: true`). Without it "081234567890" became
//   the number 81234567890, which the API then stores as +81234567890, a
//   Japanese number;
// - a CSV that is valid UTF-8 (Google Sheets, most editors, Excel's "CSV
//   UTF-8") is decoded as UTF-8. SheetJS reads CSV bytes as Windows-1252, so
//   "tökö" became "tÃ¶kÃ¶". A CSV that is not valid UTF-8 (Excel's older
//   "CSV (Comma delimited)") still goes in as bytes, read as before.
// An .xlsx/.xls file goes in unchanged: its cells carry their own types.

export interface ColumnMapping {
  excelColumn: string;
  // The field the column fills; null = the column is skipped.
  apiField: string | null;
}

/**
 * The file's rows as fields, trimmed. Several columns mapped to Name are joined,
 * skipping empty ones; every row has a `name`, even an empty one.
 */
export function mapFileRows(
  rows: Record<string, unknown>[],
  mappings: ColumnMapping[],
): Record<string, string | undefined>[] {
  return rows.map((row) => {
    const mapped: Record<string, string | undefined> = { name: "" };
    for (const { excelColumn, apiField } of mappings) {
      if (!apiField || row[excelColumn] === undefined) continue;
      const value = String(row[excelColumn] || "").trim();
      mapped[apiField] = apiField === "name" ? [mapped.name, value].filter(Boolean).join(" ") : value;
    }
    return mapped;
  });
}

export interface ImportFileReadArgs {
  data: string | ArrayBuffer;
  options: { type?: "string"; raw?: boolean };
}

/** The file's text when it is valid UTF-8 (a leading BOM dropped), else null. */
export function decodeUtf8(bytes: ArrayBuffer): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function importFileReadArgs(fileName: string, bytes: ArrayBuffer): ImportFileReadArgs {
  if (!fileName.toLowerCase().endsWith(".csv")) return { data: bytes, options: {} };
  const text = decodeUtf8(bytes);
  return text === null ? { data: bytes, options: { raw: true } } : { data: text, options: { type: "string", raw: true } };
}
