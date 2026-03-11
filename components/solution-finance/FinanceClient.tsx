"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FinanceHero from "./FinanceHero";
import FinanceChallenges from "./FinanceChallenges";
import FinanceSolutions from "./FinanceSolutions";
import FinanceImpactCta from "./FinanceImpactCta";

export default function FinanceClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <FinanceHero />
                <FinanceChallenges />
                <FinanceSolutions />
                <FinanceImpactCta />
            </main>
            <Footer />
        </div>
    );
}
