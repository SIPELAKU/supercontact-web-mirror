import { describe, expect, it } from "vitest";
import { departmentLine, keyPeoplePageCount, personInitials, presenceBadge, whatsappLink } from "./keyPeople";

describe("whatsappLink", () => {
  it("turns a local number into the international one", () => {
    expect(whatsappLink("0812-3456 7890")).toBe("https://wa.me/6281234567890");
    expect(whatsappLink("812 3456 7890")).toBe("https://wa.me/6281234567890");
  });

  it("keeps a number that already has its country code", () => {
    expect(whatsappLink("+62 812 3456 7890")).toBe("https://wa.me/6281234567890");
    expect(whatsappLink("+1 415 555 0100")).toBe("https://wa.me/14155550100");
  });

  it("too short to be a number: no link", () => {
    expect(whatsappLink("0812")).toBeNull();
    expect(whatsappLink("ext. 12")).toBeNull();
  });
});

describe("presenceBadge", () => {
  it("online, away and offline", () => {
    expect(presenceBadge("online")).toEqual({ label: "Online", dot: "bg-green-500" });
    expect(presenceBadge(" Away ")?.label).toBe("Away");
    expect(presenceBadge("offline")?.dot).toBe("bg-slate-300");
  });

  it("not an agent: no dot", () => {
    for (const value of [null, undefined, "", "busy"]) expect(presenceBadge(value)).toBeNull();
  });
});

describe("personInitials", () => {
  it("first and last name", () => {
    expect(personInitials("Rina Sari")).toBe("RS");
    expect(personInitials("  rina  ayu  sari ")).toBe("RS");
  });

  it("one word, or nothing", () => {
    expect(personInitials("budi")).toBe("B");
    expect(personInitials("   ")).toBe("?");
  });
});

describe("keyPeoplePageCount", () => {
  it("rounds up", () => {
    expect(keyPeoplePageCount(12)).toBe(1);
    expect(keyPeoplePageCount(13)).toBe(2);
    expect(keyPeoplePageCount(25, 12)).toBe(3);
  });

  it("never less than one page", () => {
    expect(keyPeoplePageCount(0)).toBe(1);
    expect(keyPeoplePageCount(Number.NaN)).toBe(1);
    expect(keyPeoplePageCount(5, 0)).toBe(1);
  });
});

describe("departmentLine", () => {
  it("joins what is known", () => {
    expect(departmentLine("Sales", "HO")).toBe("Sales · HO");
    expect(departmentLine("Sales", " ")).toBe("Sales");
    expect(departmentLine(undefined, "HO")).toBe("HO");
    expect(departmentLine()).toBe("");
  });
});
