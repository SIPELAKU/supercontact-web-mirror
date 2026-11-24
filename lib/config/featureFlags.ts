// lib/config/featureFlags.ts
//
// Unreleased Data Intelligence features (Prospecting incl. its "Unlimited
// (dev)" credit pill, and the Website Intelligence card on Company 360) are
// merged into dev but must not appear in production yet.
//
// Hidden by default: they show only when NEXT_PUBLIC_ENABLE_DATA_INTEL_PREVIEW
// is exactly "true". Unset, empty or any other value keeps them hidden, so an
// environment nobody configured can never leak them. NEXT_PUBLIC_* is inlined
// at build time, so keep the literal `process.env.NEXT_PUBLIC_...` access and
// redeploy after changing the value.
export const SHOW_DATA_INTEL_PREVIEW =
  process.env.NEXT_PUBLIC_ENABLE_DATA_INTEL_PREVIEW === "true";

// Finished-in-part features that stay hidden on every environment (dev too)
// until they are ready. This is a plain constant, not an env variable: to show
// a feature, delete its line below (a missing or false entry shows it).
export type HideableFeature = "languageSwitch" | "themeSwitch";

export const HIDDEN_FEATURES: Partial<Record<HideableFeature, boolean>> = {
  // ID/EN switch in the app Topbar. The app is still being translated, so
  // while hidden it stays in English whatever was picked on the public site,
  // and the public site behaves as before (its choice is not remembered).
  languageSwitch: true,
  // Light/Dark switch in the app Topbar. Pages are moved to dark colours one
  // module at a time, so while hidden every page stays light, whatever was
  // picked before.
  themeSwitch: true,
};

export function isFeatureHidden(
  feature: HideableFeature,
  flags: Partial<Record<HideableFeature, boolean>> = HIDDEN_FEATURES,
): boolean {
  return flags[feature] === true;
}
