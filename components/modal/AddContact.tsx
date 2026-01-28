"use client";

import React, { useState, useEffect } from "react";
import { ContactReq } from "@/lib/models/types";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";
import router from "next/router";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
import { notify } from "@/lib/notifications";


interface InputProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRequired: boolean;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isRequired,
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
      />
    </div>
  );
};

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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
    }
  }, [open]);

  const validateFields = (data: ContactReq) => {
    const errors: { label: string; message: string }[] = [];

    // Name validation
    if (!data.name) {
      errors.push({ label: "Name", message: "is required" });
    } else if (data.name.length < 3) {
      errors.push({ label: "Name", message: "must be at least 3 characters" });
    }

    // Phone validation
    const phoneRegex = /^[0-9]+$/;
    if (!data.phone_number) {
      errors.push({ label: "Phone", message: "is required" });
    } else {
      if (!phoneRegex.test(data.phone_number)) {
        errors.push({ label: "Phone", message: "must contain only numbers" });
      }
      if (data.phone_number.length < 10 || data.phone_number.length > 15) {
        errors.push({
          label: "Phone",
          message: "must be between 10 and 15 characters",
        });
      }
    }

    // Email validation
    if (!data.email) {
      errors.push({ label: "Email", message: "is required" });
    }

    // Position validation
    if (!data.position) {
      errors.push({ label: "Position", message: "is required" });
    } else if (data.position.length < 3) {
      errors.push({
        label: "Position",
        message: "must be at least 3 characters",
      });
    }

    // Optional fields validation
    if (data.company && data.company.length < 3) {
      errors.push({
        label: "Company",
        message: "must be at least 3 characters",
      });
    }

    if (data.address && data.address.length < 6) {
      errors.push({
        label: "Address",
        message: "must be at least 6 characters",
      });
    }

    return errors;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
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
    if (validationErrors.length > 0) {
      notify.warning("Validation Error", {
        description: validationErrors
          .map((e) => `• ${e.label} ${e.message}`)
          .join("<br/>"),
      });
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
        const details = result?.error?.details?.errors
          ?.map((e: any) => `• ${e.loc.join(".")}: ${e.msg}`)
          .join("<br/>");

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
      notify.error("Network error", {
        description: "Please try again later",
      });
    }
    setIsLoading(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
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
              />

              <InputField
                isRequired
                label="Email"
                value={local.email}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="Enter email"
              />

              <InputField
                isRequired={false}
                label="Company"
                value={local.company}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, company: e.target.value }))
                }
                placeholder="Enter company"
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <InputField
                isRequired
                label="Phone Number"
                value={local.phone_number}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, phone_number: e.target.value }))
                }
                placeholder="Enter phone number"
              />

              <InputField
                isRequired
                label="Position"
                value={local.position}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, position: e.target.value }))
                }
                placeholder="Enter position"
              />
              <InputField
                isRequired={false}
                label="Address"
                value={local.address}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, address: e.target.value }))
                }
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 font-medium">
            <AppButton onClick={onClose} variantStyle="outline" color="primary">
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
  );
};

export default AddContactModal;
