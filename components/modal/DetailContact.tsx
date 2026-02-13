import React, { useEffect, useRef, useState } from "react";
import { Contact } from "@/lib/models/types";

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
        <ReadOnlyField label="Phone Number" value={initialData.phone_number ?? ""} />
        <ReadOnlyField label="Email" value={initialData.email ?? ""} />
        <ReadOnlyField label="Company" value={initialData.company ?? ""} />
        <ReadOnlyField label="Job Title" value={initialData.position ?? ""} />
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
  if (!open || !initialData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContent
          initialData={initialData}
          onClose={onClose}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
};

export default DetailContactModal;
