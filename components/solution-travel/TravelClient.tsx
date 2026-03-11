"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TravelHero from "./TravelHero";
import TravelChallenges from "./TravelChallenges";
import TravelSolutions from "./TravelSolutions";
import TravelImpactCta from "./TravelImpactCta";

export default function TravelClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <TravelHero />
                <TravelChallenges />
                <TravelSolutions />
                <TravelImpactCta />
            </main>
            <Footer />
        </div>
    );
}
