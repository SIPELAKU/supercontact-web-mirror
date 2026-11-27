"use client";

// Add Deal with many products (BE 1.172.0, POST /pipelines/bulk): one client
// (lead) and one assignee, then a list of products where each becomes its own
// card on the board. Update Pipeline (one existing card) stays AddDealModal.
//
//   Step 1  Client/Account (lead) + Assign To            -> Next step
//   Step 2  product list: AI Recommendation Product, + Add Product,
//           click a row to edit, Delete                  -> Save deals
//   Form    one product's fields; Cancel / Add to deal (back to the list)

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppAlert } from "@/components/ui/app-alert";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import { useGetPipelineStore } from "@/lib/store/pipeline";
import { usePipelineStages } from "@/lib/hooks/usePipelineStages";
import { isClosedOutcome } from "@/lib/helper/transformPipeline";
import type { RecommendedProduct } from "@/lib/api/pipelines";
import { canAssignDeals } from "../dealAssignment";
import type { LeadOption } from "../dealLeadOptions";
import { AiRecommendationButton } from "./AiRecommendationButton";
import { DealAssigneePicker, DealLeadPicker, FieldLabel, LockedField, type PickerOption } from "./DealFormParts";
import { DealItemForm } from "./DealItemForm";
import { DealItemList } from "./DealItemList";
import {
  buildBulkBody,
  emptyItem,
  isItemComplete,
  isProductTaken,
  mapBulkErrors,
  MAX_DEAL_ITEMS,
  type DealItemDraft,
  type DealItemErrors,
} from "./dealItems";

