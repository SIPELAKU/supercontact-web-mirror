"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";
import { useCreateWaRecipient, useUpdateWaRecipient } from "@/lib/hooks/useWaRecipients";
import type { CreateWaRecipientData, WaRecipient, WaRecipientType } from "@/lib/types/whatsapp-marketing";

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRequired?: boolean;
  error?: string;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isRequired = false,
  error,
}) => (
  <div className="flex flex-col w-full gap-2">
    <label className="font-medium text-gray-700">
      {label}
      {isRequired && <span className="text-red-500"> *</span>}
    </label>
    <AppInput
      required={isRequired}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isBgWhite
      className={error ? "border-red-500" : ""}
    />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AddRecipientModalProps {
  open: boolean;
  recipientType: WaRecipientType;
  /** Saat diisi, modal berjalan dalam mode Edit */
  initialData?: WaRecipient;
  onClose: () => void;
  onSuccess: () => void;
  target?: 'recipient' | 'broadcast_group';
  broadcastGroupId?: string;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone_number: "",
  position: "",
  company: "",
  address: "",
};

const AddRecipientModal: React.FC<AddRecipientModalProps> = ({
  open,
  recipientType,
  initialData,
  onClose,
  onSuccess,
  target = 'recipient',
  broadcastGroupId,
}) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const createMutation = useCreateWaRecipient();
  const updateMutation = useUpdateWaRecipient();

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  // Reset / pre-fill form whenever modal opens
  useEffect(() => {
    if (open) {
      setErrors({});
      if (initialData) {
        setForm({
          name: initialData.name ?? "",
          email: initialData.email ?? "",
          phone_number: initialData.phone_number ?? "",
          position: initialData.position ?? "",
          company: initialData.company ?? "",
          address: initialData.address ?? "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initialData]);

  const set = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [field]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    const hasIdentity =
      form.name.trim() || form.email.trim() || form.phone_number.trim();

    if (!hasIdentity) {
      errs.name = "At least one of Name, Email, or Phone Number is required";
    }

    if (form.phone_number && /[a-zA-Z]/.test(form.phone_number)) {
      errs.phone_number = "Cannot contain letters";
    }

    if (form.position && form.position.length < 3) {
      errs.position = "Must be at least 3 characters";
    }

    if (form.company && form.company.length < 3) {
      errs.company = "Must be at least 3 characters";
    }

    if (form.address && form.address.length < 6) {
      errs.address = "Must be at least 6 characters";
    }

    return errs;
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Build payload — omit empty strings (backend normalises to null)
    const fields = {
      ...(form.name.trim() && { name: form.name.trim() }),
      ...(form.email.trim() && { email: form.email.trim() }),
      ...(form.phone_number.trim() && { phone_number: form.phone_number.trim() }),
      ...(form.position.trim() && { position: form.position.trim() }),
      ...(form.company.trim() && { company: form.company.trim() }),
      ...(form.address.trim() && { address: form.address.trim() }),
    };

    const payload: CreateWaRecipientData = {
      target: target,
      type_request: "manual",
      new_contact: {
        ...fields,
        recipient_type: recipientType,
      },
      ...(target === 'broadcast_group' && broadcastGroupId && { broadcast_group_ids: [broadcastGroupId] })
    };

    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        });
        notify.success("Recipient updated!", {
          description: "Recipient has been updated successfully",
        });
      } else {
        await createMutation.mutateAsync(payload);
        notify.success("Recipient added!", {
          description: "Recipient has been added successfully",
        });
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      const message = handleError(err, isEdit ? "Updating recipient" : "Adding recipient");
      notify.error("Error", { description: message });
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
        style={{ height: "100vh", width: "100vw" }}
        onClick={() => setShowCloseConfirmation(true)}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-[888px] max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#5479EE]">
              {isEdit ? "Edit Recipient" : "Add New Recipient"}
            </h2>
            <p className="text-gray-600 text-md mt-1">
              {isEdit
                ? "Update the details of the recipient below."
                : "Fill in the details below to add a new recipient."}
            </p>

            <div className="mt-6 flex flex-col md:flex-row gap-4">
              {/* Left column */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <InputField
                  label="Name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Enter name"
                  error={errors.name}
                />
                <InputField
                  label="Email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Enter email"
                  error={errors.email}
                />
                <InputField
                  label="Company"
                  value={form.company}
                  onChange={set("company")}
                  placeholder="Enter company"
                  error={errors.company}
                />
              </div>

              {/* Right column */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <InputField
                  label="Phone Number"
                  value={form.phone_number}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[^a-zA-Z]*$/.test(val)) {
                      setForm((s) => ({ ...s, phone_number: val }));
                      setErrors((p) => ({ ...p, phone_number: "" }));
                    }
                  }}
                  placeholder="Enter phone number"
                  error={errors.phone_number}
                />
                <InputField
                  label="Position"
                  value={form.position}
                  onChange={set("position")}
                  placeholder="Enter position"
                  error={errors.position}
                />
                <InputField
                  label="Address"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Enter address"
                  error={errors.address}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 font-medium">
              <AppButton onClick={handleClose} variantStyle="outline" color="primary">
                Cancel
              </AppButton>
              <AppButton onClick={handleSubmit} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Save Recipient"
                )}
              </AppButton>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => {
          setShowCloseConfirmation(false);
          handleClose();
        }}
        title="Are you sure?"
        description="This will discard your current changes."
        confirmText="Discard"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default AddRecipientModal;
