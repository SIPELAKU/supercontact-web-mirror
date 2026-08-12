"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LogisticsHero from "./LogisticsHero";
import LogisticsChallenges from "./LogisticsChallenges";
import LogisticsSolutions from "./LogisticsSolutions";
import LogisticsComparison from "./LogisticsComparison";
import LogisticsFAQ from "./LogisticsFAQ";
import LogisticsImpactCta from "./LogisticsImpactCta";
import { Box } from "@mui/material";

export default function LogisticsClient() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <LogisticsHero />
                <LogisticsChallenges />
                <LogisticsSolutions />
                <LogisticsComparison />
                <LogisticsFAQ />
                <LogisticsImpactCta />
            </Box>
            <Footer />
        </Box>
    );
}
