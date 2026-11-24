import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { DARK_TOKENS, darkTint, themed } from "./theme";

describe("dark colour tokens", () => {
  it("app/globals.css defines every --dk-* token with the same colour, inside .dark only", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
    const darkBlock = css.match(/^\.dark \{([\s\S]*?)^\}/m)?.[1] ?? "";
    const inDark = Object.fromEntries([...darkBlock.matchAll(/--dk-([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
    expect(inDark).toEqual(DARK_TOKENS);

    // Defined anywhere else (such as :root), light mode would change too.
    const definitions = [...css.matchAll(/--dk-[a-z-]+:/g)].length;
    expect(definitions).toBe(Object.keys(DARK_TOKENS).length);
  });

  it("themed() keeps the light colour as the fallback", () => {
    expect(themed("field", "#FAFAF6")).toBe("var(--dk-field, #FAFAF6)");
    expect(themed("text", "white")).toBe("var(--dk-text, white)");
  });

  it("darkTint() mixes the colour into transparent", () => {
    expect(darkTint("#666cff")).toBe("color-mix(in srgb, #666cff 18%, transparent)");
    expect(darkTint("#EF4444", 40)).toBe("color-mix(in srgb, #EF4444 40%, transparent)");
  });
});
