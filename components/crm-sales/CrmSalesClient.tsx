"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CrmSalesHero from "./CrmSalesHero";
import CrmSalesFeatures from "./CrmSalesFeatures";
import CrmSalesWhyChoose from "./CrmSalesWhyChoose";
import CrmSalesComparison from "./CrmSalesComparison";
import CrmSalesFAQ from "./CrmSalesFAQ";
import CrmSalesCta from "./CrmSalesCta";
import RelatedReading from "@/components/layout/RelatedReading";

export default function CrmSalesClient() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main>
                <CrmSalesHero />
                <CrmSalesFeatures />
                <CrmSalesWhyChoose />
                <CrmSalesComparison />
                <CrmSalesFAQ />
                <CrmSalesCta />
                <RelatedReading
                    heading="Panduan sales & lead management"
                    items={[
                        { href: "/blog/lead-management", title: "Panduan Lead Management", desc: "Kelola & kualifikasi leads dari masuk sampai closing." },
                        { href: "/blog/lead-routing-adalah", title: "Apa itu lead routing", desc: "Arahkan lead ke sales yang tepat secara otomatis." },
                        { href: "/blog/sla-follow-up-leads", title: "SLA follow-up leads", desc: "Standar kecepatan follow-up yang bisa ditagih." },
                    ]}
                />
            </main>
            <Footer />
        </Box>
    );
}
