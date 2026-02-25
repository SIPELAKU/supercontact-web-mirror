"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Box } from "@mui/material";
import FadeIn from "../animations/FadeIn";
import Hero from "./Hero";
import Footer from "../layout/Footer";
import Productivity from "./Productivity";
import TrustedBy from "../layout/TrustedBy";
import FAQ from "../layout/FAQ";
import CTA from "../layout/CTA";

export default function HomeClient() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect to analytics dashboard page if authenticated
      router.push("/analytics/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authenticated, we show loading while redirect happens
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <FadeIn direction="up" delay={0.1} fullWidth>
          <Hero />
        </FadeIn>
        <FadeIn direction="up" delay={0.2} fullWidth>
          <Productivity />
        </FadeIn>
        <FadeIn direction="up" delay={0.3} fullWidth>
          <TrustedBy />
        </FadeIn>
        <FadeIn direction="up" delay={0.4} fullWidth>
          <FAQ />
        </FadeIn>
        <FadeIn direction="up" delay={0.5} fullWidth>
          <CTA />
        </FadeIn>
      </main>
      <Footer />
    </Box>
  );
}
