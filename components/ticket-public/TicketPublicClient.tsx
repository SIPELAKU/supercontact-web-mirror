"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TicketHero from "./TicketHero";
import TicketFeatures from "./TicketFeatures";
import TicketIntegration from "./TicketIntegration";
import TicketComparison from "./TicketComparison";
import TicketFAQ from "./TicketFAQ";
import TicketCta from "./TicketCta";

export default function TicketPublicClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <TicketHero />
                <TicketFeatures />
                <TicketIntegration />
                <TicketComparison />
                <TicketFAQ />
                <TicketCta />
            </main>
            <Footer />
        </div>
    );
}
