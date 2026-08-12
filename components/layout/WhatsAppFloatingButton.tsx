'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { strings } from '@/lib/utils/strings';
import { trackCtaClick } from '@/lib/analytics/events';

const WhatsAppFloatingButton = () => {
    const handleWhatsAppClick = () => {
        trackCtaClick('floating_button', 'whatsapp_widget');
        const message = encodeURIComponent(strings.formatString(strings.wa_interest_msg, "SmartSales"));
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    return (
        <Box
            onClick={handleWhatsAppClick}
            sx={{
                position: 'fixed',
                bottom: { xs: 20, md: 30 },
                right: { xs: 20, md: 30 },
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#25D366',
                color: 'white',
                p: 1.2, // Uniform padding by default for circle look
                borderRadius: '50px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    bgcolor: '#128C7E',
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    px: 2.5, // Expand horizontal padding on hover
                    gap: 1.5, // Show gap on hover
                    '& .cta-text': {
                        maxWidth: '200px',
                        opacity: 1,
                        ml: 0.5,
                    }
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'white',
                    color: '#25D366',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <WhatsAppIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography
                className="cta-text"
                sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: 0,
                    opacity: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: { xs: 'none', sm: 'block' },
                }}
            >
                {strings.whatsapp_sales_button}
            </Typography>
        </Box>
    );
};

export default WhatsAppFloatingButton;
