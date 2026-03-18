"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RetailHero from './RetailHero';
import RetailChallenges from './RetailChallenges';
import RetailSolutions from './RetailSolutions';
import RetailImpactCta from './RetailImpactCta';
import { Box } from '@mui/material';

export default function RetailClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <RetailHero />
            <RetailChallenges />
            <RetailSolutions />
            <RetailImpactCta />
            <Footer />
        </Box>
    );
}
