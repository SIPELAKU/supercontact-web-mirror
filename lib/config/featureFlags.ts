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
