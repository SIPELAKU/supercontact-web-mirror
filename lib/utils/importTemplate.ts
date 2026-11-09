// lib/utils/importTemplate.ts
//
// A downloadable import template built from a module's import rules (FE-7):
// a data sheet with the exact column headers and sample rows, and a Guide
// sheet saying what each column takes. Built from the same rules the file
// check uses, so the guide and the check cannot drift apart. Knows nothing
// about Contacts; see CONTACT_IMPORT_TEMPLATE.

import { columnWidths } from "./exportRows";

export interface TemplateColumn {
  field: string;
  column: string;
  required: string;
  format: string;
}

export interface ImportTemplateConfig {
  fileName: string;
  // Name of the data sheet, e.g. "Contacts".
  sheetName: string;
  rules: TemplateColumn[];
  // Rules for the whole row, listed under the columns in the guide.
  notes: string[];
  samples: Record<string, string | undefined>[];
}

export const GUIDE_HEADER = ["Column", "Required", "Format", "Example"];

/** The cells of both sheets: `data` is header + samples, `guide` the help. */
export function importTemplateSheets(config: ImportTemplateConfig) {
  const example = (field: string) => config.samples.map((sample) => sample[field]).find((v) => v?.trim()) ?? "";
  return {
    data: [
      config.rules.map((rule) => rule.column),
      ...config.samples.map((sample) => config.rules.map((rule) => sample[rule.field] ?? "")),
    ],
    guide: [
      GUIDE_HEADER,
      ...config.rules.map((rule) => [rule.column, rule.required, rule.format, example(rule.field)]),
      [],
      ["Every row"],
      ...config.notes.map((note) => [note]),
    ],
  };
}

/** Builds the .xlsx and hands it to the browser to save. */
export async function downloadImportTemplate(config: ImportTemplateConfig) {
  // Loaded on the click, like the exports: ~400 kB the page should not pay for.
  const XLSX = await import("xlsx");
  const { data, guide } = importTemplateSheets(config);

  // Text cells stay text, so "0812…" keeps its leading 0.
  const dataSheet = XLSX.utils.aoa_to_sheet(data);
  dataSheet["!cols"] = columnWidths(data);
  const guideSheet = XLSX.utils.aoa_to_sheet(guide);
  // Sized by the column rows; the long notes below may overflow.
  guideSheet["!cols"] = columnWidths(guide.slice(0, config.rules.length + 1));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, dataSheet, config.sheetName);
  XLSX.utils.book_append_sheet(book, guideSheet, "Guide");
  XLSX.writeFile(book, config.fileName, { bookType: "xlsx" });
}
