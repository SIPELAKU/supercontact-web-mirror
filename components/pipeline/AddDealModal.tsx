"use client";


import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetContactStore } from "@/lib/store/contact";
import { useGetProductStore } from "@/lib/store/product";
import type { DealForm, reqBody } from "@/lib/store/pipeline";
import { useGetPipelineStore } from "@/lib/store/pipeline";
import { AddDealModalProps } from "@/lib/types/Pipeline";
import { useEffect, useMemo, useState } from "react";
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
  const { listContact, fetchContact, loading: loadingContacts, clearContact } = useGetContactStore();
  const { listProduct, fetchProduct } = useGetProductStore();
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
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fetchedDeal, setFetchedDeal] = useState<any>(null);
  const [persistedContact, setPersistedContact] = useState<{ value: string; label: string } | null>(null);
  const [persistedProduct, setPersistedProduct] = useState<{ value: string; label: string } | null>(null);

  const reset = () => {
    setFormData({
      client_account: "",
      product_id: "",
      deal_stage: "",
      expected_close_date: undefined,
      quantity: 1,
      probability_of_close: "0",
      notes: ""
    });
    setPersistedContact(null);
    setPersistedProduct(null);
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
          });

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
      setPersistedContact(null);
      setPersistedProduct(null);
    }
  }, [id, setStage]);

  useEffect(() => {
    if (open) {
      fetchContact({ query: "" });
      fetchProduct();
    }
  }, [open, fetchContact, fetchProduct]);


  const selectedContactOption = useMemo(() => {
    // Priority 1: If we have a fetched deal and the ID matches, use the detailed contact/company info from it
    if (deal && (deal.contact?.id === formData.client_account || deal.company?.id === formData.client_account)) {
      if (deal.contact) {
        return {
          value: deal.contact.id,
          label: deal.contact.name || deal.contact.company
        };
      }
      if (deal.company) {
        return {
          value: deal.company.id,
          label: deal.company.name
        };
      }
    }

    // Priority 2: Use the existing list of contacts
    if (formData.client_account) {
      const found = listContact.find(c => c.value === formData.client_account);
      if (found) return found;

      // Priority 3: Use persisted selection if still matching the ID
      if (persistedContact && persistedContact.value === formData.client_account) {
        return persistedContact;
      }
    }

    return null;
  }, [deal, formData.client_account, listContact, persistedContact]);

  const contactOptions = useMemo(() => {
    if (!selectedContactOption) return listContact;

    const exists = listContact.some(
      (c) => c.value === selectedContactOption.value
    );

    return exists
      ? listContact
      : [selectedContactOption, ...listContact];
  }, [listContact, selectedContactOption]);

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

  const validateForm = (data: DealForm): FormErrors => {
    const errs: FormErrors = {};

    if (!data.client_account) {
      errs.client_account = "Client is required";
    }

    if (!data.product_id) {
      errs.product_id = "Product is required";
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
      notes: formData.notes
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
              {id === "" ? "Add New Pipeline" : "Update Pipeline"}
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
                    const keyword = inputValue.trim();
                    if (keyword.length < 1) {
                      fetchProduct({ search: "" });
                      return;
                    }
                    fetchProduct({ search: inputValue });
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
                <AppAutocomplete
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={id ? true : false}
                  loading={loadingContacts}
                  value={contactOptions.find(c => c.value === formData.client_account) || null}
                  options={contactOptions}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                  onChange={(_, newValue) => {
                    if (newValue && typeof newValue !== 'string' && !Array.isArray(newValue)) {
                      const val = newValue as { value: string; label: string };
                      setFormData({ ...formData, client_account: val.value });
                      setPersistedContact(val);
                    } else if (!newValue) {
                      setFormData({ ...formData, client_account: "" });
                      setPersistedContact(null);
                    }
                  }}
                  onInputChange={(_, inputValue) => {
                    const keyword = inputValue.trim();
                    if (keyword.length < 1) {
                      fetchContact({ query: "" });
                      return;
                    }
                    fetchContact({ query: inputValue });
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!value) return false;
                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                    return (option as any).value === (value as any).value;
                  }}
                  placeholder="Select Client"
                  error={Boolean(errors.client_account)}
                  helperText={errors.client_account}
                />
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
                  Probability of Close (%) <span className="text-red-500">*</span>
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
        variant="danger"
      />
    </>
  );
}
