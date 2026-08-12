'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { Box } from '@mui/material';
import { useLanguage } from '@/lib/context/LanguageContext';
import CompanyCTA from './CompanyCTA';
import CompanyHero from './CompanyHero';
import CompanyVision from './CompanyVision';
import { ClientLogos } from '../ui/ClientLogos';


export const CompanyClient = () => {
    useLanguage();
    return (
        <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <Box component="main" sx={{ flexGrow: 1 }} pt={{ xs: 8, sm: 8, md: 4, lg: 6 }}>
                <CompanyHero />
                <CompanyVision />
                <ClientLogos />

                <Box sx={{ pt: 10 }}>
                    <CompanyCTA />
                </Box>
            </Box>

            <Footer />
        </Box>
    )
}
