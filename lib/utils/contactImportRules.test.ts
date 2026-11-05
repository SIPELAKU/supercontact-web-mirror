import { describe, expect, it } from "vitest";
import {
  CONTACT_IMPORT_TEMPLATE,
  contactCompareValue,
  contactIdentity,
  hasContactInfo,
  isImportEmail,
  normalizeImportPhone,
  validateContactImportRow,
} from "./contactImportRules";

const messages = (row: Record<string, string>) => validateContactImportRow(row).map((i) => i.message);

describe("normalizeImportPhone (copy of the API's normalize_phone_number_unchecked)", () => {
  it("formats Indonesian and international numbers like the API", () => {
    expect(normalizeImportPhone("081234567890")).toBe("+6281234567890");
    expect(normalizeImportPhone("+62 812-3456-7890")).toBe("+6281234567890");
    expect(normalizeImportPhone("(0812) 3456 7890")).toBe("+6281234567890");
    expect(normalizeImportPhone("006281234567890")).toBe("+6281234567890");
    expect(normalizeImportPhone("6281234567890")).toBe("+6281234567890");
    expect(normalizeImportPhone("81234567890")).toBe("+81234567890");
    // A lone 0 is not an Indonesian prefix.
    expect(normalizeImportPhone("0")).toBe("+0");
  });

  it("rejects what the API rejects", () => {
    expect(() => normalizeImportPhone("0813-ABC-5555")).toThrow("only digits");
    expect(() => normalizeImportPhone("62+812")).toThrow("one '+'");
    expect(() => normalizeImportPhone("++62812")).toThrow("one '+'");
    expect(() => normalizeImportPhone("(0812 3456")).toThrow("parentheses");
    expect(() => normalizeImportPhone("+")).toThrow("after '+'");
    expect(() => normalizeImportPhone("()")).toThrow("digits only");
    expect(() => normalizeImportPhone("  ")).toThrow("empty");
  });
});

describe("hasContactInfo", () => {
  it("needs an email or a phone number, either one is enough", () => {
    expect(hasContactInfo({ name: "Gita", email: "g@example.com" })).toBe(true);
    expect(hasContactInfo({ name: "Hadi", phone_number: "0813" })).toBe(true);
    expect(hasContactInfo({ name: "Fajar", company: "PT Fajar", email: " ", phone_number: "" })).toBe(false);
    expect(hasContactInfo({})).toBe(false);
  });
});

describe("validateContactImportRow", () => {
  const ok = { name: "Budi Santoso", email: "budi@example.com" };

  it("a row with a name and an email or phone passes", () => {
    expect(messages(ok)).toEqual([]);
    expect(messages({ name: "Hadi", phone_number: "081388880008" })).toEqual([]);
  });

  it("name is required, 3-255 characters", () => {
    expect(messages({ email: "a@example.com" })).toEqual(["Name is required"]);
    expect(messages({ ...ok, name: "Al" })).toEqual(["Name must be 3–255 characters"]);
    expect(messages({ ...ok, name: "Ali" })).toEqual([]);
    expect(messages({ ...ok, name: "x".repeat(255) })).toEqual([]);
    expect(messages({ ...ok, name: "x".repeat(256) })).toEqual(["Name must be 3–255 characters"]);
    // Counted in characters like the API, not UTF-16 units (an emoji is 2).
    expect(messages({ ...ok, name: "😀".repeat(255) })).toEqual([]);
  });

  it("email must look like an email", () => {
    for (const email of ["citra-at-example.com", "a@b", "a b@example.com", "a@@example.com", "a@example..com"]) {
      expect(messages({ ...ok, email })).toEqual(["Invalid email"]);
    }
    expect(messages({ ...ok, email: `${"a".repeat(250)}@x.com` })).toEqual(["Invalid email"]);
    expect(messages({ ...ok, email: "first.last+tag@mail.example.co.id" })).toEqual([]);
  });

  it("phone number: the API's characters and at most 30 characters", () => {
    expect(messages({ ...ok, phone_number: "0813-ABC-5555" })).toEqual([
      "Invalid phone number: only digits, spaces, '+', '-' and parentheses are allowed",
    ]);
    expect(messages({ ...ok, phone_number: "1".repeat(30) })).toEqual([]);
    expect(messages({ ...ok, phone_number: "1".repeat(31) })).toEqual(["Invalid phone number: at most 30 characters"]);
  });

  it("company 3-255, position at most 255, address at least 6, only when filled in", () => {
    expect(messages({ ...ok, company: "PT", address: "Jl 1" })).toEqual([
      "Company must be 3–255 characters",
      "Address must be at least 6 characters",
    ]);
    expect(messages({ ...ok, company: "PT A", address: "Jl. 12", position: "x".repeat(255) })).toEqual([]);
    expect(messages({ ...ok, address: "Jl. 1" })).toEqual(["Address must be at least 6 characters"]);
    expect(messages({ ...ok, position: "x".repeat(256) })).toEqual(["Position is too long"]);
    expect(messages({ ...ok, company: "", address: "", position: "" })).toEqual([]);
  });
});

