"use client";

import { useState } from "react";
import {
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { notify } from "@/lib/notifications";
import { useCreateMailSender, useValidateMailSender } from "@/lib/hooks/useMailSenders";
import type { MailSender } from "@/lib/api/email-marketing/mail-senders";

interface AddMailSenderDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (mailSender: MailSender) => void;
}

export default function AddMailSenderDialog({ open, onClose, onSuccess }: AddMailSenderDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [createdMailSenderId, setCreatedMailSenderId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [createdMailSender, setCreatedMailSender] = useState<MailSender | null>(null);

    const createMutation = useCreateMailSender();
    const validateMutation = useValidateMailSender();

    const handleClose = () => {
        setStep(1);
        setName("");
        setEmail("");
        setOtp("");
        setCreatedMailSenderId(null);
        setCreatedMailSender(null);
        setError("");
        onClose();
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("A valid email is required");
            return;
        }

        setError("");
        try {
            const response = await createMutation.mutateAsync({
                name: name.trim(),
                email: email.trim(),
            });
            setCreatedMailSenderId(response.data.id);
            setCreatedMailSender(response.data);
            setStep(2);
            notify.success("Mail sender created. Please check your email for the OTP.");
        } catch (err: any) {
            setError(err.message || "Failed to create mail sender");
        }
    };

    const handleValidate = async () => {
        if (!otp.trim() || !/^\d+$/.test(otp)) {
            setError("Please enter a valid numeric OTP");
            return;
        }
        if (!createdMailSenderId || !createdMailSender) {
            setError("Missing mail sender ID");
            return;
        }

        setError("");
        try {
            await validateMutation.mutateAsync({
                mailSenderId: createdMailSenderId,
                otp: parseInt(otp, 10),
            });
            notify.success("Mail sender validated successfully!");
            onSuccess(createdMailSender);
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to validate OTP");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Mail Sender</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {step === 1 ? (
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Enter the name and email address for the new mail sender. We will send an OTP to this email address to verify it.
                        </Typography>

                        <div>
                            <label htmlFor="mail-sender-name">Sender Name *</label>
                            <AppInput
                                id="mail-sender-name"
                                placeholder="e.g., Marketing Team"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isBgWhite
                                fullWidth
                                error={Boolean(error && !name.trim())}
                            />
                        </div>

                        <div>
                            <label htmlFor="mail-sender-email">Sender Email *</label>
                            <AppInput
                                id="mail-sender-email"
                                type="email"
                                placeholder="marketing@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isBgWhite
                                fullWidth
                                error={Boolean(error && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))}
                            />
                        </div>
                    </Stack>
                ) : (
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Alert severity="info">
                            An OTP has been sent to <strong>{email}</strong>.
                        </Alert>
                        <Typography variant="body2" color="text.secondary">
                            Please enter the code to verify your sender email.
                        </Typography>

                        <div>
                            <label htmlFor="mail-sender-otp">Verification Code (OTP) *</label>
                            <AppInput
                                id="mail-sender-otp"
                                placeholder="Enter 6-digit code"
                                inputProps={{ maxLength: 6 }}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                                isBgWhite
                                fullWidth
                                error={Boolean(error && !otp.trim())}
                            />
                        </div>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
                <AppButton onClick={handleClose} color="gray" variantStyle="outline">
                    Cancel
                </AppButton>

                {step === 1 ? (
                    <AppButton
                        onClick={handleCreate}
                        variantStyle="primary"
                        isLoading={createMutation.isPending}
                    >
                        Send OTP
                    </AppButton>
                ) : (
                    <AppButton
                        onClick={handleValidate}
                        variantStyle="primary"
                        isLoading={validateMutation.isPending}
                        disabled={!otp || otp.length < 4}
                    >
                        Verify OTP
                    </AppButton>
                )}
            </DialogActions>
        </Dialog>
    );
}
