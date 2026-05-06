// components/email-marketing/mailing-lists/MailingListsTable.tsx
"use client";

import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, ChangeEvent, MouseEvent } from 'react';

import { DeleteButton, EditButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import Pagination from '@/components/ui/pagination';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { notify } from '@/lib/notifications';
import { MailingList } from '@/lib/types/email-marketing';

interface MailingListsTableProps {
  onAdd: () => void;
  onEdit: (list: MailingList) => void;
  onDeleteRequest: (list: MailingList) => void;
  refreshTrigger: number;
}

const MailingListsTable = ({ onAdd, onEdit, onDeleteRequest }: MailingListsTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error } = useMailingLists(page + 1, rowsPerPage);

  const lists = data?.data?.mailing_lists || [];
  const totalCount = data?.data?.total || 0;

  const handlePageChange = (
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (error) {
    notify.error('Failed to fetch mailing lists.');
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Mailing Lists ({totalCount})</Typography>
        <AppButton
          variantStyle="primary"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
        >
          Create New List
        </AppButton>
      </Box>

      {/* Lists */}
      <Box sx={{ px: 3, pb: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : lists.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            No mailing lists yet.
          </Typography>
        ) : (
          lists.map((list) => (
            <Paper
              key={list.id}
              variant="outlined"
              sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <Link
                href={`/email-marketing/mailing-lists/${list.id}`}
                style={{
                  flex: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{list.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2, minWidth: '80px' }}>
                  <Typography variant="body1" fontWeight={600}>{list.subscriber_count}</Typography>
                  <Typography variant="caption" color="text.secondary">Contacts</Typography>
                </Box>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Box sx={{ borderLeft: 1, borderColor: 'divider', p: 1, display: 'flex', gap: 0.5 }}>
                <EditButton onClick={() => onEdit(list)} />
                <DeleteButton onClick={() => onDeleteRequest(list)} />
              </Box>
            </Paper>
          ))
        )}

        {lists.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              count={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MailingListsTable;
