'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { Box } from '@mui/material';
import { useLanguage } from '@/lib/context/LanguageContext';
import CTA from '../layout/CTA';
import CompanyHelp from './CompanyHelp';
import CompanyHero from './CompanyHero';
import CompanyVision from './CompanyVision';
import TrustedBy from '../layout/TrustedBy';
import { bgcolor } from '@mui/system';


export const CompanyClient = () => {
    useLanguage();
    return (
        <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <Box component="main" sx={{ flexGrow: 1 }} pt={{ xs: 8, sm: 8, md: 4, lg: 6 }}>
                <CompanyHero />
                <CompanyVision />

                {/* Reusing TrustedBy Section */}
                <TrustedBy />

                {/* <Box sx={{ pt: 10, bgcolor: '#F5F5F5' }}>
                    <CompanyHelp />
                </Box> */}

                <Box sx={{ pt: 10, bgcolor: '#F5F5F5' }}>
                    <CTA />
                </Box>
            </Box>

            <Footer />
        </Box>
    )
}
