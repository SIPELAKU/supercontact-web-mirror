// lib/utils/kbPlaceholders.ts
//
// Raw template placeholders ({{ALAMAT_PUSAT}}, {{company_name}}) left in
// Knowledge Base articles. A blank stays visible in the text rather than
// disappearing, and the answer bot reads a published article out as it is -
// so these decide what gets filled, and what may not be published yet.

/** What a placeholder-fill form sends to POST /knowledge/articles/fill-placeholders:
 *  values trimmed, blank ones left out (they stay visible placeholders). */
export function placeholderPayload(values: Record<string, string>): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
  }
  return payload;
}

/** Every distinct placeholder still in a text, in order of first use. Upper and
 *  lower case both count: blueprint variables are lower case ({{company_name}}). */
export function unfilledPlaceholders(text?: string | null): string[] {
  const found: string[] = [];
  for (const match of (text ?? "").matchAll(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g)) {
    if (!found.includes(match[1])) found.push(match[1]);
  }
  return found;
}

/** A Content Gaps snippet cut into plain text and the field's own placeholder.
 *  Neighbouring placeholders share a snippet ("Sabtu: {{JAM_SABTU}} - Minggu:
 *  {{JAM_MINGGU}}"), so the form marks which one the field fills. The key
 *  matches case-insensitively and with inner spaces, like fill-placeholders. */
export function splitOwnPlaceholder(
  context: string,
  key: string
): { text: string; own: boolean }[] {
  const pieces: { text: string; own: boolean }[] = [];
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const token = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "gi");
  let last = 0;
  for (const match of context.matchAll(token)) {
    const start = match.index ?? 0;
    if (start > last) pieces.push({ text: context.slice(last, start), own: false });
    pieces.push({ text: match[0], own: true });
    last = start + match[0].length;
  }
  if (last < context.length) pieces.push({ text: context.slice(last), own: false });
  return pieces;
}

export interface ArticleWithPlaceholders {
  id: string;
  title: string;
  placeholders: string[];
}

/** The articles that still carry placeholders, with which ones - for the
 *  "cannot publish yet" check. */
export function articlesWithPlaceholders(
  articles: { id: string; title: string; body?: string | null }[]
): ArticleWithPlaceholders[] {
  return articles
    .map((a) => ({ id: a.id, title: a.title, placeholders: unfilledPlaceholders(a.body) }))
    .filter((a) => a.placeholders.length > 0);
}

export interface ArticleGap extends ArticleWithPlaceholders {
  status?: string;
}

/** Content Gaps turned around: one entry per article with every placeholder
 *  still in it, in the order the API lists them. The article list has no
 *  bodies, so this is how it knows which drafts are ready to publish. */
export function articlesFromGaps(
  gaps: { variables: { key: string; articles: { id: string; title: string; status?: string }[] }[] } | undefined
): ArticleGap[] {
  const byId = new Map<string, ArticleGap>();
  for (const variable of gaps?.variables ?? []) {
    for (const a of variable.articles) {
      const entry = byId.get(a.id) ?? { id: a.id, title: a.title, status: a.status, placeholders: [] };
      if (!entry.placeholders.includes(variable.key)) entry.placeholders.push(variable.key);
      byId.set(a.id, entry);
    }
  }
  return [...byId.values()];
}

/** The tag beside an article's status in the list: "ready" for a draft with
 *  nothing left to fill, the number of placeholders left for one that still
 *  has some, null when there is nothing to say (archived, or gaps unknown). */
export function publishReadiness(
  article: { id: string; status: string },
  gapsById: Map<string, ArticleGap> | undefined
): "ready" | number | null {
  if (!gapsById || article.status === "archived") return null;
  const gap = gapsById.get(article.id);
  if (gap) return gap.placeholders.length;
  return article.status === "draft" ? "ready" : null;
}

export interface PlaceholderField {
  key: string;
  label: string;
  example: string;
}

type GapsForArticle = {
  variables: { key: string; label?: string; example?: string; articles: { id: string }[] }[];
};

