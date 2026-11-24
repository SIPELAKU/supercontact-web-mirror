import { describe, expect, it } from "vitest";
import { HIDDEN_FEATURES, isFeatureHidden } from "@/lib/config/featureFlags";
import { isAppPath } from "@/lib/config/appRoutes";
import { THEME_STORAGE_KEY } from "@/lib/constants/theme";
import { effectiveTheme, parseTheme, readStoredTheme, themeBootScript, writeStoredTheme } from "./theme";

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

describe("theme flag", () => {
  it("the switch is hidden for now", () => {
    expect(HIDDEN_FEATURES.themeSwitch).toBe(true);
    expect(isFeatureHidden("themeSwitch")).toBe(true);
  });
});

describe("app pages", () => {
  it("the logged-in pages, not the public site", () => {
    for (const path of ["/dashboard", "/sales/pipeline", "/settings/sales/pipeline-stages", "/support/workspace"]) {
      expect(isAppPath(path)).toBe(true);
    }
    for (const path of ["/", "/login", "/blog/x", "/solusi/sales", "/price", "", null, undefined]) {
      expect(isAppPath(path)).toBe(false);
    }
  });
});

describe("theme choice", () => {
  it("only light and dark", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    for (const value of ["Dark", "system", "", null, undefined, 1]) expect(parseTheme(value)).toBeNull();
  });

  it("saved and read back under its key", () => {
    const store = memoryStore();
    writeStoredTheme(store, "dark");
    expect(store.data[THEME_STORAGE_KEY]).toBe("dark");
    expect(readStoredTheme(store)).toBe("dark");
  });

  it("nothing saved, a strange value, no storage, or blocked storage", () => {
    expect(readStoredTheme(memoryStore())).toBeNull();
    expect(readStoredTheme(memoryStore({ [THEME_STORAGE_KEY]: "neon" }))).toBeNull();
    expect(readStoredTheme(null)).toBeNull();
    expect(readStoredTheme(blockedStore)).toBeNull();
    expect(() => writeStoredTheme(blockedStore, "dark")).not.toThrow();
  });
});

describe("effectiveTheme", () => {
  it("dark only on an app page with the switch shown and Dark picked", () => {
    expect(effectiveTheme("dark", false, "/dashboard")).toBe("dark");
    expect(effectiveTheme("light", false, "/dashboard")).toBe("light");
    expect(effectiveTheme(null, false, "/dashboard")).toBe("light");
  });

  it("the public site stays light", () => {
    expect(effectiveTheme("dark", false, "/")).toBe("light");
    expect(effectiveTheme("dark", false, "/login")).toBe("light");
  });

  it("a hidden switch keeps everything light, whatever was saved", () => {
    expect(effectiveTheme("dark", true, "/dashboard")).toBe("light");
  });
});

describe("themeBootScript", () => {
  const run = (path: string, stored: string | null) => {
    const classes = new Set<string>();
    const html = { classList: { add: (c: string) => classes.add(c) }, style: { colorScheme: "" } };
    const fn = new Function("location", "localStorage", "document", themeBootScript());
    fn({ pathname: path }, { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) }, { documentElement: html });
    return { dark: classes.has("dark"), scheme: html.style.colorScheme };
  };

  it("same rule as effectiveTheme, before the first paint", () => {
    expect(run("/dashboard", "dark")).toEqual({ dark: true, scheme: "dark" });
    expect(run("/dashboard", "light")).toEqual({ dark: false, scheme: "" });
    expect(run("/dashboard", null)).toEqual({ dark: false, scheme: "" });
    expect(run("/", "dark")).toEqual({ dark: false, scheme: "" });
  });

  it("never throws (blocked storage)", () => {
    const fn = new Function("location", "localStorage", "document", themeBootScript());
    expect(() =>
      fn({ pathname: "/dashboard" }, { getItem: () => { throw new Error("blocked"); } }, { documentElement: {} }),
    ).not.toThrow();
  });
});
