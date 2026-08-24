"use client";

import { notFound } from "next/navigation";

import React, { useState } from "react";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { Box, Typography, Paper } from "@mui/material";

export default function ConfirmationTestPage() {
  // Dev-only page: hidden in production builds
  if (process.env.NODE_ENV === "production") notFound();

    const [isPopupOpen, setIsPopupOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleOpen = () => {
        setIsPopupOpen(true);
        setLastAction(null);
    };

    const handleClose = () => {
        setIsPopupOpen(false);
        setLastAction("Closed/Cancelled");
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsPopupOpen(false);
        setLastAction("Confirmed: Card Deleted");
    };

    return (
        <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 6, maxWidth: 600, width: '100%', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
                    Confirmation Popup Test
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <AppButton variantStyle="primary" onClick={handleOpen} size="large">
                        Delete Payment Method
                    </AppButton>
                </Box>

                {lastAction && (
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: lastAction.includes("Confirmed") ? "#e8f5e9" : "#ffebee",
                            borderRadius: 1,
                            color: lastAction.includes("Confirmed") ? "green" : "red"
                        }}
                    >
                        Last Action: {lastAction}
                    </Typography>
                )}
            </Paper>

            <ConfirmationPopup
                isOpen={isPopupOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title="Are you sure?"
                description="This will discard your current record."
                confirmText="Discard record"
                cancelText="Cancel"
                variant="discard"
                isLoading={isLoading}
            />
        </Box>
    );
}
