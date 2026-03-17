"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import MarketingHero from './MarketingHero';
import MarketingChallenges from './MarketingChallenges';
import MarketingSolutions from './MarketingSolutions';
import MarketingImpactCTA from './MarketingImpactCTA';

export default function MarketingClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <MarketingHero />
            <MarketingChallenges />
            <MarketingSolutions />
            <MarketingImpactCTA />
            <Footer />
        </Box>
    );
}
