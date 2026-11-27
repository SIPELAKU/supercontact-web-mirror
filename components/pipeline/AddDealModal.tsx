"use client";

// Update Pipeline: one existing deal (card). Adding deals - one client, many
// products - is AddDealsDialog (add-deal/), which shares the field parts.

import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { DealForm, reqBody } from "@/lib/store/pipeline";
import { useGetPipelineStore } from "@/lib/store/pipeline";
import { AddDealModalProps } from "@/lib/types/Pipeline";
import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { canAssignDeals } from "./dealAssignment";
import { isCloseDateAllowed, PAST_CLOSE_DATE_MESSAGE } from "./dealCloseDate";
import { AppInput } from "../ui/app-input";
import { AppDatePicker } from "../ui/app-datepicker";
import { AppTextarea } from "../ui/app-textarea";
import { AppButton } from "../ui/app-button";
import { AppSelect } from "../ui/app-select";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import * as pipelineAPI from "@/lib/api/pipelines";
import { isClosedOutcome } from "@/lib/helper/transformPipeline";
import { usePipelineStages } from "@/lib/hooks/usePipelineStages";
import { format, startOfToday } from "date-fns";
import { Lock } from "lucide-react";
import { DealAssigneePicker, FieldLabel, LockedField, type PickerOption } from "./add-deal/DealFormParts";
import { PROBABILITY_OPTIONS, toApiDate } from "./add-deal/dealItems";

const EMPTY_FORM: DealForm = {
  client_account: "",
  product_id: "",
  deal_stage: "",
  expected_close_date: undefined,
  quantity: 1,
  probability_of_close: "0",
  notes: "",
  assigned_to: "",
  lead_id: ""
};

