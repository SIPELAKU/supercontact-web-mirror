'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FAQ from '@/components/layout/FAQ';
import CTA from '@/components/layout/CTA';
import { Box, Container } from '@mui/material';
import { useLanguage } from '@/lib/context/LanguageContext';
import PricingHeader from './PricingHeader';
import PricingTabs from './PricingTabs';
import PricingCards from './PricingCards';
import PricingTrial from './PricingTrial';

export const PriceClient = () => {
    useLanguage();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <Box component="main" sx={{ flexGrow: 1 }} pt={{ xs: '56px', sm: '64px' }}>
                <PricingHeader />
                <Container maxWidth="lg">
                    {/* <PricingTabs value={tabValue} onChange={handleTabChange} /> */}
                    <PricingCards />
                </Container>
                <Box mt={{ xs: 10, md: 18 }}>
                    <PricingTrial />
                </Box>
                <Box pt={{ xs: 10, md: 18 }}>
                    <FAQ />
                </Box>
                <Box>
                    <CTA />
                </Box>
            </Box>
            <Footer />
        </Box>
    );
}
