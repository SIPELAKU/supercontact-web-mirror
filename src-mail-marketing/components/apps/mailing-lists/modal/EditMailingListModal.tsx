// src/components/apps/mailing-lists/modal/EditMailingListModal.tsx

import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    CircularProgress, Alert, Stack
} from '@mui/material';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { MailingList } from 'src/types/apps/campaigns'; // Gunakan tipe yang ada

interface EditMailingListModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    listData: MailingList | null; // Data list yang akan diedit
}

const EditMailingListModal = ({ open, onClose, onSuccess, listData }: EditMailingListModalProps) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && listData) {
            setName(listData.name); // Isi form saat modal terbuka
            setError('');
        }
    }, [open, listData]);

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async () => {
        if (!listData) return; // Seharusnya tidak terjadi
        if (!name.trim()) {
            setError('Nama mailing list tidak boleh kosong.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await axios.put(`/marketing/mailing-lists/${listData.id}`, { name });
            toast.success(`Mailing list "${name}" berhasil diupdate.`);
            onSuccess();
            handleClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Gagal mengupdate mailing list.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Mailing List</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        label="Nama Mailing List"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                        error={Boolean(error && !name.trim())}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>Batal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Simpan Perubahan'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditMailingListModal;