"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { Box, Divider, CircularProgress } from "@mui/material";

import { AppButton } from "@/components/ui/app-button";
import { LeadMagnet } from "../LeadMagnetsTable";
import { DetailHeader } from "./sections/DetailHeader";
import { PerformanceStats } from "./sections/PerformanceStats";
import { ConfigurationInfo } from "./sections/ConfigurationInfo";
import { CapturedLeadsTable } from "./sections/CapturedLeadsTable";
import { notify } from "@/lib/notifications";

// Mock Data (Consistent with SmartCaptureClient)
const MOCK_LEAD_MAGNETS: LeadMagnet[] = [
  { id: '1', name: 'Template SOP Sales 2026', status: 'Active', views: 342, leadsValid: 89, conversion: 26 },
  { id: '2', name: 'E-book: Cold Calling Script', status: 'Draft', views: 150, leadsValid: 12, conversion: 8 },
  { id: '3', name: 'Kalkulator ROI B2B', status: 'Active', views: 890, leadsValid: 410, conversion: 46 },
];

export const SmartCaptureDetailClient = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [data, setData] = useState<LeadMagnet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        const timer = setTimeout(() => {
            const magnet = MOCK_LEAD_MAGNETS.find(m => m.id === id) || MOCK_LEAD_MAGNETS[0];
            setData(magnet);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [id]);

    const handleEdit = () => {
        router.push(`/smart-capture/edit/${id}`);
    };

    const handleDelete = () => {
        notify.warning("Delete functionality will be available soon.");
    };

    const handleShare = () => {
        notify.success("Share options opened.");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <CircularProgress size={40} thickness={4} sx={{ color: '#5479EE' }} />
                <p className="text-gray-500 font-medium animate-pulse">Loading magnet details...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Magnet Not Found</h2>
                <p className="text-gray-500 mt-2 max-w-xs">The lead magnet you are looking for does not exist or has been removed.</p>
                <AppButton 
                    className="mt-6" 
                    onClick={() => router.push('/smart-capture')}
                    variantStyle="primary"
                >
                    Back to List
                </AppButton>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 space-y-6 bg-gray-50/30 min-h-screen">
            
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
                <Box>
                    <AppButton
                        onClick={() => router.push('/smart-capture')}
                        variantStyle="outline"
                        startIcon={<ArrowLeft size={18} />}
                        className="!border-none !bg-transparent hover:!bg-white shadow-none text-gray-600"
                    >
                        Back to Magnets
                    </AppButton>
                </Box>
                <AppButton
                    onClick={handleShare}
                    variantStyle="outline"
                    startIcon={<Share2 size={16} />}
                    className="hidden sm:flex"
                >
                    Share Magnet
                </AppButton>
            </div>

            <Divider className="opacity-50" />

            {/* Header Section */}
            <DetailHeader 
                data={data} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            {/* Performance Metrics */}
            <PerformanceStats data={data} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column: Configuration (Smaller) */}
                <div className="lg:col-span-1 space-y-6">
                    <ConfigurationInfo data={data} />
                    
                    {/* Quick Preview Placeholder */}
                    <div className="bg-[#1E293B] rounded-xl p-6 text-white shadow-inner overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Share2 size={80} />
                        </div>
                        <h4 className="font-bold mb-2">Live Preview</h4>
                        <p className="text-xs text-slate-400 mb-4 font-light">See how your magnet appears to prospects in real-time.</p>
                        <AppButton 
                            variantStyle="primary" 
                            className="w-full !bg-white !text-slate-900 hover:!bg-slate-100 border-none text-xs font-bold py-2"
                            onClick={() => window.open(`/m/${id}`, '_blank')}
                        >
                            Open Preview
                        </AppButton>
                    </div>
                </div>

                {/* Right Column: Leads Table (Larger) */}
                <div className="lg:col-span-2">
                    <CapturedLeadsTable />
                </div>

            </div>

        </div>
    );
};
