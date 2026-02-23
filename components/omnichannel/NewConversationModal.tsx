"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateConversation, useAccounts } from "@/lib/hooks/useOmnichannel";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const createConversationMutation = useCreateConversation();

  const [formData, setFormData] = useState({
    account_id: "",
    to: "",
    name: "",
    subject: "",
    message: "",
  });

  const selectedAccount = accounts?.find(acc => acc.id === formData.account_id);
  const isEmailAccount = selectedAccount?.channel_type === 'email';

  useEffect(() => {
    if (isOpen) {
      setFormData({
        account_id: "",
        to: "",
        name: "",
        subject: "",
        message: "",
      });
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.account_id || !formData.to || !formData.name) {
      notify.warning("Validation Error", { description: "Please fill in all required fields." });
      return;
    }

    // Email-specific validation
    if (isEmailAccount && !formData.subject) {
      notify.warning("Validation Error", { description: "Subject is required for email conversations." });
      return;
    }

    try {
      const payload: any = {
        account_id: formData.account_id,
        to: formData.to,
        name: formData.name,
      };

      if (isEmailAccount) {
        payload.subject = formData.subject;
      }

      if (formData.message) {
        payload.message = formData.message;
      }

      const conversation = await createConversationMutation.mutateAsync(payload);
      notify.success("Conversation Created", { description: "New conversation has been created successfully." });
      onClose();
      router.push(`/omnichannel/conversations/${conversation.id}`);
    } catch (error: any) {
      const message = handleError(error, "Create Conversation");
      notify.error("Error", { description: message });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">New Conversation</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Account <span className="text-red-500">*</span>
            </label>
            <AppSelect
              isBgWhite
              fullWidth
              size="small"
              value={formData.account_id}
              onChange={(e) => handleChange("account_id", e.target.value as string)}
              displayEmpty
              disabled={createConversationMutation.isPending}
              options={[
                { value: "", label: "Select an account" },
                ...(accounts?.map(acc => ({
                  value: acc.id,
                  label: `${acc.display_name} (${acc.channel_type})`,
                })) || []),
              ]}
            />
            {!accounts || accounts.length === 0 ? (
              <p className="text-xs text-red-600">No accounts connected. Please connect an account first on settings.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {isEmailAccount ? "Email Address" : "Phone Number"} <span className="text-red-500">*</span>
            </label>
            <AppInput
              fullWidth
              isBgWhite
              value={formData.to}
              onChange={(e) => handleChange("to", e.target.value)}
              placeholder={isEmailAccount ? "recipient@example.com" : "+1234567890"}
              disabled={createConversationMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <AppInput
              fullWidth
              isBgWhite
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              disabled={createConversationMutation.isPending}
            />
          </div>

          {isEmailAccount && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <AppInput
                fullWidth
                isBgWhite
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Email subject"
                disabled={createConversationMutation.isPending}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Initial Message (Optional)
            </label>
            <AppTextarea
              fullWidth
              isBgWhite
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              disabled={createConversationMutation.isPending}
            />
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <AppButton onClick={onClose} variantStyle="outline" color="gray" disabled={createConversationMutation.isPending}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSubmit} disabled={createConversationMutation.isPending || !accounts || accounts.length === 0} variantStyle="primary">
            {createConversationMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Creating...
              </>
            ) : (
              "Create Conversation"
            )}
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
