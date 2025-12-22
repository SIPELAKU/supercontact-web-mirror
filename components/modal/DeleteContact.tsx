"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Contact, ContactReq } from "@/lib/models/types";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col w-full gap-2">
    <label className="font-medium text-gray-700">{label}</label>
    <input
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

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (initialData : Contact) => void;
  initialData: Contact;
}

const ModalContent: React.FC<ModalContentProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-[#6739EC]">Delete Contact</h2>
      <p className="text-gray-600 text-md mt-1">
        delete contact {initialData?.name}?
      </p>
      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onClose} className="px-5 py-4 rounded-lg bg-gray-200">
          Cancel
        </button>
        <button onClick={() => onSubmit(initialData)} className="px-6 py-4 rounded-lg bg-[#6739EC] text-white">
          Delete Contact
        </button>
      </div>
    </div>
  );
};

interface DeleteContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Contact | null;
}

const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialData,
// id,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (initialData: Contact) => {
    if (!initialData) return;

    try {
      const res = await fetch(`/api/contact`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: initialData.id,
        }),
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        const message = result?.error?.message ?? "Failed to delete contact";
        const details =
          result?.error?.details?.errors
            ?.map((e: any) => `• ${e.loc.join(".")}: ${e.msg}`)
            .join("<br/>");

        MySwal.fire({
          icon: "error",
          title: message,
          html: details || message,
        });
        return;
      }

      onSuccess();
      onClose();
      MySwal.close();

      MySwal.fire({
        icon: "success",
        title: "Contact deleted!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      MySwal.fire({
        icon: "error",
        title: "Network error",
        text: "Please try again later",
      });
    }
  };

  useEffect(() => {
    if (!open || !initialData) return;

    MySwal.fire({
      html: `<div id="react-swal-container"></div>`,
      showConfirmButton: false,
      width: "600px",
      didOpen: () => {
        const container = document.getElementById("react-swal-container");
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(
            <ModalContent
              initialData={initialData}
              onClose={() => {
                MySwal.close();
                onClose();
              }}
              onSubmit={handleSubmit}
            />
          );
        }
      },
      didClose: ()=>{
        onClose()
      },
      willClose: () => {
        reactRootRef.current?.unmount();
        reactRootRef.current = null;
      },
    });
  }, [open, initialData]);

  return null;
};

export default DeleteContactModal;
