// src/components/apps/subscribers/modal/AddSubscriberModal.tsx

import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    CircularProgress, Alert, Autocomplete, Box, ToggleButtonGroup, ToggleButton,
    Stack
} from '@mui/material';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { Contact } from 'src/types/apps/contacts';
import { MailingList } from 'src/types/apps/campaigns';
import { IconUser, IconUsers } from '@tabler/icons-react';

interface AddSubscriberModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultListId?: number;
}

const AddSubscriberModal = ({ open, onClose, onSuccess, defaultListId }: AddSubscriberModalProps) => {
    const [creationMode, setCreationMode] = useState<'manual' | 'import'>('manual');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [selectedPartners, setSelectedPartners] = useState<Contact[]>([]);
    const [selectedLists, setSelectedLists] = useState<MailingList[]>([]);

    const [partnerOptions, setPartnerOptions] = useState<Contact[]>([]);
    const [listOptions, setListOptions] = useState<MailingList[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setEmail(''); setName(''); setCompanyName(''); setSelectedPartners([]);
            setSelectedLists([]); setError(''); setCreationMode('manual');
            const fetchData = async () => {
                try {
                    const [partnersRes, listsRes] = await Promise.all([
                        axios.get('/contacts/for-selection'),
                        axios.get('/marketing/mailing-lists')
                    ]);

                    const partnerData = Array.isArray(partnersRes.data) ? partnersRes.data : (partnersRes.data.lists || []);
                    const listData = Array.isArray(listsRes.data) ? listsRes.data : (listsRes.data.lists || []);

                    setPartnerOptions(partnerData);
                    setListOptions(listData);

                    if (defaultListId) {
                        const defaultList = listData.find((list: MailingList) => list.id === defaultListId);
                        if (defaultList) {
                            setSelectedLists([defaultList]);
                        }
                    }

                } catch (err) {
                    console.error("Fetch data error:", err);
                    toast.error("Gagal memuat data kontak atau mailing list.");
                }
            };
            fetchData();
        }
    }, [open, defaultListId]);

    const handleClose = () => { onClose(); };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const listIdsToSend = selectedLists.map(list => list.id);

            if (creationMode === 'import') {
                if (selectedPartners.length === 0) {
                    setError("Pilih setidaknya satu kontak yang akan diimpor.");
                    setIsSubmitting(false);
                    return;
                }

                const importPromises = selectedPartners.map(partner => {
                    const payload = { partner_id: partner.id, list_ids: listIdsToSend };
                    return axios.post('/subscribers', payload);
                });

                const results = await Promise.allSettled(importPromises);
                const successfulImports = results.filter(result => result.status === 'fulfilled').length;
                const failedImports = results.length - successfulImports;

                if (successfulImports > 0) toast.success(`${successfulImports} subscriber berhasil diimpor.`);
                if (failedImports > 0) {
                    const firstError = results.find(result => result.status === 'rejected') as PromiseRejectedResult | undefined;
                    const errorMessage = (firstError?.reason as any)?.response?.data?.detail || 'Beberapa impor gagal.';
                    toast.error(`${failedImports} impor subscriber gagal. Error pertama: ${errorMessage}`);
                    setError(`Gagal mengimpor ${failedImports} subscriber. Error: ${errorMessage}`);
                }
                if (successfulImports > 0) { onSuccess(); handleClose(); }

            } else {
                if (!email.trim()) {
                    setError("Email wajib diisi.");
                    setIsSubmitting(false);
                    return;
                }
                const payload = {
                    email,
                    name: name || undefined,
                    company_name: companyName || undefined,
                    list_ids: listIdsToSend
                };
                await axios.post('/subscribers', payload);
                toast.success('Subscriber berhasil ditambahkan.');
                onSuccess();
                handleClose();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Terjadi kesalahan.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Tambah Subscriber Baru</DialogTitle>
            <DialogContent dividers>
                {error && !isSubmitting && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <ToggleButtonGroup
                            value={creationMode}
                            exclusive
                            onChange={(_, newMode) => { if (newMode) setCreationMode(newMode); setError(''); setSelectedPartners([]); setEmail(''); setName(''); setCompanyName(''); }}
                            aria-label="creation mode"
                        >
                            <ToggleButton value="manual" aria-label="manual">
                                <IconUser size="1rem" style={{ marginRight: 8 }} /> Manual
                            </ToggleButton>
                            <ToggleButton value="import" aria-label="import">
                                <IconUsers size="1rem" style={{ marginRight: 8 }} /> Impor dari Kontak
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {creationMode === 'manual' ? (
                        <>
                            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required error={Boolean(error && creationMode === 'manual' && !email.trim())} helperText={error && creationMode === 'manual' && !email.trim() ? "Email wajib diisi" : ""} />
                            <TextField label="Nama (Opsional)" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                            <TextField label="Nama Perusahaan (Opsional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} fullWidth />
                        </>
                    ) : (
                        <Autocomplete
                            multiple
                            options={partnerOptions}
                            filterOptions={(options, params) => {
                                const filtered = options.filter(option =>
                                    !selectedPartners.some(selected => selected.id === option.id) &&
                                    ((option.name && option.name.toLowerCase().includes(params.inputValue.toLowerCase())) ||
                                        (option.email && option.email.toLowerCase().includes(params.inputValue.toLowerCase())))
                                );
                                return filtered.slice(0, 100);
                            }}
                            getOptionLabel={(option) => `${option.name || 'No Name'} (${option.email || 'No Email'})`}
                            value={selectedPartners}
                            onChange={(_, newValue) => setSelectedPartners(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} label="Pilih Kontak untuk Diimpor" placeholder="Cari nama atau email..." error={Boolean(error && creationMode === 'import' && selectedPartners.length === 0)} helperText={error && creationMode === 'import' && selectedPartners.length === 0 ? "Pilih minimal satu kontak" : ""} />}
                        />
                    )}

                    <Autocomplete
                        multiple
                        options={listOptions}
                        getOptionLabel={(option) => `${option.name} (${option.contact_count})`}
                        value={selectedLists}
                        onChange={(_, newValue) => setSelectedLists(newValue)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => <TextField {...params} label="Masukkan ke Mailing List (Opsional)" />}
                    />
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

export default AddSubscriberModal;