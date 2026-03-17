import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = "Terjadi kesalahan saat memuat data.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        color: 'text.secondary',
        gap: 2
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.8 }} />
      <Typography variant="body1">
        {message}
      </Typography>
      {onRetry && (
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onRetry}
          size="small"
        >
          Coba Lagi
        </Button>
      )}
    </Box>
  );
}
