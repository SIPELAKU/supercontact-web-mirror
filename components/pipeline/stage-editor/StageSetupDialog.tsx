"use client";

// First setup of a company with no stages. Step 1: Default or Customize.
// Step 2 (Customize): the editor on the six defaults, then Create Pipeline.

import { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { Check, SlidersHorizontal } from "lucide-react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { useSetupPipelineStages } from "@/lib/hooks/usePipelineStages";
import StageEditor from "./StageEditor";
import StagePreview from "./StagePreview";
import { DEFAULT_STAGES, defaultDraftRows } from "./stageRules";
import { useStageDraft } from "./useStageDraft";

interface StageSetupDialogProps {
  open: boolean;
  onClose: () => void;
  /** The stages were created: reload the board. */
  onDone: () => void;
}

const defaultPreview = DEFAULT_STAGES.map((stage) => ({ key: stage.name, name: stage.name, color: stage.color }));

export default function StageSetupDialog({ open, onClose, onDone }: StageSetupDialogProps) {
  const [step, setStep] = useState<"choose" | "customize">("choose");
  const draft = useStageDraft(defaultDraftRows());
  const setup = useSetupPipelineStages();
  const { confirm, confirmationPopup } = useConfirmationPopup();
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down("sm"));
  const { reset } = draft;

  // Each opening starts from the beginning.
  useEffect(() => {
    if (open) {
      setStep("choose");
      reset(defaultDraftRows());
    }
  }, [open, reset]);

  const busy = setup.isPending;
  // The Customize copy differs from the defaults: closing asks first.
  const edited = step === "customize" && draft.isDirty;

  const requestClose = () => {
    if (busy) return;
    if (!edited) return onClose();
    confirm({
      title: "Discard unsaved changes?",
      description: "The stages you set up here will be lost.",
      variant: "discard",
      onConfirm: onClose,
    });
  };

  const finish = () => {
    notify.success("Pipeline is ready");
    onDone();
    onClose();
  };

  const useDefault = async () => {
    try {
      await setup.mutateAsync({ mode: "default" });
      finish();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to set up pipeline stages");
    }
  };

  const createCustom = async () => {
    if (!draft.checkBeforeSave()) return;
    try {
      await setup.mutateAsync({
        mode: "custom",
        // A stage added here has no outcome: the API makes it open.
        stages: draft.rows.map((row) => ({
          ...(row.key.startsWith("default-") ? { outcome: row.outcome } : {}),
          name: row.name.trim(),
          color: row.color,
        })),
      });
      finish();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to set up pipeline stages");
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={requestClose}
      title={step === "choose" ? "Set up your pipeline" : "Customize stages"}
      description={
        step === "choose"
          ? "Start with the default stages, or change them first."
          : "Rename, recolour, reorder, add or remove stages. Prospect stays first; Closed - Won and Closed - Lost stay last."
      }
      maxWidth="md"
      fullScreen={narrow}
      actions={
        step === "customize" ? (
          <>
            <AppButton variantStyle="outline" onClick={() => setStep("choose")} disabled={busy}>
              Back
            </AppButton>
            <AppButton onClick={createCustom} isLoading={busy} disabled={busy}>
              Create Pipeline
            </AppButton>
          </>
        ) : undefined
      }
    >
      {step === "choose" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-brand">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">Default</h3>
                <p className="text-sm text-gray-500">The six stages most sales teams use.</p>
              </div>
            </div>
            <StagePreview stages={defaultPreview} />
            <AppButton onClick={useDefault} isLoading={busy} disabled={busy} className="mt-auto">
              Use Default
            </AppButton>
          </section>
          <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-brand">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">Customize</h3>
                <p className="text-sm text-gray-500">Start from the same six and make them yours.</p>
              </div>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Pick a suggested name or type your own</li>
              <li>Choose colours and drag to reorder</li>
              <li>Add as many stages as you need</li>
            </ul>
            <AppButton variantStyle="outline" onClick={() => setStep("customize")} disabled={busy} className="mt-auto">
              Customize
            </AppButton>
          </section>
        </div>
      ) : (
        <StageEditor mode="setup" draft={draft} saving={busy} />
      )}
      {confirmationPopup}
    </AppDialog>
  );
}
