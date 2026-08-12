"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FmcgHero from './FmcgHero';
import FmcgChallenges from './FmcgChallenges';
import FmcgSolutions from './FmcgSolutions';
import FmcgComparison from './FmcgComparison';
import FmcgFAQ from './FmcgFAQ';
import FmcgImpactCta from './FmcgImpactCta';
import { Box } from '@mui/material';

export default function FmcgClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <FmcgHero />
            <FmcgChallenges />
            <FmcgSolutions />
            <FmcgComparison />
            <FmcgFAQ />
            <FmcgImpactCta />
            <Footer />
        </Box>
    );
}
