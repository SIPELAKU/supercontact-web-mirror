import { describe, expect, it } from "vitest";
import {
  CONTACT_SOURCE_OPTIONS,
  contactSourceLabel,
  contactSourceQuery,
} from "./contact-source";

describe("contactSourceLabel", () => {
  it("labels every API value", () => {
    expect(contactSourceLabel("web_widget")).toBe("Web Widget");
    expect(contactSourceLabel("crm_company")).toBe("Company");
    expect(contactSourceLabel("wa_marketing")).toBe("WA Marketing");
  });

  it("reads a contact without a source as Unknown", () => {
    expect(contactSourceLabel(null)).toBe("Unknown");
    expect(contactSourceLabel(undefined)).toBe("Unknown");
    expect(contactSourceLabel("")).toBe("Unknown");
  });

  it("shows a value this build does not know yet as-is", () => {
    expect(contactSourceLabel("tiktok")).toBe("tiktok");
  });
});

describe("CONTACT_SOURCE_OPTIONS", () => {
  it("offers the 14 API sources plus Unknown, last", () => {
    expect(CONTACT_SOURCE_OPTIONS).toHaveLength(15);
    expect(CONTACT_SOURCE_OPTIONS[0]).toEqual({ value: "manual", label: "Manual" });
    expect(CONTACT_SOURCE_OPTIONS.at(-1)).toEqual({ value: "unknown", label: "Unknown" });
  });
});

describe("contactSourceQuery", () => {
  it("joins several picks with commas (the API ORs them)", () => {
    expect(contactSourceQuery(["web_widget", "whatsapp"])).toBe("web_widget,whatsapp");
  });

  it("reads ONE pick restored from the URL, which arrives as a plain string", () => {
    expect(contactSourceQuery("unknown")).toBe("unknown");
  });

  it("is undefined when nothing is picked", () => {
    expect(contactSourceQuery(undefined)).toBeUndefined();
    expect(contactSourceQuery([])).toBeUndefined();
    expect(contactSourceQuery("")).toBeUndefined();
    expect(contactSourceQuery(["", ""])).toBeUndefined();
  });
});
