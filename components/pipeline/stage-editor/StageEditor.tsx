"use client";

// The stage list with drag & drop, Add Stage, "Show inactive stages" and the
// board preview. One editor for three places:
//   setup  - the Customize step: the six defaults, nothing saved yet
//   manage - the gear dialog: every stage of the company
//   single - Edit from a column's menu: one stage's name and colour

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AlertTriangle, Info, Lock, Plus } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import StagePreview from "./StagePreview";
import StageRow from "./StageRow";
import StageColorPicker from "./StageColorPicker";
import StageNameField from "./StageNameField";
import QuotationStageBadge from "./QuotationStageBadge";
import { MAX_STAGES, canAddStage, deleteConfirmTitle, isQuotationStage, stageCountLabel, stageLimitMessage, type StageDraftRow } from "./stageRules";
import type { StageDraft } from "./useStageDraft";

export type StageEditorMode = "setup" | "manage" | "single";

interface StageEditorProps {
  mode: StageEditorMode;
  draft: StageDraft;
  /** single: the stage being edited. */
  stageKey?: string;
  showInactive?: boolean;
  onShowInactiveChange?: (show: boolean) => void;
  /** manage: (de)activate now, without waiting for Save. */
  onToggleActive?: (row: StageDraftRow) => void;
  togglingKey?: string | null;
  saving?: boolean;
}

export default function StageEditor({
  mode,
  draft,
  stageKey,
  showInactive = false,
  onShowInactiveChange,
  onToggleActive,
  togglingKey,
  saving = false,
}: StageEditorProps) {
  const { confirm, confirmationPopup } = useConfirmationPopup();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const preview = draft.rows.filter((row) => row.isActive);

  if (mode === "single") {
    const row = draft.rows.find((r) => r.key === stageKey);
    if (!row) return <p className="text-sm text-gray-500">This stage no longer exists.</p>;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <StageColorPicker value={row.color} onChange={(color) => draft.setColor(row.key, color)} stageName={row.name} disabled={saving} />
          </div>
          <div className="min-w-0 flex-1">
            <StageNameField key={draft.version} row={row} onChange={(name) => draft.setName(row.key, name)} error={draft.errors[row.key]} disabled={saving} />
            {isQuotationStage(row) && <QuotationStageBadge className="mt-2" />}
          </div>
        </div>
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</h3>
          <StagePreview stages={preview} highlightKey={row.key} />
        </section>
      </div>
    );
  }

  const visible = draft.rows.filter((row) => row.isActive || showInactive);
  const total = draft.rows.length;
  const inactive = draft.rows.filter((row) => !row.isActive).length;
  const limitMessage = stageLimitMessage(total, inactive);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) draft.move(String(active.id), String(over.id));
  };

  const askDelete = (row: StageDraftRow) =>
    confirm({
      title: deleteConfirmTitle(row.name),
      description:
        mode === "setup"
          ? "It won't be created with the pipeline."
          : "The stage is removed when you save. Its name can be used again.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: () => draft.removeRow(row.key),
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="min-w-0">
        {mode === "manage" && (
          <div className="mb-4 flex gap-3 rounded-xl border border-brand/20 bg-brand-light/40 p-3 text-sm text-gray-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="font-semibold text-gray-900">Before you change stages</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>
                  <strong>Delete:</strong> move every deal out of a stage first. A stage that still has deals can&apos;t be deleted.
                </li>
                <li>
                  <strong>Deactivate with care:</strong> the stage disappears from Add Deal and the stage filter, so no new deal can go
                  there. Its deals are kept, but they only stay visible in a column at the end of the board while the stage still
                  holds deals; filters can hide that column too.
                </li>
                <li>
                  <strong>Required stages</strong>{" "}
                  <span className="inline-flex translate-y-px items-center gap-1 rounded-full bg-white px-1.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200">
                    <Lock className="h-3 w-3" aria-hidden /> Required
                  </span>{" "}
                  can be renamed and recoloured, but not deleted or
                  deactivated.
                </li>
                <li>
                  <strong>At most {MAX_STAGES} stages</strong>, inactive ones included.
                </li>
                <li>Renaming, adding, deleting and reordering are saved when you click Save. Activate and Deactivate are saved at once.</li>
              </ul>
            </div>
          </div>
        )}
        {mode === "manage" && (
          <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700">
            <AppInput
              type="checkbox"
              checked={showInactive}
              onChange={(event) => onShowInactiveChange?.(event.target.checked)}
              disabled={saving}
            />
            Show inactive stages
          </label>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={visible.map((row) => row.key)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2" aria-label="Stages">
              {visible.map((row) => (
                <StageRow
                  key={row.key}
                  row={row}
                  resetKey={draft.version}
                  error={draft.errors[row.key]}
                  disabled={saving}
                  showDeals={mode === "manage"}
                  onNameChange={(name) => draft.setName(row.key, name)}
                  onColorChange={(color) => draft.setColor(row.key, color)}
                  onDelete={() => askDelete(row)}
                  onToggleActive={mode === "manage" && onToggleActive ? () => onToggleActive(row) : undefined}
                  toggling={togglingKey === row.key}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {/* Every stage counts towards the limit, inactive ones too. At the
            limit Add Stage goes away and the reason takes its place. */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {canAddStage(total) && (
            <AppButton
              variantStyle="outline"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={draft.addStage}
              disabled={saving}
            >
              Add Stage
            </AppButton>
          )}
          <span className="text-xs font-medium text-gray-500" aria-live="polite">
            {stageCountLabel(total, inactive)}
          </span>
        </div>
        {limitMessage && (
          <div
            role="status"
            className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <p>{limitMessage}</p>
          </div>
        )}
      </div>

      <section className="border-t border-gray-100 pt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</h3>
        <StagePreview stages={preview} />
      </section>
      {confirmationPopup}
    </div>
  );
}