describe("contactIdentity / contactCompareValue", () => {
  it("email ignores case, phone ignores format; each only when filled in", () => {
    expect(contactIdentity({ email: " ANDI@x.com ", phone_number: "0813 1111 0001" })).toEqual([
      "email:andi@x.com",
      "phone:+6281311110001",
    ]);
    expect(contactIdentity({ phone_number: "+62 813-1111-0001" })).toEqual(["phone:+6281311110001"]);
    expect(contactIdentity({ name: "No contact" })).toEqual([]);
  });

  it("compares other fields exactly", () => {
    expect(contactCompareValue("email", "ANDI@x.com")).toBe(contactCompareValue("email", "andi@x.com"));
    expect(contactCompareValue("phone_number", "0813-1111-0001")).toBe("+6281311110001");
    expect(contactCompareValue("name", "Andi")).not.toBe(contactCompareValue("name", "andi"));
  });
});

describe("CONTACT_IMPORT_TEMPLATE", () => {
  it("every sample row passes the check, so the template is never rejected", () => {
    for (const sample of CONTACT_IMPORT_TEMPLATE.samples) {
      expect(hasContactInfo(sample)).toBe(true);
      expect(validateContactImportRow(sample)).toEqual([]);
    }
  });
});

describe("isImportEmail (email-validator 2.3.0 behind the API's EmailStr, BE-7)", () => {
  it("refuses what the API refuses, which the old pattern let through", () => {
    for (const email of [
      // Special-use domains, also as the last part.
      "a@localhost",
      "a@toko.local",
      "a@toko.test",
      "a@x.invalid",
      "a@x.onion",
      "a@in-addr.arpa",
      "a@TOKO.LOCAL",
      // Dots in the local part.
      "a..b@mail.com",
      ".a@mail.com",
      "a.@mail.com",
      // Hostname labels and the top-level domain.
      "a@-toko.com",
      "a@toko-.com",
      "a@toko.123",
      "a@toko.co1",
      "a@[1.2.3.4]",
      "a@toko_x.com",
      `a@${"x".repeat(64)}.com`,
      `a@${"x.".repeat(126)}com`,
      // Characters outside atext, spaces, and more than one @.
      "a(b)@mail.com",
      "a,b@mail.com",
      '"a"@mail.com',
      "a\u00a0b@mail.com",
      "a@b@mail.com",
      "@mail.com",
      "a@",
      // A UTF-8 file read as Windows-1252: "tökö" became "tÃ¶kÃ¶"; ¶ is not
      // a letter, so no internationalized domain can hold it.
      "budi@tÃ¶kÃ¶.com",
      "budi@toko©.com",
      // Unsafe in the local part: a zero-width space (also after a dot), a
      // control character, and a combining mark first.
      "a\u200bb@mail.com",
      "a\u0007b@mail.com",
      "\u0301a@mail.com",
      "a.\u200bb@mail.com",
      // Domains: a combining mark first; non-ASCII digits (see the rule).
      "a@\u0301bali.id",
      "a@\u0663bali.id",
    ]) {
      expect([email, isImportEmail(email)]).toEqual([email, false]);
    }
  });

  it("takes what the API takes", () => {
    for (const email of [
      "budi@example.com",
      "Budi.Santoso@Example.CO.ID",
      "first.last+tag@mail.example.co.id",
      "o'neil_99@sub-domain.example.com",
      "a!#$%&*/=?^`{|}~-@mail.com",
      // Internationalized addresses.
      "budi@tökö.com",
      "bùdi@toko.com",
      // Non-ASCII punctuation, symbols and inner marks are fine before the @.
      "budi¶©@toko.com",
      "be\u0301la@toko.com",
      "用户@例子.广告",
      "a@b\u0301ali.id",
      `a@${"x".repeat(63)}.com`,
      // "test" only as a whole label.
      "a@test.com",
      "a@contest.id",
    ]) {
      expect([email, isImportEmail(email)]).toEqual([email, true]);
    }
  });

  it("at most 254 characters in all", () => {
    expect(isImportEmail(`${"a".repeat(248)}@x.com`)).toBe(true);
    expect(isImportEmail(`${"a".repeat(249)}@x.com`)).toBe(false);
  });
});
