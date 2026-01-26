"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Contact } from "@/lib/models/types";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  value: string;
}

const ReadOnlyField: React.FC<InputProps> = ({ label, value }) => (
  <div className="flex flex-col w-full gap-2">
    <label className="font-medium text-gray-700">{label}</label>
    <div
      className="
          mt-1 px-4 py-3 border border-gray-300 rounded-lg 
          bg-gray-50 text-md font-medium text-gray-700
        "
    >
      {value || "-"}
    </div>
  </div>
);

interface ModalContentProps {
  onClose: () => void;
  onEdit: () => void;
  initialData: Contact;
}

const ModalContent: React.FC<ModalContentProps> = ({
  onClose,
  onEdit,
  initialData,
}) => {
  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">Contact Details</h2>
      <p className="text-gray-600 text-md mt-1">View contact information</p>

      <div className="mt-6 flex flex-col gap-4">
        <ReadOnlyField label="Name" value={initialData.name ?? ""} />
        <ReadOnlyField label="Phone Number" value={initialData.phone ?? ""} />
        <ReadOnlyField label="Email" value={initialData.email ?? ""} />
        <ReadOnlyField label="Company" value={initialData.company ?? ""} />
        <ReadOnlyField label="Job Title" value={initialData.job_title ?? ""} />
        <ReadOnlyField label="Address" value={initialData.address ?? ""} />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onClose} className="px-5 py-4 rounded-lg bg-gray-200">
          Close
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-4 rounded-lg bg-primary text-white"
        >
          Edit Contact
        </button>
      </div>
    </div>
  );
};

interface DetailContactModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  initialData: Contact | null;
}

const DetailContactModal: React.FC<DetailContactModalProps> = ({
  open,
  onClose,
  onEdit,
  initialData,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!open || !initialData) return;

    MySwal.fire({
      html: `<div id="react-swal-container-detail"></div>`,
      showConfirmButton: false,
      width: "600px",
      didOpen: () => {
        const container = document.getElementById(
          "react-swal-container-detail"
        );
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(
            <ModalContent
              initialData={initialData}
              onClose={() => {
                MySwal.close();
                onClose();
              }}
              onEdit={() => {
                MySwal.close();
                onEdit();
              }}
            />
          );
        }
      },
      didClose: () => {
        onClose();
      },
      willClose: () => {
        reactRootRef.current?.unmount();
        reactRootRef.current = null;
      },
    });
  }, [open, initialData]);

  return null;
};

export default DetailContactModal;
