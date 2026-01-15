// components/email-marketing/subscribers/modals/AddSubscriberModal.tsx
"use client";

import { Contact, MailingList } from '@/lib/types/email-marketing';
import {
    Alert, Autocomplete, Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { IconUser, IconUsers } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

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
                    // TODO: Replace with real API calls when backend is ready
                    // const [partnersRes, listsRes] = await Promise.all([
                    //     axiosClient.get('/contacts/for-selection'),
                    //     axiosClient.get('/marketing/mailing-lists')
                    // ]);

                    // MOCK DATA - Remove this when backend is ready
                    const { mockContacts, mockMailingLists, simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
                    await simulateApiDelay(300);
                    
                    const partnerData = mockContacts;
                    const listData = mockMailingLists;

                    setPartnerOptions(partnerData);
                    setListOptions(listData);

                    if (defaultListId) {
                        const defaultList = listData.find((list) => list.id === defaultListId);
                        if (defaultList) {
                            setSelectedLists([defaultList]);
                        }
                    }

                } catch (err) {
                    console.error("Fetch data error:", err);
                    toast.error("Failed to load contacts or mailing lists.");
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
                    setError("Please select at least one contact to import.");
                    setIsSubmitting(false);
                    return;
                }

                // TODO: Replace with real API call when backend is ready
                // const importPromises = selectedPartners.map(partner => {
                //     const payload = { partner_id: partner.id, list_ids: listIdsToSend };
                //     return axiosClient.post('/subscribers', payload);
                // });
                // const results = await Promise.allSettled(importPromises);

                // MOCK - Simulate success
                const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
                await simulateApiDelay(500);
                const successfulImports = selectedPartners.length;

                toast.success(`${successfulImports} subscriber(s) imported successfully.`);
                onSuccess(); 
                handleClose();

            } else {
                if (!email.trim()) {
                    setError("Email is required.");
                    setIsSubmitting(false);
                    return;
                }
                
                // TODO: Replace with real API call when backend is ready
                // const payload = {
                //     email,
                //     name: name || undefined,
                //     company_name: companyName || undefined,
                //     list_ids: listIdsToSend
                // };
                // await axiosClient.post('/subscribers', payload);
                
                // MOCK - Simulate success
                const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
                await simulateApiDelay(500);
                
                toast.success('Subscriber added successfully.');
                onSuccess();
                handleClose();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'An error occurred.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogContent dividers>
                {error && !isSubmitting && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <ToggleButtonGroup
                            value={creationMode}
                            exclusive
                            onChange={(_, newMode) => { 
                                if (newMode) setCreationMode(newMode); 
                                setError(''); 
                                setSelectedPartners([]); 
                                setEmail(''); 
                                setName(''); 
                                setCompanyName(''); 
                            }}
                            aria-label="creation mode"
                        >
                            <ToggleButton value="manual" aria-label="manual">
                                <IconUser size="1rem" style={{ marginRight: 8 }} /> Manual
                            </ToggleButton>
                            <ToggleButton value="import" aria-label="import">
                                <IconUsers size="1rem" style={{ marginRight: 8 }} /> Import from Contacts
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {creationMode === 'manual' ? (
                        <>
                            <TextField 
                                label="Email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                fullWidth 
                                required 
                                error={Boolean(error && creationMode === 'manual' && !email.trim())} 
                                helperText={error && creationMode === 'manual' && !email.trim() ? "Email is required" : ""} 
                            />
                            <TextField 
                                label="Name (Optional)" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                fullWidth 
                            />
                            <TextField 
                                label="Company Name (Optional)" 
                                value={companyName} 
                                onChange={(e) => setCompanyName(e.target.value)} 
                                fullWidth 
                            />
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
                            renderInput={(params) => 
                                <TextField 
                                    {...params} 
                                    label="Select Contacts to Import" 
                                    placeholder="Search name or email..." 
                                    error={Boolean(error && creationMode === 'import' && selectedPartners.length === 0)} 
                                    helperText={error && creationMode === 'import' && selectedPartners.length === 0 ? "Select at least one contact" : ""} 
                                />
                            }
                        />
                    )}

                    <Autocomplete
                        multiple
                        options={listOptions}
                        getOptionLabel={(option) => `${option.name} (${option.contact_count})`}
                        value={selectedLists}
                        onChange={(_, newValue) => setSelectedLists(newValue)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => <TextField {...params} label="Add to Mailing Lists (Optional)" />}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSubscriberModal;
