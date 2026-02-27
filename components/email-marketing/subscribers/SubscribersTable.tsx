// components/email-marketing/subscribers/SubscribersTable.tsx
"use client";

import { DeleteButton, EditButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { useSubscribers } from '@/lib/hooks/useSubscribers';
import { notify } from '@/lib/notifications';
import { Subscriber } from '@/lib/types/email-marketing';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip
} from '@mui/material';
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface SubscribersTableProps {
  onAdd: () => void;
  onEdit: (subscriber: Subscriber) => void;
  onDeleteRequest: (subscribers: Subscriber[]) => void;
  onImport: () => void;
  refreshTrigger: number;
  isDeleting: boolean;
}

const SubscribersTable = ({ onAdd, onEdit, onDeleteRequest, onImport, isDeleting, refreshTrigger }: SubscribersTableProps) => {
  const { data, isLoading, error, refetch } = useSubscribers();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const rows = data?.data?.contacts || [];

  // Filter rows based on search query using useMemo to avoid infinite loops
  const filteredRows = useMemo(() => {
    if (searchQuery.trim() === '') {
      return rows;
    } else {
      const query = searchQuery.toLowerCase();
      return rows.filter(row =>
        row.email.toLowerCase().includes(query) ||
        row.name?.toLowerCase().includes(query) ||
        row.company?.toLowerCase().includes(query)
      );
    }
  }, [searchQuery, rows]);

  // Reset to first page when searching
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // Handle errors in an effect
  useEffect(() => {
    if (error) {
      notify.error('Failed to fetch subscribers.');
    }
  }, [error]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      {/* Toolbar */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box className="w-[250px]">
          <AppInput
            placeholder="Search subscribers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isBgWhite
            rounded='8px'
            startIcon={<Search className="w-4 h-4 mr-2 text-gray-400" />}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {selected.length > 0 && (
            <AppButton
              variantStyle="outline"
              color="danger"
              startIcon={<Trash2 className="w-4 h-4" />}
              disabled={isDeleting}
              onClick={() => {
                const subscribersToDelete = rows.filter(r => selected.includes(r.id));
                onDeleteRequest(subscribersToDelete);
              }}
            >
              Delete ({selected.length})
            </AppButton>
          )}
          <AppButton
            variantStyle="outline"
            color="primary"
            startIcon={<Upload className="w-4 h-4" />}
            onClick={onImport}
          >
            Import
          </AppButton>
          <AppButton
            variantStyle="primary"
            color="primary"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={onAdd}
          >
            Add Subscriber
          </AppButton>
        </Box>
      </Box>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
              <TableCell padding="checkbox" sx={{ pl: 3 }}>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                  checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Email</TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Name</TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Company</TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Position</TableCell>
              <TableCell align="center" sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <span className="text-gray-500">
                    {searchQuery ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    sx={{
                      '&:hover': { bgcolor: '#f9fafb' },
                      '& td': { borderBottom: '1px solid #f3f4f6' }
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ pl: 3 }}>
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectOne(row.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <span className="font-medium text-gray-900">{row.email}</span>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>{row.name || '-'}</TableCell>
                    <TableCell sx={{ py: 2 }}>{row.company || '-'}</TableCell>
                    <TableCell sx={{ py: 2 }}>{row.position || 'N/A'}</TableCell>
                    <TableCell align="center" sx={{ py: 2, pr: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <EditButton onClick={() => onEdit(row)} />
                        <DeleteButton onClick={() => onDeleteRequest([row])} />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default SubscribersTable;
