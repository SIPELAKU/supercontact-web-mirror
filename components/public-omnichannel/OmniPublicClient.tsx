"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OmniHero from "./OmniHero";
import OmniIntegration from "./OmniIntegration";
import OmniCollaboration from "./OmniCollaboration";
import OmniComparison from "./OmniComparison";
import OmniFAQ from "./OmniFAQ";
import OmniCta from "./OmniCta";

export default function OmniPublicClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <OmniHero />
                <OmniIntegration />
                <OmniCollaboration />
                <OmniComparison />
                <OmniFAQ />
                <OmniCta />
            </main>
            <Footer />
        </div>
    );
}
