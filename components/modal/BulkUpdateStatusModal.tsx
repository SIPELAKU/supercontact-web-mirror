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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { useUpdateSmartCaptureStatus } from "@/lib/hooks/useSmartCaptures";
import { SmartCaptureStatus } from "@/lib/models/types";

interface BulkUpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSuccess?: () => void;
}

export const BulkUpdateStatusModal: React.FC<BulkUpdateStatusModalProps> = ({
  open,
  onClose,
  selectedIds,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<SmartCaptureStatus>("Active");
  const { mutate, isPending } = useUpdateSmartCaptureStatus();

  const handleUpdate = () => {
    if (selectedIds.length === 0) {
      notify.error("No items selected");
      return;
    }

    mutate(
      { ids: selectedIds, status: selectedStatus },
      {
        onSuccess: () => {
          notify.success(`Successfully updated status for ${selectedIds.length} item(s)`);
          if (onSuccess) onSuccess();
          onClose();
        },
        onError: (err: any) => {
          notify.error(err.message || "Failed to update status");
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          Update Status
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1 }}>
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "#F0F4FF",
            borderRadius: 2,
            border: "1px solid #D1DBFF",
          }}
        >
          <Typography variant="body2" color="#4F70DD" sx={{ lineHeight: 1.6 }}>
            You are updating the status for <strong>{selectedIds.length}</strong> selected item(s).
          </Typography>
        </Box>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as SmartCaptureStatus)}
          >
            {[
              { value: "Active", label: "Active", color: "#16A34A", bg: "#DCFCE7" },
              { value: "Inactive", label: "Inactive", color: "#EF4444", bg: "#FEE2E2" },
              { value: "Archived", label: "Archived", color: "#64748B", bg: "#F1F5F9" },
            ].map((option) => (
              <Box
                key={option.value}
                onClick={() => setSelectedStatus(option.value as SmartCaptureStatus)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: selectedStatus === option.value ? option.color : "#E5E7EB",
                  bgcolor: selectedStatus === option.value ? option.bg : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: selectedStatus === option.value ? option.bg : "#F9FAFB",
                  },
                }}
              >
                <FormControlLabel
                  value={option.value}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: option.color,
                        "&.Mui-checked": { color: option.color },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight={600}>
                      {option.label}
                    </Typography>
                  }
                  sx={{ width: "100%", m: 0 }}
                />
              </Box>
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ p: 2, pb: 2, gap: 1 }}>
        <AppButton
          variantStyle="outline"
          onClick={onClose}
          sx={{ flex: 1, borderRadius: 2 }}
        >
          Cancel
        </AppButton>
        <AppButton
          variantStyle="primary"
          onClick={handleUpdate}
          disabled={isPending}
          sx={{ flex: 1, borderRadius: 2 }}
        >
          {isPending ? "Updating..." : "Update Status"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
