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
        <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <Box component="main" sx={{ flexGrow: 1 }} pt={{ xs: 6, sm: 8, md: 4, lg: 6 }}>
                <PricingHeader />
                <Container maxWidth="lg">
                    <PricingTabs value={tabValue} onChange={handleTabChange} />
                    <PricingCards />
                </Container>
                <Box mt={"150px"}>
                    <PricingTrial />
                </Box>
                <Box pt={"150px"} bgcolor="#F7F7F9">
                    <FAQ />
                </Box>
                <Box pt={"50px"} bgcolor="#F7F7F9">
                    <CTA />
                </Box>
            </Box>
            <Footer />
        </Box>
    );
}
