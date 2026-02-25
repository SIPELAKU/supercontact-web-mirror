"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import PageHeader from "@/components/ui/page-header";
import { Box, Typography, Grid, Paper, Stack, Divider, Chip } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { CreditCard, CheckCircle2, Zap, LayoutDashboard } from "lucide-react";
import { notify } from "@/lib/notifications";

const pricingTiers = [
    {
        name: "Pro",
        price: "Rp 150.000",
        period: "/month",
        features: [
            "Up to 10,000 Contacts",
            "Unlimited Email Campaigns",
            "Advanced Analytics",
            "10GB Storage",
            "Priority Support",
        ],
        popular: false,
    },
    {
        name: "Business",
        price: "Rp 350.000",
        period: "/month",
        features: [
            "Unlimited Contacts",
            "Custom Domain Sending",
            "Intelligent Lead Routing",
            "50GB Storage",
            "24/7 Phone Support",
        ],
        popular: true,
    }
];

export default function SubscriptionClient() {
    const { userSubscription, userProfile } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const currentPlan = userSubscription || "Free Tier";
    const isTrial = currentPlan.toLowerCase() === "trial";

    const handleUpgrade = (tierName: string) => {
        setIsProcessing(true);
        // Simulate an API call preparation before opening Midtrans (future implementation)
        setTimeout(() => {
            setIsProcessing(false);
            notify.info("Coming soon", {
                description: `Payment gateway integration for the ${tierName} plan is under development.`,
            });
        }, 1000);
    };

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 space-y-8">
            <PageHeader
                title="My Subscription"
                subtitle="Manage your billing, plans, and active subscriptions."
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Subscription" }]}
            />

            <Grid container spacing={4}>
                {/* Active Plan Overview */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #E5E7EB", height: '100%', bgcolor: '#ffffff' }}>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#EEF2FF', borderRadius: 2 }}>
                                    <LayoutDashboard color="#4F46E5" size={24} />
                                </Paper>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Current Plan
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {currentPlan}
                                        </Typography>
                                        {isTrial && (
                                            <Chip label="14 Days Left" size="small" color="warning" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Account Owner
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {userProfile?.fullname || "Loading..."} <br />
                                    {userProfile?.email}
                                </Typography>
                            </Box>

                            {/* Future Midtrans Active Billing Info Box */}
                            <Box sx={{ p: 2.5, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Next Billing Date
                                </Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                                    {isTrial ? "Trial ends soon" : "Not applicable"}
                                </Typography>

                                <AppButton
                                    variantStyle="primary"
                                    className="w-full"
                                    onClick={() => handleUpgrade('Current')}
                                >
                                    <CreditCard size={18} className="mr-2" />
                                    Manage Payment Method
                                </AppButton>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Available Upgrade Plans */}
                <Grid item xs={12} md={7}>
                    <Grid container spacing={3}>
                        {pricingTiers.map((tier) => (
                            <Grid item xs={12} sm={6} key={tier.name}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 3,
                                        border: tier.popular ? "2px solid #4F46E5" : "1px solid #E5E7EB",
                                        height: '100%',
                                        bgcolor: '#ffffff',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {tier.popular && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -12,
                                                left: 24,
                                                bgcolor: '#4F46E5',
                                                color: '#fff',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            <Zap size={14} /> MOST POPULAR
                                        </Box>
                                    )}

                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        {tier.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                                        <Typography variant="h4" fontWeight={800} color="text.primary">
                                            {tier.price}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                                            {tier.period}
                                        </Typography>
                                    </Box>

                                    <Stack spacing={2} sx={{ mb: 4, flex: 1 }}>
                                        {tier.features.map((feature, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {feature}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>

                                    <AppButton
                                        variantStyle={tier.popular ? "primary" : "outline"}
                                        className="w-full"
                                        onClick={() => handleUpgrade(tier.name)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Processing..." : `Upgrade to ${tier.name}`}
                                    </AppButton>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}