export function AddDealModal({ open, onOpenChange }: AddDealModalProps) {
  type FormErrors = Partial<Record<keyof reqBody, string>>;
  const { listPipeline, id, setEditId, updateFormPipeline, setStage } = useGetPipelineStore();
  // The company's active stages, for the Deal Stage picker.
  const { data: stagesData } = usePipelineStages(false);
  const catalogue = useMemo(() => stagesData?.data?.data ?? [], [stagesData]);
  // What a stage does (Won/Lost lock the deal), never its name: the company's
  // stages first, then the board's columns (which also hold a stage outside
  // the catalogue that still has deals).
  const outcomeOf = (name?: string | null) => {
    const key = (name ?? "").trim().toLowerCase();
    if (!key) return undefined;
    return (
      catalogue.find((s) => s.name.trim().toLowerCase() === key)?.outcome ??
      listPipeline.find((s) => s.name.trim().toLowerCase() === key)?.outcome
    );
  };
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  // Confirmation before saving a deal as Won/Lost (see handleSubmit).
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<DealForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fetchedDeal, setFetchedDeal] = useState<any>(null);
  const [persistedAssignee, setPersistedAssignee] = useState<PickerOption | null>(null);
  const { userProfile, userRole } = useAuth();
  // Managers pick the assignee; the sales team is locked to the deal's
  // current assignee.
  const canAssign = canAssignDeals(userProfile?.role ?? userRole);

  const reset = () => {
    setFormData(EMPTY_FORM);
    setPersistedAssignee(null);
  };

  const deal = fetchedDeal;

  // Waits for THIS deal's detail - checking the id also covers the first
  // frame, before the fetch effect has even started.
  const isInitialLoading = Boolean(id) && (loadingDetails || fetchedDeal?.id !== id);
  // Won/Lost is final: the deal can still be opened and read, but every field
  // and the save button are disabled. Judged by the SAVED stage, not the form.
  const isClosedDeal =
    Boolean(id) && isClosedOutcome(deal?.stage_outcome ?? outcomeOf(deal?.deal_stage));
  // The active stages, plus the deal's own stage when it is not one of them
  // (an inactive stage), so the field never shows blank.
  const stageOptions = useMemo(() => {
    const options = catalogue.map((s) => ({ value: s.name, label: s.name }));
    const current = deal?.deal_stage;
    if (current && !options.some((o) => o.value === current)) options.push({ value: current, label: current });
    return options;
  }, [catalogue, deal?.deal_stage]);
  // The close date the deal has now: it may stay as it is even when it has
  // passed (an expired deal).
  const savedCloseDate = deal?.expected_close_date ? new Date(deal.expected_close_date) : undefined;

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoadingDetails(true);
        const response = await pipelineAPI.fetchPipelineById(id);
        const detail = response?.data;
        if (detail) {
          setFetchedDeal(detail);

          // Determine client ID from contact or company object in detail
          let clientId = "";
          if (detail.contact?.id) clientId = detail.contact.id;
          else if (detail.company?.id) clientId = detail.company.id;
          else if (typeof detail.client_account === 'string') clientId = detail.client_account;

          setFormData({
            client_account: clientId,
            product_id: detail.product?.id || detail.product_id || "",
            deal_stage: detail.deal_stage || "",
            expected_close_date: detail.expected_close_date
              ? new Date(detail.expected_close_date)
              : undefined,
            quantity: detail.quantity ?? 1,
            probability_of_close: String(detail.probability_of_close ?? 0),
            notes: detail.notes ?? "",
            assigned_to: detail.assigned_to || detail.user?.id || "",
            lead_id: "",
          });
          setPersistedAssignee(
            detail.user ? { value: detail.user.id, label: detail.user.fullname } : null
          );

          if (detail.deal_stage) {
            setStage(detail.deal_stage);
          }
        }
      } catch (err) {
        console.error("Failed to fetch pipeline details:", err);
        // A 404 = deleted, or (for a sales user) someone else's deal - e.g.
        // opened from an old notification. Either way there is nothing to
        // edit, so close instead of showing an empty Update form.
        const status = (err as { response?: { status?: number } })?.response?.status;
        notify.error(
          status === 404 ? "Deal not found or you no longer have access" : "Failed to load latest deal details."
        );
        onOpenChange(false);
        setEditId("");
      } finally {
        setLoadingDetails(false);
      }
    }

    if (id) {
      fetchDetails();
    } else {
      setFetchedDeal(null);
      reset();
    }
  }, [id, setStage, onOpenChange, setEditId]);

  // Update Pipeline shows the deal's client and product as they are; neither
  // can be changed.
  const dealClientName = deal?.contact?.name || deal?.contact?.company || deal?.company?.name || "";
  const dealSku = deal?.product?.sku || "";
  const dealProductName = deal?.product?.product_name || "";

  const validateForm = (data: DealForm): FormErrors => {
    const errs: FormErrors = {};

    if (!data.assigned_to) {
      errs.assigned_to = "Assign To is required";
    }

    if (!data.deal_stage) {
      errs.deal_stage = "Deal stage is required";
    }

    if (!data.expected_close_date) {
      errs.expected_close_date = "Expected close date is required";
    } else if (!isCloseDateAllowed(data.expected_close_date, savedCloseDate)) {
      // The calendar already blocks past days; this catches a modal left
      // open past midnight.
      errs.expected_close_date = PAST_CLOSE_DATE_MESSAGE;
    }

    if (!data.quantity || data.quantity <= 0) {
      errs.quantity = "Quantity must be greater than 0";
    }

    if (
      !data.probability_of_close ||
      data.probability_of_close === "0"
    ) {
      errs.probability_of_close = "Probability is required";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    // Saving as Won/Lost is final (the deal can't be edited or moved again
    // afterwards), so it waits for a confirmation first.
    if (isClosedOutcome(outcomeOf(formData.deal_stage))) {
      setShowCloseConfirm(true);
      return;
    }
    await submitDeal();
  };

  const submitDeal = async () => {
    setIsSubmitting(true);

    // The lead and client stay as they are on an update.
    const body: reqBody = {
      client_account: formData.client_account,
      product_id: formData.product_id,
      deal_stage: formData.deal_stage,
      expected_close_date: toApiDate(formData.expected_close_date),
      quantity: formData.quantity,
      probability_of_close: Number(formData.probability_of_close),
      notes: formData.notes,
      assigned_to: formData.assigned_to,
    };

    const response = await updateFormPipeline(body, id)

    if (response.success) {
      notify.success("Pipeline updated successfully!");
      setTimeout(() => (
        onOpenChange(false)
      ), 500)
      setIsSubmitting(false);
      reset();
      setErrors({})
      setEditId("")
    } else {
      setIsSubmitting(false);
      // Show error notification
      const errorMessage = typeof response.error === 'string'
        ? response.error
        : (response.error as any)?.message || "An error occurred";

      notify.error("Failed to update pipeline", {
        description: errorMessage
      });

      // If there are validation errors, show them in the form
      if (response.validation && response.validation.length > 0) {
        const validationErrors: FormErrors = {};
        response.validation.forEach(err => {
          const field = err.loc[err.loc.length - 1] as keyof reqBody;
          validationErrors[field] = err.msg;
        });
        setErrors(validationErrors);
      }
    }
  };

  const handleClose = () => {
    setShowCloseConfirmation(true);
  };

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    onOpenChange(false);
    reset();
    setErrors({})
    setEditId("")
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
        <DialogContent
          className="
          max-w-205
          w-full
          px-10 py-8
          rounded-3xl
          bg-white
          border border-gray-200
        "
        >
          <div className="mt-2">
            <h2 className="text-2xl font-semibold text-[#5479EE]">
              Update Pipeline
            </h2>
            {isClosedDeal && !isInitialLoading && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span>
                  This deal is closed ({deal?.deal_stage}). You can view it, but it can no longer be edited or moved.
                </span>
              </div>
            )}
          </div>

          <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
            {isInitialLoading ? (
              <DealFormSkeleton />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  <div>
                    <FieldLabel required>SKU</FieldLabel>
                    <LockedField value={dealSku} />
                  </div>

                  <div>
                    <FieldLabel>Product Name</FieldLabel>
                    <LockedField
                      placeholder="Product name will appear here"
                      value={dealProductName}
                    />
                  </div>

                  <div>
                    <FieldLabel required>Client/Account</FieldLabel>
                    <LockedField value={dealClientName} />
                  </div>

                  <div>
                    <FieldLabel required>Assign To</FieldLabel>
                    {/* Locked (by role, or a closed deal): the same disabled input
                        as Product Name and Client/Account, not a greyed-out dropdown. */}
                    {!canAssign || isClosedDeal ? (
                      <LockedField
                        value={persistedAssignee?.label || ""}
                        error={Boolean(errors.assigned_to)}
                        helperText={errors.assigned_to || (!canAssign && !isClosedDeal ? "Only an Admin or Manager can change the assignee" : undefined)}
                      />
                    ) : (
                      <DealAssigneePicker
                        value={formData.assigned_to}
                        current={persistedAssignee}
                        onChange={(opt) => {
                          setFormData({ ...formData, assigned_to: opt?.value ?? "" });
                          setPersistedAssignee(opt);
                        }}
                        error={errors.assigned_to}
                      />
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Deal Stage</FieldLabel>
                    {isClosedDeal ? (
                      <LockedField
                        value={formData.deal_stage}
                      />
                    ) : (
                      <AppSelect
                        value={formData.deal_stage}
                        onChange={(e) => setFormData({ ...formData, deal_stage: e.target.value as string })}
                        options={stageOptions}
                        placeholder="Select Deal Stage"
                        isBgWhite
                        height="48px"
                        rounded="8px"
                        error={Boolean(errors.deal_stage)}
                        helperText={errors.deal_stage}
                      />
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Expected Close Date</FieldLabel>
                    {isClosedDeal ? (
                      <LockedField
                        value={formData.expected_close_date ? format(formData.expected_close_date, "dd MMM yyyy") : ""}
                      />
                    ) : (
                      <AppDatePicker
                        value={formData.expected_close_date}
                        onChange={(value) => {
                          if (Array.isArray(value)) return;
                          setFormData({ ...formData, expected_close_date: value ?? undefined });
                        }}
                        placeholder="Select close date"
                        // No past dates on an open deal.
                        minDate={startOfToday()}
                        isBgWhite
                        error={Boolean(errors.expected_close_date)}
                        helperText={errors.expected_close_date}
                      />
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Quantity</FieldLabel>
                    {isClosedDeal ? (
                      <LockedField value={String(formData.quantity)} />
                    ) : (
                      <AppInput
                        type="number"
                        placeholder="1"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: Number(e.target.value) })
                        }
                        isBgWhite
                        height="48px"
                        rounded="8px"
                        error={Boolean(errors.quantity)}
                        helperText={errors.quantity}
                      />
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Probability of Close Won (%)</FieldLabel>
                    {isClosedDeal ? (
                      <LockedField value={`${formData.probability_of_close}%`} />
                    ) : (
                      <AppSelect
                        value={String(formData.probability_of_close)}
                        onChange={(e) =>
                          setFormData({ ...formData, probability_of_close: e.target.value as string })
                        }
                        placeholder="0"
                        options={PROBABILITY_OPTIONS}
                        isBgWhite
                        height="48px"
                        rounded="8px"
                        error={Boolean(errors.probability_of_close)}
                        helperText={errors.probability_of_close}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  {/* Notes are read-only on update, so an empty box shows no
                      "add notes" prompt that suggests it can be typed in. */}
                  <AppTextarea
                    disabled
                    value={formData.notes}
                    isBgWhite
                    rounded="8px"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <AppButton
                type="button"
                variantStyle="outline"
                color="gray"
                onClick={handleConfirmClose}
              >
                Cancel
              </AppButton>

              <AppButton
                type="submit"
                variantStyle="primary"
                color="primary"
                isLoading={isSubmitting}
                disabled={isInitialLoading || isClosedDeal}
              >
                Update Deal
              </AppButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={handleConfirmClose}
        title="Are you sure?"
        description="This will discard your current record."
        confirmText="Discard record"
        cancelText="Cancel"
        variant="discard"
      />

      <ConfirmationPopup
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={() => {
          setShowCloseConfirm(false);
          submitDeal();
        }}
        title={`Save this deal as ${formData.deal_stage}?`}
        description="A Won or Lost deal is final: it can't be moved back to another stage or edited afterwards."
        confirmText="Yes, save it"
        cancelText="Cancel"
        variant="warning"
      />
    </>
  );
}

// Stand-in with the form's own shape (8 fields in two columns, then Notes), so
// nothing jumps when the data lands.
function DealFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true">
      <span className="sr-only">Loading deal...</span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-12 w-full rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-24 w-full rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}
