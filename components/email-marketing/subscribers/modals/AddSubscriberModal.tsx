// components/email-marketing/subscribers/modals/AddSubscriberModal.tsx
"use client";

import { AppInput } from '@/components/ui/app-input';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { AppAutocomplete } from '@/components/ui/app-autocomplete';
import { AppTextarea } from '@/components/ui/app-textarea';
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
import { notify } from '@/lib/notifications';
import { AppButton } from '@/components/ui/app-button';

interface AddSubscriberModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultListId?: string;
    target?: 'subscriber' | 'mailing_list'; // Add target prop
}

const AddSubscriberModal = ({ open, onClose, onSuccess, defaultListId, target = 'subscriber' }: AddSubscriberModalProps) => {
    const [creationMode, setCreationMode] = useState<'manual' | 'from_contacts'>('manual');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [position, setPosition] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [selectedLists, setSelectedLists] = useState<MailingList[]>([]);
    const [contactSearchQuery, setContactSearchQuery] = useState('');

    const [error, setError] = useState('');

    const createMutation = useCreateSubscriber();
    const { data: mailingListsData } = useMailingLists();
    const { data: contactsData, isLoading: isLoadingContacts } = useContacts(contactSearchQuery);

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
            setContactSearchQuery('');
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

            if (creationMode === 'from_contacts') {
                if (selectedContacts.length === 0) {
                    setError("Please select at least one contact to import.");
                    return;
                }

                const contactIds = selectedContacts.map(contact => contact.id);

                await createMutation.mutateAsync({
                    target: target,
                    type_request: 'from_contacts',
                    contact_ids: contactIds,
                    mailing_list_ids: listIdsToSend
                });

                notify.success(`${selectedContacts.length} subscriber(s) imported successfully.`);
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

                await createMutation.mutateAsync({
                    target: target,
                    type_request: 'manual',
                    new_contact: {
                        name: name.trim(),
                        email: email.trim(),
                        phone_number: phoneNumber.trim() || undefined,
                        position: position.trim() || undefined,
                        company: company.trim() || undefined,
                        address: address.trim() || undefined
                    },
                    mailing_list_ids: listIdsToSend
                });

                notify.success('Subscriber added successfully.');
                onSuccess();
                handleClose();
            }
        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred.';
            setError(errorMessage);
            notify.error(errorMessage);
        }
    };

    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    return (
        <Dialog open={open} onClose={() => setShowCloseConfirmation(true)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogContent dividers>
                {error && !createMutation.isPending && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ textAlign: 'center', }}>
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
                            sx={{ borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <ToggleButton value="manual" aria-label="manual">
                                <IconUser size="1rem" style={{ marginRight: 8 }} /> Manual
                            </ToggleButton>
                            <ToggleButton value="from_contacts" aria-label="import">
                                <IconUsers size="1rem" style={{ marginRight: 8 }} /> Import from Contacts
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {creationMode === 'manual' ? (
                        <>
                            <Box>
                                <label htmlFor="email">Email <span style={{ color: 'red' }}>*</span> </label>
                                <AppInput
                                    isBgWhite
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    required
                                    error={Boolean(error && !email.trim())}
                                    helperText={error && !email.trim() ? "Email is required" : ""}
                                />
                            </Box>
                            <Box>
                                <label htmlFor="name">Name <span style={{ color: 'red' }}>*</span> </label>
                                <AppInput
                                    isBgWhite
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    fullWidth
                                    required
                                    error={Boolean(error && !name.trim())}
                                    helperText={error && !name.trim() ? "Name is required" : ""}
                                />
                            </Box>
                            <Box>
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <AppInput
                                    isBgWhite
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    fullWidth
                                />
                            </Box>

                            <Box>
                                <label htmlFor="position">Position</label>
                                <AppInput
                                    isBgWhite
                                    type="text"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box>
                                <label htmlFor="company">Company</label>
                                <AppInput
                                    isBgWhite
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box>
                                <label htmlFor="address">Address</label>
                                <AppTextarea
                                    isBgWhite
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Box>
                        </>
                    ) : (
                        <AppAutocomplete
                            multiple
                            isBgWhite
                            options={contactOptions}
                            loading={isLoadingContacts}
                            getOptionLabel={(option) => `${option.name || 'No Name'} (${option.email || 'No Email'})`}
                            value={selectedContacts}
                            onChange={(_, newValue) => setSelectedContacts(newValue)}
                            onInputChange={(_, newInputValue) => {
                                setContactSearchQuery(newInputValue);
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            label="Select Contacts to Import"
                            placeholder="Search name or email..."
                            error={Boolean(error && creationMode === 'from_contacts' && selectedContacts.length === 0)}
                            helperText={error && creationMode === 'from_contacts' && selectedContacts.length === 0 ? "Select at least one contact" : ""}
                        />
                    )}

                    <AppAutocomplete<MailingList, true, false, false>
                        isBgWhite
                        multiple
                        options={listOptions}
                        getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.subscriber_count})`}
                        value={selectedLists}
                        onChange={(_, newValue) => {
                            if (Array.isArray(newValue) && newValue.every(item => typeof item !== 'string')) {
                                setSelectedLists(newValue as MailingList[]);
                            }
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        label="Add to Mailing Lists (Optional)"
                        placeholder="Search mailing list..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <AppButton
                    onClick={() => {
                        onClose();
                    }}
                    variantStyle="outline"
                    color='danger'
                    disabled={createMutation.isPending}
                >
                    Cancel
                </AppButton>
                <AppButton onClick={handleSubmit} variantStyle="primary" color='primary' isLoading={createMutation.isPending}>
                    Save
                </AppButton>
            </DialogActions>

            <ConfirmationPopup
                isOpen={showCloseConfirmation}
                onClose={() => setShowCloseConfirmation(false)}
                onConfirm={() => {
                    setShowCloseConfirmation(false);
                    handleClose();
                }}
                title="Are you sure?"
                description="This will discard your current record."
                confirmText="Discard record"
                cancelText="Cancel"
                variant="danger"
            />
        </Dialog>
    );
};

export default AddSubscriberModal;
