import { describe, expect, it } from "vitest";
import { HIDDEN_FEATURES, isFeatureHidden } from "@/lib/config/featureFlags";
import { settingsNav } from "@/lib/config/settingsNav";
import { sidebarNav } from "@/lib/config/sidebarNav";
import { DICTIONARIES, LANGUAGE_STORAGE_KEY } from "@/lib/constants/i18n";
import {
  appLanguage,
  formatText,
  navLabel,
  parseLanguage,
  readStoredLanguage,
  siteLanguage,
  writeStoredLanguage,
} from "./language";

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

const blockedStore = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("isFeatureHidden", () => {
  it("true hides; a missing or false entry shows", () => {
    expect(isFeatureHidden("languageSwitch", { languageSwitch: true })).toBe(true);
    expect(isFeatureHidden("languageSwitch", {})).toBe(false);
    expect(isFeatureHidden("languageSwitch", { languageSwitch: false })).toBe(false);
  });

  it("the language switch is hidden for now", () => {
    expect(HIDDEN_FEATURES.languageSwitch).toBe(true);
    expect(isFeatureHidden("languageSwitch")).toBe(true);
  });
});

describe("language choice", () => {
  it("only en and id are accepted", () => {
    expect(parseLanguage("en")).toBe("en");
    expect(parseLanguage("id")).toBe("id");
    for (const value of ["EN", "fr", "", null, undefined, 1]) expect(parseLanguage(value)).toBeNull();
  });

  it("saved and read back under the shared key", () => {
    const store = memoryStore();
    writeStoredLanguage(store, "id");
    expect(store.data[LANGUAGE_STORAGE_KEY]).toBe("id");
    expect(readStoredLanguage(store)).toBe("id");
  });

  it("nothing saved, a strange value, no storage, or blocked storage", () => {
    expect(readStoredLanguage(memoryStore())).toBeNull();
    expect(readStoredLanguage(memoryStore({ [LANGUAGE_STORAGE_KEY]: "jp" }))).toBeNull();
    expect(readStoredLanguage(null)).toBeNull();
    expect(readStoredLanguage(blockedStore)).toBeNull();
    expect(() => writeStoredLanguage(blockedStore, "en")).not.toThrow();
  });

  it("the site is Indonesian until someone picks", () => {
    expect(siteLanguage(null)).toBe("id");
    expect(siteLanguage("en")).toBe("en");
  });

  it("the app is English until someone picks, and always while the switch is hidden", () => {
    expect(appLanguage(null, false)).toBe("en");
    expect(appLanguage("id", false)).toBe("id");
    expect(appLanguage("en", false)).toBe("en");
    expect(appLanguage("id", true)).toBe("en");
    expect(appLanguage(null, true)).toBe("en");
  });
});

describe("formatText", () => {
  it("fills placeholders and leaves unknown ones", () => {
    expect(formatText("Notifications, {count} unread", { count: 3 })).toBe("Notifications, 3 unread");
    expect(formatText("{a} and {b}", { a: "x" })).toBe("x and {b}");
    expect(formatText("{count}{count}", { count: 0 })).toBe("00");
    expect(formatText("no placeholders", { count: 1 })).toBe("no placeholders");
  });
});

describe("menu names", () => {
  const names = new Set<string>();
  for (const section of sidebarNav) {
    names.add(section.title);
    for (const item of section.items) {
      names.add(item.name);
      for (const child of item.children ?? []) names.add(child.name);
    }
  }
  // Prospecting only shows with the data-intel preview, so it may be absent here.
  names.add("Prospecting");
  for (const section of settingsNav) {
    names.add(section.title);
    for (const child of section.children ?? []) names.add(child.title);
  }

  it("every Sidebar and Settings name has an Indonesian label", () => {
    const missing = [...names].filter((name) => !(name in DICTIONARIES.id.navLabels));
    expect(missing).toEqual([]);
  });

  it("no Indonesian label is left over from a removed menu entry", () => {
    const unused = Object.keys(DICTIONARIES.id.navLabels).filter((name) => !names.has(name));
    expect(unused).toEqual([]);
  });

  it("English keeps today's names; Indonesian translates", () => {
    expect(navLabel(DICTIONARIES.en, "Contacts")).toBe("Contacts");
    expect(navLabel(DICTIONARIES.en, "Tahapan Penjualan")).toBe("Tahapan Penjualan");
    expect(navLabel(DICTIONARIES.id, "Contacts")).toBe("Kontak");
    expect(navLabel(DICTIONARIES.id, "Not In The List")).toBe("Not In The List");
    expect(navLabel(DICTIONARIES.id, "toString")).toBe("toString");
  });
});

describe("dictionaries", () => {
  function keys(value: unknown, prefix = ""): string[] {
    if (typeof value !== "object" || value === null) return [prefix];
    return Object.entries(value).flatMap(([key, inner]) => keys(inner, prefix ? `${prefix}.${key}` : key));
  }

  it("Indonesian has the same keys as English and no empty text", () => {
    const { navLabels: _en, ...en } = DICTIONARIES.en;
    const { navLabels: _id, ...id } = DICTIONARIES.id;
    expect(keys(id).sort()).toEqual(keys(en).sort());
    for (const dictionary of [en, id]) {
      for (const path of keys(dictionary)) {
        const text = path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], dictionary);
        expect(typeof text === "string" && text.trim().length > 0, path).toBe(true);
      }
    }
  });

  it("placeholders match between the two languages", () => {
    const placeholders = (text: unknown) => (String(text).match(/\{\w+\}/g) ?? []).sort();
    const at = (dictionary: unknown, path: string) =>
      path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], dictionary);
    const { navLabels: _en, ...en } = DICTIONARIES.en;
    for (const path of keys(en)) {
      expect(placeholders(at(DICTIONARIES.id, path)), path).toEqual(placeholders(at(DICTIONARIES.en, path)));
    }
  });
});
