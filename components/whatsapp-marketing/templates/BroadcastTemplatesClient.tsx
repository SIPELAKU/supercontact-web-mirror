// components/whatsapp-marketing/templates/BroadcastTemplatesClient.tsx
"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';

import PageHeader from '@/components/ui/page-header';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { notify } from '@/lib/notifications';
import {
  useBroadcastTemplates,
  useDuplicateBroadcastTemplates,
  useDeleteBroadcastTemplate,
  useBulkDeleteBroadcastTemplates,
} from '@/lib/hooks/useBroadcastTemplates';
import { useAccounts } from '@/lib/hooks/useOmnichannel';
import BroadcastTemplatesTable from './BroadcastTemplatesTable';
import AccountSelect from '@/components/omnichannel/AccountSelect';
import type { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';

export default function BroadcastTemplatesClient() {
  const router = useRouter();

  const { data: waAccounts } = useAccounts('whatsapp');
  const accounts = waAccounts || [];
  const [accountId, setAccountId] = useState('');

  // Auto-pick when there's exactly one WhatsApp account.
  useEffect(() => {
    if (accounts.length === 1 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Pagination & search state
  // (search is already debounced by SuperTable — no extra debounce layer here)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  const { data, isLoading, isError, refetch } = useBroadcastTemplates(
    {
      page,
      limit,
      search: searchQuery || undefined,
      account_id: accountId || undefined,
    },
    { enabled: !!accountId }
  );

  const templates = data?.data?.templates || [];
  const totalCount = data?.data?.total || 0;

  const duplicateMutation = useDuplicateBroadcastTemplates();
  const deleteMutation = useDeleteBroadcastTemplate();
  const bulkDeleteMutation = useBulkDeleteBroadcastTemplates();

  const handleStateChange = useCallback(
    (state: { page: number; limit: number; search: string }) => {
      const searchChanged = state.search !== searchQuery;
      if (searchChanged) setSearchQuery(state.search);
      if (state.limit !== limit) {
        setLimit(state.limit);
        setPage(1);
      } else if (searchChanged) {
        setPage(1); // Reset to first page on search
      } else if (state.page !== page) {
        setPage(state.page);
      }
    },
    [page, limit, searchQuery]
  );

  const handleCreate = () => {
    router.push('/whatsapp-marketing/template-broadcasting/create');
  };

  const handleEdit = (template: BroadcastTemplate) => {
    router.push(`/whatsapp-marketing/template-broadcasting/${template.id}`);
  };

  const handleDuplicate = async (ids: string[]) => {
    try {
      await duplicateMutation.mutateAsync({ template_ids: ids });
      notify.success(`${ids.length} template(s) duplicated successfully.`);
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to duplicate template(s).');
    }
  };

  const handleDeleteRequest = (ids: string[]) => {
    setSelectedToDelete(ids);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    try {
      if (selectedToDelete.length === 1) {
        await deleteMutation.mutateAsync(selectedToDelete[0]);
      } else {
        await bulkDeleteMutation.mutateAsync(selectedToDelete);
      }
      notify.success(`${selectedToDelete.length} template(s) deleted successfully.`);
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete template(s).');
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Broadcast Template"
        breadcrumbs={[
          { label: 'Whatsapp Marketing' },
          { label: 'Broadcast Template' },
        ]}
      />

      {accounts.length > 1 && (
        <Box sx={{ maxWidth: 360 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            WhatsApp Account
          </Typography>
          <AccountSelect
            accounts={accounts}
            value={accountId}
            onChange={(id) => {
              setAccountId(id);
              setPage(1);
            }}
            placeholder="Choose a WhatsApp account"
          />
        </Box>
      )}

      {/* Error state renders inside the table (with Retry) — SuperTable owns it */}
      <BroadcastTemplatesTable
        templates={templates}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load broadcast templates."
        onRetry={() => refetch()}
        totalCount={totalCount}
        onStateChange={handleStateChange}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Delete Confirmation */}
      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${selectedToDelete?.length} selected template(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  );
}
