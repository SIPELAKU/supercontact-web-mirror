// src/components/apps/mailing-lists/detail/ListSubscribersTable.tsx

import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, IconButton, Tooltip, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, CircularProgress
} from '@mui/material';
import {
    DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel,
    GridFilterModel, GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter
} from '@mui/x-data-grid';
import {
    IconUserPlus, IconUserOff, IconPencil, IconAlertTriangle
} from '@tabler/icons-react';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { Subscriber } from 'src/types/apps/subscribers';
import AddSubscriberModal from 'src/components/apps/subscribers/modal/AddSubscriberModal';
import EditSubscriberModal from 'src/components/apps/subscribers/modal/EditSubscriberModal';

interface ListSubscribersTableProps {
    listId: number;
    refreshTrigger: number;
    forceRefreshParent: () => void;
}

const ListSubscribersTable = ({ listId, refreshTrigger, forceRefreshParent }: ListSubscribersTableProps) => {
    const [rows, setRows] = useState<Subscriber[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    // --- State Modal & Dialog ---
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
    const [subscriberToRemove, setSubscriberToRemove] = useState<Subscriber | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/marketing/mailing-lists/${listId}/subscribers`, {
                params: {
                    skip: paginationModel.page * paginationModel.pageSize,
                    limit: paginationModel.pageSize,
                    filters: JSON.stringify(filterModel),
                },
            });
            setRows(response.data.subscribers);
            setRowCount(response.data.total);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Gagal mengambil data subscriber list ini.');
            setRows([]); setRowCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [listId, paginationModel, filterModel]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTrigger]);

    const handleOpenAddModal = () => setAddModalOpen(true);
    const handleOpenEditModal = (subscriber: Subscriber) => {
        setSelectedSubscriber(subscriber);
        setEditModalOpen(true);
    };
    const handleCloseModals = () => {
        setAddModalOpen(false);
        setEditModalOpen(false);
        setSelectedSubscriber(null);
    };
    const handleModalSuccess = () => {
        handleCloseModals();
        fetchData();
        forceRefreshParent();
    };

    const handleRemoveRequest = (subscriber: Subscriber) => {
        setSubscriberToRemove(subscriber);
        setConfirmRemoveOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!subscriberToRemove) return;
        setIsRemoving(true);
        try {
            const subscriberFromState = rows.find(r => r.id === subscriberToRemove.id);
            const currentListIds = subscriberFromState?.list_ids || [];

            const updatedListIds = currentListIds.filter(id => id !== listId);

            await axios.put(`/subscribers/${subscriberToRemove.id}`, { list_ids: updatedListIds });
            toast.success(`Subscriber "${subscriberToRemove.email}" dikeluarkan dari list.`);
            fetchData();
            forceRefreshParent();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Gagal mengeluarkan subscriber dari list.';
            toast.error(errorMessage);
        } finally {
            setConfirmRemoveOpen(false);
            setSubscriberToRemove(null);
            setIsRemoving(false);
        }
    };

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GridToolbarFilterButton />
                    <GridToolbarQuickFilter debounceMs={500} variant="outlined" size="small" sx={{ minWidth: '250px' }} />
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconUserPlus size="1.1rem" />}
                    onClick={handleOpenAddModal}
                >
                    Tambah Subscriber ke List Ini
                </Button>
            </GridToolbarContainer>
        );
    }

    const columns: GridColDef<Subscriber>[] = [
        { field: 'email', headerName: 'Email', flex: 2, minWidth: 250 },
        { field: 'name', headerName: 'Nama', flex: 1, minWidth: 180, valueGetter: (value) => value || '-' },
        { field: 'company_name', headerName: 'Perusahaan', flex: 1, minWidth: 180, valueGetter: (value) => value || '-' },
        {
            field: 'actions', headerName: 'Aksi', sortable: false, filterable: false,
            disableColumnMenu: true, width: 100, align: 'center', headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<any, Subscriber>) => (
                <Box>
                    {/* Aktifkan Aksi Edit */}
                    <Tooltip title="Edit Subscriber">
                        <IconButton size="small" onClick={() => handleOpenEditModal(params.row)}>
                            <IconPencil size="1.2rem" />
                        </IconButton>
                    </Tooltip>
                    {/* Aktifkan Aksi Remove from List */}
                    <Tooltip title="Keluarkan dari List">
                        <IconButton size="small" color="warning" onClick={() => handleRemoveRequest(params.row)}>
                            <IconUserOff size="1.2rem" />
                        </IconButton>
                    </Tooltip>
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
            />

            {/* --- Render Modal Add/Edit & Konfirmasi Remove --- */}
            <AddSubscriberModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleModalSuccess} defaultListId={listId} />
            {selectedSubscriber && (
                <EditSubscriberModal open={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleModalSuccess} subscriberData={selectedSubscriber} />
            )}

            {/* Dialog Konfirmasi Remove */}
            <Dialog open={confirmRemoveOpen} onClose={() => setConfirmRemoveOpen(false)}>
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconAlertTriangle size="1.5rem" color="orange" />
                        <Typography variant="h6">Konfirmasi Pengeluaran</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Anda yakin ingin mengeluarkan subscriber "{subscriberToRemove?.email}" dari mailing list ini? Subscriber tidak akan dihapus permanen.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmRemoveOpen(false)} color="secondary" disabled={isRemoving}>Batal</Button>
                    <Button onClick={handleConfirmRemove} color="warning" variant="contained" disabled={isRemoving}>
                        {isRemoving ? <CircularProgress size={24} color="inherit" /> : 'Ya, Keluarkan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListSubscribersTable;