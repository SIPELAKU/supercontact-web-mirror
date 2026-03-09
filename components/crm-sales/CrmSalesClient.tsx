"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CrmSalesHero from "./CrmSalesHero";
import CrmSalesFeatures from "./CrmSalesFeatures";
import CrmSalesWhyChoose from "./CrmSalesWhyChoose";
import CrmSalesCta from "./CrmSalesCta";

export default function CrmSalesClient() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main>
                <CrmSalesHero />
                <CrmSalesFeatures />
                <CrmSalesWhyChoose />
                <CrmSalesCta />
                {/* Additional sections for CRM Sales can be added here in the future */}
            </main>
            <Footer />
        </Box>
    );
}
