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
    <Box sx={{ width: '100%' }}>
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
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Plus className="w-4 h-4" />} 
            onClick={onAdd}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ mx: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  {searchQuery ? 'No campaigns found matching your search.' : 'No campaigns yet.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const canEditOrDelete = row.status.toLowerCase() === 'draft' || row.status.toLowerCase() === 'in_queue' || row.status.toLowerCase() === 'queued';
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell>
                      {row.sent_at ? format(new Date(row.sent_at), 'dd MMM yyyy, HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{row.user_fullname || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Statistics">
                        <IconButton size="small" onClick={() => onView(row)}>
                          <Eye className="w-4 h-4" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={canEditOrDelete ? "Edit" : "Can only edit Draft/In Queue"}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => onEdit(row)}
                            disabled={!canEditOrDelete}
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
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </span>
                      </Tooltip>
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
    </Box>
  );
};

export default CampaignsTable;
