"use client";

import React, { useState, useEffect } from "react";
import { ContactReq } from "@/lib/models/types";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";
import router from "next/router";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
import { notify } from "@/lib/notifications";

import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";

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
    <div className="flex flex-col w-full gap-2">
      <label className="font-medium text-gray-700">
        {label}

        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <AppInput
        required={isRequired}
        type="text"
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        isBgWhite
        className={error ? "border-red-500" : ""}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
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

const AddContactModal: React.FC<AddContactModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [isLoadiNg, setIsLoading] = useState(false);
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
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

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

    // Phone validation
    const phoneRegex = /^[0-9]+$/;
    if (!data.phone_number) {
      newErrors.phone_number = "is required";
    } else {
      if (!phoneRegex.test(data.phone_number)) {
        newErrors.phone_number = "must contain only numbers";
      } else if (
        data.phone_number.length < 10 ||
        data.phone_number.length > 15
      ) {
        newErrors.phone_number = "must be between 10 and 15 characters";
      }
    }

    // Email validation
    if (!data.email) {
      newErrors.email = "is required";
    }

    // Position validation
    if (!data.position) {
      newErrors.position = "is required";
    } else if (data.position.length < 3) {
      newErrors.position = "must be at least 3 characters";
    }

    // Optional fields validation
    // Company validation
    if (!data.company) {
      newErrors.company = "is required";
    } else if (data.company.length < 3) {
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
        onClick={() => setShowCloseConfirmation(true)}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-[888px] max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#5479EE]">Add New Contact</h2>
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
                  isRequired
                  label="Email"
                  value={local.email}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, email: e.target.value }))
                  }
                  placeholder="Enter email"
                  error={errors.email}
                />

                <InputField
                  isRequired={true}
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
                  isRequired
                  label="Phone Number"
                  value={local.phone_number}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9]*$/.test(val)) {
                      setLocal((s) => ({ ...s, phone_number: val }));

                      let error = "";
                      if (val.length < 10) {
                        error = "must be between 10 and 15 characters";
                      } else if (val.length > 15) {
                        error = "must be between 10 and 15 characters";
                        return setLocal((s) => ({ ...s, phone_number: val.slice(0, 15) }));
                      }

                      setErrors((prev) => ({ ...prev, phone_number: error }));
                    }
                  }}
                  placeholder="Enter phone number"
                  error={errors.phone_number}
                />

                <InputField
                  isRequired
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

            <div className="flex justify-end gap-3 mt-8 font-medium">
              <AppButton onClick={() => setShowCloseConfirmation(true)} variantStyle="outline" color="primary">
                Cancel
              </AppButton>

              <AppButton onClick={handleSubmit} disabled={isLoadiNg}>
                {isLoadiNg ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Contact"
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
        description="This will discard your current filled data."
        confirmText="Discard"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default AddContactModal;
