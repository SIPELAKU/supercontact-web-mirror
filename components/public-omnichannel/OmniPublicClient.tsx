"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OmniHero from "./OmniHero";
import OmniIntegration from "./OmniIntegration";
import OmniCollaboration from "./OmniCollaboration";
import OmniComparison from "./OmniComparison";
import OmniFAQ from "./OmniFAQ";
import OmniCta from "./OmniCta";
import RelatedReading from "@/components/layout/RelatedReading";

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
                <RelatedReading
                    heading="Panduan omnichannel & lead management"
                    items={[
                        { href: "/blog/integrasi-whatsapp-business-crm", title: "Integrasi WhatsApp Business & CRM", desc: "Satukan percakapan WhatsApp ke dalam CRM." },
                        { href: "/blog/lead-management", title: "Panduan Lead Management", desc: "Proses lengkap mengelola leads lintas kanal." },
                        { href: "/blog/mql-vs-sql", title: "MQL vs SQL", desc: "Bedakan lead marketing vs sales sebelum di-follow-up." },
                    ]}
                />
            </main>
            <Footer />
        </div>
    );
}
