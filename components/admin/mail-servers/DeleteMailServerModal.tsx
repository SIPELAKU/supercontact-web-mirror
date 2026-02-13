"use client";

import { notify } from "@/lib/notifications";
import { useDeleteMailServer } from "@/lib/hooks/useMailServers";
import React, { useState } from "react";
import { MailServer } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";
import { Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/errorHandler";

interface DeleteMailServerModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mailServer: MailServer | null;
}

const DeleteMailServerModal: React.FC<DeleteMailServerModalProps> = ({
    open,
    onClose,
    onSuccess,
    mailServer,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const deleteMailServerMutation = useDeleteMailServer();

    const handleSubmit = async () => {
        if (!mailServer) return;
        setIsLoading(true);

        try {
            await deleteMailServerMutation.mutateAsync(mailServer.id);

            notify.success("Mail Server Deleted", { description: "The mail server has been successfully deleted." });
            onSuccess();
            onClose();
        } catch (err: any) {
            const message = handleError(err, "Delete Mail Server");
            notify.error("Error", { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-start">
                    <h2 className="text-2xl font-bold text-gray-900">Delete Mail Server</h2>
                    <p className="text-gray-600 text-md mt-2">
                        Are you sure you want to delete mail server{" "}
                        <span className="font-semibold text-gray-900">
                            {mailServer?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 mt-8 font-medium">
                        <AppButton onClick={onClose} variantStyle="outline" color="gray">
                            Cancel
                        </AppButton>
                        <AppButton
                            onClick={handleSubmit}
                            disabled={isLoading}
                            variantStyle="danger"
                            color="danger"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Delete Server"}
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteMailServerModal;
