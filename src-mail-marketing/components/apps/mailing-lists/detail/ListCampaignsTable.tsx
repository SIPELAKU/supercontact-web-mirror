// src/components/apps/mailing-lists/detail/ListCampaignsTable.tsx

import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Tooltip, Chip, LinearProgress } from '@mui/material';
import {
    DataGrid, GridColDef, GridRenderCellParams, GridFilterModel,
    GridPaginationModel, GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { IconEye } from '@tabler/icons-react';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Campaign } from 'src/types/apps/campaigns';
import ViewCampaignModal from 'src/components/apps/campaigns/modal/ViewCampaignModal';

interface ListCampaignsTableProps {
    listId: number;
    refreshTrigger: number;
}

const getStatusChip = (status: Campaign['state']) => {
    switch (status) {
        case 'draft': return <Chip label="Draft" color="secondary" size="small" />;
        case 'in_queue': return <Chip label="In Queue" color="info" size="small" sx={{ animation: 'pulse 1.5s infinite' }} />;
        case 'sending': return <Chip label="Sending" color="primary" size="small" sx={{ animation: 'pulse 1.5s infinite' }} />;
        case 'done': return <Chip label="Sent" color="success" size="small" />;
        case 'canceled': return <Chip label="Canceled" color="error" size="small" />;
        default: return <Chip label={status || 'Unknown'} size="small" />;
    }
};

const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;
// --------------------------------------------------------

function CustomLoadingOverlay() {
    return <LinearProgress />;
}

const ListCampaignsTable = ({ listId, refreshTrigger }: ListCampaignsTableProps) => {
    const [rows, setRows] = useState<Campaign[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

    const fetchData = useCallback(async (showLoadingSpinner = true) => {
        if (showLoadingSpinner) setIsLoading(true);
        try {
            const response = await axios.get(`/marketing/mailing-lists/${listId}/campaigns`, {
                params: {
                    // --- Params Lengkap ---
                    skip: paginationModel.page * paginationModel.pageSize,
                    limit: paginationModel.pageSize,
                    filters: JSON.stringify(filterModel),
                },
            });
            setRows(response.data.campaigns);
            setRowCount(response.data.total);
            // --- Cek Status Lengkap ---
            const isProcessing = response.data.campaigns.some(
                (c: Campaign) => c.state === 'in_queue' || c.state === 'sending'
            );
            return isProcessing;
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || `Gagal memuat kampanye untuk list ID ${listId}.`;
            if (showLoadingSpinner) toast.error(errorMessage);
            setRows([]); setRowCount(0);
            return false;
        } finally {
            if (showLoadingSpinner) setIsLoading(false);
        }
    }, [listId, paginationModel, filterModel]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTrigger]);

    useEffect(() => {
        // --- Logika Polling Lengkap ---
        let intervalId: NodeJS.Timeout | null = null;
        const startPolling = () => {
            intervalId = setInterval(async () => {
                const stillProcessing = await fetchData(false); // Jangan tampilkan spinner saat polling
                if (!stillProcessing && intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }, 7000); // Poll setiap 7 detik
        };

        if (!isLoading && rows.some(c => c.state === 'in_queue' || c.state === 'sending')) {
            startPolling();
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
        // -----------------------------
    }, [rows, fetchData, isLoading]);

    const handleOpenViewModal = (campaign: Campaign) => {
        setSelectedCampaignId(campaign.id);
        setViewModalOpen(true);
    };
    const handleCloseViewModal = () => {
        setViewModalOpen(false);
        setSelectedCampaignId(null);
    };

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GridToolbarFilterButton />
                    <GridToolbarQuickFilter debounceMs={500} variant="outlined" size="small" sx={{ minWidth: '250px' }} />
                </Box>
            </GridToolbarContainer>
        );
    }

    const columns: GridColDef<Campaign>[] = [
        { field: 'subject', headerName: 'Subjek Kampanye', flex: 2, minWidth: 300 },
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
            field: 'delivered',
            headerName: 'Stats (Delivered/Opened)',
            flex: 1, minWidth: 180,
            filterable: false, sortable: false,
            renderCell: (params) => `${params.row.delivered ?? 0} / ${params.row.opened ?? 0}`
            // ---------------------------------
        },
        {
            field: 'x_studio_owner_id', headerName: 'Dibuat Oleh', flex: 1, minWidth: 150,
            valueGetter: (value) => (value && Array.isArray(value)) ? value[1] : 'N/A'
        },
        {
            field: 'actions', headerName: 'Aksi', sortable: false, filterable: false,
            disableColumnMenu: true, width: 80, align: 'center', headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<any, Campaign>) => (
                <Box>
                    <Tooltip title="Lihat Statistik"><IconButton size="small" onClick={() => handleOpenViewModal(params.row)}><IconEye size="1.2rem" /></IconButton></Tooltip>
                </Box>
            ),
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
                getRowId={(row) => row.id}
                slots={{
                    toolbar: CustomToolbar,
                    loadingOverlay: CustomLoadingOverlay
                }}
                slotProps={{
                    toolbar: { showQuickFilter: true },
                }}
                sx={{ border: 'none' }}
            />
            <ViewCampaignModal open={isViewModalOpen} onClose={handleCloseViewModal} campaignId={selectedCampaignId} />
        </Box>
    );
};

export default ListCampaignsTable;