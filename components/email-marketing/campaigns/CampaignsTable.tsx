// components/email-marketing/campaigns/CampaignsTable.tsx
"use client";

import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { Campaign } from '@/lib/types/email-marketing';
import {
  Box,
  Button,
  Chip,
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
import { format } from 'date-fns';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface CampaignsTableProps {
  onAdd: () => void;
  onEdit: (campaign: Campaign) => void;
  onDeleteRequest: (campaign: Campaign) => void;
  onView: (campaign: Campaign) => void;
  refreshTrigger: number;
}

const getStatusChip = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'draft': return <Chip label="Draft" color="default" size="small" />;
    case 'in_queue':
    case 'queued': return <Chip label="In Queue" color="info" size="small" />;
    case 'sending': return <Chip label="Sending" color="primary" size="small" />;
    case 'sent':
    case 'done': return <Chip label="Sent" color="success" size="small" />;
    case 'canceled':
    case 'cancelled': return <Chip label="Canceled" color="error" size="small" />;
    default: return <Chip label={status} size="small" />;
  }
};

const CampaignsTable = ({ onAdd, onEdit, onDeleteRequest, onView, refreshTrigger }: CampaignsTableProps) => {
  const { data, isLoading, error, refetch } = useCampaigns();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const rows = useMemo(() => data?.data?.campaigns || [], [data?.data?.campaigns]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch campaigns.');
    }
  }, [error]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (searchQuery.trim() === '') {
      return rows;
    }
    const query = searchQuery.toLowerCase();
    return rows.filter(row =>
      row.subject.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query) ||
      row.user_fullname.toLowerCase().includes(query)
    );
  }, [searchQuery, rows]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
          }}
          sx={{ minWidth: '250px' }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={onAdd}
            sx={{
              bgcolor: '#5D87FF',
              '&:hover': {
                bgcolor: '#4570ea'
              },
              textTransform: 'none',
              px: 3,
              borderRadius: '8px'
            }}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ px: 0, pb: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#EEF2FD', '& th': { borderBottom: '1px solid #e5e7eb' } }}>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pl: 3 }}>Subject</TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Status</TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Sent Date</TableCell>
              <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Created By</TableCell>
              <TableCell align="center" sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <span className="text-gray-500">
                    {searchQuery ? 'No campaigns found matching your search.' : 'No campaigns yet.'}
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const canEditOrDelete = row.status.toLowerCase() === 'draft' || row.status.toLowerCase() === 'in_queue' || row.status.toLowerCase() === 'queued';
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f9fafb' },
                      '& td': { borderBottom: '1px solid #f3f4f6' }
                    }}
                  >
                    <TableCell sx={{ py: 2, pl: 3 }}>
                      <span className="font-medium text-gray-900">{row.subject}</span>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>{getStatusChip(row.status)}</TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {row.sent_at ? format(new Date(row.sent_at), 'dd MMM yyyy, HH:mm') : '-'}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>{row.user_fullname || 'N/A'}</TableCell>
                    <TableCell align="center" sx={{ py: 2, pr: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Statistics">
                          <IconButton size="small" onClick={() => onView(row)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' } }}>
                            <Eye className="w-4 h-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={canEditOrDelete ? "Edit" : "Can only edit Draft/In Queue"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row)}
                              disabled={!canEditOrDelete}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' } }}
                            >
                              <Pencil className="w-4 h-4" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={canEditOrDelete ? "Delete" : "Can only delete Draft/In Queue"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDeleteRequest(row)}
                              disabled={!canEditOrDelete}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.lighter' } }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
  );
};

export default CampaignsTable;
