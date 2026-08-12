"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HotelHero from "./HotelHero";
import HotelChallenges from "./HotelChallenges";
import HotelSolutions from "./HotelSolutions";
import HotelComparison from "./HotelComparison";
import HotelFAQ from "./HotelFAQ";
import HotelImpactCta from "./HotelImpactCta";

export default function HotelClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <HotelHero />
                <HotelChallenges />
                <HotelSolutions />
                <HotelComparison />
                <HotelFAQ />
                <HotelImpactCta />
            </main>
            <Footer />
        </div>
    );
}
