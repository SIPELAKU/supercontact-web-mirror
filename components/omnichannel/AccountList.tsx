"use client";

import React, { useState } from "react";
import { useAccounts, useDeleteAccount, useUpdateAccount, useReactivateAccount } from "@/lib/hooks/useOmnichannel";
import { useUpdateAutomationMode } from "@/lib/hooks/useFlows";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Trash2, Mail, MessageCircle, Globe, Smartphone, Pencil, Check, X, RotateCcw, Facebook, Instagram, Workflow } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { ActiveStatusBadge, WhatsAppStatusBadge, BranchBadge } from "@/components/omnichannel/AccountStatusBadges";
import type { Account, ChannelType } from "@/lib/types/omnichannel";

interface AccountListProps {
  channelType?: ChannelType;
}

// Shares a query key (and therefore a cache entry) with any other useAccounts(channelType)
// call for the same channelType, e.g. the whatsapp-accounts page's own fetch — no prop drilling needed.
const AccountList: React.FC<AccountListProps> = ({ channelType }) => {
  const { data: accounts, isLoading, error } = useAccounts(channelType, true);
  const { userProfile } = useAuth();
  const { can } = usePermission();
  // Must match the API gate on PATCH /accounts/{id}/automation-mode, which is
  // `omnichannel:setup` (the permission the Manager role actually holds and
  // the one that owns these settings pages). Gating the UI on
  // `conversations:routing:manage` instead would hide the toggle from every
  // Manager even though the request would have succeeded - the profile
  // endpoint returns raw role permissions and does NOT expand the
  // setup -> routing:manage alias the backend applies. Accepting either
  // keeps custom roles granted only the routing permission working too.
  const canManageFlows = can(["omnichannel:setup", "conversations:routing:manage"]);
  const deleteAccountMutation = useDeleteAccount();
  const updateAccountMutation = useUpdateAccount();
  const reactivateAccountMutation = useReactivateAccount();
  const automationModeMutation = useUpdateAutomationMode();
  const [pendingModeId, setPendingModeId] = useState<string | null>(null);
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

  // Only WhatsApp (rule-bot) and the web widget (answer-bot) have a built-in
  // bot to fall back to. On Email/SMS/Messenger/Instagram, legacy mode means
  // NO automation at all - saying "the built-in bot replies here" there would
  // be plainly false.
  const hasLegacyBot = (channel: ChannelType) =>
    channel === "whatsapp" || channel === "web_widget";

  const legacyModeDescription = (channel: ChannelType) =>
    hasLegacyBot(channel)
      ? "The built-in bot replies here; published flows are paused."
      : "No automatic replies on this account.";

  const flowModeDescription = (channel: ChannelType) =>
    hasLegacyBot(channel)
      ? "Published flows reply here; the built-in bot is paused."
      : "Published flows reply here.";

  const handleAutomationModeToggle = async (account: Account) => {
    const next = account.automation_mode === "flow" ? "legacy" : "flow";
    setPendingModeId(account.id);
    try {
      await automationModeMutation.mutateAsync({ accountId: account.id, mode: next });
      notify.success(
        next === "flow" ? "Flow automation enabled" : "Flow automation disabled",
        {
          description:
            next === "flow"
              ? flowModeDescription(account.channel_type)
              : legacyModeDescription(account.channel_type),
        }
      );
    } catch (error: any) {
      const message = handleError(error, "Update Automation Mode");
      notify.error("Error", { description: message });
    } finally {
      setPendingModeId(null);
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
            ) : account.channel_type === 'sms' ? (
              <Smartphone className="text-amber-600" size={24} />
            ) : account.channel_type === 'web_widget' ? (
              <Globe className="text-indigo-600" size={24} />
            ) : account.channel_type === 'messenger' ? (
              <Facebook className="text-[#1877F2]" size={24} />
            ) : account.channel_type === 'instagram' ? (
              <Instagram className="text-[#E1306C]" size={24} />
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
              <span className="capitalize">{account.channel_type === 'sms' ? 'SMS' : account.channel_type === 'messenger' ? 'Messenger' : account.channel_type === 'instagram' ? 'Instagram' : account.channel_type}</span>
              <span>•</span>
              <span>Added {new Date(account.created_at).toLocaleDateString()}</span>
            </div>

            {/* Automation owner: the built-in bot, or published Flow Studio
                flows. Mutually exclusive so a contact never gets a double
                auto-reply, which is why this is one toggle, not two. */}
            {account.is_active && canManageFlows && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={account.automation_mode === "flow"}
                  aria-label="Use Flow Studio automation for this account"
                  disabled={pendingModeId === account.id}
                  onClick={() => handleAutomationModeToggle(account)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                    account.automation_mode === "flow" ? "bg-[#5479EE]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      account.automation_mode === "flow" ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                  {pendingModeId === account.id ? (
                    <Loader2 className="animate-spin" size={13} />
                  ) : (
                    <Workflow size={13} className={account.automation_mode === "flow" ? "text-[#5479EE]" : "text-gray-400"} />
                  )}
                  Flow automation
                </span>
                <span className="text-[11px] text-gray-400">
                  {account.automation_mode === "flow"
                    ? flowModeDescription(account.channel_type)
                    : legacyModeDescription(account.channel_type)}
                </span>
              </div>
            )}
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
