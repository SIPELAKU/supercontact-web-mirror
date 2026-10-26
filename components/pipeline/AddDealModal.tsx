"use client";


import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetProductStore } from "@/lib/store/product";
import type { DealForm, reqBody } from "@/lib/store/pipeline";
import { useGetPipelineStore } from "@/lib/store/pipeline";
import { AddDealModalProps } from "@/lib/types/Pipeline";
import { useAuth } from "@/lib/context/AuthContext";
import { useUsers } from "@/lib/hooks/useUsers";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { canAssignDeals } from "./dealAssignment";
import { toLeadOption, type LeadOption } from "./dealLeadOptions";
import { AppInput } from "../ui/app-input";
import { AppDatePicker } from "../ui/app-datepicker";
import { AppTextarea } from "../ui/app-textarea";
import { AppButton } from "../ui/app-button";
import { AppAutocomplete } from "../ui/app-autocomplete";
import { AppSelect } from "../ui/app-select";
import { Spinner } from "../ui/spinner";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import * as pipelineAPI from "@/lib/api/pipelines";

export const dealStages = [
  { value: "all", label: "All", bgColor: "bg-white", textColor: "text-black" },
  { value: "Prospect", label: "Prospect", bgColor: "bg-[#F3F4F6]", textColor: "text-gray-700" },
  { value: "Qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "Negotiation", label: "Negotiation", bgColor: "bg-[#EAF6FF]", textColor: "text-blue-700" },
  { value: "Proposal", label: "Proposal", bgColor: "bg-[#FFF6E8]", textColor: "text-orange-700" },
  { value: "Closed - Won", label: "Closed/Won", bgColor: "bg-[#E8FFE8]", textColor: "text-green-700" },
  { value: "Closed - Lost", label: "Closed/Lost", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
]


export function AddDealModal({ open, onOpenChange }: AddDealModalProps) {
  type FormErrors = Partial<Record<keyof reqBody, string>>;
  // The picker slice (page 1, limit 100, active) - never the product page's
  // list, whose page/search/status/sort would otherwise leak in here (S3-1).
  const { catalogue: listProduct, fetchCatalogue } = useGetProductStore();
  const { listPipeline, postFormPipeline, id, setEditId, stage, updateFormPipeline, setStage } = useGetPipelineStore();
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<DealForm>({
    client_account: "",
    product_id: "",
    deal_stage: "",
    expected_close_date: undefined,
    quantity: 1,
    probability_of_close: "0",
    notes: "",
    assigned_to: "",
    lead_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fetchedDeal, setFetchedDeal] = useState<any>(null);
  const [persistedProduct, setPersistedProduct] = useState<{ value: string; label: string } | null>(null);
  const [persistedAssignee, setPersistedAssignee] = useState<{ value: string; label: string } | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const debouncedAssigneeSearch = useDebounce(assigneeSearch);
  const { data: usersResponse, isLoading: loadingUsers } = useUsers(1, 20, debouncedAssigneeSearch || undefined);
  const { userProfile, userRole } = useAuth();
  // Managers pick the assignee; the sales team is locked to the lead's
  // assignee (Add Deal) or to the deal's current assignee (Update Pipeline).
  const canAssign = canAssignDeals(userProfile?.role ?? userRole);

  // The client always comes from a LEAD (BO): a lead has exactly one contact
  // (the deal's client) and one assignee, which "Assign To" starts from.
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [leadSearch, setLeadSearch] = useState("");
  // Searches only once the user has stopped typing for a second.
  const debouncedLeadSearch = useDebounce(leadSearch, 1000);
  // Admin/Manager/Super Admin pick any lead; everyone else only their own, so
  // the deal they create is theirs and stays on their kanban.
  const leadOwner = canAssign ? undefined : userProfile?.id;
  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["deal-leads", debouncedLeadSearch, leadOwner],
    queryFn: () => pipelineAPI.fetchDealLeads(debouncedLeadSearch, leadOwner),
    // Update Pipeline keeps the deal's client, so it never needs the list.
    // A sales user waits for their id, so they never see others' leads.
    enabled: open && !id && (canAssign || Boolean(leadOwner)),
  });

  const reset = () => {
    setFormData({
      client_account: "",
      product_id: "",
      deal_stage: "",
      expected_close_date: undefined,
      quantity: 1,
      probability_of_close: "0",
      notes: "",
      assigned_to: "",
      lead_id: ""
    });
    setSelectedLead(null);
    setLeadSearch("");
    setPersistedProduct(null);
    setPersistedAssignee(null);
    setAssigneeSearch("");
  };

  const deal = fetchedDeal;

  useEffect(() => {
    async function fetchDetails() {
      if (!id) {
        setFetchedDeal(null);
        return;
      }
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
        notify.error("Error", { description: "Failed to load latest deal details." });
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
  }, [id, setStage]);

  useEffect(() => {
    if (open) {
      // Phase 5 (spec I9, M-e): variants are the sellable rows, and the list is
      // top-level only without this.
      fetchCatalogue({ includeVariants: true });
    }
  }, [open, fetchCatalogue]);

  const leadOptions = useMemo(() => {
    const listOpts = leads.map(toLeadOption);
    // Keep the picked lead selectable when a new search no longer returns it.
    if (selectedLead && !listOpts.find(o => o.value === selectedLead.value)) {
      return [selectedLead, ...listOpts];
    }
    return listOpts;
  }, [leads, selectedLead]);

  // Update Pipeline shows the deal's client as it is; it cannot be changed.
  const dealClientName = deal?.contact?.name || deal?.contact?.company || deal?.company?.name || "";

  const selectedProductOption = useMemo(() => {
    // Priority 1: Fetched deal detail
    if (deal?.product && deal.product.id === formData.product_id) {
      return {
        value: deal.product.id,
        label: deal.product.sku,
      };
    }
    // Priority 2: List product
    if (formData.product_id) {
      const found = listProduct.find(p => p.id === formData.product_id);
      if (found) return { value: found.id, label: found.sku };

      // Priority 3: Persisted product
      if (persistedProduct && persistedProduct.value === formData.product_id) {
        return persistedProduct;
      }
    }
    return null;
  }, [deal, formData.product_id, listProduct, persistedProduct]);

  const productOptions = useMemo(() => {
    const listOpts = listProduct.map(p => ({
      value: p.id,
      label: p.sku
    }));

    if (selectedProductOption && !listOpts.find(o => o.value === selectedProductOption.value)) {
      return [selectedProductOption, ...listOpts];
    }
    return listOpts;

  }, [listProduct, selectedProductOption]);

  // Get selected product for displaying product name
  const selectedProduct = useMemo(() => {
    if (!formData.product_id) return null;

    // Check if fetched deal has this product (likely if just loaded)
    if (deal?.product && deal.product.id === formData.product_id) return deal.product;

    return listProduct.find(p => p.id === formData.product_id) || null;
  }, [formData.product_id, listProduct, deal]);

  const assigneeOptions = useMemo(() => {
    const listOpts = (usersResponse?.data?.users ?? []).map(u => ({
      value: u.id,
      label: u.fullname,
    }));

    // Keep the current assignee selectable even when the search results
    // (first 20 users, or a search) do not include them.
    if (persistedAssignee && persistedAssignee.value === formData.assigned_to
      && !listOpts.find(o => o.value === persistedAssignee.value)) {
      return [persistedAssignee, ...listOpts];
    }
    return listOpts;
  }, [usersResponse, persistedAssignee, formData.assigned_to]);

  const validateForm = (data: DealForm): FormErrors => {
    const errs: FormErrors = {};

    if (!data.client_account) {
      errs.client_account = "Client is required";
    }

    if (!data.product_id) {
      errs.product_id = "Product is required";
    }

    if (!data.assigned_to) {
      errs.assigned_to = "Assign To is required";
    }

    if (!data.deal_stage) {
      errs.deal_stage = "Deal stage is required";
    }

    if (!data.expected_close_date) {
      errs.expected_close_date = "Expected close date is required";
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

  function toApiDate(date?: Date): string {
    if (!date) return "";

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    setErrors({});

    const body: reqBody = {
      client_account: formData.client_account,
      product_id: formData.product_id,
      deal_stage: formData.deal_stage,
      expected_close_date: toApiDate(formData.expected_close_date),
      quantity: formData.quantity,
      probability_of_close: Number(formData.probability_of_close),
      notes: formData.notes,
      assigned_to: formData.assigned_to,
      // The lead is chosen on create only; an update keeps the deal's lead.
      ...(!id && formData.lead_id ? { lead_id: formData.lead_id } : {})
    };

    if (!id) {
      // Create
      const response = await postFormPipeline(body)

      if (response.success) {
        notify.success("Pipeline created successfully!");
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

        notify.error("Failed to create pipeline", {
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
    } else {
      // Update
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
              {id === "" ? "Add Deal" : "Update Pipeline"}
            </h2>
          </div>

          <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  SKU <span className="text-red-500">*</span>
                </label>
                <AppAutocomplete
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={id ? true : false}
                  value={productOptions.find(p => p.value === formData.product_id) || null}
                  options={productOptions}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                  onChange={(_, newValue) => {
                    if (newValue && typeof newValue !== 'string' && !Array.isArray(newValue)) {
                      const val = newValue as { value: string; label: string };
                      setFormData({ ...formData, product_id: val.value });
                      setPersistedProduct(val);
                    } else if (!newValue) {
                      setFormData({ ...formData, product_id: "" });
                      setPersistedProduct(null);
                    }
                  }}
                  onInputChange={(_, inputValue) => {
                    // COMMERCIAL Phase 5 (spec I9, M-e). `GET /products` became
                    // TOP-LEVEL ONLY by default (E5.1), so without
                    // `includeVariants` every VARIANT would silently become
                    // unpickable on the deal form - and a deal names the
                    // sellable thing, which after A8 is the variant.
                    const keyword = inputValue.trim();
                    if (keyword.length < 1) {
                      fetchCatalogue({ includeVariants: true });
                      return;
                    }
                    fetchCatalogue({ search: keyword, includeVariants: true });
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!value) return false;
                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                    return (option as any).value === (value as any).value;
                  }}
                  placeholder="Search by SKU"
                  error={Boolean(errors.product_id)}
                  helperText={errors.product_id}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Product Name</label>
                <AppInput
                  disabled={true}
                  placeholder="Product name will appear here"
                  value={selectedProduct?.product_name || ""}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Client/Account <span className="text-red-500">*</span>
                </label>
                {id ? (
                  <AppInput
                    disabled={true}
                    value={dealClientName}
                    isBgWhite
                    height="48px"
                    rounded="8px"
                    readOnly
                  />
                ) : (
                  <AppAutocomplete
                    isBgWhite
                    height="48px"
                    rounded="8px"
                    loading={loadingLeads}
                    value={selectedLead}
                    options={leadOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                    // The list is already the API's search result.
                    filterOptions={(options) => options}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as typeof props & { key: string };
                      return (
                        <li key={option.value} {...optionProps}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            {option.detail && (
                              <span className="text-xs text-gray-500">{option.detail}</span>
                            )}
                          </div>
                        </li>
                      );
                    }}
                    onChange={(_, newValue) => {
                      // Picking a lead sets the client and starts "Assign To"
                      // from that lead's assignee.
                      if (newValue && typeof newValue !== 'string' && !Array.isArray(newValue)) {
                        const lead = newValue as LeadOption;
                        setSelectedLead(lead);
                        setFormData({
                          ...formData,
                          client_account: lead.contactId,
                          lead_id: lead.value,
                          assigned_to: lead.assignedTo,
                        });
                        setPersistedAssignee(
                          lead.assignedTo ? { value: lead.assignedTo, label: lead.assigneeName } : null
                        );
                      } else if (!newValue) {
                        setSelectedLead(null);
                        setFormData({ ...formData, client_account: "", lead_id: "", assigned_to: "" });
                        setPersistedAssignee(null);
                      }
                    }}
                    onInputChange={(_, inputValue, reason) => {
                      // Only what the user types searches; picking a lead also
                      // fills the input and must not become the search.
                      if (reason === "input") setLeadSearch(inputValue.trim());
                      else if (reason === "clear") setLeadSearch("");
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!value) return false;
                      if (typeof option === 'string' || typeof value === 'string') return option === value;
                      return (option as any).value === (value as any).value;
                    }}
                    noOptionsText="No Contacted or Qualified leads found"
                    placeholder="Select Client"
                    error={Boolean(errors.client_account)}
                    helperText={errors.client_account}
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assign To <span className="text-red-500">*</span>
                </label>
                {/* Locked (by role, or no client yet): the same disabled input as
                    Product Name and Client/Account, not a greyed-out dropdown. */}
                {!canAssign || !formData.client_account ? (
                  <AppInput
                    disabled={true}
                    value={assigneeOptions.find(u => u.value === formData.assigned_to)?.label || ""}
                    placeholder={!formData.client_account ? "Select a client/account first" : ""}
                    isBgWhite
                    height="48px"
                    rounded="8px"
                    readOnly
                    error={Boolean(errors.assigned_to)}
                    helperText={errors.assigned_to || (!canAssign ? "Only an Admin or Manager can change the assignee" : undefined)}
                  />
                ) : (
                  <AppAutocomplete
                    isBgWhite
                    height="48px"
                    rounded="8px"
                    loading={loadingUsers}
                    value={assigneeOptions.find(u => u.value === formData.assigned_to) || null}
                    options={assigneeOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                    // The list is already the API's search result.
                    filterOptions={(options) => options}
                    onChange={(_, newValue) => {
                      if (newValue && typeof newValue !== 'string' && !Array.isArray(newValue)) {
                        const val = newValue as { value: string; label: string };
                        setFormData({ ...formData, assigned_to: val.value });
                        setPersistedAssignee(val);
                      } else if (!newValue) {
                        setFormData({ ...formData, assigned_to: "" });
                        setPersistedAssignee(null);
                      }
                    }}
                    onInputChange={(_, inputValue, reason) => {
                      // Only what the user types searches; selecting an option
                      // also fills the input and must not become the search.
                      if (reason === "input") setAssigneeSearch(inputValue.trim());
                      else if (reason === "clear") setAssigneeSearch("");
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!value) return false;
                      if (typeof option === 'string' || typeof value === 'string') return option === value;
                      return (option as any).value === (value as any).value;
                    }}
                    placeholder="Select User"
                    error={Boolean(errors.assigned_to)}
                    helperText={errors.assigned_to}
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Deal Stage <span className="text-red-500">*</span>
                </label>
                <AppSelect
                  value={formData.deal_stage}
                  disabled={false}
                  onChange={(e) => setFormData({ ...formData, deal_stage: e.target.value as string })}
                  options={dealStages.filter(s => s.value !== "all")}
                  placeholder="Select Deal Stage"
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  error={Boolean(errors.deal_stage)}
                  helperText={errors.deal_stage}
                // disabled={id ? true : false} // Corrected based on requirement to be editable
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Expected Close Date <span className="text-red-500">*</span>
                </label>
                <AppDatePicker
                  value={formData.expected_close_date}
                  onChange={(value) => {
                    if (Array.isArray(value)) return;
                    setFormData({ ...formData, expected_close_date: value ?? undefined });
                  }}
                  placeholder="Select close date"
                  isBgWhite
                  error={Boolean(errors.expected_close_date)}
                  helperText={errors.expected_close_date}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <AppInput
                  type="number"
                  disabled={false}
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
                // disabled={id ? true : false} // Corrected
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Probability of Close Won (%) <span className="text-red-500">*</span>
                </label>
                <AppSelect
                  value={String(formData.probability_of_close)}
                  onChange={(e) =>
                    setFormData({ ...formData, probability_of_close: e.target.value as string })
                  }
                  placeholder="0"
                  options={[
                    { label: "20%", value: "20" },
                    { label: "40%", value: "40" },
                    { label: "60%", value: "60" },
                    { label: "80%", value: "80" },
                    { label: "100%", value: "100" },
                  ]}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  error={Boolean(errors.probability_of_close)}
                  helperText={errors.probability_of_close}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <AppTextarea
                disabled={id ? true : false}
                placeholder="Add any relevant notes here..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                isBgWhite
                rounded="8px"
              />
            </div>

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
              >
                {id ? "Update Deal" : "Save Deal"}
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
    </>
  );
}