/** The placeholders still left in one article, each with the label and
 *  example Content Gaps carries - the fields of the "Isi placeholder" dialog. */
export function articlePlaceholderFields(gaps: GapsForArticle | undefined, articleId: string): PlaceholderField[] {
  const fields: PlaceholderField[] = [];
  for (const v of gaps?.variables ?? []) {
    if (fields.some((f) => f.key === v.key)) continue;
    if (v.articles.some((a) => a.id === articleId)) {
      fields.push({ key: v.key, label: v.label ?? "", example: v.example ?? "" });
    }
  }
  return fields;
}

/** How many OTHER articles carry at least one of these placeholders: what
 *  "apply to the other articles too" would also change. */
export function otherArticlesSharing(gaps: GapsForArticle | undefined, articleId: string, keys: string[]): number {
  const others = new Set<string>();
  for (const v of gaps?.variables ?? []) {
    if (!keys.includes(v.key)) continue;
    for (const a of v.articles) if (a.id !== articleId) others.add(a.id);
  }
  return others.size;
}

/** Where in this article a placeholder sits, for the dialog: the first of the
 *  title, excerpt and body that holds it (the API fills all three), cut to a
 *  window around it. null when it is in none of them. */
export function placeholderSnippet(
  article: { title?: string | null; excerpt?: string | null; body?: string | null },
  key: string,
  radius = 60
): { where: "title" | "excerpt" | "body"; text: string } | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const token = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "i");
  for (const where of ["title", "excerpt", "body"] as const) {
    const text = article[where] ?? "";
    const match = token.exec(text);
    if (!match) continue;
    const start = Math.max(0, match.index - radius);
    const end = Math.min(text.length, match.index + match[0].length + radius);
    const window = text.slice(start, end).split(/\s+/).join(" ").trim();
    return { where, text: `${start > 0 ? "…" : ""}${window}${end < text.length ? "…" : ""}` };
  }
  return null;
}

/** The fill-placeholders body for the dialog: only this article, unless the
 *  user chose to apply the values to every article carrying them. */
export function articleFillRequest(
  values: Record<string, string>,
  articleId: string,
  applyToOthers: boolean
): { values: Record<string, string>; articleIds?: string[] } {
  const payload = placeholderPayload(values);
  return applyToOthers ? { values: payload } : { values: payload, articleIds: [articleId] };
}

type RejectedArticle = { id?: unknown; article_id?: unknown; title?: unknown; placeholders?: unknown };

/** The articles in the API's refusal to publish placeholders (BE-10, a 422
 *  VALIDATION_ERROR). `error.details` is `{ article_id, title, placeholders }`
 *  for one article, `{ articles: [same] }` for bulk-status / bulk-publish. An
 *  `id` key and a `reason` other than "unfilled_placeholders" are read too, in
 *  case the API moves to the contract first written down for it. The UI
 *  checks first, but "Terbitkan semua draft" cannot (it never loads the
 *  bodies), nor can a stale page - this is how those still land on the same
 *  dialog. [] for any other error, a pydantic 422 (details is a list) included. */
export function placeholderRejection(err: unknown): ArticleWithPlaceholders[] {
  const details = (err as { error?: { details?: unknown } } | null)?.error?.details as
    | (RejectedArticle & { reason?: unknown; articles?: unknown })
    | null
    | undefined;
  if (!details || typeof details !== "object" || Array.isArray(details)) return [];
  if (details.reason !== undefined && details.reason !== "unfilled_placeholders") return [];
  const entries: RejectedArticle[] = Array.isArray(details.articles) ? details.articles : [details];
  return entries
    .map((a) => ({
      id: String(a?.article_id ?? a?.id ?? ""),
      title: String(a?.title || "(tanpa judul)"),
      placeholders: Array.isArray(a?.placeholders) ? a.placeholders.map(String) : [],
    }))
    .filter((a) => a.id && a.placeholders.length > 0);
}
