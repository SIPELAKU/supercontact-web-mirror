"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import IntHero from './IntHero';
import IntProblem from './IntProblem';
import IntEducation from './IntEducation';
import IntFramework from './IntFramework';
import IntSolution from './IntSolution';
import IntUseCases from './IntUseCases';
import IntTrust from './IntTrust';
import IntComparison from './IntComparison';
import IntFAQ from './IntFAQ';
import IntCTA from './IntCTA';

export default function IntClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <IntHero />
            <IntProblem />
            <IntEducation />
            <IntFramework />
            <IntSolution />
            <IntUseCases />
            <IntTrust />
            <IntComparison />
            <IntFAQ />
            <IntCTA />
            <Footer />
        </Box>
    );
}
