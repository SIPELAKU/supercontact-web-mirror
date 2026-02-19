"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FileCheck, Pencil, Eye } from "lucide-react";

import { CompanyDocument } from "@/lib/types/company-profile";

interface CompanyDocumentsCardProps {
    documents?: CompanyDocument[];
    isLoading?: boolean;
    onEdit?: () => void;
    onView?: (doc: CompanyDocument) => void;
}

export default function CompanyDocumentsCard({ documents = [], isLoading, onEdit, onView }: CompanyDocumentsCardProps) {
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

                {isLoading ? (
                    <Typography className="text-sm! text-slate-500!">Loading documents...</Typography>
                ) : documents.length === 0 ? (
                    <Typography className="text-sm! text-slate-500!">No documents uploaded yet</Typography>
                ) : (
                    <div className="space-y-4">
                        {documents.map((doc, index) => (
                            <div key={doc.id || index} className="flex items-center justify-between">
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
                )}
            </CardContent>
        </Card>
    );
}
