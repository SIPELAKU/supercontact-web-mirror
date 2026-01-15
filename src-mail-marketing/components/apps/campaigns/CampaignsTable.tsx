// src/components/apps/campaigns/CampaignsTable.tsx

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, IconButton, Tooltip, Chip, LinearProgress } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridFilterModel,
  GridPaginationModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { IconPlus, IconPencil, IconTrash, IconEye, IconRefresh } from '@tabler/icons-react';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Campaign } from 'src/types/apps/campaigns';

interface CampaignsTableProps {
  onAdd: () => void;
  onEdit: (campaign: Campaign) => void;
  onDeleteRequest: (campaign: Campaign) => void;
  onView: (campaign: Campaign) => void;
  refreshTrigger: number;
}

const getStatusChip = (status: Campaign['state']) => {
  switch (status) {
    case 'draft': return <Chip label="Draft" color="secondary" size="small" />;
    case 'in_queue': return <Chip label="In Queue" color="info" size="small" sx={{ animation: 'pulse 1.5s infinite' }} />;
    case 'sending': return <Chip label="Sending" color="primary" size="small" sx={{ animation: 'pulse 1.5s infinite' }} />;
    case 'done': return <Chip label="Sent" color="success" size="small" />;
    case 'canceled': return <Chip label="Canceled" color="error" size="small" />;
    default: return <Chip label={status} size="small" />;
  }
}

const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;

function CustomLoadingOverlay() {
  return <LinearProgress />;
}

const CampaignsTable = ({ onAdd, onEdit, onDeleteRequest, onView, refreshTrigger }: CampaignsTableProps) => {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  const fetchData = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    try {
      const response = await axios.get(`/marketing`, {
        params: {
          skip: paginationModel.page * paginationModel.pageSize,
          limit: paginationModel.pageSize,
          filters: JSON.stringify(filterModel),
        },
      });
      setRows(response.data.campaigns);
      setRowCount(response.data.total);

      const isProcessing = response.data.campaigns.some(
        (c: Campaign) => c.state === 'in_queue' || c.state === 'sending'
      );
      return isProcessing;

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal mengambil data kampanye.';
      if (showLoadingSpinner) toast.error(errorMessage);
      setRows([]); setRowCount(0);
      return false;
    } finally {
      if (showLoadingSpinner) {
        setIsLoading(false);
      }
    }
  }, [paginationModel, filterModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const stillProcessing = await fetchData(false);
        if (!stillProcessing && intervalId) {
          clearInterval(intervalId);
        }
      }, 7000);
    };

    const isProcessing = rows.some(c => c.state === 'in_queue' || c.state === 'sending');
    if (isProcessing) {
      startPolling();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [rows, fetchData]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Bagian kiri */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GridToolbarFilterButton />
          <GridToolbarQuickFilter
            debounceMs={500}
            variant="outlined"
            size="small"
            sx={{ minWidth: '250px' }}
          />
        </Box>

        {/* Bagian kanan */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IconRefresh size="1.1rem" />}
            onClick={() => fetchData()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size="1.1rem" />}
            onClick={onAdd}
          >
            Buat Kampanye
          </Button>
        </Box>
      </GridToolbarContainer>
    );
  }


  const columns: GridColDef<Campaign>[] = [
    {
      field: 'subject', headerName: 'Subjek Kampanye', flex: 2, minWidth: 300,
    },
    {
      field: 'state', headerName: 'Status', flex: 1, minWidth: 120,
      renderCell: (params) => getStatusChip(params.row.state)
    },
    {
      field: 'sent_date', headerName: 'Tanggal Terkirim', flex: 1, minWidth: 180,
      type: 'dateTime',
      valueGetter: (value) => value ? new Date(value) : null,
      renderCell: (params) => params.value ? format(params.value, 'dd MMM yyyy, HH:mm') : '-'
    },
    {
      field: 'statistics', headerName: 'Statistik (Delivered/Opened)', flex: 1, minWidth: 200,
      filterable: false,
      renderCell: (params) => `${params.row.delivered} / ${params.row.opened}`
    },
    {
      field: 'x_studio_owner_id', headerName: 'Dibuat Oleh', flex: 1, minWidth: 150,
      valueGetter: (value) => value ? value[1] : 'N/A'
    },
    {
      field: 'actions', headerName: 'Aksi', sortable: false, filterable: false,
      disableColumnMenu: true, width: 120, align: 'center', headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<any, Campaign>) => {
        const canEditOrDelete = params.row.state === 'draft' || params.row.state === 'in_queue';
        return (
          <Box>
            <Tooltip title="Lihat Statistik"><IconButton size="small" onClick={() => onView(params.row)}><IconEye size="1.2rem" /></IconButton></Tooltip>
            <Tooltip title={canEditOrDelete ? "Edit" : "Hanya bisa diedit jika status Draft/In Queue"}>
              <span>
                <IconButton size="small" onClick={() => onEdit(params.row)} disabled={!canEditOrDelete}>
                  <IconPencil size="1.2rem" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={canEditOrDelete ? "Hapus" : "Hanya bisa dihapus jika status Draft/In Queue"}>
              <span>
                <IconButton size="small" color="error" onClick={() => onDeleteRequest(params.row)} disabled={!canEditOrDelete}>
                  <IconTrash size="1.2rem" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <style>{pulseAnimation}</style>
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
        slots={{
          toolbar: CustomToolbar,
          loadingOverlay: CustomLoadingOverlay
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={{ border: 'none' }}
      />
    </Box>
  );
};

export default CampaignsTable;