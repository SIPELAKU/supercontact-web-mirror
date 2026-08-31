"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Box, Typography } from "@mui/material";
import FadeIn from "../animations/FadeIn";
import HeroSlider from "./HeroSlider";
import ShortsShowcase from "./ShortsShowcase";
import Footer from "../layout/Footer";
import Productivity from "./Productivity";
import TrustedBy from "../layout/TrustedBy";
import FAQ from "../layout/FAQ";
import CTA from "../layout/CTA";
import { ClientLogos } from "../ui/ClientLogos";
import PricingTrial from "../price/PricingTrial";
import { AppButton } from "../ui/app-button";
import { strings } from "@/lib/utils/strings";
import { trackCtaClick } from "@/lib/analytics/events";

export default function HomeClient() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect to analytics dashboard page if authenticated
      router.push("/analytics/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // NOTE: while auth state is still loading we render the full marketing page
  // (not a spinner). Auth always starts as loading=true on the server, so
  // gating on it would strip the hero/h1/content out of the prerendered HTML
  // and hide the homepage from crawlers. Authenticated visitors get a brief
  // flash of the homepage before the redirect — an acceptable trade-off.

  // If authenticated, we show loading while redirect happens
  if (!loading && isAuthenticated) {
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
          <HeroSlider />
        </FadeIn>
        <FadeIn direction="up" delay={0.15} fullWidth>
          <ShortsShowcase />
        </FadeIn>
        <FadeIn direction="up" delay={0.2} fullWidth>
          <Productivity />
        </FadeIn>
        <FadeIn direction="up" delay={0.3} fullWidth>
          {/* <TrustedBy /> */}
          <ClientLogos />
        </FadeIn>
        <FadeIn direction="up" delay={0.35} fullWidth>
          {/* Mid-page conversion banner (same free-trial banner as /price) */}
          <Box sx={{ py: { xs: 6, md: 8 } }}>
            <PricingTrial />
          </Box>
        </FadeIn>
        <FadeIn direction="up" delay={0.4} fullWidth>
          <FAQ />
        </FadeIn>
        <FadeIn direction="up" delay={0.5} fullWidth>
          <CTA />
        </FadeIn>
      </main>
      <Footer />

      {/* Slim sticky register CTA, mobile only */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          pb: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {strings.sticky_cta_text}
        </Typography>
        <AppButton
          variantStyle="primary"
          component={Link}
          href="/register"
          onClick={() => trackCtaClick('home', 'sticky_mobile_cta')}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {strings.hero_cta_free}
        </AppButton>
      </Box>
    </Box>
  );
}
