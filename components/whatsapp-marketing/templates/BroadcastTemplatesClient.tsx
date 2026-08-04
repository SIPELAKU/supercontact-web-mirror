// components/whatsapp-marketing/templates/BroadcastTemplatesClient.tsx
"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

import PageHeader from '@/components/ui/page-header';
import { AppButton } from '@/components/ui/app-button';
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, refetch } = useBroadcastTemplates(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
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
      if (state.page !== page) setPage(state.page);
      if (state.limit !== limit) {
        setLimit(state.limit);
        setPage(1);
      }
      if (state.search !== searchQuery) setSearchQuery(state.search);
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

      {isError ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">Failed to load broadcast templates.</Typography>
          <AppButton onClick={() => refetch()} sx={{ mt: 2 }}>Try Again</AppButton>
        </Box>
      ) : (
        <BroadcastTemplatesTable
          templates={templates}
          isLoading={isLoading}
          totalCount={totalCount}
          onStateChange={handleStateChange}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedToDelete?.length} selected template(s)?{' '}
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setConfirmOpen(false)} color="gray" variantStyle="outline">
            Cancel
          </AppButton>
          <AppButton
            onClick={handleConfirmDelete}
            color="danger"
            variantStyle="danger"
            disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
          >
            {deleteMutation.isPending || bulkDeleteMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Yes, Delete'
            )}
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
