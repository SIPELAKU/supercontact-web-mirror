import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { PALETTE_COLORS, buildDarkPaletteCss, readTailwindTheme } from "../../scripts/dark-palette.mjs";

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), "utf8").replace(/\r\n/g, "\n");

describe("app/dark-palette.css", () => {
  it("matches the generator (run: node scripts/dark-palette.mjs > app/dark-palette.css)", () => {
    expect(read("app", "dark-palette.css")).toBe(buildDarkPaletteCss(readTailwindTheme()));
  });

  it("is imported by app/globals.css", () => {
    expect(read("app", "globals.css")).toContain('@import "./dark-palette.css";');
  });

  it("changes dark mode only: every variable sits in .dark, every rule under :where(.dark)", () => {
    const css = buildDarkPaletteCss(readTailwindTheme());
    const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const darkBlock = body.match(/^\.dark \{([\s\S]*?)^\}/m)?.[1] ?? "";
    expect([...darkBlock.matchAll(/--color-/g)].length).toBe(PALETTE_COLORS.length * 3);
    expect([...body.matchAll(/--color-[a-z]+-\d+:/g)].length).toBe(PALETTE_COLORS.length * 3);
    const rules = body.split("@layer utilities {")[1].split("\n").filter((l) => l.trim() && l.trim() !== "}");
    expect(rules.every((l) => l.trim().startsWith(":where(.dark) "))).toBe(true);
  });

  it("pale shades become tints, coloured text gets lighter, solid fills stay", () => {
    const css = buildDarkPaletteCss(readTailwindTheme());
    expect(css).toMatch(/--color-indigo-50: color-mix\(in oklab, oklch\([^)]+\) 12%, transparent\);/);
    expect(css).toContain(":where(.dark) .text-indigo-600 {");
    expect(css).toContain(":where(.dark) .hover\\:text-red-600:hover {");
    expect(css).not.toMatch(/--color-[a-z]+-(500|600|700|800|900):/);
  });
});
