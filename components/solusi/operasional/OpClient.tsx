"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OpHero from "./OpHero";
import OpChallenges from "./OpChallenges";
import OpSolutions from "./OpSolutions";
import OpImpactCTA from "./OpImpactCTA";
import { Box } from "@mui/material";

export default function OpClient() {
    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
            <Navbar />
            <OpHero />
            <OpChallenges />
            <OpSolutions />
            <OpImpactCTA />
            <Footer />
        </Box>
    );
}
