// src/components/apps/subscribers/SubscribersTable.tsx

import { useState, useEffect } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { 
    DataGrid, 
    GridColDef, 
    GridRenderCellParams, 
    GridPaginationModel, 
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
    GridFilterModel,
    GridRowId
} from '@mui/x-data-grid';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { Subscriber } from 'src/types/apps/subscribers';

interface SubscribersTableProps {
  onAdd: () => void;
  onEdit: (subscriber: Subscriber) => void;
  onDeleteRequest: (subscribers: Subscriber[]) => void;
  refreshTrigger: number;
  isDeleting: boolean;
}

const SubscribersTable = ({ onAdd, onEdit, onDeleteRequest, refreshTrigger, isDeleting }: SubscribersTableProps) => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/subscribers`, {
          params: {
            skip: paginationModel.page * paginationModel.pageSize,
            limit: paginationModel.pageSize,
            filters: JSON.stringify(filterModel),
          },
        });
        setRows(response.data.subscribers);
        setRowCount(response.data.total);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Gagal mengambil data subscriber.');
        setRows([]); setRowCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [paginationModel, filterModel, refreshTrigger]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GridToolbarFilterButton />
            <GridToolbarQuickFilter debounceMs={500} variant="outlined" size="small" sx={{ minWidth: '250px' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedRows.length > 0 && (
                <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<IconTrash size="1.1rem" />}
                    disabled={isDeleting}
                    onClick={() => {
                        const subscribersToDelete = rows.filter(r => selectedRows.includes(r.id));
                        onDeleteRequest(subscribersToDelete);
                    }}
                >
                    Hapus ({selectedRows.length})
                </Button>
            )}
            <Button variant="contained" color="primary" startIcon={<IconPlus size="1.1rem" />} onClick={onAdd}>
              Tambah Subscriber
            </Button>
        </Box>
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef<Subscriber>[] = [
    { field: 'email', headerName: 'Email', flex: 2, minWidth: 250 },
    { field: 'name', headerName: 'Nama', flex: 1, minWidth: 200 },
    { field: 'company_name', headerName: 'Nama Perusahaan', flex: 1, minWidth: 200 },
    {
      field: 'x_studio_owner_id', headerName: 'Owner', flex: 1, minWidth: 150,
      valueGetter: (value) => value ? value[1] : 'N/A'
    },
    {
      field: 'actions', headerName: 'Aksi', sortable: false, filterable: false,
      disableColumnMenu: true, width: 100, align: 'center', headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<any, Subscriber>) => (
        <Box>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(params.row)}><IconPencil size="1.2rem" /></IconButton></Tooltip>
          <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => onDeleteRequest([params.row])}><IconTrash size="1.2rem" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        filterMode="server"
        onFilterModelChange={setFilterModel}
        slots={{ toolbar: CustomToolbar }}
        sx={{ border: 'none' }}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection as GridRowId[])}
        rowSelectionModel={selectedRows}
      />
    </Box>
  );
};

export default SubscribersTable;