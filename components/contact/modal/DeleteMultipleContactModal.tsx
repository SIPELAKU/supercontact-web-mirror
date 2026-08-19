"use client";

import { notify } from "@/lib/notifications";
import React, { useState } from "react";
import { Contact } from "@/lib/models/types";
import { deleteContact } from "@/lib/api/contacts";
import { useAuth } from "@/lib/context/AuthContext";
import { AppButton } from "@/components/ui/app-button";

interface DeleteContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selected: Contact[];
  clearSelection?: () => void;
}

const DeleteMultipleContactModal: React.FC<DeleteContactModalProps> = ({
  open,
  onClose,
  onSuccess,
  selected,
  clearSelection,
}) => {
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async () => {
    if (!selected.length) {
      notify.error("Please select at least one contact");
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;
    const failMessages: string[] = [];

    for (const contact of selected) {
      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        await deleteContact(token, contact.id);
        successCount++;
      } catch (err: any) {
        const message = err?.message || "Gagal menghapus contact";
        failMessages.push(message);
        failCount++;
      }
    }

    setIsDeleting(false);
    onClose();
    clearSelection?.();

    if (successCount > 0) {
      notify.success(`${successCount} contact(s) deleted successfully`);
    }
    if (failCount > 0) {
      notify.error(
        `${failCount} contact(s) failed to delete` +
        (failMessages[0] ? `: ${failMessages[0]}` : "")
      );
    }

    onSuccess?.();
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
          <p className="text-gray-600 text-md mt-6 font-bold">
            This action is permanent and cannot be undone
          </p>

          <div className="flex justify-end gap-3 mt-8 font-medium">
            <AppButton
              onClick={onClose}
              variantStyle="outline"
              color="danger"
              disabled={isDeleting}
            >
              Cancel
            </AppButton>
            <AppButton
              onClick={handleSubmit}
              variantStyle="danger"
              color="danger"
              disabled={isDeleting}
              isLoading={isDeleting}
            >
              {`Delete ${selected.length} Contact${selected.length > 1 ? "s" : ""}`}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMultipleContactModal;
