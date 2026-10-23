"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import SalesHero from './SalesHero';
import SalesChallenges from './SalesChallenges';
import SalesSolutions from './SalesSolutions';
import SalesComparison from './SalesComparison';
import SalesFAQ from './SalesFAQ';
import SalesImpactCTA from './SalesImpactCTA';
import RelatedReading from '@/components/layout/RelatedReading';

export default function SalesClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <SalesHero />
            <SalesChallenges />
            <SalesSolutions />
            <SalesComparison />
            <SalesFAQ />
            <SalesImpactCTA />
            <RelatedReading
                heading="Panduan sales & lead management"
                items={[
                    { href: '/blog/lead-management', title: 'Panduan Lead Management', desc: 'Kelola & kualifikasi leads dari masuk sampai closing.' },
                    { href: '/blog/sla-follow-up-leads', title: 'SLA follow-up leads', desc: 'Standar kecepatan follow-up yang bisa ditagih.' },
                    { href: '/blog/checklist-audit-kebocoran-leads', title: 'Audit kebocoran leads', desc: 'Checklist agar tak ada lead yang jatuh.' },
                ]}
            />
            <Footer />
        </Box>
    );
}
