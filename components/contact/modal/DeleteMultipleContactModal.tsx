"use client";

import { notify } from "@/lib/notifications";
import React from "react";
import { Contact } from "@/lib/models/types";
import { useDeleteMultipleContacts } from "@/lib/hooks/useContacts";

interface DeleteContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selected: Contact[];
}

const DeleteMultipleContactModal: React.FC<DeleteContactModalProps> = ({
  open,
  onClose,
  onSuccess,
  selected,
}) => {
  const deleteMultipleContactsMutation = useDeleteMultipleContacts();

  const handleSubmit = async () => {
    if (!selected.length) {
      notify.error("Please select at least one contact");
      return;
    }

    try {
      await deleteMultipleContactsMutation.mutateAsync(
        selected.map((contact) => contact.id),
      );

      onSuccess();
      onClose();

      notify.success("Contact deleted successfully!");
    } catch (err: any) {
      notify.error(err.message || "Failed to delete multiple contacts");
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
          <h2 className="text-2xl font-semibold text-[#FF4D49]">
            Are you sure you want to delete all selected list?
          </h2>
          <p className="text-gray-600 text-md mt-[24px] font-bold">
            This action is permanent and cannot be undone
          </p>

          <div className="flex justify-end gap-3 mt-8 font-medium">
            <button
              onClick={onClose}
              className="cursor-pointer px-5 py-3 rounded-lg text-[#FF4D49] border-[#FF4D49] border"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="cursor-pointer px-6 py-3 rounded-lg bg-[#FF4D49] text-white hover:bg-[#e04440] transition-colors"
            >
              Delete Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMultipleContactModal;
