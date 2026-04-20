"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    Stack,
    Divider,
} from "@mui/material";
import { X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { saveAsSubmissions } from "@/lib/api/smart-captures";
import { saveAsContacts } from "@/lib/api/contacts";
import { saveAsSubscribers } from "@/lib/api/email-marketing/subscribers";
import { saveAsRecipients } from "@/lib/api/whatsapp-marketing";
import { useAuth } from "@/lib/context/AuthContext";

export type SaveAsSourceType = "contact" | "subscriber" | "recipient" | "submission";

interface SaveAsModalProps {
    open: boolean;
    onClose: () => void;
    selectedIds: string[];
    sourceType: SaveAsSourceType;
    onSuccess?: () => void;
    smartCaptureId?: string;
}

export const SaveAsModal: React.FC<SaveAsModalProps> = ({
    open,
    onClose,
    selectedIds,
    sourceType,
    onSuccess,
    smartCaptureId,
}) => {
    const [targets, setTargets] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const handleToggleTarget = (target: string) => {
        setTargets((prev) =>
            prev.includes(target)
                ? prev.filter((t) => t !== target)
                : [...prev, target]
        );
    };

    const handleSave = async () => {
        if (!token) {
            notify.error("Please login to continue");
            return;
        }
        if (targets.length === 0) {
            notify.error("Please select at least one target");
            return;
        }

        setIsLoading(true);
        try {
            if (sourceType === "contact") {
                await saveAsContacts(token, targets, selectedIds);
            } else if (sourceType === "subscriber") {
                await saveAsSubscribers(token, targets, selectedIds);
            } else if (sourceType === "recipient") {
                await saveAsRecipients(token, targets, selectedIds);
            } else if (sourceType === "submission") {
                if (!smartCaptureId) throw new Error("Smart Capture ID is missing");
                await saveAsSubmissions(token, smartCaptureId, targets, selectedIds);
            }

            notify.success("Successfully saved contacts to selected targets");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            notify.error(error.message || "Failed to save contacts");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, p: 1 },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                    Save Selected Contacts
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers={false} sx={{ px: 2, py: 1 }}>
                <Box
                    sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: "#F0F4FF",
                        borderRadius: 1,
                        border: "1px solid #D1DBFF",
                    }}
                >
                    <Typography variant="body2" color="#4F70DD" sx={{ lineHeight: 1.6 }}>
                        There are {selectedIds.length} selected contacts. How would you like to save them?
                    </Typography>
                </Box>

                <Stack spacing={1}>
                    {["contact", "subscriber", "recipient"]
                        .filter((target) => target !== sourceType)
                        .map((target) => (
                            <Box
                                key={target}
                                onClick={() => handleToggleTarget(target)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: targets.includes(target) ? "#D1DBFF" : "#E5E7EB",
                                    bgcolor: targets.includes(target) ? "#F0F4FF" : "transparent",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        bgcolor: targets.includes(target) ? "#F0F4FF" : "#F9FAFB",
                                    },
                                }}
                            >
                                <Checkbox
                                    checked={targets.includes(target)}
                                    size="small"
                                    sx={{ p: 0, mr: 2, color: "#4F70DD", "&.Mui-checked": { color: "#4F70DD" } }}
                                />
                                <Typography variant="body1" fontWeight={600} className="capitalize">
                                    {target}
                                </Typography>
                            </Box>
                        ))}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, pb: 2, gap: 1 }}>
                <AppButton
                    variantStyle="outline"
                    onClick={onClose}
                    sx={{ flex: 1, borderColor: "#D1DBFF", color: "#4F70DD" }}
                >
                    Cancel
                </AppButton>
                <AppButton
                    variantStyle="primary"
                    onClick={handleSave}
                    disabled={isLoading || targets.length === 0}
                    sx={{ flex: 1, bgcolor: "#5479EE", "&:hover": { bgcolor: "#3F66E0" } }}
                >
                    {isLoading ? "Saving..." : "Save"}
                </AppButton>
            </DialogActions>
        </Dialog>
    );
};
