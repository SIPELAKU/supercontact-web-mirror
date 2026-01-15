// src/components/apps/mailing-lists/modal/AddMailingListModal.tsx

import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    CircularProgress, Alert, Stack
} from '@mui/material';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';

interface AddMailingListModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void; // Callback setelah sukses
}

const AddMailingListModal = ({ open, onClose, onSuccess }: AddMailingListModalProps) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setName('');
        setError('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Nama mailing list tidak boleh kosong.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await axios.post('/marketing/mailing-lists', { name });
            toast.success(`Mailing list "${name}" berhasil dibuat.`);
            onSuccess(); // Panggil callback sukses
            handleClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Gagal membuat mailing list.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Buat Mailing List Baru</DialogTitle>
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
                    {/* Tambahkan field lain jika perlu */}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>Batal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Simpan'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMailingListModal;