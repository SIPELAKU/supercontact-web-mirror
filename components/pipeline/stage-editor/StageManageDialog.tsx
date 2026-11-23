"use client";

// The gear dialog (mode "manage": every stage) and Edit from a column's menu
// (mode "single": one stage). The logic is useStageManager, shared with the
// Settings › Sales › Pipeline Stages page, which shows the same editor
// without a dialog.

import { useMediaQuery, useTheme } from "@mui/material";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import StageEditor from "./StageEditor";
import { StageEditorLoadState } from "./StageEditorLoadState";
import { useStageManager } from "./useStageManager";

interface StageManageDialogProps {
  open: boolean;
  mode: "manage" | "single";
  /** single: the stage to edit. */
  stageId?: string | null;
  onClose: () => void;
  /** Something was saved: reload the board. */
  onSaved: () => void;
}

export default function StageManageDialog({ open, mode, stageId, onClose, onSaved }: StageManageDialogProps) {
  const manager = useStageManager({ active: open, onSaved });
  const { draft, isDirty, saving, loading, loadError } = manager;
  const { confirm, confirmationPopup } = useConfirmationPopup();
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down("sm"));

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

  const single = mode === "single";
  const save = async () => {
    if (await manager.save(single ? "Stage saved" : "Stages saved")) onClose();
  };
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
      {loading || loadError ? (
        <StageEditorLoadState loading={loading} error={loadError} onRetry={() => manager.refetch()} />
      ) : (
        <StageEditor
          mode={mode}
          draft={draft}
          stageKey={singleRow?.key}
          showInactive={manager.showInactive}
          onShowInactiveChange={manager.setShowInactive}
          onToggleActive={manager.toggleActive}
          togglingKey={manager.togglingKey}
          saving={saving}
        />
      )}
      {confirmationPopup}
    </AppDialog>
  );
}
