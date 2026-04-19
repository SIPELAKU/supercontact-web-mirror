"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { Box, Divider, CircularProgress } from "@mui/material";

import { AppButton } from "@/components/ui/app-button";
import { LeadMagnet } from "../LeadMagnetsTable";
import { DetailHeader } from "./sections/DetailHeader";
import { PerformanceStats } from "./sections/PerformanceStats";
import { OutreachStats } from "./sections/OutreachStats";
import { ConfigurationInfo } from "./sections/ConfigurationInfo";
import { CapturedLeadsTable } from "./sections/CapturedLeadsTable";
import { notify } from "@/lib/notifications";

import { useSmartCaptureDetail } from "@/lib/hooks/useSmartCaptureDetail";

export const SmartCaptureDetailClient = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: response, isLoading: loading, error } = useSmartCaptureDetail(id);
    const data = response?.data;

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

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Magnet Not Found</h2>
                <p className="text-gray-500 mt-2 max-w-xs">{error?.message || "The lead magnet you are looking for does not exist or has been removed."}</p>
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
                        className="border-none! bg-transparent! hover:bg-white! shadow-none text-gray-600"
                    >
                        Back to Magnets
                    </AppButton>
                </Box>
                {/* <AppButton
                    onClick={handleShare}
                    variantStyle="outline"
                    startIcon={<Share2 size={16} />}
                    className="hidden sm:flex"
                >
                    Share Magnet
                </AppButton> */}
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

            {/* Outreach Statistics */}
            <OutreachStats data={data} />

            {/* Main Content: Table and Configuration */}
            <div className="flex flex-col gap-6">
                <CapturedLeadsTable />
                <ConfigurationInfo data={data} />
            </div>

        </div>
    );
};
