"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { Box, Typography, Grid, Paper, Stack, Divider, Chip, CircularProgress, Button } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { CreditCard, CheckCircle2, Zap, LayoutDashboard } from "lucide-react";
import { notify } from "@/lib/notifications";
import { fetchBillingPlans, fetchCurrentBilling, checkoutBillingPlan, BillingPlan, CurrentBilling } from "@/lib/api";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { NO_WA } from "@/lib/constants/constants";

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
    // const currentPlan: string = "Exclusive";
    const currentPlan = currentBilling?.plan_name || userPlanName || "Free Tier";
    const isTrial = currentPlan.toLowerCase() === "trial";
    const activePlanId = currentBilling?.plan_id;

    const handleUpgrade = async (planId: string) => {
        if (!token) return;
        setIsProcessingId(planId);

        try {
            const res = await checkoutBillingPlan(token, { plan_id: planId });
            if (res.success && res.data.payment_redirect_url) {
                // Open payment window/redirect in a new tab
                window.open(res.data.payment_redirect_url, '_blank');
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
            <SettingsPageHeader
                title="My Subscription"
                description="Manage your billing, plans, and active subscriptions."
                breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Billing" }]}
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
                                        disabled={!activePlanId || isProcessingId === activePlanId || isTrial}
                                    >
                                        <CreditCard size={18} className="mr-2" />
                                        {isProcessingId === activePlanId ? "Processing..." : "Manage Payment Method"}
                                    </AppButton>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid >

                    {/* Available Upgrade Plans */}
                    <Grid item xs={12} md={7}>
                        <Grid container spacing={3}>
                            {/* Free Trial Card */}
                            <Grid item xs={12} sm={6}>
                                <div className={`h-full relative transition-all duration-300 ${currentPlan === "Free Trial" ? "rounded-3xl p-[2px] bg-[#5479EE] shadow-xl scale-[1.02]" : ""}`}>
                                    {currentPlan === "Free Trial" && (
                                        <div className="absolute top-4 left-4 bg-[#5479EE] text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-widest z-10 flex items-center gap-1.5 shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            ACTIVE
                                        </div>
                                    )}
                                    <div className="bg-white rounded-[22px] border border-gray-200 p-8 flex flex-col h-full items-center text-center">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Free Trial</h3>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Mulai gunakan SmartSales secara<br />gratis dengan batasan<br />penggunaan.
                                        </p>
                                        <div className="flex items-baseline justify-center mb-8">
                                            <span className="text-sm font-semibold text-gray-600 mr-2">Rp.</span>
                                            <span className="text-[64px] leading-none font-bold text-[#5479EE]">0</span>
                                            <span className="text-sm text-gray-500 ml-1">/bulan</span>
                                        </div>
                                        <div className="flex flex-col gap-5 text-left w-full mb-8">
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-400 mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium text-gray-700 leading-tight">Hingga 100 kontak (batas<br />maksimum)</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-400 mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium text-gray-700">1-2 pengguna per akun</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-400 mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium text-gray-700">Fitur CRM dasar</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium text-gray-400 line-through">Tanpa akses Data Intelligence</span>
                                            </div>
                                        </div>
                                        <div className="mt-auto w-full">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                disabled={currentPlan === "Free Trial"}
                                                onClick={() => window.open(`https://wa.me/${NO_WA}?text=${encodeURIComponent("Hi, I'm interested in the free plan")}`, '_blank')}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    bgcolor: currentPlan === "Free Trial" ? "#F8FAFC" : "#25D366",
                                                    border: currentPlan === "Free Trial" ? "1px solid #E2E8F0" : "none",
                                                    color: currentPlan === "Free Trial" ? "#94A3B8" : "#FFFFFF",
                                                    py: 1.5,
                                                    boxShadow: 'none',
                                                    '&.Mui-disabled': {
                                                        bgcolor: '#F8FAFC',
                                                        color: '#94A3B8',
                                                        borderColor: '#E2E8F0',
                                                    },
                                                    '&:hover': {
                                                        bgcolor: currentPlan === "Free Trial" ? "#F8FAFC" : "#128C7E",
                                                        boxShadow: 'none'
                                                    }
                                                }}
                                            >
                                                {currentPlan === "Free Trial" ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <CheckCircle2 size={18} className="text-[#25D366]" />
                                                        <span>Current Plan</span>
                                                    </div>
                                                ) : "Whatsapp Sales"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Grid>

                            {/* Exclusive Card */}
                            <Grid item xs={12} sm={6}>
                                <div className={`h-full relative transition-all duration-300 ${currentPlan === "Exclusive" ? "rounded-3xl p-[2px] bg-linear-to-br from-white/40 to-white/0 shadow-2xl scale-[1.02]" : ""}`}>
                                    {currentPlan === "Exclusive" && (
                                        <div className="absolute top-4 left-4 bg-white text-[#5479EE] text-[10px] font-bold px-2 py-1 rounded-md tracking-widest z-10 flex items-center gap-1.5 shadow-md">
                                            <div className="w-1.5 h-1.5 bg-[#5479EE] rounded-full animate-pulse" />
                                            ACTIVE
                                        </div>
                                    )}
                                    <div className="bg-[#5479EE] rounded-[22px] p-8 flex flex-col h-full items-center text-center relative overflow-hidden">
                                        <div className="absolute top-4 right-4 bg-[#25D366] text-white text-[11px] font-bold px-3 py-1.5 rounded-md tracking-wide">
                                            Recommended
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 mt-4">Exclusive</h3>
                                        <p className="text-sm font-medium text-white mb-6 px-1">
                                            Maksimalkan potensi bisnis Anda<br />dengan solusi CRM yang dapat<br />dikustomisasi.
                                        </p>
                                        <div className="flex flex-col items-center justify-center mb-8 text-white min-h-[56px] w-full">
                                            <div className="text-[34px] font-bold leading-tight">Hubungi</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[34px] font-bold leading-tight">Kami</span>
                                                <span className="text-[15px] font-semibold">/ sesuai kontrak</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-5 text-left w-full mb-8 text-white">
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-white mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium leading-tight">Kontak & pengguna tanpa<br />batas</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-white mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium leading-tight">Akses penuh ke Data<br />Intelligence</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-white mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium leading-tight">Workflow & automasi kustom</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-white mt-0.5 shrink-0" />
                                                <span className="text-[15px] font-medium leading-tight">Dukungan & onboarding khusus</span>
                                            </div>
                                        </div>
                                        <div className="mt-auto w-full">
                                            <AppButton
                                                className={`w-full ${currentPlan === "Exclusive" ? "bg-white/10 text-white/60 border border-white/20 cursor-default" : "bg-[#25D366] hover:bg-[#128C7E] text-white"} rounded-xl py-2.5 font-semibold transition-colors`}
                                                onClick={() => currentPlan !== "Exclusive" && window.open('https://wa.me/628212345678', '_blank')}
                                            >
                                                {currentPlan === "Exclusive" ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <CheckCircle2 size={18} />
                                                        <span>Current Plan</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <WhatsAppIcon sx={{ fontSize: 20 }} />
                                                        Whatsapp Sales
                                                    </div>
                                                )}
                                            </AppButton>
                                        </div>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid >
            )
            }
        </div >
    );
}
