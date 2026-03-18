"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import ITSaaSHero from './ITSaaSHero';
import ITSaaSChallenges from './ITSaaSChallenges';
import ITSaaSSolutions from './ITSaaSSolutions';
import ITSaaSImpactCta from './ITSaaSImpactCta';

export default function ITSaaSClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <ITSaaSHero />
            <ITSaaSChallenges />
            <ITSaaSSolutions />
            <ITSaaSImpactCta />
            <Footer />
        </Box>
    );
}
