import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { Sparkles } from 'lucide-react';

interface DraftNoticeProps {
    type?: 'dummy' | 'frontend' | 'partial';
    className?: string;
    message?: string;
}

export const DraftNotice: React.FC<DraftNoticeProps> = ({
    type = 'frontend',
    className,
    message
}) => {
    const config = {
        dummy: {
            label: 'Demo Data',
            color: '#F59E0B', // Amber
            description: 'This page currently uses dummy data for demonstration. Real integration is coming in a future release.'
        },
        frontend: {
            label: 'Frontend Preview',
            color: '#3B82F6', // Blue
            description: 'Initial frontend-only layout. Full backend connectivity is scheduled for the next release.'
        },
        partial: {
            label: 'In Progress',
            color: '#10B981', // Emerald
            description: 'Some features on this page are still in development and will be fully usable soon.'
        }
    };

    const active = config[type];

    return (
        <Tooltip title={message || active.description} arrow placement="bottom">
            <Box
                className={className}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: `${active.color}15`,
                    color: active.color,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '9999px',
                    border: `1px solid ${active.color}30`,
                    cursor: 'help',
                    width: 'fit-content',
                    backdropFilter: 'blur(4px)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'scale(1.02)'
                    }
                }}
            >
                <Sparkles size={12} className="shrink-0" fill={active.color} />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
                    {active.label}
                </Typography>
            </Box>
        </Tooltip>
    );
};
