"use client";

import { Dialog, DialogContent } from "@mui/material";
import { Check, Copy, Eye, Download, ArrowLeft } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import Link from "next/link";
import { notify } from "@/lib/notifications";

interface QuotationSuccessModalProps {
    open: boolean;
    onClose: () => void;
    quotationId: string;    // The UUID for URLs
    quotationNumber: string; // The number for display (e.g. TC-202609-0001)
    pdfUrl?: string; // Blob URL for the PDF
}

export default function QuotationSuccessModal({
    open,
    onClose,
    quotationId,
    quotationNumber,
    pdfUrl,
}: QuotationSuccessModalProps) {
    const handleCopyLink = () => {
        const url = `${window.location.origin}/sales/quotation/${quotationId}`;
        navigator.clipboard.writeText(url);
        notify.success("Tautan disalin", { description: "Tautan quotation disalin ke clipboard" });
    };

    const handleDownloadPDF = () => {
        if (pdfUrl) {
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `quotation-${quotationNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            notify.error("Error", { description: "PDF belum tersedia untuk diunduh" });
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

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation terkirim</h2>

                <p className="text-gray-600 mb-8 max-w-md">
                    Quotation sudah dikirim ke pelanggan dan berstatus Terkirim.
                    Anda bisa melihat, mengunduh PDF-nya, atau membagikan tautannya.
                </p>

                <div className="w-full bg-gray-50 rounded-lg p-4 mb-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium mb-1">Nomor quotation</p>
                            <p className="text-sm font-bold text-gray-900">{quotationNumber}</p>
                        </div>

                        <div className="flex gap-2">
                            <AppButton
                                onClick={handleCopyLink}
                                variantStyle="outline"
                                color="gray"
                            >
                                <Copy size={16} className="mr-2" />
                                Salin tautan
                            </AppButton>

                            <Link href={`/sales/quotation/${quotationId}`} passHref>
                                <AppButton variantStyle="primary" color="primary">
                                    <Eye size={16} className="mr-2" />
                                    Lihat quotation
                                </AppButton>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <AppButton
                        onClick={handleDownloadPDF}
                        variantStyle="outline"
                        color="gray"
                        className="w-full justify-center"
                    >
                        <Download size={20} className="mr-2" />
                        Unduh PDF
                    </AppButton>

                    <Link href="/sales/quotation" className="w-full flex items-center justify-center gap-2 py-3 text-blue-600 font-medium hover:underline">
                        <ArrowLeft size={16} />
                        Kembali ke daftar quotation
                    </Link>
                </div>

            </DialogContent>
        </Dialog>
    );
}
