// components/email-marketing/subscribers/modals/AddSubscriberModal.tsx
"use client";

import { useContacts } from '@/lib/hooks/useContacts';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { useCreateSubscriber } from '@/lib/hooks/useSubscribers';
import { MailingList } from '@/lib/types/email-marketing';
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
    defaultListId?: string;
    target?: 'subscriber' | 'mailing_list'; // Add target prop
}

const AddSubscriberModal = ({ open, onClose, onSuccess, defaultListId, target = 'subscriber' }: AddSubscriberModalProps) => {
    const [creationMode, setCreationMode] = useState<'manual' | 'import'>('manual');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [position, setPosition] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [selectedLists, setSelectedLists] = useState<MailingList[]>([]);

    const [error, setError] = useState('');

    const createMutation = useCreateSubscriber();
    const { data: mailingListsData } = useMailingLists();
    const { data: contactsData } = useContacts();

    const listOptions = mailingListsData?.data?.mailing_lists || [];
    const contactOptions = contactsData?.data?.contacts || [];

    useEffect(() => {
        if (open) {
            setEmail(''); 
            setName(''); 
            setPhoneNumber('');
            setPosition('');
            setCompany(''); 
            setAddress('');
            setSelectedContacts([]);
            setSelectedLists([]); 
            setError(''); 
            setCreationMode('manual');

            if (defaultListId && listOptions.length > 0) {
                const defaultList = listOptions.find((list) => list.id === defaultListId);
                if (defaultList) {
                    setSelectedLists([defaultList]);
                }
            }
        }
    }, [open, defaultListId, listOptions.length]);

    const handleClose = () => { onClose(); };
    
    const handleSubmit = async () => {
        setError('');
        try {
            const listIdsToSend = selectedLists.map(list => list.id);

            if (creationMode === 'import') {
                if (selectedContacts.length === 0) {
                    setError("Please select at least one contact to import.");
                    return;
                }

                const contactIds = selectedContacts.map(contact => contact.id);
                
                await createMutation.mutateAsync({
                    target: target,
                    type_request: 'import',
                    contact_ids: contactIds,
                    mailing_list_ids: listIdsToSend
                });

                toast.success(`${selectedContacts.length} subscriber(s) imported successfully.`);
                onSuccess(); 
                handleClose();

            } else {
                // Validate required fields
                if (!email.trim()) {
                    setError("Email is required.");
                    return;
                }
                if (!name.trim()) {
                    setError("Name is required.");
                    return;
                }
                if (!phoneNumber.trim()) {
                    setError("Phone number is required.");
                    return;
                }
                if (!position.trim()) {
                    setError("Position is required.");
                    return;
                }
                
                await createMutation.mutateAsync({
                    target: target,
                    type_request: 'manual',
                    new_contact: {
                        name: name.trim(),
                        email: email.trim(),
                        phone_number: phoneNumber.trim(),
                        position: position.trim(),
                        company: company.trim(),
                        address: address.trim()
                    },
                    mailing_list_ids: listIdsToSend
                });
                
                toast.success('Subscriber added successfully.');
                onSuccess();
                handleClose();
            }
        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogContent dividers>
                {error && !createMutation.isPending && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <ToggleButtonGroup
                            value={creationMode}
                            exclusive
                            onChange={(_, newMode) => { 
                                if (newMode) setCreationMode(newMode); 
                                setError(''); 
                                setSelectedContacts([]); 
                                setEmail(''); 
                                setName(''); 
                                setPhoneNumber('');
                                setPosition('');
                                setCompany(''); 
                                setAddress('');
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
                                error={Boolean(error && !email.trim())} 
                                helperText={error && !email.trim() ? "Email is required" : ""} 
                            />
                            <TextField 
                                label="Name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                fullWidth 
                                required
                                error={Boolean(error && !name.trim())} 
                                helperText={error && !name.trim() ? "Name is required" : ""}
                            />
                            <TextField 
                                label="Phone Number" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)} 
                                fullWidth 
                                required
                                error={Boolean(error && !phoneNumber.trim())} 
                                helperText={error && !phoneNumber.trim() ? "Phone number is required" : ""}
                            />
                            <TextField 
                                label="Position" 
                                value={position} 
                                onChange={(e) => setPosition(e.target.value)} 
                                fullWidth 
                                required
                                error={Boolean(error && !position.trim())} 
                                helperText={error && !position.trim() ? "Position is required" : ""}
                            />
                            <TextField 
                                label="Company" 
                                value={company} 
                                onChange={(e) => setCompany(e.target.value)} 
                                fullWidth 
                            />
                            <TextField 
                                label="Address" 
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                                fullWidth 
                                multiline
                                rows={2}
                            />
                        </>
                    ) : (
                        <Autocomplete
                            multiple
                            options={contactOptions}
                            filterOptions={(options, params) => {
                                const filtered = options.filter(option =>
                                    !selectedContacts.some(selected => selected.id === option.id) &&
                                    ((option.name && option.name.toLowerCase().includes(params.inputValue.toLowerCase())) ||
                                        (option.email && option.email.toLowerCase().includes(params.inputValue.toLowerCase())))
                                );
                                return filtered.slice(0, 100);
                            }}
                            getOptionLabel={(option) => `${option.name || 'No Name'} (${option.email || 'No Email'})`}
                            value={selectedContacts}
                            onChange={(_, newValue) => setSelectedContacts(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => 
                                <TextField 
                                    {...params} 
                                    label="Select Contacts to Import" 
                                    placeholder="Search name or email..." 
                                    error={Boolean(error && creationMode === 'import' && selectedContacts.length === 0)} 
                                    helperText={error && creationMode === 'import' && selectedContacts.length === 0 ? "Select at least one contact" : ""} 
                                />
                            }
                        />
                    )}

                    <Autocomplete
                        multiple
                        options={listOptions}
                        getOptionLabel={(option) => `${option.name} (${option.subscriber_count})`}
                        value={selectedLists}
                        onChange={(_, newValue) => setSelectedLists(newValue)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => <TextField {...params} label="Add to Mailing Lists (Optional)" />}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} color="secondary" disabled={createMutation.isPending}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSubscriberModal;
