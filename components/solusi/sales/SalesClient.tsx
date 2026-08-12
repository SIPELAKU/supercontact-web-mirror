"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import SalesHero from './SalesHero';
import SalesChallenges from './SalesChallenges';
import SalesSolutions from './SalesSolutions';
import SalesComparison from './SalesComparison';
import SalesFAQ from './SalesFAQ';
import SalesImpactCTA from './SalesImpactCTA';

export default function SalesClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <SalesHero />
            <SalesChallenges />
            <SalesSolutions />
            <SalesComparison />
            <SalesFAQ />
            <SalesImpactCTA />
            <Footer />
        </Box>
    );
}
