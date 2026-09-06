"use client";

import React, { useState, useEffect } from "react";
import { ContactReq } from "@/lib/models/types";
import { useAuth } from "@/lib/context/AuthContext";
import router from "next/router";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";

import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";
import ContactCommercialFields, {
  type ContactCommercialValues,
} from "@/components/contact/ContactCommercialFields";

interface InputProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRequired: boolean;
  error?: string;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isRequired,
  error,
}) => {
  return (
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
};

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const fieldLabels: Record<string, string> = {
  name: "Name",
  phone_number: "Phone Number",
  email: "Email",
  company: "Company",
  position: "Position",
  address: "Address",
};

const EMPTY_COMMERCIAL: ContactCommercialValues = {
  customer_type_id: "",
  region_id: "",
  crm_company_id: "",
};

const AddContactModal: React.FC<AddContactModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const [local, setLocal] = useState<ContactReq>({
    name: "",
    phone_number: "",
    email: "",
    company: "",
    position: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Phase 3 reference columns (spec I6). This modal is a separate hand-rolled
  // form with a raw fetch and no custom-field support, so the controls are
  // added here independently of EditContactModal - both render the same shared
  // component so the two cannot drift.
  const [commercial, setCommercial] = useState<ContactCommercialValues>(EMPTY_COMMERCIAL);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleClose = () => {
    onClose();
    setLocal({
      name: "",
      phone_number: "",
      email: "",
      company: "",
      position: "",
      address: "",
    });
    setCommercial(EMPTY_COMMERCIAL);
    setErrors({});
  };

  // Selalu reset form saat modal terbuka
  useEffect(() => {
    if (open) {
      setLocal({
        name: "",
        phone_number: "",
        email: "",
        company: "",
        position: "",
        address: "",
      });
      setCommercial(EMPTY_COMMERCIAL);
      setErrors({});
    }
  }, [open]);

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
    setIsLoading(true);
    setErrors({});
    const token = await getToken();
    if (!token) {
      notify.error("Token not found", {
        description: "Please log in again",
      });
      router.push("/login");
      return;
    }
    // Validasi data
    const validationErrors = validateFields(local);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const payload: ContactReq = {
      ...local,
      company: local.company?.trim() === "" ? null : local.company,
      address: local.address?.trim() === "" ? null : local.address,
      // Only sent when picked. On CREATE there is nothing to clear, so an
      // omitted key is the honest representation of "not set" - and it keeps
      // the body identical to today's for a tenant that configures none of
      // this.
      customer_type_id: commercial.customer_type_id || undefined,
      region_id: commercial.region_id || undefined,
      crm_company_id: commercial.crm_company_id || undefined,
    };

    try {
      const token = await getToken();
      if (!token) {
        notify.error("Authentication required", {
          description: "Please log in again",
        });
        return;
      }

      const res = await fetch("/api/proxy/contacts", {
        method: "POST",
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
        const message = result?.error?.message ?? "Failed to add contact";
        const details = result?.error?.details
          ?.map((e: any) => {
            const label = fieldLabels[e.field] || e.field;
            return `• ${label}: ${e.message}`;
          })
          .join("\n");

        notify.error("Error", {
          description: details || message,
        });
        setIsLoading(false);
        return;
      }

      onSuccess();
      onClose();

      notify.success("Contact added!", {
        description: "Contact has been added successfully",
      });
    } catch (err) {
      const message = handleError(err, "Adding contact")
      notify.error("Error", {
        description: message,
      });
    }
    setIsLoading(false);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
        style={{ height: '100vh', width: '100vw' }}
        onClick={() => setShowCloseConfirmation(true)}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-[888px] max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#5479EE]">Add Contact</h2>
            <p className="text-gray-600 text-md mt-1">
              Fill in the details below to add a new contact to your CRM.
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
                  isRequired={false}
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
                  isRequired={false}
                  label="Phone Number"
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
                  isRequired={false}
                  label="Position"
                  value={local.position}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, position: e.target.value }))
                  }
                  placeholder="Enter position"
                  error={errors.position}
                />
                <InputField
                  isRequired={false}
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

            <ContactCommercialFields
              values={commercial}
              onChange={(patch) => setCommercial((prev) => ({ ...prev, ...patch }))}
              errors={errors}
              disabled={isLoading}
              enabled={open}
            />

            <div className="flex justify-end gap-3 mt-8 font-medium">
              <AppButton onClick={handleClose} variantStyle="outline" color="primary">
                Cancel
              </AppButton>

              <AppButton onClick={handleSubmit} disabled={isLoading} isLoading={isLoading}>
                Save Contact
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
        description="This will discard your current filled data."
        confirmText="Discard"
        cancelText="Cancel"
        variant="discard"
      />
    </>
  );
};

export default AddContactModal;
