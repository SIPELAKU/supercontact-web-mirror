// components/whatsapp-marketing/templates/BroadcastTemplatesClient.tsx
"use client";

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';

import PageHeader from '@/components/ui/page-header';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { notify } from '@/lib/notifications';
import {
  broadcastTemplatesKey,
  useBroadcastTemplates,
  useDuplicateBroadcastTemplates,
  useDeleteBroadcastTemplate,
  useBulkDeleteBroadcastTemplates,
} from '@/lib/hooks/useBroadcastTemplates';
import { useAccounts } from '@/lib/hooks/useOmnichannel';
import { useListRefresh } from '@/lib/hooks/useListRefresh';
import BroadcastTemplatesTable from './BroadcastTemplatesTable';
import AccountSelect from '@/components/omnichannel/AccountSelect';
import { useSelectedWaAccount } from '@/lib/hooks/useSelectedWaAccount';
import type { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';

export default function BroadcastTemplatesClient() {
  const router = useRouter();

  const {
    data: waAccounts,
    isPending: isAccountsPending,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useAccounts('whatsapp');
  // Remembered sender scope: URL, then last-used, then the first account -
  // never blank. Replaces a `useState('')` that reset on every Back
  // navigation and left the table empty behind an unselected dropdown.
  const { accountId, setAccountId, accounts } = useSelectedWaAccount(waAccounts);

  // Pagination & search state
  // (search is already debounced by SuperTable — no extra debounce layer here)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  const listParams = {
    page,
    limit,
    search: searchQuery || undefined,
    account_id: accountId || undefined,
  };
  const { data, isLoading, isError, refetch } = useBroadcastTemplates(listParams, {
    enabled: !!accountId,
  });

  const templates = data?.data?.templates || [];
  const totalCount = data?.data?.total || 0;

  const duplicateMutation = useDuplicateBroadcastTemplates();
  const deleteMutation = useDeleteBroadcastTemplate();
  const bulkDeleteMutation = useBulkDeleteBroadcastTemplates();

  // Loading state and batch-1 refresh around Duplicate/Delete. Its loading
  // flag is deliberately not TanStack's `isFetching`: that is also true while
  // a cached list is re-checked on the way back to this page, and SuperTable
  // holds rows back while it is set - the cached rows would give way to "No
  // templates found" until the request returned.
  const listRefresh = useListRefresh({
    batchIndex: page - 1,
    firstBatchKey: broadcastTemplatesKey({ ...listParams, page: 1 }),
  });

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

  const handleDuplicate = (ids: string[]) =>
    listRefresh.run(async () => {
      try {
        await duplicateMutation.mutateAsync({ template_ids: ids });
        notify.success(`${ids.length} template(s) duplicated successfully.`);
        await listRefresh.refresh();
      } catch (err: any) {
        notify.error(err.message || 'Failed to duplicate template(s).');
      }
    });

  const handleDeleteRequest = (ids: string[]) => {
    setSelectedToDelete(ids);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () =>
    listRefresh.run(async () => {
      if (!selectedToDelete) return;

      try {
        if (selectedToDelete.length === 1) {
          await deleteMutation.mutateAsync(selectedToDelete[0]);
        } else {
          await bulkDeleteMutation.mutateAsync(selectedToDelete);
        }
        notify.success(`${selectedToDelete.length} template(s) deleted successfully.`);
      } catch (err: any) {
        notify.error(err.message || 'Failed to delete template(s).');
      } finally {
        setConfirmOpen(false);
        setSelectedToDelete(null);
      }
      // After the popup has closed, so it does not wait on the list. On a
      // failure too: a bulk delete that failed part-way has removed the rest.
      await listRefresh.refresh();
    });

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
        // Three ways to be loading, each with rows to show soon:
        //  - the WhatsApp accounts are still loading. The template query
        //    waits on an account and is disabled until then, and a disabled
        //    query is not `isLoading`, so this used to show "No templates
        //    found" on every first open and refresh;
        //  - the template query itself (`isLoading` = no data at all yet);
        //  - a Duplicate/Delete until the refreshed list lands. With rows on
        //    screen SuperTable shows this as its progress bar, and while the
        //    list restarts from batch 1 as a skeleton.
        isLoading={isLoading || isAccountsPending || listRefresh.isRefreshing}
        isError={isError || isAccountsError}
        errorMessage={
          isAccountsError
            ? 'Failed to load WhatsApp accounts.'
            : 'Failed to load broadcast templates.'
        }
        onRetry={() => (isAccountsError ? refetchAccounts() : refetch())}
        // The account is a scope, not a filter the table knows about: without
        // it here, switching account after scrolling kept the old account's
        // batches above the new one's.
        resetPageKey={accountId}
        restartKey={listRefresh.restartKey}
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
