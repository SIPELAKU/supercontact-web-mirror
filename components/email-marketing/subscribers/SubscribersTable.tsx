// components/email-marketing/subscribers/SubscribersTable.tsx
"use client";

import { useSubscribers } from '@/lib/hooks/useSubscribers';
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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SubscribersTableProps {
  onAdd: () => void;
  onEdit: (subscriber: Subscriber) => void;
  onDeleteRequest: (subscribers: Subscriber[]) => void;
  refreshTrigger: number;
  isDeleting: boolean;
}

const SubscribersTable = ({ onAdd, onEdit, onDeleteRequest, isDeleting }: SubscribersTableProps) => {
  const { data, isLoading, error } = useSubscribers();
  
  const [filteredRows, setFilteredRows] = useState<Subscriber[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const rows = data?.data?.contacts || [];

  if (error) {
    toast.error('Failed to fetch subscribers.');
  }

  // Filter rows based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRows(rows);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = rows.filter(row => 
        row.email.toLowerCase().includes(query) ||
        row.name?.toLowerCase().includes(query) ||
        row.company?.toLowerCase().includes(query)
      );
      setFilteredRows(filtered);
    }
    setPage(0); // Reset to first page when searching
  }, [searchQuery, rows.length]); // Use rows.length instead of rows

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
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search subscribers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
          }}
          sx={{ minWidth: '250px' }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selected.length > 0 && (
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<Trash2 className="w-4 h-4" />}
              disabled={isDeleting}
              onClick={() => {
                const subscribersToDelete = rows.filter(r => selected.includes(r.id));
                onDeleteRequest(subscribersToDelete);
              }}
            >
              Delete ({selected.length})
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Plus className="w-4 h-4" />} 
            onClick={onAdd}
          >
            Add Subscriber
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                  checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Position</TableCell>
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
                  {searchQuery ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
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
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectOne(row.id)}
                      />
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.name || '-'}</TableCell>
                    <TableCell>{row.company || '-'}</TableCell>
                    <TableCell>{row.position || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(row)}>
                          <Pencil className="w-4 h-4" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => onDeleteRequest([row])}>
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
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

export default SubscribersTable;
