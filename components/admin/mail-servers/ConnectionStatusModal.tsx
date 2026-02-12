"use client";

import React, { useEffect } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useMailServerConnectionLog } from "@/lib/hooks/useMailServers";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatDateTime } from "@/lib/helper/date";

interface ConnectionStatusModalProps {
    open: boolean;
    onClose: () => void;
    serverName: string;
    mailServerId: string | null;
}

const ConnectionStatusModal: React.FC<ConnectionStatusModalProps> = ({
    open,
    onClose,
    serverName,
    mailServerId,
}) => {
    if (!open) return null;

    const { data: logResponse, isLoading, error, refetch } = useMailServerConnectionLog(mailServerId, open);
    const log = logResponse?.data;

    useEffect(() => {
        if (open && mailServerId) {
            refetch();
        }
    }, [open, mailServerId, refetch]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="animate-spin text-gray-500" size={28} />
                    ) : log?.is_success ? (
                        <CheckCircle2 className="text-green-500" size={28} />
                    ) : (
                        <AlertCircle className="text-red-500" size={28} />
                    )}
                    <h2 className="text-xl font-semibold text-gray-900">
                        Connection Status: {serverName}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-8 text-red-500 gap-2">
                            <XCircle size={32} />
                            <p>Failed to load connection log.</p>
                            <p className="text-sm">{error.message}</p>
                        </div>
                    ) : !log ? (
                        <div className="text-center py-8 text-gray-500">
                            This server has never been tested for connection.
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 text-sm">
                                Tested at: {format(new Date(log.created_at), "dd MMMM yyyy HH:mm:ss", { locale: idLocale })}
                            </p>

                            <div className={`p-4 rounded-lg font-mono text-xs md:text-sm whitespace-pre-wrap break-all overflow-auto border ${log.is_success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                                }`}>
                                {log.message || (log.is_success ? "Connection successful." : "Connection failed.")}
                                {log.error_code && (
                                    <div className="mt-2 font-bold">Error Code: {log.error_code}</div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="soft" color="gray">
                        Close
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default ConnectionStatusModal;
