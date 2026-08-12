"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import CSHero from './CSHero';
import CSChallenges from './CSChallenges';
import CSSolutions from './CSSolutions';
import CSComparison from './CSComparison';
import CSFAQ from './CSFAQ';
import CSImpactCTA from './CSImpactCTA';

export default function CSClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <CSHero />
            <CSChallenges />
            <CSSolutions />
            <CSComparison />
            <CSFAQ />
            <CSImpactCTA />
            <Footer />
        </Box>
    );
}
