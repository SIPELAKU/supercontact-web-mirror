import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SuperTableSlots } from '../types';

interface BulkActionsBarProps<TData extends object> {
  selectedRows: TData[];
  clearSelection: () => void;
  renderBulkActions: SuperTableSlots<TData>['renderBulkActions'];
}

export function BulkActionsBar<TData extends object>({
  selectedRows,
  clearSelection,
  renderBulkActions,
}: BulkActionsBarProps<TData>) {
  const theme = useTheme();
  const selectedCount = selectedRows.length;

  if (selectedCount === 0 || !renderBulkActions) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 10, // menutupi tombol add/left toolbar
        px: 2,
        backgroundColor: theme.palette.primary.light,
        // Odoo style keyframes anim slide-down
        animation: 'slideDown 0.15s ease-out forwards',
        '@keyframes slideDown': {
          from: {
            opacity: 0,
            transform: 'translateY(-8px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            color: theme.palette.primary.contrastText,
            // Hilangkan gaya text-transform yang aneh kalau ada
            textTransform: 'none',
          }}
        >
          {selectedCount} line selected
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {renderBulkActions({ selectedRows, clearSelection })}
        </Box>
      </Box>

      <IconButton
        onClick={clearSelection}
        size="small"
        sx={{ color: theme.palette.primary.contrastText }}
        title="Cancel"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
