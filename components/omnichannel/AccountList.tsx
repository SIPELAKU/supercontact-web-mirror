"use client";

import React, { useState } from "react";
import { useAccounts, useDeleteAccount, useUpdateAccount, useReactivateAccount } from "@/lib/hooks/useOmnichannel";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Trash2, Mail, MessageCircle, Globe, Pencil, Check, X, RotateCcw } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { ActiveStatusBadge, WhatsAppStatusBadge, BranchBadge } from "@/components/omnichannel/AccountStatusBadges";
import type { Account } from "@/lib/types/omnichannel";

interface AccountListProps {
  channelType?: 'whatsapp' | 'email' | 'web_widget';
}

// Shares a query key (and therefore a cache entry) with any other useAccounts(channelType)
// call for the same channelType, e.g. the whatsapp-accounts page's own fetch — no prop drilling needed.
const AccountList: React.FC<AccountListProps> = ({ channelType }) => {
  const { data: accounts, isLoading, error } = useAccounts(channelType, true);
  const { userProfile } = useAuth();
  const deleteAccountMutation = useDeleteAccount();
  const updateAccountMutation = useUpdateAccount();
  const reactivateAccountMutation = useReactivateAccount();
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; accountId: string | null; accountName: string }>({
    open: false,
    accountId: null,
    accountName: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ display_name: "", branch: "" });

  const handleDeleteClick = (accountId: string, displayName: string) => {
    setDeleteConfirm({ open: true, accountId, accountName: displayName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.accountId) return;

    try {
      await deleteAccountMutation.mutateAsync(deleteConfirm.accountId);
      notify.success("Account Deleted", { description: "Account has been deactivated. You can reactivate it later if needed." });
      setDeleteConfirm({ open: false, accountId: null, accountName: "" });
    } catch (error: any) {
      const message = handleError(error, "Delete Account");
      notify.error("Error", { description: message });
    }
  };

  const handleEditClick = (accountId: string, displayName: string, branch: string | null) => {
    setEditingId(accountId);
    setEditForm({ display_name: displayName, branch: branch || "" });
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSave = async (accountId: string) => {
    if (!editForm.display_name.trim()) {
      notify.warning("Validation Error", { description: "Display name cannot be empty." });
      return;
    }
    try {
      await updateAccountMutation.mutateAsync({
        accountId,
        data: { display_name: editForm.display_name.trim(), branch: editForm.branch.trim() },
      });
      notify.success("Account Updated", { description: "Changes have been saved." });
      setEditingId(null);
    } catch (error: any) {
      const message = handleError(error, "Update Account");
      notify.error("Error", { description: message });
    }
  };

  const handleReactivate = async (accountId: string) => {
    try {
      await reactivateAccountMutation.mutateAsync(accountId);
      notify.success("Account Reactivated", { description: "This account is active again." });
    } catch (error: any) {
      const message = handleError(error, "Reactivate Account");
      notify.error("Error", { description: message });
    }
  };

  const renderAccountRow = (account: Account) => (
    <div
      key={account.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-gray-100 rounded-lg">
            {account.channel_type === 'whatsapp' ? (
              <MessageCircle className="text-green-600" size={24} />
            ) : account.channel_type === 'web_widget' ? (
              <Globe className="text-indigo-600" size={24} />
            ) : (
              <Mail className="text-blue-600" size={24} />
            )}
          </div>

          <div className="flex-1">
            {editingId === account.id ? (
              <div className="flex flex-col sm:flex-row gap-2 mb-2 max-w-md">
                <AppInput
                  fullWidth
                  isBgWhite
                  value={editForm.display_name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Display name"
                  disabled={updateAccountMutation.isPending}
                />
                <AppInput
                  fullWidth
                  isBgWhite
                  value={editForm.branch}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, branch: e.target.value }))}
                  placeholder="Branch (optional)"
                  disabled={updateAccountMutation.isPending}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">{account.display_name}</h3>
                {account.branch && (
                  <BranchBadge branch={account.branch} />
                )}
                <ActiveStatusBadge isActive={account.is_active} />
                {account.channel_type === 'whatsapp' && (
                  <WhatsAppStatusBadge status={account.whatsapp_status} />
                )}
              </div>
            )}

            <p className="text-sm text-gray-600 mb-2">{account.channel_identifier}</p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{account.channel_type}</span>
              <span>•</span>
              <span>Added {new Date(account.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editingId === account.id ? (
            <>
              <AppButton
                variantStyle="outline"
                color="primary"
                size="small"
                onClick={() => handleEditSave(account.id)}
                disabled={updateAccountMutation.isPending}
              >
                {updateAccountMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              </AppButton>
              <AppButton
                variantStyle="outline"
                color="gray"
                size="small"
                onClick={handleEditCancel}
                disabled={updateAccountMutation.isPending}
              >
                <X size={16} />
              </AppButton>
            </>
          ) : account.is_active ? (
            <>
              <AppButton
                variantStyle="outline"
                color="gray"
                size="small"
                onClick={() => handleEditClick(account.id, account.display_name, account.branch)}
              >
                <Pencil size={16} />
              </AppButton>
              <AppButton
                variantStyle="outline"
                color="danger"
                size="small"
                onClick={() => handleDeleteClick(account.id, account.display_name)}
                disabled={deleteAccountMutation.isPending}
              >
                <Trash2 size={16} />
              </AppButton>
            </>
          ) : (
            <AppButton
              variantStyle="outline"
              color="primary"
              size="small"
              onClick={() => handleReactivate(account.id)}
              disabled={reactivateAccountMutation.isPending}
            >
              {reactivateAccountMutation.isPending ? (
                <Loader2 className="animate-spin mr-1.5" size={16} />
              ) : (
                <RotateCcw className="mr-1.5" size={16} />
              )}
              Reactivate
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );

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

  // Email is the one channel where multiple accounts per company are new (Workstream 2) -
  // split by ownership there so "whose mailbox is this" is obvious at a glance. WhatsApp/widget
  // accounts are company resources by convention already, so keep them as a flat list.
  const showOwnershipGroups = channelType === 'email' && !!userProfile;
  const myAccounts = showOwnershipGroups ? accounts.filter((a) => a.user_id === userProfile!.id) : [];
  const teamAccounts = showOwnershipGroups ? accounts.filter((a) => a.user_id !== userProfile!.id) : [];

  return (
    <>
      {showOwnershipGroups ? (
        <div className="space-y-6">
          {myAccounts.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">My mailboxes</h4>
              <div className="space-y-4">{myAccounts.map(renderAccountRow)}</div>
            </div>
          )}
          {teamAccounts.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Team mailboxes</h4>
              <div className="space-y-4">{teamAccounts.map(renderAccountRow)}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map(renderAccountRow)}
        </div>
      )}

      <ConfirmationPopup
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, accountId: null, accountName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        description={`Are you sure you want to deactivate "${deleteConfirm.accountName}"? It will stop accepting new messages, but you can reactivate it later.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default AccountList;
