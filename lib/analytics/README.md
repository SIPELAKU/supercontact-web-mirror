# Analytics & Google Ads measurement

## Account registry

- **GA4 property:** G-PWP9LQW138 (live in production)
- **Google Ads account:** 263-511-6386 → site tag `AW-2635116386`
  (`NEXT_PUBLIC_GOOGLE_ADS_ID=AW-2635116386` in the Vercel **Production**
  environment only). The "Registration completed" conversion label goes in
  `NEXT_PUBLIC_GOOGLE_ADS_REGISTER_LABEL` once the conversion action exists.

## Canonical event schema (GA4)

```
page_view                     — manual SPA pageviews (GoogleAnalytics.tsx, send_page_view:false)
  └─ cta_click                — any generic marketing CTA (register buttons, learn-more, …)
  └─ whatsapp_click           — clicks that actually open wa.me (floating button, hero/price WA CTAs)
       └─ sign_up             — successful registration (register page success path)
generate_lead                 — RESERVED for real lead captures (smart-capture magnet submits).
                                Renamed FROM the old generic-CTA event on 2026-08-31 — annotate
                                that date in GA4; earlier generate_lead data is CTA noise.
```

## Google Ads conversion architecture (decided 2026-08-31)

- **Primary bidding conversion:** the direct AW- tag conversion fired by
  `trackAdsRegistration()` (lib/analytics/ads.ts) on register success, with
  enhanced-conversion `user_data` (email + E.164 phone) from the form itself.
- **Secondary / volume signal:** GA4 `whatsapp_click`, imported into Ads as a
  conversion after GA4↔Ads linking. Value hierarchy: whatsapp_click 1,
  registration 10.
- GA4 `sign_up` stays **observation-only** in Ads (the AW tag is primary) —
  never import both, that double-counts registrations.
- **Never import `generate_lead`** unless you have verified it now only fires
  on magnet submits.

## Host guard

`analyticsAllowedOnHost()` (lib/analytics/gtag.ts) restricts script loading to
`smartsales.id` / `www.smartsales.id`. Production serves on the APEX — www
308-redirects to apex with query strings preserved (verified 2026-08-31).
dev.smartsales.id, staging.smartsales.id and *.vercel.app never load analytics
even if `NEXT_PUBLIC_GA_ID` leaks into their builds.
`NEXT_PUBLIC_ANALYTICS_DEBUG=true` bypasses the guard for localhost testing only.

## Consent posture (decision 2026-08-31)

No cookie banner / Consent Mode v2 at launch: campaigns geo-target Indonesia
and the Google consent mandate applies to EEA/UK/CH traffic. **Revisit
trigger:** any EEA targeting, or material EU traffic showing up in GA4 —
then implement Consent Mode v2 before expanding.

## Verification

`next.config.mjs` suppresses TS/ESLint build failures, so tracking regressions
never fail CI. Verify in the browser instead: Tag Assistant on the prod host
must show the G- and AW- tags firing, and one real test registration must show
"Recording conversions" in Ads diagnostics before any campaign is enabled.
Re-check after any release touching app/layout.tsx, components/analytics/ or
lib/analytics/.
