"use client";

import React from "react";
import { AppButton } from "@/components/ui/app-button";
import { Box, Typography, Paper, Grid } from "@mui/material";
// Importing commonly used icons for demo
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CloseIcon from "@mui/icons-material/Close";

export default function ButtonTestPage() {
  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        AppButton Component Verification
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          1. Primary Variant
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <AppButton variantStyle="primary">Update Lead</AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="primary" startIcon={<SaveIcon />}>
              Save Changes
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton
              variantStyle="primary"
              endIcon={<ArrowBackIcon sx={{ transform: "rotate(180deg)" }} />}
            >
              Next Step
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="primary" disabled>
              Disabled
            </AppButton>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          2. Outline Variant
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <AppButton variantStyle="outline" color="primary">
              Close
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton
              variantStyle="outline"
              color="primary"
              startIcon={<FileCopyIcon />}
            >
              Copy Link
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton
              variantStyle="outline"
              color="danger"
              startIcon={<CloseIcon />}
            >
              Cancel
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="outline" color="primary" disabled>
              Disabled
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="outline" color="gray">
              Gray Active
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="outline" color="gray" disabled>
              Gray Disabled
            </AppButton>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          3. Danger Variant
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <AppButton variantStyle="danger">Delete Data</AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="danger" startIcon={<DeleteIcon />}>
              Delete Card
            </AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="danger" disabled>
              Disabled
            </AppButton>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          4. Text Variant
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <AppButton variantStyle="text">Back to Quotation</AppButton>
          </Grid>
          <Grid item>
            <AppButton variantStyle="text" startIcon={<ArrowBackIcon />}>
              Back
            </AppButton>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          5. Full Width
        </Typography>
        <Box sx={{ width: 300, border: "1px dashed grey", p: 1 }}>
          <AppButton variantStyle="primary" fullWidth>
            Full Width Button
          </AppButton>
        </Box>
      </Paper>
    </Box>
  );
}
