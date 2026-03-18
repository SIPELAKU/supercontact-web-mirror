"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import CSHero from './CSHero';
import CSChallenges from './CSChallenges';
import CSSolutions from './CSSolutions';
import CSImpactCTA from './CSImpactCTA';

export default function CSClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <CSHero />
            <CSChallenges />
            <CSSolutions />
            <CSImpactCTA />
            <Footer />
        </Box>
    );
}
