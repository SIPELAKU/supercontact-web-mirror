import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { strings } from '@/lib/utils/strings';
import { AppButton } from '../ui/app-button';

const CompanyHelp = () => {
    return (
        <Box sx={{ py: 10, textAlign: 'center', bgcolor: '#F5F5F5' }}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {strings.company_help_title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                    {strings.company_help_subtitle}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <AppButton
                        variantStyle="primary"
                    >
                        {strings.company_btn_community}
                    </AppButton>
                    <AppButton
                        variantStyle="primary"
                    >
                        {strings.company_btn_contact}
                    </AppButton>
                </Box>
            </Container>
        </Box>
    );
};

export default CompanyHelp;
