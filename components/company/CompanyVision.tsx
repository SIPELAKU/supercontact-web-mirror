import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { strings } from '@/lib/utils/strings';

const VisionCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <Box sx={{ textAlign: 'center', p: 2 }}>
        <Box sx={{
            width: 80,
            height: 80,
            bgcolor: '#EEF2FF',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mx: 'auto',
            mb: 3,
            color: 'primary.main'
        }}>
            {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {text}
        </Typography>
    </Box>
);

const CompanyVision = () => {
    return (
        <Box sx={{ py: 10, bgcolor: '#FFFFFF' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        {strings.company_vision_title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                        {strings.company_vision_subtitle}
                    </Typography>
                </Box>

                <Grid container spacing={8} justifyContent="center">
                    <Grid item xs={12} md={5}>
                        <VisionCard
                            icon={<FilterCenterFocusIcon fontSize="large" />}
                            title={strings.company_vis_label}
                            text={strings.company_vis_text}
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <VisionCard
                            icon={<ReceiptLongIcon fontSize="large" />}
                            title={strings.company_mis_label}
                            text={strings.company_mis_text}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CompanyVision;
