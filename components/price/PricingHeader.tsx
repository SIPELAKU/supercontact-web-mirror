import React from 'react';
import { Typography, Container } from '@mui/material';
import { strings } from '@/lib/utils/strings';

const PricingHeader = () => {
    return (
        <Container maxWidth="lg" sx={{ textAlign: 'center', pt: 8, pb: 4 }}>
            <Typography
                variant="h3"
                component="h1"
                fontWeight={700}
                gutterBottom
                sx={{ color: 'text.primary' }}
            >
                {strings.price_title}
            </Typography>
            <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: '800px', mx: 'auto', fontWeight: 400 }}
            >
                {strings.price_subtitle}
            </Typography>
        </Container>
    );
};

export default PricingHeader;
