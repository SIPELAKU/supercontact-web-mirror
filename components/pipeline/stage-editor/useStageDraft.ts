"use client";

// components/pipeline/stage-editor/useStageDraft.ts
//
// The editor's working copy: rows are changed here and only reach the API on
// Save (or Create Pipeline). `diffStages` turns the copy into the requests to
// send, in the order the API needs them.

import { useCallback, useMemo, useState } from "react";
import {
  FALLBACK_STAGE_COLOR,
  STAGE_PALETTE,
  canAddStage,
  insertBeforeWon,
  moveRow,
  normalizeOrder,
  validateNames,
  type StageDraftRow,
} from "./stageRules";

export type StageRequest =
  | { kind: "delete"; id: string; name: string }
  | { kind: "create"; key: string; name: string; color: string }
  | { kind: "update"; id: string; name?: string; color?: string }
  /** The active stages in board order, by row key (a new stage's id is only
   *  known once it is created). */
  | { kind: "reorder"; keys: string[] };

const activeKeys = (rows: StageDraftRow[]) => rows.filter((row) => row.isActive).map((row) => row.key);

/**
 * The requests that turn `original` (as saved) into `draft`: deletes first
 * (so a freed name can be reused), then creates, then renames/recolours,
 * then one reorder of the active stages. The reorder is left out when the API
 * already puts the stages in that order by itself (a new stage lands right
 * before Won).
 */
export function diffStages(original: StageDraftRow[], draft: StageDraftRow[]): StageRequest[] {
  const draftIds = new Set(draft.map((row) => row.id).filter(Boolean));
  const requests: StageRequest[] = [];

  for (const row of original) {
    if (row.id && !draftIds.has(row.id)) requests.push({ kind: "delete", id: row.id, name: row.name });
  }

  const created = draft.filter((row) => !row.id);
  for (const row of created) {
    requests.push({ kind: "create", key: row.key, name: row.name.trim(), color: row.color });
  }

  const before = new Map(original.map((row) => [row.id, row]));
  for (const row of draft) {
    const saved = row.id ? before.get(row.id) : undefined;
    if (!row.id || !saved) continue;
    const name = row.name.trim();
    const patch: { name?: string; color?: string } = {};
    if (name !== saved.name) patch.name = name;
    if (row.color.toUpperCase() !== saved.color.toUpperCase()) patch.color = row.color;
    if (patch.name !== undefined || patch.color !== undefined) requests.push({ kind: "update", id: row.id, ...patch });
  }

  // What the API ends up with without a reorder: the saved order minus the
  // deleted stages, with each new stage inserted right before Won.
  let expected = original.filter((row) => row.isActive && row.id && draftIds.has(row.id));
  for (const row of created.filter((r) => r.isActive)) expected = insertBeforeWon(expected, row);
  const wanted = activeKeys(draft);
  const expectedKeys = expected.map((row) => (row.id ? draft.find((d) => d.id === row.id)?.key ?? row.key : row.key));
  if (wanted.join("|") !== expectedKeys.join("|")) requests.push({ kind: "reorder", keys: wanted });

  return requests;
}

export interface StageApi {
  remove: (id: string) => Promise<unknown>;
  /** Resolves with the new stage's id. */
  create: (body: { name: string; color: string }) => Promise<string>;
  update: (id: string, body: { name?: string; color?: string }) => Promise<unknown>;
  reorder: (ids: string[]) => Promise<unknown>;
}

/** Sends the requests one after another and stops at the first failure
 *  (which is thrown). Earlier requests stay saved: there is no batch endpoint. */
export async function applyStageRequests(requests: StageRequest[], api: StageApi, draft: StageDraftRow[]): Promise<void> {
  const idByKey = new Map(draft.filter((row) => row.id).map((row) => [row.key, row.id as string]));
  for (const request of requests) {
    if (request.kind === "delete") await api.remove(request.id);
    else if (request.kind === "create") idByKey.set(request.key, await api.create({ name: request.name, color: request.color }));
    else if (request.kind === "update") {
      const { id, kind: _kind, ...body } = request;
      await api.update(id, body);
    } else {
      const ids = request.keys.map((key) => idByKey.get(key)).filter((id): id is string => Boolean(id));
      await api.reorder(ids);
    }
  }
}

/** The next palette colour no row uses yet (grey when all are taken). */
export function nextColor(rows: StageDraftRow[]): string {
  const used = new Set(rows.map((row) => row.color.toUpperCase()));
  return STAGE_PALETTE.find((color) => !used.has(color)) ?? FALLBACK_STAGE_COLOR;
}

let newKeySeq = 0;

export function useStageDraft(initial: StageDraftRow[]) {
  const [original, setOriginal] = useState<StageDraftRow[]>(initial);
  const [rows, setRows] = useState<StageDraftRow[]>(initial);
  // Errors show on a field once it was edited, or on every field after a
  // save attempt; a fresh "Add Stage" row is not red straight away.
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);
  // Bumped on every reset, so fields with their own state (the name field's
  // "Custom name…") start over from the reloaded rows.
  const [version, setVersion] = useState(0);

  const touch = (key: string) => setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  const patchRow = (key: string, patch: Partial<StageDraftRow>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const reset = useCallback((next: StageDraftRow[]) => {
    setOriginal(next);
    setRows(next);
    setTouched(new Set());
    setShowAllErrors(false);
    setVersion((v) => v + 1);
  }, []);

  const requests = useMemo(() => diffStages(original, rows), [original, rows]);
  const allErrors = useMemo(() => validateNames(rows), [rows]);
  const errors = useMemo(
    () => Object.fromEntries(Object.entries(allErrors).filter(([key]) => showAllErrors || touched.has(key))),
    [allErrors, showAllErrors, touched],
  );

  return {
    original,
    rows,
    version,
    requests,
    isDirty: requests.length > 0,
    errors,
    isValid: Object.keys(allErrors).length === 0,
    /** Call on Save: shows every error; true when there is none. */
    checkBeforeSave: () => {
      setShowAllErrors(true);
      return Object.keys(allErrors).length === 0;
    },
    setName: (key: string, name: string) => {
      touch(key);
      patchRow(key, { name });
    },
    setColor: (key: string, color: string) => patchRow(key, { color }),
    addStage: () => {
      setRows((prev) =>
        // Never past the limit, even if the button was not hidden in time.
        !canAddStage(prev.length) ? prev : insertBeforeWon(prev, {
          key: `new-${++newKeySeq}`,
          id: null,
          name: "",
          color: nextColor(prev),
          outcome: "open",
          isLocked: false,
          isActive: true,
          dealCount: 0,
        }),
      );
    },
    removeRow: (key: string) => setRows((prev) => prev.filter((row) => row.key !== key)),
    move: (activeKey: string, overKey: string) => setRows((prev) => moveRow(prev, activeKey, overKey)),
    /** A stage was (de)activated on the API already: reflect it in both the
     *  saved copy and the draft, keeping the other unsaved edits. */
    applyActivation: (id: string, isActive: boolean) => {
      const toggle = (list: StageDraftRow[]) => {
        const row = list.find((r) => r.id === id);
        if (!row) return list;
        const next = { ...row, isActive };
        return isActive ? insertBeforeWon(list, next) : normalizeOrder(list.map((r) => (r.id === id ? next : r)));
      };
      setOriginal(toggle);
      setRows(toggle);
    },
    reset,
  };
}

export type StageDraft = ReturnType<typeof useStageDraft>;
