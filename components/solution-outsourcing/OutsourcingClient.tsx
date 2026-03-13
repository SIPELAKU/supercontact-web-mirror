"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import OutsourcingHero from './OutsourcingHero';
import OutsourcingChallenges from './OutsourcingChallenges';
import OutsourcingSolutions from './OutsourcingSolutions';
import OutsourcingImpactCta from './OutsourcingImpactCta';

export default function OutsourcingClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <OutsourcingHero />
            <OutsourcingChallenges />
            <OutsourcingSolutions />
            <OutsourcingImpactCta />
            <Footer />
        </Box>
    );
}
