import { defineConfig } from 'vitest/config';
import path from 'node:path';

// First real test runner in this repo. `lib/tests/cookies.test.ts` predates it
// and is a hand-rolled console.log script, not a suite - nothing fails a build.
//
// Kept deliberately minimal: node environment, no jsdom, no React Testing
// Library. The tests that exist so far are pure logic - the content-type
// resolver and the sender-scope resolver - because the bugs they pin were pure
// logic that no amount of typechecking caught. Add a DOM environment when a
// component test actually needs one, not before.
export default defineConfig({
  // Vite loads the project's postcss.config.mjs by default and rejects the
  // Tailwind v4 plugin as "Invalid PostCSS Plugin". Nothing here renders CSS -
  // the suites are pure logic - so CSS processing is switched off rather than
  // teaching vitest about Tailwind for no benefit.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'components/**/*.test.ts'],
    // lib/tests/ predates any runner: hand-rolled console.log scripts with no
    // describe/it. They are not vitest suites and are excluded wholesale rather
    // than one file at a time - new tests live beside the code they cover.
    exclude: ['node_modules', '.next', 'lib/tests/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
