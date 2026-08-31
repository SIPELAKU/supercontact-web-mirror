import React from 'react';
import { Box, Tabs, Tab, styled } from '@mui/material';
import { strings } from '@/lib/utils/strings';

interface PricingTabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
    minHeight: '48px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    padding: '4px',
    maxWidth: '100%',
    '& .MuiTabs-indicator': {
        display: 'none',
    },
    '& .MuiTabs-flexContainer': {
        gap: '4px',
        [theme.breakpoints.up('md')]: {
            justifyContent: 'center',
        },
    },
    '& .MuiTabs-scroller': {
        borderRadius: '12px',
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: '10px',
    color: 'var(--brand)',
    minHeight: '40px',
    padding: '8px 24px',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        padding: '6px 16px',
        fontSize: '0.85rem',
        minWidth: 'auto',
    },
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
        color: '#FFFFFF',
        backgroundColor: 'var(--brand)',
    },
    '&:hover': {
        backgroundColor: 'rgba(85, 112, 241, 0.05)',
        '&.Mui-selected': {
            backgroundColor: 'var(--brand-hover)', // Slightly darker blue on hover when selected
        },
    },
}));

const PricingTabs = ({ value, onChange }: PricingTabsProps) => {
    return (
        <Box sx={{
            width: '100%',
            mb: { xs: 4, md: 6 },
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, sm: 0 }
        }}>
            <StyledTabs
                value={value}
                onChange={onChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <StyledTab label={strings.price_tab_crm} />
                <StyledTab label={strings.price_tab_omni} />
                <StyledTab label={strings.price_tab_cc} />
            </StyledTabs>
        </Box>
    );
};

export default PricingTabs;
