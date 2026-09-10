"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Box } from '@mui/material';
import MarketingHero from './MarketingHero';
import MarketingChallenges from './MarketingChallenges';
import MarketingSolutions from './MarketingSolutions';
import MarketingImpactCTA from './MarketingImpactCTA';
import MarketingComparison from './MarketingComparison';
import MarketingFAQ from './MarketingFAQ';
import RelatedReading from '@/components/layout/RelatedReading';

export default function MarketingClient() {
    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />
            <MarketingHero />
            <MarketingChallenges />
            <MarketingSolutions />
            <MarketingComparison />
            <MarketingFAQ />
            <MarketingImpactCTA />
            <RelatedReading
                heading="Panduan marketing & integrasi sales"
                items={[
                    { href: '/blog/mql-vs-sql', title: 'MQL vs SQL', desc: 'Bedakan lead marketing vs sales sebelum di-follow-up.' },
                    { href: '/blog/kesalahan-umum-integrasi-sales-marketing', title: 'Kesalahan integrasi sales-marketing', desc: 'Jebakan umum yang membuat leads bocor.' },
                    { href: '/blog/cara-menghitung-leads-yang-hilang', title: 'Menghitung leads yang hilang', desc: 'Ukur kebocoran lead di tiap tahap corong.' },
                ]}
            />
            <Footer />
        </Box>
    );
}
