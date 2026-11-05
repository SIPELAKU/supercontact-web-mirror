import { describe, expect, it } from "vitest";
import { GUIDE_HEADER, importTemplateSheets } from "./importTemplate";
import { CONTACT_IMPORT_RULES, CONTACT_IMPORT_TEMPLATE, suggestContactField } from "./contactImportRules";

describe("importTemplateSheets", () => {
  const config = {
    fileName: "t.xlsx",
    sheetName: "Data",
    rules: [
      { field: "name", column: "Name", required: "Yes", format: "Text" },
      { field: "email", column: "Email", required: "No", format: "An email" },
    ],
    notes: ["Note one"],
    samples: [{ name: "Budi", email: "" }, { name: "Siti", email: "siti@example.com" }],
  };
  const { data, guide } = importTemplateSheets(config);

  it("data: the column headers, then one row per sample in column order", () => {
    expect(data).toEqual([
      ["Name", "Email"],
      ["Budi", ""],
      ["Siti", "siti@example.com"],
    ]);
  });

  it("guide: one row per column with the first filled-in sample, then the row notes", () => {
    expect(guide).toEqual([
      GUIDE_HEADER,
      ["Name", "Yes", "Text", "Budi"],
      ["Email", "No", "An email", "siti@example.com"],
      [],
      ["Every row"],
      ["Note one"],
    ]);
  });
});

describe("CONTACT_IMPORT_TEMPLATE", () => {
  const { data, guide } = importTemplateSheets(CONTACT_IMPORT_TEMPLATE);

  it("uses the import field headers, so the Mapping step maps them all", () => {
    expect(data[0]).toEqual(["Name", "Email", "Phone Number", "Company", "Position", "Address"]);
    expect(data[0].map(suggestContactField)).toEqual(CONTACT_IMPORT_RULES.map((rule) => rule.field));
    expect(data).toHaveLength(4);
  });

  it("the guide covers every rule and the email-or-phone rule", () => {
    expect(guide.slice(1, CONTACT_IMPORT_RULES.length + 1).map((row) => row[0])).toEqual(
      CONTACT_IMPORT_RULES.map((rule) => rule.column),
    );
    expect(guide.flat().join(" ")).toContain("Fill in Email or Phone Number (at least one)");
  });
});
