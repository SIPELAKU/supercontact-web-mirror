// Bundles widget/src/widget.ts into public/widget.js - a static asset
// served by this app's own Vercel deploy, embedded on TENANT websites via
// <script src=".../widget.js" data-widget-key="..." data-api-url="...">.
// Deliberately not part of the Next.js/webpack build (that bundle isn't
// meant to be embedded on a third-party page) - run before `next build` so
// public/widget.js exists by the time Next.js copies public/ into the
// deploy output. public/widget.js itself is generated, not committed.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

await build({
  entryPoints: [path.join(root, "widget/src/widget.ts")],
  outfile: path.join(root, "public/widget.js"),
  bundle: true,
  minify: true,
  target: "es2018",
  format: "iife",
  logLevel: "info",
});
