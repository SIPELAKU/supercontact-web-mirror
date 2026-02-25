'use client';

import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android'; // Placeholder if specific Google Play icon is needed, we usually use custom SVG or just text

interface StoreButtonProps extends ButtonProps {
    store: 'apple' | 'google';
}

const StoreButton: React.FC<StoreButtonProps> = ({ store, sx, ...props }) => {
    const isApple = store === 'apple';

    // Custom SVG for Google Play if needed, but for now using MUI icons or similar 
    // Ideally we would use SVGs for exact branding match. 
    // Using generic structure for now.

    return (
        <Button
            variant="contained"
            color="secondary"
            sx={{
                backgroundColor: '#000', // Black background for store buttons usually
                color: '#fff',
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                minWidth: '160px',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                    backgroundColor: '#333',
                },
                ...sx
            }}
            {...props}
        >
            {isApple ? <AppleIcon sx={{ fontSize: 28 }} /> : <AndroidIcon sx={{ fontSize: 28 }} />}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                    {isApple ? 'Download on the' : 'Download on the'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                    {isApple ? 'App Store' : 'Google Play'}
                </Typography>
            </Box>
        </Button>
    );
};

export default StoreButton;
