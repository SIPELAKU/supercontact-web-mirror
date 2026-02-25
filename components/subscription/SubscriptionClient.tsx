"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import PageHeader from "@/components/ui/page-header";
import { Box, Typography, Grid, Paper, Stack, Divider, Chip, CircularProgress } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { CreditCard, CheckCircle2, Zap, LayoutDashboard } from "lucide-react";
import { notify } from "@/lib/notifications";
import { fetchBillingPlans, fetchCurrentBilling, checkoutBillingPlan, BillingPlan, CurrentBilling } from "@/lib/api";

export default function SubscriptionClient() {
    const { token, userProfile, userPlanName } = useAuth();

    const [plans, setPlans] = useState<BillingPlan[]>([]);
    const [currentBilling, setCurrentBilling] = useState<CurrentBilling | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [plansRes, currentRes] = await Promise.all([
                fetchBillingPlans(token),
                fetchCurrentBilling(token).catch(() => null) // Allow failing gracefully if no active billing
            ]);

            if (plansRes.success) setPlans(plansRes.data);
            if (currentRes?.success && currentRes.data) setCurrentBilling(currentRes.data);

        } catch (error: any) {
            console.error("Failed to fetch billing data", error);
            notify.error("Data Fetch Error", { description: "Could not load subscription details." });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Determine the active plan prioritizing the API response, then falling back to auth context
    const currentPlan = currentBilling?.plan_name || userPlanName || "Free Tier";
    const isTrial = currentPlan.toLowerCase() === "trial";
    const activePlanId = currentBilling?.plan_id;

    const handleUpgrade = async (planId: string) => {
        if (!token) return;
        setIsProcessingId(planId);

        try {
            const res = await checkoutBillingPlan(token, { plan_id: planId });
            if (res.success && res.data.midtrans_redirect_url) {
                // Open Midtrans payment window/redirect in a new tab
                window.open(res.data.midtrans_redirect_url, '_blank');
            } else {
                notify.error("Checkout Failed", { description: "Invalid checkout response received." });
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            notify.error("Checkout Failed", { description: error.message || "An error occurred during checkout initialization." });
        } finally {
            setIsProcessingId(null);
        }
    };

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 space-y-8">
            <PageHeader
                title="My Subscription"
                description="Manage your billing, plans, and active subscriptions."
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Subscription" }]}
            />

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={12}>
                    <CircularProgress />
                </Box>
            ) : (
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
                                        Cycle Ends At
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                                        {currentBilling?.expires_at ? new Date(currentBilling.expires_at).toLocaleDateString() : (isTrial ? "Trial ends soon" : "Not applicable")}
                                    </Typography>

                                    <AppButton
                                        variantStyle="primary"
                                        className="w-full"
                                        onClick={() => activePlanId ? handleUpgrade(activePlanId) : notify.info("No active plan", { description: "You don't have an active billed plan to manage." })}
                                        disabled={!activePlanId || isProcessingId === activePlanId}
                                    >
                                        <CreditCard size={18} className="mr-2" />
                                        {isProcessingId === activePlanId ? "Processing..." : "Manage Payment Method"}
                                    </AppButton>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid >

                    {/* Available Upgrade Plans */}
                    < Grid item xs={12} md={7} >
                        <Grid container spacing={3}>
                            {plans.map((plan) => {
                                const isCurrent = plan.id === activePlanId || plan.code === currentPlan?.toLowerCase();
                                const isPopular = plan.code === 'standard' || plan.code === 'professional'; // Fallback logic for popular mark

                                return (
                                    <Grid item xs={12} sm={6} key={plan.id}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 3,
                                                border: isCurrent ? "2px solid #10B981" : (isPopular ? "2px solid #4F46E5" : "1px solid #E5E7EB"),
                                                height: '100%',
                                                bgcolor: '#ffffff',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {isPopular && (
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

                                            {isCurrent && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -12,
                                                        right: 24,
                                                        bgcolor: '#10B981',
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
                                                    <CheckCircle2 size={14} /> ACTIVE
                                                </Box>
                                            )}

                                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                                {plan.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                                <Typography variant="h4" fontWeight={800} color="text.primary">
                                                    Rp {parseInt(plan.price).toLocaleString('id-ID')}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                                                    /{plan.billing_interval.toLowerCase() === 'monthly' ? 'mo' : plan.billing_interval}
                                                </Typography>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                                                {plan.description}
                                            </Typography>

                                            <Box sx={{ mt: 'auto' }}>
                                                <AppButton
                                                    variantStyle={isCurrent ? "outline" : (isPopular ? "primary" : "outline")}
                                                    className="w-full"
                                                    onClick={() => handleUpgrade(plan.id)}
                                                    disabled={isCurrent || isProcessingId === plan.id}
                                                >
                                                    {isProcessingId === plan.id ? "Processing..." : (isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`)}
                                                </AppButton>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid >
                </Grid >
            )
            }
        </div >
    );
}
