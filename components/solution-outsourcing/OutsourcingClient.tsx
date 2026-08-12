"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Box } from '@mui/material';
import OutsourcingHero from './OutsourcingHero';
import OutsourcingChallenges from './OutsourcingChallenges';
import OutsourcingSolutions from './OutsourcingSolutions';
import OutsourcingComparison from './OutsourcingComparison';
import OutsourcingFAQ from './OutsourcingFAQ';
import OutsourcingImpactCta from './OutsourcingImpactCta';
import Footer from '../layout/Footer';

export default function OutsourcingClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <OutsourcingHero />
            <OutsourcingChallenges />
            <OutsourcingSolutions />
            <OutsourcingComparison />
            <OutsourcingFAQ />
            <OutsourcingImpactCta />
            <Footer />
        </Box>
    );
}
