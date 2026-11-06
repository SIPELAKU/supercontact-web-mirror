import { describe, expect, it } from "vitest";
import { checkImportFile } from "./importFileDuplicates";
import {
  IMPORT_VIEWS,
  importFieldOptions,
  importJobBody,
  importModuleNoun,
  missingMappings,
  type ImportView,
} from "./importModules";
import { suggestContactField, validateImportRow } from "./importRules";
import { importTemplateSheets } from "./importTemplate";

const VIEWS = Object.keys(IMPORT_VIEWS) as ImportView[];

describe("IMPORT_VIEWS", () => {
  it("each entry knows which view it is", () => {
    for (const view of VIEWS) expect(IMPORT_VIEWS[view].view).toBe(view);
  });

  it("sends rows under the key each endpoint reads", () => {
    expect(VIEWS.map((view) => [view, IMPORT_VIEWS[view].rowsKey, IMPORT_VIEWS[view].module])).toEqual([
      ["contacts", "contacts", "contacts"],
      ["subscribers", "new_contacts", "subscribers"],
      ["mailing_list", "new_contacts", "subscribers"],
      ["recipients", "new_contacts", "recipients"],
      ["broadcast_group", "new_contacts", "recipients"],
    ]);
  });

  it("each view's Import History says whose imports it lists", () => {
    expect(VIEWS.map((view) => IMPORT_VIEWS[view].history.label)).toEqual([
      "Contacts",
      "Subscribers",
      "Mailing Lists",
      "Recipients",
      "Groups",
    ]);
  });

  it("each view opens its own Import History", () => {
    expect(VIEWS.map((view) => IMPORT_VIEWS[view].history.targetFilter)).toEqual([
      ["contact"],
      ["subscriber"],
      ["mailing_list"],
      ["recipient", "broadcast_group"],
      ["broadcast_group"],
    ]);
    const keys = VIEWS.map((view) => IMPORT_VIEWS[view].history.storageKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("importModuleNoun", () => {
  it("names the dialog after the module", () => {
    expect(importModuleNoun("contacts")).toBe("contact");
    expect(importModuleNoun("subscribers")).toBe("subscriber");
    expect(importModuleNoun("recipients")).toBe("recipient");
  });
});

describe("importJobBody", () => {
  it("Contacts sends nothing extra", () => {
    expect(importJobBody(IMPORT_VIEWS.contacts)).toEqual({});
  });

  it("a page without a group sends only its target", () => {
    expect(importJobBody(IMPORT_VIEWS.subscribers)).toEqual({ target: "subscriber" });
    expect(importJobBody(IMPORT_VIEWS.recipients)).toEqual({ target: "recipient" });
  });

  it("a list or group sends its target and ids", () => {
    expect(importJobBody(IMPORT_VIEWS.mailing_list, ["l1"])).toEqual({ target: "mailing_list", mailing_list_ids: ["l1"] });
    expect(importJobBody(IMPORT_VIEWS.broadcast_group, ["g1"])).toEqual({
      target: "broadcast_group",
      broadcast_group_ids: ["g1"],
    });
  });
});

describe("missingMappings", () => {
  const missing = (view: ImportView, fields: (string | null)[]) => missingMappings(IMPORT_VIEWS[view], fields).length;

  it("Contacts needs Name and either Email or Phone Number", () => {
    expect(missing("contacts", ["name", "email"])).toBe(0);
    expect(missing("contacts", ["name", "phone_number"])).toBe(0);
    expect(missing("contacts", ["name"])).toBe(1);
    expect(missing("contacts", ["email"])).toBe(1);
    expect(missing("contacts", [null])).toBe(2);
  });

  it("Subscribers needs Name and Email; a phone number does not replace it", () => {
    expect(missing("subscribers", ["name", "email"])).toBe(0);
    expect(missing("mailing_list", ["name", "phone_number"])).toBe(1);
  });

  it("Recipients needs Name and Phone Number; an email does not replace it", () => {
    expect(missing("recipients", ["name", "phone_number"])).toBe(0);
    expect(missing("broadcast_group", ["name", "email"])).toBe(1);
  });
});

describe("importFieldOptions", () => {
  const labels = (view: ImportView) => importFieldOptions(IMPORT_VIEWS[view].rules).map((option) => option.label);

  it("starts with Skip and marks what the module requires", () => {
    expect(importFieldOptions(IMPORT_VIEWS.contacts.rules)[0]).toEqual({ value: null, label: "-- Skip this column --" });
    expect(labels("contacts").slice(1, 4)).toEqual(["Name (required)", "Email", "Phone Number"]);
    expect(labels("subscribers").slice(1, 4)).toEqual(["Name (required)", "Email (required)", "Phone Number"]);
    expect(labels("recipients").slice(1, 4)).toEqual(["Name (required)", "Email", "Phone Number (required)"]);
  });

  it("all modules offer the same six fields", () => {
    for (const view of VIEWS) expect(importFieldOptions(IMPORT_VIEWS[view].rules)).toHaveLength(7);
  });
});

describe("the file check per module", () => {
  const rows = [
    { name: "Budi Santoso", email: "budi@example.com" },
    { name: "Andi Wijaya", phone_number: "081388880008" },
    { name: "Tanpa Kontak" },
  ];
  const result = (view: ImportView) => {
    const { ready, invalid, skipped } = checkImportFile(rows, IMPORT_VIEWS[view].fileRules);
    return { ready, invalid: invalid.map((row) => row.index), skipped };
  };

  it("Contacts: either identity is fine, a row with neither is skipped", () => {
    expect(result("contacts")).toEqual({ ready: [0, 1], invalid: [], skipped: [2] });
  });

  it("Subscribers: a row without an email is invalid, never skipped", () => {
    expect(result("subscribers")).toEqual({ ready: [0], invalid: [1, 2], skipped: [] });
    expect(result("mailing_list")).toEqual({ ready: [0], invalid: [1, 2], skipped: [] });
  });

  it("Recipients: a row without a phone number is invalid, never skipped", () => {
    expect(result("recipients")).toEqual({ ready: [1], invalid: [0, 2], skipped: [] });
    expect(result("broadcast_group")).toEqual({ ready: [1], invalid: [0, 2], skipped: [] });
  });

  it("says which column is missing", () => {
    const messages = (view: ImportView, row: Record<string, string>) =>
      validateImportRow(row, IMPORT_VIEWS[view].rules).map((issue) => issue.message);
    expect(messages("subscribers", { name: "Andi Wijaya" })).toEqual(["Email is required"]);
    expect(messages("recipients", { name: "Andi Wijaya" })).toEqual(["Phone Number is required"]);
  });

  it("rows with the same email or phone are one group in every module", () => {
    const same = [
      { name: "Budi", email: "budi@example.com", phone_number: "081388880008" },
      { name: "Budi Santoso", email: "BUDI@example.com", phone_number: "0813-8888-0008" },
    ];
    for (const view of VIEWS) {
      expect(checkImportFile(same, IMPORT_VIEWS[view].fileRules).groups).toHaveLength(1);
    }
  });
});

describe("the templates", () => {
  it("every sample row passes its module's check, in every view", () => {
    for (const view of VIEWS) {
      const { rules, template } = IMPORT_VIEWS[view];
      for (const sample of template.samples) expect(validateImportRow(sample, rules)).toEqual([]);
    }
  });

  it("the headers map themselves in the Mapping step", () => {
    for (const view of VIEWS) {
      const { rules, template } = IMPORT_VIEWS[view];
      expect(importTemplateSheets(template).data[0].map(suggestContactField)).toEqual(rules.map((rule) => rule.field));
    }
  });

  it("each module has its own file", () => {
    const names = ["contacts", "subscribers", "recipients"].map((view) => IMPORT_VIEWS[view as ImportView].template.fileName);
    expect(new Set(names).size).toBe(3);
  });
});
