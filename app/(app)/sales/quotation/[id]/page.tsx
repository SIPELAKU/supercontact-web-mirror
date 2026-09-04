"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchQuotationById } from "@/lib/api/quotations";
import type { QuotationDetail } from "@/lib/types/Quotation";
import { AppButton } from "@/components/ui/app-button";
import PageHeader from "@/components/ui/page-header";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import QuotationFormClient from "@/components/quotation/QuotationFormClient";

/**
 * Renders the quotation form seeded with the stored row. The form decides
 * from `quotation_status` whether it is editable (draft) or read-only
 * (sent / accepted / rejected), and shows the status chip in its header.
 */
export default function QuotationDetailPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const quotationId = params.id as string;

    const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadQuotation = async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const response = await fetchQuotationById(token, quotationId);
                setQuotation(response.data ?? null);
            } catch (err: any) {
                console.error("Error fetching quotation:", err);
                setError(err.message || "Failed to load quotation");
            } finally {
                setLoading(false);
            }
        };

        if (quotationId) {
            loadQuotation();
        }
    }, [quotationId, getToken]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5479EE]" />
                </div>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="p-6">
                <PageHeader
                    title="Quotation Not Found"
                    breadcrumbs={[
                        { label: "Sales" },
                        { label: "Quotation", href: "/sales/quotation" },
                        { label: "Detail" },
                    ]}
                />
                <Card className="mt-4">
                    <CardContent className="p-6 text-center text-red-600">
                        {error || "Quotation not found"}
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <Link href="/sales/quotation">
                        <AppButton variantStyle="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Quotations
                        </AppButton>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <QuotationFormClient initialData={quotation} />
    );
}
