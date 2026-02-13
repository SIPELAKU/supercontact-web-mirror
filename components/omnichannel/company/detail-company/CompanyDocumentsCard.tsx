"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FileCheck, Pencil, Eye } from "lucide-react";

interface DocumentItem {
    title: string;
    filename: string;
}

interface CompanyDocumentsCardProps {
    onEdit?: () => void;
    onView?: (doc: DocumentItem) => void;
}

export default function CompanyDocumentsCard({ onEdit, onView }: CompanyDocumentsCardProps) {
    const documents: DocumentItem[] = [
        {
            title: "NIB (Nomor Induk Berusaha)",
            filename: "interview_result_137.pdf",
        },
        {
            title: "NPWP (Nomor Pokok Wajib Pajak)",
            filename: "Hasil_Wawancara_Sales (16).pdf",
        },
    ];

    return (
        <Card className="rounded-2xl! shadow-lg!">
            <CardContent className="p-6!">
                <div className="flex items-center justify-between mb-6">
                    <Typography className="text-lg! font-semibold!">Dokumen Perusahaan</Typography>
                    <button
                        onClick={onEdit}
                        className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <Pencil size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#10B98115] text-[#10B981]">
                                    <FileCheck size={24} />
                                </div>
                                <div className="min-w-0">
                                    <Typography className="text-[14px]! font-semibold! text-slate-800! truncate">{doc.title}</Typography>
                                    <Typography className="text-[12px]! text-slate-500! truncate">{doc.filename}</Typography>
                                </div>
                            </div>
                            <button
                                onClick={() => onView?.(doc)}
                                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 ml-4"
                            >
                                <Eye size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
