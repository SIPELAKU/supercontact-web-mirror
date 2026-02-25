"use client";

import { notify } from "@/lib/notifications";
import { useDeleteContact } from "@/lib/hooks/useContacts";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Contact } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";

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
}) => {
  const deleteContactMutation = useDeleteContact();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async () => {
    if (!initialData) return;

    try {
      await deleteContactMutation.mutateAsync(initialData.id);

      onSuccess();
      onClose();

      notify.success("Contact deleted!");
    } catch (err: any) {
      notify.error(err.message || "Failed to delete contact");
    }
  };

  if (!open || !mounted) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-start">
          <h2 className="text-2xl font-bold text-[#5479EE]">Delete Contact</h2>
          <p className="text-gray-600 text-md mt-2">
            Are you sure you want to delete contact{" "}
            <span className="font-semibold text-gray-900">
              {initialData?.name}
            </span>
            ?
          </p>

          <div className="flex justify-end gap-3 mt-8 font-medium">
            <AppButton onClick={onClose} variantStyle="outline" color="primary">
              Cancel
            </AppButton>
            <AppButton
              onClick={handleSubmit}
              variantStyle="danger"
              color="danger"
            >
              Delete Contact
            </AppButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteContactModal;
