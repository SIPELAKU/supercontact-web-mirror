"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import HRHero from './HRHero';
import HRChallenges from './HRChallenges';
import HRSolutions from './HRSolutions';
import HRComparison from './HRComparison';
import HRFAQ from './HRFAQ';
import HRImpactCTA from './HRImpactCTA';

export default function HRClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <HRHero />
            <HRChallenges />
            <HRSolutions />
            <HRComparison />
            <HRFAQ />
            <HRImpactCTA />
            <Footer />
        </Box>
    );
}
