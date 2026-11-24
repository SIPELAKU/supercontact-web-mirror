import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { isAppPath } from "./appRoutes";

describe("APP_ROUTE_PREFIXES", () => {
  it("covers every page folder of the logged-in app (app/(app)/*)", () => {
    const appDir = path.join(process.cwd(), "app", "(app)");
    const folders = fs
      .readdirSync(appDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `/${entry.name}`);

    expect(folders.length).toBeGreaterThan(0);
    // A new module folder must be added to the list, or it is neither
    // protected by the middleware nor themed.
    expect(folders.filter((folder) => !isAppPath(folder))).toEqual([]);
  });

  it("leaves the public site out", () => {
    for (const p of ["/", "/login", "/help/acme", "/q/abc", "/csat/t1", "/blog", "/price"]) {
      expect(isAppPath(p)).toBe(false);
    }
    expect(isAppPath("/knowledge-base/articles/new")).toBe(true);
  });
});
