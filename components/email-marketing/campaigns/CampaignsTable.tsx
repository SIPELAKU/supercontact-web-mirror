// components/email-marketing/campaigns/CampaignsTable.tsx
"use client";

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
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CampaignsTableProps {
  onAdd: () => void;
  onEdit: (campaign: Campaign) => void;
  onDeleteRequest: (campaign: Campaign) => void;
  onView: (campaign: Campaign) => void;
  refreshTrigger: number;
}

const getStatusChip = (status: Campaign['state']) => {
  switch (status) {
    case 'draft': return <Chip label="Draft" color="default" size="small" />;
    case 'in_queue': return <Chip label="In Queue" color="info" size="small" />;
    case 'sending': return <Chip label="Sending" color="primary" size="small" />;
    case 'done': return <Chip label="Sent" color="success" size="small" />;
    case 'canceled': return <Chip label="Canceled" color="error" size="small" />;
    default: return <Chip label={status} size="small" />;
  }
};

const CampaignsTable = ({ onAdd, onEdit, onDeleteRequest, onView, refreshTrigger }: CampaignsTableProps) => {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [filteredRows, setFilteredRows] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // MOCK DATA - Remove this when backend is ready
      const { mockCampaigns, simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(300);
      
      setRows(mockCampaigns);
      setFilteredRows(mockCampaigns);
    } catch (err: any) {
      toast.error('Failed to fetch campaigns.');
      setRows([]); 
      setFilteredRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Filter rows based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRows(rows);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = rows.filter(row => 
        row.subject.toLowerCase().includes(query) ||
        row.state.toLowerCase().includes(query)
      );
      setFilteredRows(filtered);
    }
    setPage(0);
  }, [searchQuery, rows]);

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
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
            onClick={fetchData}
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
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent Date</TableCell>
              <TableCell>Statistics (Delivered/Opened)</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {searchQuery ? 'No campaigns found matching your search.' : 'No campaigns yet.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const canEditOrDelete = row.state === 'draft' || row.state === 'in_queue';
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{getStatusChip(row.state)}</TableCell>
                    <TableCell>
                      {row.sent_date ? format(new Date(row.sent_date), 'dd MMM yyyy, HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{row.delivered} / {row.opened}</TableCell>
                    <TableCell>{row.x_studio_owner_id ? row.x_studio_owner_id[1] : 'N/A'}</TableCell>
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
