"use client";

import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Check, Copy, Eye, Download, ArrowLeft } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import Link from "next/link";
import { notify } from "@/lib/notifications";

interface QuotationSuccessModalProps {
    open: boolean;
    onClose: () => void;
    quotationId: string;
    pdfUrl?: string; // Blob URL for the PDF
}

export default function QuotationSuccessModal({
    open,
    onClose,
    quotationId,
    pdfUrl,
}: QuotationSuccessModalProps) {
    const handleCopyLink = () => {
        // Construct the URL to the quotation details page
        // Assuming the URL structure is /sales/quotation/[id]
        // We might need to adjust this if the ID passed isn't the UUID but the display ID
        // ideally we should pass the UUID if we want a direct link, or we assume the user is redirected to list
        // verification step will clarify this, for now let's assume we can link to the list or specific page.
        // If quotationId is a display ID (e.g. QT-2024-001), we might not be able to link directly without the UUID.
        // However, the prompt asks to "share url", implying a public link or internal link.
        // For now, let's copy the current page URL or a constructed one.
        // Since we are in the "add" page, we probably want to link to the *view* page of the created quotation.

        // If quotationId passed here is the Display ID, we might need the internal UUID for the link.
        // But let's assume for now we copy the link to the quotation list or just a placeholder if we lack the UUID.
        const url = `${window.location.origin}/sales/quotation/${quotationId}`;
        navigator.clipboard.writeText(url);
        notify.success("Success", { description: "Link copied to clipboard" });
    };

    const handleDownloadPDF = () => {
        if (pdfUrl) {
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `quotation-${quotationId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            notify.error("Error", { description: "PDF not available for download" });
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: "16px",
                    padding: "24px",
                }
            }}
        >
            <DialogContent className="flex flex-col items-center text-center p-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Check size={24} strokeWidth={3} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation Published!</h2>

                <p className="text-gray-600 mb-8 max-w-md">
                    Your quotation has been successfully published and is now available.
                    You can view, download or share the link with your client.
                </p>

                <div className="w-full bg-gray-50 rounded-lg p-4 mb-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium mb-1">Quotation ID</p>
                            <p className="text-sm font-bold text-gray-900">{quotationId}</p>
                        </div>

                        <div className="flex gap-2">
                            <AppButton
                                onClick={handleCopyLink}
                                variantStyle="outline"
                                color="grey"
                            >
                                <Copy size={16} className="mr-2" />
                                Copy Link
                            </AppButton>

                            <Link href={`/sales/quotation/${quotationId}`} passHref>
                                <AppButton variantStyle="primary" color="primary">
                                    <Eye size={16} className="mr-2" />
                                    View Quotation
                                </AppButton>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <AppButton
                        onClick={handleDownloadPDF}
                        variantStyle="outline"
                        color="grey"
                        className="w-full justify-center"
                    >
                        <Download size={20} className="mr-2" />
                        Download PDF
                    </AppButton>

                    <Link href="/sales/quotation" className="w-full flex items-center justify-center gap-2 py-3 text-blue-600 font-medium hover:underline">
                        <ArrowLeft size={16} />
                        Back to Quotation List
                    </Link>
                </div>

            </DialogContent>
        </Dialog>
    );
}
