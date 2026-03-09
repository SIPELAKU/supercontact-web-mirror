"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CrmServicesHero from "./CrmServicesHero";
import CrmServicesFeatures from "./CrmServicesFeatures";
import CrmServicesWhyChoose from "./CrmServicesWhyChoose";
import CrmServicesCta from "./CrmServicesCta";

export default function CrmServicesClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
                <CrmServicesHero />
                <CrmServicesFeatures />
                <CrmServicesWhyChoose />
                <CrmServicesCta />
            </main>
            <Footer />
        </div>
    );
}
