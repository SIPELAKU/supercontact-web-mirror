"use client";

// Everything behind "manage the company's stages", shared by the gear dialog
// on the Pipeline page and the Settings › Sales › Pipeline Stages page: load
// every stage (inactive ones too), keep a draft, (de)activate at once, and
// save the draft as deletes, creates, renames/recolours and one reorder.

import { useCallback, useEffect, useState } from "react";
import { notify } from "@/lib/notifications";
import {
  useCreatePipelineStage,
  useDeletePipelineStage,
  usePipelineStages,
  useReorderPipelineStages,
  useUpdatePipelineStage,
} from "@/lib/hooks/usePipelineStages";
import { rowsFromStages, type StageDraftRow } from "./stageRules";
import { applyStageRequests, useStageDraft } from "./useStageDraft";

const message = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

interface UseStageManagerOptions {
  /** The editor is on screen (a dialog that is open, or the settings page). */
  active: boolean;
  /** Something was written to the API (to reload a board, for instance). */
  onSaved?: () => void;
}

export function useStageManager({ active, onSaved }: UseStageManagerOptions) {
  // Inactive stages are always loaded (one request); the checkbox only shows
  // or hides them. Names must stay unique across all of them.
  const stagesQuery = usePipelineStages(true);
  const { refetch } = stagesQuery;
  const draft = useStageDraft([]);
  const { reset, isDirty } = draft;
  const [showInactive, setShowInactive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();

  const serverStages = stagesQuery.data?.data?.data;

  // Fresh rows when shown, and whenever the list reloads with nothing unsaved.
  useEffect(() => {
    if (active && serverStages && !isDirty && !saving) reset(rowsFromStages(serverStages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, serverStages]);

  // Each time it is shown: from the top, against the latest list.
  useEffect(() => {
    if (!active) return;
    setShowInactive(false);
    if (serverStages) reset(rowsFromStages(serverStages));
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /** Throw the draft away and show the list as the API has it now. */
  const reload = useCallback(async () => {
    const fresh = await refetch();
    reset(rowsFromStages(fresh.data?.data?.data ?? []));
  }, [refetch, reset]);

  const toggleActive = async (row: StageDraftRow) => {
    if (!row.id) return;
    const next = !row.isActive;
    setTogglingKey(row.key);
    try {
      await updateStage.mutateAsync({ id: row.id, data: { is_active: next } });
      draft.applyActivation(row.id, next);
      notify.success(next ? `${row.name} is active again` : `${row.name} is hidden from the board`);
      onSaved?.();
    } catch (error) {
      notify.error(message(error, "Failed to update pipeline stage"));
    } finally {
      setTogglingKey(null);
    }
  };

  /** Resolves true when everything was saved. On a failure the list is
   *  reloaded: whatever went through before it stays saved. */
  const save = async (successMessage = "Stages saved"): Promise<boolean> => {
    if (!draft.checkBeforeSave()) return false;
    setSaving(true);
    try {
      await applyStageRequests(
        draft.requests,
        {
          remove: (id) => deleteStage.mutateAsync(id),
          create: async (body) => (await createStage.mutateAsync(body)).data.id,
          update: (id, body) => updateStage.mutateAsync({ id, data: body }),
          reorder: (ids) => reorderStages.mutateAsync(ids),
        },
        draft.rows,
      );
      notify.success(successMessage);
      onSaved?.();
      return true;
    } catch (error) {
      notify.error(message(error, "Failed to save stages"));
      onSaved?.();
      await reload();
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    draft,
    isDirty,
    serverStages,
    loading: stagesQuery.isLoading && !serverStages,
    loadError: stagesQuery.isError && !serverStages ? message(stagesQuery.error, "Failed to load pipeline stages") : null,
    refetch,
    reload,
    showInactive,
    setShowInactive,
    saving,
    togglingKey,
    toggleActive,
    save,
  };
}

export type StageManager = ReturnType<typeof useStageManager>;
