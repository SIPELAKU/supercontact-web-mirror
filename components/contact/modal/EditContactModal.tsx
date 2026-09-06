"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Contact, ContactReq } from "@/lib/models/types";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "@mui/material";
import CustomFieldsPanel from "@/components/custom-fields/CustomFieldsPanel";
import ContactCommercialFields, {
  type ContactCommercialValues,
} from "@/components/contact/ContactCommercialFields";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { customFieldErrorsByKey, validateCustomFieldValues } from "@/lib/utils/customFieldValues";

/** A free-form (undefined) value as the text input shows it. */
function freeFormText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

interface InputProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRequired?: boolean;
  error?: string;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isRequired,
  error,
}) => (
  <AppInput
    label={label}
    required={isRequired}
    type="text"
    value={value ?? ""}
    onChange={onChange}
    placeholder={placeholder}
    isBgWhite
    error={!!error}
    helperText={error}
  />
);

interface EditContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Contact | null;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialData,
}) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [local, setLocal] = useState<ContactReq>({
    name: "",
    phone_number: "",
    email: "",
    company: "",
    position: "",
    address: "",
  });
  // Values are `unknown`: defined fields hold typed values (number, boolean,
  // list), legacy free-form keys hold whatever was stored (strings, mostly).
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
  const [newFieldKey, setNewFieldKey] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Phase 3 reference columns. Held as strings ("" = not set) because that is
  // what a <select> holds; converted to `null` on submit, which is how the API
  // clears a reference (spec 0.23: a null reaches the column only when it is
  // sent, and this form always sends every other field beside it).
  const [commercial, setCommercial] = useState<ContactCommercialValues>({
    customer_type_id: "",
    region_id: "",
    crm_company_id: "",
  });

  // The tenant's defined contact fields get one typed control each; every
  // other stored key stays in the free-form editor below (permissive contract).
  const { definitions: contactDefinitions } = useCustomFieldDefinitionsFor("contact", { enabled: open });
  const definedKeys = new Set(contactDefinitions.map((d) => d.field_key));
  const freeFormEntries = Object.entries(customFields).filter(([key]) => !definedKeys.has(key));

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  useEffect(() => {
    if (initialData) {
      setLocal({
        name: initialData.name ?? "",
        phone_number: initialData.phone_number ?? "",
        email: initialData.email ?? "",
        company: initialData.company ?? "",
        position: initialData.position ?? "",
        address: initialData.address ?? "",
      });
      setCustomFields({ ...(initialData.custom_fields ?? {}) });
      setCommercial({
        customer_type_id: initialData.customer_type_id ?? "",
        region_id: initialData.region_id ?? "",
        crm_company_id: initialData.crm_company_id ?? "",
      });
      setCustomFieldErrors({});
      setErrors({});
    }
  }, [initialData]);

  const validateFields = (data: ContactReq) => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!data.name) {
      newErrors.name = "is required";
    } else if (data.name.length < 3) {
      newErrors.name = "must be at least 3 characters";
    }

    // Optional fields validation
    if (data.phone_number) {
      // Allow numbers and symbols, but not letters
      const phoneRegex = /^[^a-zA-Z]+$/;
      if (!phoneRegex.test(data.phone_number)) {
        newErrors.phone_number = "cannot contain letters";
      }
    }

    if (data.position && data.position.length < 3) {
      newErrors.position = "must be at least 3 characters";
    }

    if (data.company && data.company.length < 3) {
      newErrors.company = "must be at least 3 characters";
    }

    if (data.address && data.address.length < 6) {
      newErrors.address = "must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    const token = await getToken();
    if (!token) {
      notify.error("Token not found", {
        description: "Please login again",
      });
      router.push("/login");
      return;
    }
    if (!initialData) return;

    // Validate data
    const validationErrors = validateFields(local);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Permissive pre-check, the server's rule (spec A7/A22): only DEFINED keys
    // whose value CHANGED are type-checked; unknown keys pass; required is not
    // enforced. Unchanged legacy values (a `gender: "L"` under a select
    // definition) are resent as-is and skipped on both sides.
    const checked = validateCustomFieldValues(contactDefinitions, customFields, {
      entityType: "contact",
      mode: "permissive",
      enforceRequired: false,
      storedValues: initialData.custom_fields ?? {},
    });
    const cfErrors = customFieldErrorsByKey(checked.errors);
    if (Object.keys(cfErrors).length > 0) {
      setCustomFieldErrors(cfErrors);
      return;
    }
    setCustomFieldErrors({});

    const payload: ContactReq = {
      ...local,
      company: local.company?.trim() === "" ? null : local.company,
      address: local.address?.trim() === "" ? null : local.address,
      custom_fields: Object.keys(checked.values).length > 0 ? checked.values : undefined,
      // Always sent, `null` when cleared: these three are read through
      // `model_dump(exclude_unset=True)`, so an OMITTED key leaves the column
      // alone while an explicit null clears it. The request is never all-null
      // (name is required above), which is the condition
      // `at_least_one_field_filled` enforces (spec 0.23).
      customer_type_id: commercial.customer_type_id || null,
      region_id: commercial.region_id || null,
      crm_company_id: commercial.crm_company_id || null,
    };

    setIsSubmitting(true);
    try {
      const token = await getToken();

      const res = await fetch(`/api/proxy/contacts/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch {
        result = {};
      }

      if (!res.ok) {
        const message = result?.error?.message ?? "Failed to update contact";
        const entries: any[] = Array.isArray(result?.error?.details?.errors) ? result.error.details.errors : [];
        // Phase 1 custom-field refusals are `{ field, message }` and belong
        // under their control; pydantic entries are `{ loc, msg }`.
        const fieldMessages: Record<string, string> = {};
        const others: string[] = [];
        for (const e of entries) {
          if (e && typeof e.field === "string" && typeof e.message === "string") {
            fieldMessages[e.field] = e.message;
          } else if (e && Array.isArray(e.loc)) {
            others.push(`• ${e.loc.join(".")}: ${e.msg}`);
          }
        }
        // A refusal on one of the three reference columns belongs under ITS
        // control, not in the custom-field panel: those keys are real columns
        // as of Phase 3, not custom-field keys.
        const REFERENCE_KEYS = ["customer_type_id", "region_id", "crm_company_id"];
        const referenceMessages: Record<string, string> = {};
        for (const key of REFERENCE_KEYS) {
          if (fieldMessages[key]) {
            referenceMessages[key] = fieldMessages[key];
            delete fieldMessages[key];
          }
        }
        if (Object.keys(referenceMessages).length > 0)
          setErrors((prev) => ({ ...prev, ...referenceMessages }));
        if (Object.keys(fieldMessages).length > 0) setCustomFieldErrors(fieldMessages);

        notify.error("Error", {
          description: others.length > 0 ? others.join("<br/>") : message,
        });
        return;
      }

      onSuccess();
      onClose();

      notify.success("Contact updated!");
    } catch (error) {
      const message = handleError(error, "Updating contact");
      notify.error("Error", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !mounted) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity cursor-pointer"
          onClick={() => setShowCloseConfirmation(true)}
        />

        {/* Modal Content */}
        <div
          className="relative bg-white rounded-xl shadow-xl w-full max-w-[888px] max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary">Edit Contact</h2>
            <p className="text-gray-600 text-md mt-1">
              Update contact information
            </p>

            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <InputField
                  isRequired
                  label="Name"
                  value={local.name}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Enter name"
                  error={errors.name}
                />
                <InputField
                  label="Email"
                  isRequired={false}
                  value={local.email}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, email: e.target.value }))
                  }
                  placeholder="Enter email"
                  error={errors.email}
                />
                <InputField
                  label="Company"
                  value={local.company}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, company: e.target.value }))
                  }
                  placeholder="Enter company"
                  error={errors.company}
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <InputField
                  label="Phone Number"
                  isRequired={false}
                  value={local.phone_number}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow numbers and symbols, but not letters
                    if (/^[^a-zA-Z]*$/.test(val)) {
                      setLocal((s) => ({ ...s, phone_number: val }));
                      setErrors((prev) => ({ ...prev, phone_number: "" }));
                    }
                  }}
                  placeholder="Enter phone number"
                  error={errors.phone_number}
                />
                <InputField
                  label="Position"
                  isRequired={false}
                  value={local.position}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, position: e.target.value }))
                  }
                  placeholder="Enter position"
                  error={errors.position}
                />
                <InputField
                  label="Address"
                  value={local.address}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, address: e.target.value }))
                  }
                  placeholder="Enter address"
                  error={errors.address}
                />
              </div>
            </div>

            {/* Built-in typed controls ABOVE the tenant-defined fields - the
                ordering CustomFieldsPanel already establishes (spec I6). */}
            <ContactCommercialFields
              values={commercial}
              onChange={(patch) => setCommercial((prev) => ({ ...prev, ...patch }))}
              errors={errors}
              disabled={isSubmitting}
              enabled={open}
              initialCrmCompanyName={initialData?.company ?? null}
            />

            {/* Defined contact fields: one typed control per definition
                (Phase 1). Rendered above the free-form editor; the keys it
                owns are removed from that list so each key has one control. */}
            <CustomFieldsPanel
              entityType="contact"
              definitions={contactDefinitions}
              values={customFields}
              onChange={(fieldKey, value) => {
                setCustomFields((prev) => ({ ...prev, [fieldKey]: value }));
                if (customFieldErrors[fieldKey]) {
                  setCustomFieldErrors((prev) => ({ ...prev, [fieldKey]: "" }));
                }
              }}
              showRequiredMarkers
              errors={customFieldErrors}
              title="Defined Fields"
              className="mt-6 space-y-3"
            />

            {/* Custom Fields (free-form, undefined keys - the permissive contract) */}
            {freeFormEntries.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Custom Fields</h3>
                <div className="flex flex-col gap-3">
                  {freeFormEntries.map(([key, value]) => (
                    <div key={key} className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="font-medium text-gray-700 capitalize text-sm">{key.replace(/_/g, " ")}</label>
                        <AppInput
                          type="text"
                          value={freeFormText(value)}
                          onChange={(e) => setCustomFields(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Enter ${key.replace(/_/g, " ")}`}
                          isBgWhite
                        />
                      </div>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const updated = { ...customFields };
                          delete updated[key];
                          setCustomFields(updated);
                        }}
                        sx={{ color: '#EF4444', mb: 0.5 }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Field */}
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="font-medium text-gray-700 text-sm">Add Custom Field</label>
                <AppInput
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder="Field name (e.g. occupation)"
                  isBgWhite
                />
              </div>
              <AppButton
                variantStyle="outline"
                color="primary"
                onClick={() => {
                  const key = newFieldKey.trim().toLowerCase().replace(/\s+/g, "_");
                  // A defined key already has its control above; adding it
                  // free-form would give it two.
                  if (key && !Object.prototype.hasOwnProperty.call(customFields, key) && !definedKeys.has(key)) {
                    setCustomFields(prev => ({ ...prev, [key]: "" }));
                    setNewFieldKey("");
                  }
                }}
                disabled={!newFieldKey.trim()}
              >
                <Plus size={16} className="mr-1" /> Add
              </AppButton>
            </div>

            <div className="flex justify-end gap-3 mt-8 font-medium">
              <AppButton
                onClick={handleClose}
                variantStyle="outline"
                color="primary"
                disabled={isSubmitting}
              >
                Cancel
              </AppButton>
              <AppButton
                onClick={handleSubmit}
                variantStyle="primary"
                color="primary"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Update Contact
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
        description="This will discard your current record."
        confirmText="Discard record"
        cancelText="Cancel"
        variant="discard"
      />
    </>,
    document.body
  );
};

export default EditContactModal;
