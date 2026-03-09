"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TicketHero from "./TicketHero";
import TicketFeatures from "./TicketFeatures";
import TicketIntegration from "./TicketIntegration";
import TicketCta from "./TicketCta";

export default function TicketPublicClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <TicketHero />
                <TicketFeatures />
                <TicketIntegration />
                <TicketCta />
            </main>
            <Footer />
        </div>
    );
}
