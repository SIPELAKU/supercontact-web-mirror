"use client";

// The gear dialog (mode "manage": every stage) and Edit from a column's menu
// (mode "single": one stage). Edits stay in a draft until Save, which sends
// deletes, creates, renames/recolours and one reorder, in that order.
// Activate/Deactivate is saved at once.

import { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import {
  useCreatePipelineStage,
  useDeletePipelineStage,
  usePipelineStages,
  useReorderPipelineStages,
  useUpdatePipelineStage,
} from "@/lib/hooks/usePipelineStages";
import StageEditor from "./StageEditor";
import { rowsFromStages, type StageDraftRow } from "./stageRules";
import { applyStageRequests, useStageDraft } from "./useStageDraft";

interface StageManageDialogProps {
  open: boolean;
  mode: "manage" | "single";
  /** single: the stage to edit. */
  stageId?: string | null;
  onClose: () => void;
  /** Something was saved: reload the board. */
  onSaved: () => void;
}

const message = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

export default function StageManageDialog({ open, mode, stageId, onClose, onSaved }: StageManageDialogProps) {
  // Inactive stages are always loaded (one request); the checkbox only shows
  // or hides them. Names must stay unique across all of them.
  const stagesQuery = usePipelineStages(true);
  const { refetch } = stagesQuery;
  const draft = useStageDraft([]);
  const { reset, isDirty } = draft;
  const [showInactive, setShowInactive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const { confirm, confirmationPopup } = useConfirmationPopup();
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down("sm"));

  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();

  const serverStages = stagesQuery.data?.data?.data;

  // Fresh rows on opening and whenever the list reloads with nothing unsaved.
  useEffect(() => {
    if (open && serverStages && !isDirty && !saving) reset(rowsFromStages(serverStages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, serverStages]);

  useEffect(() => {
    if (open) {
      setShowInactive(false);
      if (serverStages) reset(rowsFromStages(serverStages));
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reload = async () => {
    const fresh = await refetch();
    reset(rowsFromStages(fresh.data?.data?.data ?? []));
  };

  const requestClose = () => {
    if (saving) return;
    if (!isDirty) return onClose();
    confirm({
      title: "Discard unsaved changes?",
      description: "Your changes to the stages will be lost.",
      variant: "discard",
      onConfirm: onClose,
    });
  };

  const toggleActive = async (row: StageDraftRow) => {
    if (!row.id) return;
    const next = !row.isActive;
    setTogglingKey(row.key);
    try {
      await updateStage.mutateAsync({ id: row.id, data: { is_active: next } });
      draft.applyActivation(row.id, next);
      notify.success(next ? `${row.name} is active again` : `${row.name} is hidden from the board`);
      onSaved();
    } catch (error) {
      notify.error(message(error, "Failed to update pipeline stage"));
    } finally {
      setTogglingKey(null);
    }
  };

  const save = async () => {
    if (!draft.checkBeforeSave()) return;
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
      notify.success(mode === "single" ? "Stage saved" : "Stages saved");
      onSaved();
      onClose();
    } catch (error) {
      // Whatever went through before the failure stays saved: show the list
      // as it now is.
      notify.error(message(error, "Failed to save stages"));
      onSaved();
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const loading = stagesQuery.isLoading && !serverStages;
  const single = mode === "single";
  const singleRow = single ? draft.rows.find((row) => row.id === stageId) : undefined;

  return (
    <AppDialog
      open={open}
      onClose={requestClose}
      title={single ? "Edit Stage" : "Manage Stages"}
      description={
        single
          ? undefined
          : "Drag to reorder. Prospect stays first; Closed - Won and Closed - Lost stay last. Changes are saved when you click Save."
      }
      maxWidth={single ? "sm" : "md"}
      fullScreen={narrow}
      actions={
        <>
          <AppButton variantStyle="outline" onClick={requestClose} disabled={saving}>
            Cancel
          </AppButton>
          <AppButton onClick={save} isLoading={saving} disabled={saving || loading || !isDirty}>
            Save
          </AppButton>
        </>
      }
    >
      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : stagesQuery.isError && !serverStages ? (
        <div className="flex flex-col items-start gap-3 text-sm text-gray-600">
          <p>{message(stagesQuery.error, "Failed to load pipeline stages")}</p>
          <AppButton variantStyle="outline" onClick={() => refetch()}>
            Try again
          </AppButton>
        </div>
      ) : (
        <StageEditor
          mode={mode}
          draft={draft}
          stageKey={singleRow?.key}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
          onToggleActive={toggleActive}
          togglingKey={togglingKey}
          saving={saving}
        />
      )}
      {confirmationPopup}
    </AppDialog>
  );
}
