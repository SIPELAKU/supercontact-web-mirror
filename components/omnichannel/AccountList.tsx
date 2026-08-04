"use client";

import React, { useState } from "react";
import { useAccounts, useDeleteAccount } from "@/lib/hooks/useOmnichannel";
import { Loader2, Trash2, Mail, MessageCircle } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { ActiveStatusBadge, WhatsAppStatusBadge } from "@/components/omnichannel/AccountStatusBadges";

interface AccountListProps {
  channelType?: 'whatsapp' | 'email';
}

// Shares a query key (and therefore a cache entry) with any other useAccounts(channelType)
// call for the same channelType, e.g. the whatsapp-accounts page's own fetch — no prop drilling needed.
const AccountList: React.FC<AccountListProps> = ({ channelType }) => {
  const { data: accounts, isLoading, error } = useAccounts(channelType);
  const deleteAccountMutation = useDeleteAccount();
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; accountId: string | null; accountName: string }>({
    open: false,
    accountId: null,
    accountName: "",
  });

  const handleDeleteClick = (accountId: string, displayName: string) => {
    setDeleteConfirm({ open: true, accountId, accountName: displayName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.accountId) return;

    try {
      await deleteAccountMutation.mutateAsync(deleteConfirm.accountId);
      notify.success("Account Deleted", { description: "Account has been deleted successfully." });
      setDeleteConfirm({ open: false, accountId: null, accountName: "" });
    } catch (error: any) {
      const message = handleError(error, "Delete Account");
      notify.error("Error", { description: message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">Failed to load accounts. Please try again.</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No accounts connected yet.</p>
        <p className="text-sm text-gray-500 mt-2">Connect your first account to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {account.channel_type === 'whatsapp' ? (
                    <MessageCircle className="text-green-600" size={24} />
                  ) : (
                    <Mail className="text-blue-600" size={24} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{account.display_name}</h3>
                    <ActiveStatusBadge isActive={account.is_active} />
                    {account.channel_type === 'whatsapp' && (
                      <WhatsAppStatusBadge status={account.whatsapp_status} />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{account.channel_identifier}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize">{account.channel_type}</span>
                    <span>•</span>
                    <span>Added {new Date(account.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <AppButton
                variantStyle="outline"
                color="danger"
                size="small"
                onClick={() => handleDeleteClick(account.id, account.display_name)}
                disabled={deleteAccountMutation.isPending}
              >
                <Trash2 size={16} />
              </AppButton>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationPopup
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, accountId: null, accountName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        description={`Are you sure you want to delete "${deleteConfirm.accountName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default AccountList;
