// components/admin/blueprints/kbFillOffer.ts
//
// A blueprint installs its KB packs with only the blueprint's OWN variables
// filled in (company name, CS contacts…). A pack's own variables - the
// marketing packs carry 65-84 of them, {{ALAMAT_PUSAT}} and the like - are
// never asked, so they land in the articles as raw placeholders. Setup Cepat
// offers to fill them on its Checklist Aktivasi tab (where an install lands),
// for as long as any are left and the user may both list the gaps and edit
// articles.

import type { ContentGapsResponse } from "@/lib/types/botPlayground";

export function offersKbFill(state: {
  /** GET /bot-playground/content-gaps needs omnichannel:setup. */
  canListGaps: boolean;
  /** POST /knowledge/articles/fill-placeholders needs knowledge author or above. */
  canEditArticles: boolean;
  /** Placeholders still unfilled across the knowledge base. */
  gapCount: number;
}): boolean {
  return state.canListGaps && state.canEditArticles && state.gapCount > 0;
}

/**
 * Filling may wait only while every article with a gap is still a draft: the
 * answer bot never reads a draft, and publishing one with a gap is refused
 * later anyway. Once one is published the bot can read the gap out to a
 * visitor, so it has to be filled now. An article without a reported status
 * counts as published - the BE lists published ones only until it adds drafts.
 */
export function canSkipKbFill(gaps: Pick<ContentGapsResponse, "variables">): boolean {
  const articles = gaps.variables.flatMap((v) => v.articles);
  return articles.length > 0 && articles.every((a) => a.status === "draft");
}

/** Which gaps a "skip" was given for: a new install brings new ones, and the panel back. */
export function kbGapSignature(gaps: Pick<ContentGapsResponse, "variables">): string {
  return gaps.variables
    .map((v) => v.key)
    .sort()
    .join(",");
}