type Step = "client" | "items" | "item";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function AddDealsDialog({ open, onOpenChange }: Props) {
  const { postBulkPipelines, listPipeline } = useGetPipelineStore();
  const { userProfile, userRole } = useAuth();
  // Managers pick the assignee; the sales team is locked to the lead's.
  const canAssign = canAssignDeals(userProfile?.role ?? userRole);
  // Admin/Manager pick any lead; everyone else only their own, so the deals
  // they create are theirs and stay on their kanban.
  const leadOwner = canAssign ? undefined : userProfile?.id;

  const { data: stagesData } = usePipelineStages(false);
  const stages = useMemo(() => stagesData?.data?.data ?? [], [stagesData]);
  const stageOptions: PickerOption[] = useMemo(() => stages.map((s) => ({ value: s.name, label: s.name })), [stages]);
  // What a stage does (Won/Lost lock the deal), never its name.
  const outcomeOf = (name: string) => {
    const key = name.trim().toLowerCase();
    return (
      stages.find((s) => s.name.trim().toLowerCase() === key)?.outcome ??
      listPipeline.find((s) => s.name.trim().toLowerCase() === key)?.outcome
    );
  };

  const [step, setStep] = useState<Step>("client");
  const [lead, setLead] = useState<LeadOption | null>(null);
  const [assignee, setAssignee] = useState<PickerOption | null>(null);
  const [clientErrors, setClientErrors] = useState<{ client?: string; assignee?: string }>({});

  const [items, setItems] = useState<DealItemDraft[]>([]);
  /** The line open in the item form (new or existing). */
  const [editing, setEditing] = useState<{ item: DealItemDraft; isNew: boolean } | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, DealItemErrors>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmClosed, setConfirmClosed] = useState(false);

  const atLimit = items.length >= MAX_DEAL_ITEMS;
  const limitReason = `A deal can hold up to ${MAX_DEAL_ITEMS} products.`;
  const incomplete = items.filter((i) => !isItemComplete(i) || serverErrors[i.key]);

  const reset = () => {
    setStep("client");
    setLead(null);
    setAssignee(null);
    setClientErrors({});
    setItems([]);
    setEditing(null);
    setServerErrors({});
    setGeneralError(null);
    setTriedSave(false);
    setSaving(false);
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  // Ask before throwing away a picked client or products.
  const requestClose = () => {
    if (saving) return;
    if (lead || items.length > 0) setConfirmDiscard(true);
    else close();
  };

  // ---- Step 1 -------------------------------------------------------------

  const pickLead = (picked: LeadOption | null) => {
    setLead(picked);
    // "Assign To" starts from the lead's assignee.
    setAssignee(picked?.assignedTo ? { value: picked.assignedTo, label: picked.assigneeName } : null);
    setClientErrors({});
  };

  const nextStep = () => {
    const errs: typeof clientErrors = {};
    if (!lead) errs.client = "Client is required";
    if (!assignee?.value) errs.assignee = "Assign To is required";
    setClientErrors(errs);
    if (Object.keys(errs).length === 0) setStep("items");
  };

  // ---- Step 2 -------------------------------------------------------------

  const addFromAi = (rec: RecommendedProduct) => {
    if (atLimit || isProductTaken(items, rec.product_id)) return;
    setItems((list) => [...list, emptyItem(rec)]);
  };

  const openItem = (key: string) => {
    const found = items.find((i) => i.key === key);
    if (found) {
      setEditing({ item: found, isNew: false });
      setStep("item");
    }
  };

  const saveItem = (saved: DealItemDraft) => {
    setItems((list) => (list.some((i) => i.key === saved.key) ? list.map((i) => (i.key === saved.key ? saved : i)) : [...list, saved]));
    // The user has dealt with what the API said about this line.
    setServerErrors(({ [saved.key]: _done, ...rest }) => rest);
    setEditing(null);
    setStep("items");
  };

  const deleteItem = (key: string) => {
    setItems((list) => list.filter((i) => i.key !== key));
    setServerErrors(({ [key]: _gone, ...rest }) => rest);
  };

  const trySave = () => {
    setTriedSave(true);
    setGeneralError(null);
    if (items.length === 0) {
      setGeneralError("Add at least one product.");
      return;
    }
    if (incomplete.length > 0) {
      notify.error("Complete the marked products first", {
        description: `${incomplete.length} of ${items.length} product(s) still need data.`,
      });
      return;
    }
    // Saving as Won/Lost is final, so it is confirmed first.
    if (items.some((i) => isClosedOutcome(outcomeOf(i.deal_stage)))) {
      setConfirmClosed(true);
      return;
    }
    save();
  };

  const save = async () => {
    if (!lead) return;
    setSaving(true);
    const result = await postBulkPipelines(
      buildBulkBody({ client_account: lead.contactId, lead_id: lead.value, assigned_to: assignee?.value ?? "" }, items)
    );
    setSaving(false);

    if (result.success) {
      const total = result.total ?? items.length;
      notify.success(total === 1 ? "1 deal created" : `${total} deals created`);
      close();
      return;
    }

    // All or nothing: nothing was saved. Errors go back onto their lines.
    const { byIndex, general } = mapBulkErrors(result);
    const byKey: Record<string, DealItemErrors> = {};
    Object.entries(byIndex).forEach(([index, errs]) => {
      const item = items[Number(index)];
      if (item) byKey[item.key] = errs;
    });
    setServerErrors(byKey);
    setGeneralError(general ?? null);
    notify.error("Failed to create deals", {
      description: general ?? "Fix the marked products and save again. No deal was saved.",
    });
  };

  const closedItems = items.filter((i) => isClosedOutcome(outcomeOf(i.deal_stage)));

  // ---- Render -------------------------------------------------------------

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && requestClose()}>
        {/* Phones get less padding: px-10 left ~200px for the content on a 360px screen. */}
        <DialogContent className="max-w-205 w-full px-5 py-6 sm:px-10 sm:py-8 rounded-3xl bg-white border border-gray-200">
          <div className="sm:mt-2">
            <h2 className="text-xl font-semibold text-[#5479EE] sm:text-2xl">
              {step === "item" ? (editing?.isNew ? "Add Product" : "Edit Product") : "Add Deal"}
            </h2>
            {step !== "item" && <StepIndicator step={step === "client" ? 1 : 2} />}
          </div>

          <div className="mt-6">
            {step === "client" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <FieldLabel required>Client/Account</FieldLabel>
                    <DealLeadPicker
                      value={lead}
                      onChange={pickLead}
                      owner={leadOwner}
                      enabled={open && (canAssign || Boolean(leadOwner))}
                      error={clientErrors.client}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Assign To</FieldLabel>
                    {/* Locked (by role, or no client yet): the same read-only
                        field as elsewhere, not a greyed-out dropdown. */}
                    {!canAssign || !lead ? (
                      <LockedField
                        value={assignee?.label ?? ""}
                        placeholder={!lead ? "Select a client/account first" : ""}
                        error={Boolean(clientErrors.assignee)}
                        helperText={clientErrors.assignee || (!canAssign ? "Only an Admin or Manager can change the assignee" : undefined)}
                      />
                    ) : (
                      <DealAssigneePicker
                        value={assignee?.value ?? ""}
                        current={assignee}
                        onChange={(opt) => {
                          setAssignee(opt);
                          setClientErrors((e) => ({ ...e, assignee: undefined }));
                        }}
                        error={clientErrors.assignee}
                      />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  The client and assignee are shared by every product you add next. Each product becomes its own card on
                  the pipeline.
                </p>
                <div className="flex gap-3 pt-2 sm:justify-end">
                  <AppButton type="button" variantStyle="outline" color="gray" onClick={requestClose} className="flex-1 sm:flex-none">
                    Cancel
                  </AppButton>
                  <AppButton type="button" variantStyle="primary" onClick={nextStep} className="flex-1 sm:flex-none">
                    Next step
                  </AppButton>
                </div>
              </div>
            )}

            {step === "items" && lead && (
              <div className="space-y-5">
                {/* Client on the left, Change always on the right (it used to
                    wrap under the name on a phone). */}
                <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{lead.label}</p>
                    <p className="truncate text-xs text-gray-500">Assigned to {assignee?.label || "-"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("client")}
                    className="shrink-0 text-xs font-semibold text-[#5479EE] hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Phone: title, then the two actions full width and stacked.
                    sm+: title left, actions right on one row. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Products <span className="font-normal text-gray-500">({items.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
                    <AiRecommendationButton
                      leadId={lead.value}
                      isTaken={(id) => isProductTaken(items, id)}
                      onAdd={addFromAi}
                      addDisabledReason={atLimit ? limitReason : undefined}
                    />
                    <AppButton
                      type="button"
                      variantStyle="primary"
                      startIcon={<Plus size={16} />}
                      disabled={atLimit}
                      title={atLimit ? limitReason : undefined}
                      className="w-full whitespace-nowrap sm:w-auto"
                      onClick={() => {
                        setEditing({ item: emptyItem(), isNew: true });
                        setStep("item");
                      }}
                    >
                      Add Product
                    </AppButton>
                  </div>
                </div>

                {generalError && (
                  <AppAlert variant="failed" description={generalError} onClose={() => setGeneralError(null)} />
                )}

                <DealItemList
                  items={items}
                  serverErrors={serverErrors}
                  highlightIncomplete={triedSave}
                  onEdit={openItem}
                  onDelete={deleteItem}
                />

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    {incomplete.length > 0
                      ? `${incomplete.length} product(s) still need data before saving.`
                      : items.length > 0
                        ? `${items.length} card(s) will be created.`
                        : ""}
                  </p>
                  <div className="flex gap-3">
                    <AppButton type="button" variantStyle="outline" color="gray" onClick={() => setStep("client")} disabled={saving} className="flex-1 sm:flex-none">
                      Back
                    </AppButton>
                    <AppButton type="button" variantStyle="primary" onClick={trySave} isLoading={saving} disabled={saving} className="flex-1 whitespace-nowrap sm:flex-none">
                      Save deals
                    </AppButton>
                  </div>
                </div>
              </div>
            )}

            {step === "item" && editing && (
              <DealItemForm
                key={editing.item.key}
                item={editing.item}
                isNew={editing.isNew}
                stageOptions={stageOptions}
                isTaken={(id) => isProductTaken(items, id, editing.item.key)}
                serverErrors={serverErrors[editing.item.key]}
                onCancel={() => {
                  setEditing(null);
                  setStep("items");
                }}
                onSubmit={saveItem}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationPopup
        isOpen={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          close();
        }}
        title="Are you sure?"
        description="This will discard the client and products you have entered."
        confirmText="Discard"
        cancelText="Cancel"
        variant="discard"
      />

      <ConfirmationPopup
        isOpen={confirmClosed}
        onClose={() => setConfirmClosed(false)}
        onConfirm={() => {
          setConfirmClosed(false);
          save();
        }}
        title={
          closedItems.length === 1
            ? `Save ${closedItems[0].product_name || "this product"} as ${closedItems[0].deal_stage}?`
            : `Save ${closedItems.length} products as Won/Lost?`
        }
        description="A Won or Lost deal is final: it can't be moved back to another stage or edited afterwards."
        confirmText="Yes, save them"
        cancelText="Cancel"
        variant="warning"
      />
    </>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  const dot = (n: 1 | 2, label: string) => (
    <span className={`inline-flex items-center gap-2 ${step === n ? "text-[#3E63D8]" : "text-gray-400"}`}>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
          step === n ? "bg-[#5479EE] text-white" : step > n ? "bg-[#EEF2FD] text-[#3E63D8]" : "bg-gray-100 text-gray-500"
        }`}
      >
        {n}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </span>
  );
  return (
    <div className="mt-3 flex items-center gap-3" aria-label={`Step ${step} of 2`}>
      {dot(1, "Client")}
      <span className="h-px w-8 bg-gray-200" />
      {dot(2, "Products")}
    </div>
  );
}
