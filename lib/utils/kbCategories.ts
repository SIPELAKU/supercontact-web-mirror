// lib/utils/kbCategories.ts
//
// Picking several Knowledge Base categories and deleting them at once.
// Deleting a category deletes its sections and every article in them for
// good (database cascade), so before anything goes the user is shown exactly
// how much: the counts come with each category from the API (BE 1.157.0).

export type SelectAllState = "none" | "some" | "all";

/** The "select all" checkbox: unticked, half-ticked, or ticked. */
export function selectAllState(selected: ReadonlySet<string>, allIds: string[]): SelectAllState {
  const picked = allIds.filter((id) => selected.has(id)).length;
  if (picked === 0) return "none";
  return picked === allIds.length ? "all" : "some";
}

/** "Select all": everything when not everything is picked yet, else nothing. */
export function toggleAll(selected: ReadonlySet<string>, allIds: string[]): Set<string> {
  return selectAllState(selected, allIds) === "all" ? new Set() : new Set(allIds);
}

export function toggleOne(selected: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Drops picks whose category is gone (deleted, here or elsewhere). */
export function keepExisting(selected: ReadonlySet<string>, allIds: string[]): Set<string> {
  return new Set(allIds.filter((id) => selected.has(id)));
}

type CategoryCounts = {
  id: string;
  name: string;
  section_count?: number;
  article_count?: number;
  published_article_count?: number;
};

export interface DeleteImpact {
  categories: { id: string; name: string; articles: number | null }[];
  sections: number;
  articles: number;
  published: number;
  /** False when any picked category came without counts (older API): the
   *  dialog then warns without numbers rather than show a wrong zero. */
  countsKnown: boolean;
}

/** What deleting these categories takes along, in list order. */
export function deleteImpact(categories: CategoryCounts[], ids: ReadonlySet<string>): DeleteImpact {
  const picked = categories.filter((c) => ids.has(c.id));
  const countsKnown = picked.every((c) => typeof c.article_count === "number");
  return {
    categories: picked.map((c) => ({
      id: c.id,
      name: c.name,
      articles: typeof c.article_count === "number" ? c.article_count : null,
    })),
    sections: picked.reduce((n, c) => n + (c.section_count ?? 0), 0),
    articles: picked.reduce((n, c) => n + (c.article_count ?? 0), 0),
    published: picked.reduce((n, c) => n + (c.published_article_count ?? 0), 0),
    countsKnown,
  };
}
