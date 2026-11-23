"use client";

// Settings › Sales › Pipeline Stages: the same editor and rules as the gear
// dialog on the Pipeline page (useStageManager + StageEditor), shown on the
// page itself. Edits stay in a draft until Save in the bar at the bottom;
// Activate/Deactivate is saved at once.

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";
import PipelineSetupEmpty from "@/components/pipeline/stage-editor/PipelineSetupEmpty";
import StageEditor from "@/components/pipeline/stage-editor/StageEditor";
import { StageEditorLoadState } from "@/components/pipeline/stage-editor/StageEditorLoadState";
import StagePreview from "@/components/pipeline/stage-editor/StagePreview";
import StageSetupDialog from "@/components/pipeline/stage-editor/StageSetupDialog";
import { canManageStages, stageColor } from "@/components/pipeline/stage-editor/stageRules";
import { useStageManager } from "@/components/pipeline/stage-editor/useStageManager";

export default function PipelineStagesSettings() {
  const { userProfile, userRole } = useAuth();
  const canManage = canManageStages(userProfile?.role ?? userRole);
  const manager = useStageManager({ active: true });
  const { draft, isDirty, saving, loading, loadError, serverStages } = manager;
  const { confirm, confirmationPopup } = useConfirmationPopup();
  const [setupOpen, setSetupOpen] = useState(false);

  // Leaving the page (reload, close, typing another address) with unsaved
  // changes asks the browser's own "leave site?" first.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  if (loading || loadError) {
    return <StageEditorLoadState loading={loading} error={loadError} onRetry={() => manager.refetch()} />;
  }

  // A company that never set its stages up: the same first setup as the Pipeline page.
  if (!serverStages?.length) {
    return (
      <>
        <PipelineSetupEmpty canManage={canManage} onSetUp={() => setSetupOpen(true)} className="" />
        {canManage && <StageSetupDialog open={setupOpen} onClose={() => setSetupOpen(false)} onDone={() => manager.reload()} />}
      </>
    );
  }

  if (!canManage) {
    const active = serverStages
      .filter((stage) => stage.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map((stage) => ({ key: stage.id, name: stage.name, color: stageColor(stage.color) }));
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 rounded-xl border border-brand/20 bg-brand-light/40 p-3 text-sm text-gray-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
          Only an Admin can change the pipeline stages. These are the stages your pipeline uses now.
        </div>
        <StagePreview stages={active} />
      </div>
    );
  }

  const discard = () =>
    confirm({
      title: "Discard unsaved changes?",
      description: "Your changes to the stages will be lost.",
      variant: "discard",
      onConfirm: () => manager.reload(),
    });

  const save = async () => {
    // After a save the page shows the stages as the API now has them.
    if (await manager.save()) await manager.reload();
  };

  return (
    <div className="flex flex-col">
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <StageEditor
          mode="manage"
          draft={draft}
          showInactive={manager.showInactive}
          onShowInactiveChange={manager.setShowInactive}
          onToggleActive={manager.toggleActive}
          togglingKey={manager.togglingKey}
          saving={saving}
        />
      </div>

      {/* Save is always at hand. Desktop: sticky inside the settings column,
          which scrolls on its own. Smaller screens scroll the whole page under
          a layout with overflow-x hidden, where sticky can't hold, so the bar
          is fixed to the bottom of the screen with room left for it below. */}
      <div className="h-32 lg:hidden" aria-hidden />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 flex flex-col gap-3 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]",
          "sm:flex-row sm:items-center sm:justify-between",
          // The settings column has 2rem of bottom padding, which a sticky bar
          // stops above: reach down through it so nothing shows underneath.
          "lg:sticky lg:inset-x-auto lg:-bottom-8 lg:-mx-1 lg:mt-4 lg:-mb-8 lg:px-1 lg:pb-11 lg:shadow-none",
        )}
      >
        <p aria-live="polite" className={cn("text-sm", isDirty ? "font-medium text-amber-700" : "text-gray-500")}>
          {isDirty ? "You have unsaved changes." : "All changes are saved."}
        </p>
        <div className="flex gap-2 sm:justify-end">
          <AppButton variantStyle="outline" onClick={discard} disabled={!isDirty || saving}>
            Discard
          </AppButton>
          <AppButton onClick={save} isLoading={saving} disabled={!isDirty || saving}>
            Save
          </AppButton>
        </div>
      </div>
      {confirmationPopup}
    </div>
  );
}
