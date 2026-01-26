"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useState } from "react";
import { Contact, ContactReq } from "@/lib/models/types";
import { useAuth } from "@/lib/context/AuthContext";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRequired?: boolean;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isRequired,
}) => (
  <div className="flex flex-col w-full gap-2">
    <label className="font-medium text-gray-700">
      {label}
      {isRequired && <span className="text-red-500">*</span>}
    </label>
    <input
      required={isRequired}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
          mt-1 px-4 py-3 border border-gray-300 rounded-lg 
          placeholder-gray-400 text-md font-medium
          focus:outline-none focus:ring-2 focus:ring-purple-400
        "
    />
  </div>
);

interface EditContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
  initialData: Contact | null;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  open,
  onClose,
  onSuccess,
  onDelete,
  initialData,
}) => {
  const { getToken } = useAuth();
  const [local, setLocal] = useState<ContactReq>({
    name: "",
    phone_number: "",
    email: "",
    company: "",
    position: "",
    address: "",
  });

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
    }
  }, [initialData]);

  const validateRequiredFields = (data: ContactReq) => {
    const errors: { label: string }[] = [];
    if (!data.name) errors.push({ label: "Name" });
    if (!data.phone_number) errors.push({ label: "Phone" });
    if (!data.email) errors.push({ label: "Email" });
    if (!data.position) errors.push({ label: "Position" });

    return errors;
  };

  const handleSubmit = async () => {
    const token = await getToken();
    if (!token) {
      MySwal.fire({
        icon: "error",
        title: "Authentication required",
        text: "Please login again",
      });
      return;
    }
    if (!initialData) return;

    // Validate data
    const errors = validateRequiredFields(local);
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    if (errors.length > 0) {
      Toast.fire({
        icon: "warning",
        title: "Field is required",
        html: errors.map((e) => `• ${e.label} is required`).join("<br/>"),
      });
      return;
    }

    try {
      const token = await getToken();

      const res = await fetch(`/api/proxy/contacts/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: initialData.id,
          ...local,
        }),
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
        const details = result?.error?.details?.errors
          ?.map((e: any) => `• ${e.loc.join(".")}: ${e.msg}`)
          .join("<br/>");

        MySwal.fire({
          icon: "error",
          title: "Error",
          text: message,
          html: details || message,
        });
        return;
      }

      onSuccess();
      onClose();

      Toast.fire({
        icon: "success",
        title: "Contact updated!",
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Network error",
        text: "Please try again later",
      });
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-primary">Edit Contact</h2>
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
            <button
              onClick={onDelete}
              className="px-5 py-4 rounded-lg bg-[#FF4D49] text-white hover:bg-[#FF4D49] transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-4 rounded-lg bg-[#6739EC] text-white hover:bg-[#5b32d1] transition-colors"
            >
              Update Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContactModal;
