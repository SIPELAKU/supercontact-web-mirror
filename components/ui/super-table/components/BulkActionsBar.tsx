import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { X } from 'lucide-react';
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
        flexWrap: 'wrap',
        gap: 1,
        // Sits INSIDE the left toolbar slot, replacing the Add/Import buttons
        // only. It used to be position:absolute at 100% width and height with
        // zIndex 10, which covered search, export and the column controls -
        // so selecting a row made it impossible to search or export, which is
        // exactly when you want both.
        borderRadius: 2,
        px: 1.5,
        py: 0.75,
        backgroundColor: theme.palette.primary.light,
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
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            textTransform: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {selectedCount} selected
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {renderBulkActions({ selectedRows, clearSelection })}
        </Box>
      </Box>

      <IconButton
        onClick={clearSelection}
        size="small"
        sx={{ color: theme.palette.text.secondary }}
        title="Clear selection"
        aria-label="Clear selection"
      >
        <X size={16} />
      </IconButton>
    </Box>
  );
}
