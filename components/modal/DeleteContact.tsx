"use client";

import { notify } from "@/lib/notifications";
import { useDeleteContact } from "@/lib/hooks/useContacts";
import React from "react";
import { Contact } from "@/lib/models/types";
import { AppButton } from "../ui/app-button";

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
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
    </div>
  );
};

export default DeleteContactModal;
