import { describe, expect, it } from "vitest";
import {
  duplicateFieldLabel,
  duplicateValueText,
  missingDuplicateChoices,
  readCreateContactResponse,
} from "./contactDuplicate";

const existing = { id: "k1", name: "Budi Santoso", email: "budi@mail.com", phone_number: "+628121111" };

describe("readCreateContactResponse", () => {
  it("201 is a new contact", () => {
    expect(readCreateContactResponse(201, { success: true, data: { id: "n1" } })).toEqual({
      kind: "created",
      contact: { id: "n1" },
    });
  });

  it("200 with duplicate.merged means the old contact was filled in, not a new one", () => {
    const res = readCreateContactResponse(200, {
      success: true,
      data: { id: "k1", duplicate: { merged: true, contact_id: "k1" } },
    });
    expect(res.kind).toBe("merged");
  });

  it("409 DUPLICATE_CONTACT carries the reason, the existing contact and the conflicts", () => {
    const conflicts = [{ field: "phone_number", existing: "+628121111", incoming: "+628132222" }];
    const res = readCreateContactResponse(409, {
      success: false,
      error: {
        code: "DUPLICATE_CONTACT",
        message: "A contact with the same email or phone number already exists",
        details: { reason: "same_email_different_name", existing_contact: existing, conflicts },
      },
    });
    expect(res).toEqual({
      kind: "duplicate",
      duplicate: { reason: "same_email_different_name", existing_contact: existing, conflicts },
    });
  });

  it("a duplicate without a conflicts list still opens the dialog", () => {
    const res = readCreateContactResponse(409, {
      error: { code: "DUPLICATE_CONTACT", details: { reason: "same_phone", existing_contact: existing } },
    });
    expect(res.kind === "duplicate" && res.duplicate.conflicts).toEqual([]);
  });

  it("another 409 or a 422 is an error with the API message and details", () => {
    const res = readCreateContactResponse(422, {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Choose existing or incoming for every conflicting field",
        details: { field: "duplicate_resolution.keep", missing: ["name"] },
      },
    });
    expect(res).toEqual({
      kind: "error",
      status: 422,
      message: "Choose existing or incoming for every conflicting field",
      details: { field: "duplicate_resolution.keep", missing: ["name"] },
    });
    expect(readCreateContactResponse(409, { error: { code: "CONFLICT", message: "x" } }).kind).toBe("error");
    // Only DUPLICATE_CONTACT opens the dialog, whatever else the 409 carries.
    expect(
      readCreateContactResponse(409, {
        error: { code: "CONFLICT", message: "x", details: { existing_contact: existing } },
      }).kind,
    ).toBe("error");
  });

  it("401 is reported as UNAUTHORIZED", () => {
    expect(readCreateContactResponse(401, {})).toMatchObject({ kind: "error", message: "UNAUTHORIZED" });
  });
});

describe("missingDuplicateChoices", () => {
  const conflicts = [
    { field: "name", existing: "Budi", incoming: "Budi S." },
    { field: "phone_number", existing: "1", incoming: "2" },
  ];

  it("lists every conflict without a choice", () => {
    expect(missingDuplicateChoices(conflicts, { name: "existing" })).toEqual(["phone_number"]);
  });

  it("is empty once all are chosen, or when nothing conflicts", () => {
    expect(missingDuplicateChoices(conflicts, { name: "existing", phone_number: "incoming" })).toEqual([]);
    expect(missingDuplicateChoices([], {})).toEqual([]);
  });
});

describe("duplicateFieldLabel", () => {
  it("names contact columns and humanises custom field keys", () => {
    expect(duplicateFieldLabel("phone_number")).toBe("Phone Number");
    expect(duplicateFieldLabel("region_id")).toBe("Wilayah");
    expect(duplicateFieldLabel("custom_fields.ukuran_baju")).toBe("Ukuran baju");
  });
});

describe("duplicateValueText", () => {
  it("shows the name for an id field", () => {
    expect(
      duplicateValueText(
        { field: "customer_type_id", existing: "t1", incoming: "t2", existing_label: "Reseller", incoming_label: "Korporat" },
        "incoming",
      ),
    ).toBe("Korporat");
  });

  it("formats plain, list and empty values", () => {
    expect(duplicateValueText({ field: "custom_fields.size", existing: "L", incoming: "XL" }, "existing")).toBe("L");
    expect(duplicateValueText({ field: "custom_fields.tags", existing: ["a", "b"], incoming: 3 }, "existing")).toBe("a, b");
    expect(duplicateValueText({ field: "custom_fields.n", existing: null, incoming: 3 }, "incoming")).toBe("3");
    expect(duplicateValueText({ field: "x", existing: null, incoming: 3 }, "existing")).toBe("-");
  });
});
