// src/views/apps/mailing-lists/MailingListsPage.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, CircularProgress, Alert, Paper, Grid,
  IconButton, Tooltip, Menu, MenuItem, // Komponen baru
  Dialog, DialogActions, DialogContent, DialogTitle, Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  IconPlus, IconChevronRight, IconDotsVertical, IconPencil, IconTrash,
  IconAlertTriangle
} from '@tabler/icons-react';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';

import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import DashboardCard from 'src/components/shared/DashboardCard';
import { MailingList } from 'src/types/apps/campaigns';
import AddMailingListModal from 'src/components/apps/mailing-lists/modal/AddMailingListModal';
import EditMailingListModal from 'src/components/apps/mailing-lists/modal/EditMailingListModal';

const ListActions = ({ list, onEdit, onDeleteRequest }: { list: MailingList, onEdit: (list: MailingList) => void, onDeleteRequest: (list: MailingList) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    onEdit(list);
    handleClose();
  }

  const handleDeleteClick = () => {
    onDeleteRequest(list);
    handleClose();
  }

  return (
    <>
      <Tooltip title="Opsi">
        <IconButton
          aria-label="options"
          aria-controls={open ? 'list-actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <IconDotsVertical size="1.1rem" />
        </IconButton>
      </Tooltip>
      <Menu
        id="list-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleEditClick}><IconPencil size="1rem" style={{ marginRight: 8 }} /> Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}><IconTrash size="1rem" style={{ marginRight: 8 }} /> Hapus</MenuItem>
      </Menu>
    </>
  );
}

const MailingListsPage = () => {
  const BCrumb = [
    { to: '/dashboards/modern', title: 'Dashboard' },
    { to: '#', title: 'Email Marketing' },
    { title: 'Mailing Lists' },
  ];

  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<MailingList | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<MailingList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/marketing/mailing-lists');
      setMailingLists(response.data.lists);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal memuat mailing lists.';
      setError(errorMessage);
      toast.error(errorMessage);
      setMailingLists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleOpenEditModal = (list: MailingList) => {
    setSelectedList(list);
    setIsEditModalOpen(true);
  };
  const handleDeleteRequest = (list: MailingList) => {
    setListToDelete(list);
    setConfirmOpen(true);
  };
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedList(null);
  };
  const handleModalSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/marketing/mailing-lists/${listToDelete.id}`);
      toast.success(`Mailing list "${listToDelete.name}" berhasil dihapus.`);
      forceRefetch(); // Refresh data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal menghapus mailing list.';
      toast.error(errorMessage);
    } finally {
      setConfirmOpen(false);
      setListToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer title="Mailing Lists" description="Kelola mailing list Anda">
      <Breadcrumb title="Mailing Lists" items={BCrumb} />

      <DashboardCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h5">Daftar Mailing List</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size="1.1rem" />}
            onClick={handleOpenAddModal}
          >
            Buat List Baru
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && !isLoading && (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        )}

        {!isLoading && !error && mailingLists.length === 0 && (
          <Typography sx={{ p: 2, textAlign: 'center' }}>Belum ada mailing list.</Typography>
        )}


        {!isLoading && !error && mailingLists.length > 0 && (
          <Box sx={{ px: 2, pb: 2 }}> {/* Tambah padding */}
            {mailingLists.map((list) => (
              <Paper
                key={list.id}
                variant="outlined"
                sx={{ mb: 1.5, '&:hover': { borderColor: 'primary.main' } }}
              >
                <Grid container spacing={0} alignItems="center">
                  <Grid item xs component={Link} to={`/app/email-marketing/mailing-lists/${list.id}`} sx={{ p: 2, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Box flexGrow={1}>
                      <Typography variant="h6" component="div" >{list.name}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', mx: 2, minWidth: '80px' }}>
                      <Typography variant="body1">{list.contact_count}</Typography>
                      <Typography variant="caption" color="textSecondary">Contacts</Typography>
                    </Box>
                    <IconChevronRight size="1.2rem" />
                  </Grid>

                  <Grid item xs="auto" sx={{ borderLeft: 1, borderColor: 'divider', p: 1 }}>
                    <ListActions list={list} onEdit={handleOpenEditModal} onDeleteRequest={handleDeleteRequest} />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </DashboardCard>

      <AddMailingListModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleModalSuccess} />
      <EditMailingListModal open={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleModalSuccess} listData={selectedList} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconAlertTriangle size="1.5rem" color="orange" />
            <Typography variant="h6">Konfirmasi Penghapusan</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Anda yakin ingin menghapus mailing list "{listToDelete?.name}"? Aksi ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary" disabled={isDeleting}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>


    </PageContainer>
  );
};

export default MailingListsPage;