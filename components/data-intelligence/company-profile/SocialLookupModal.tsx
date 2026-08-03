"use client";

import React, { useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { enrichCompanySocial } from "@/lib/api/company-intelligence";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";

interface SocialLookupModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    cacheId: string;
}

const SocialLookupModal: React.FC<SocialLookupModalProps> = ({ open, onClose, onSuccess, cacheId }) => {
    const { getToken } = useAuth();
    const [pageUrl, setPageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!pageUrl.trim()) {
            notify.warning("Validation Error", { description: "Please enter a Page URL or username." });
            return;
        }
        setIsLoading(true);
        try {
            const token = await getToken();
            await enrichCompanySocial(token, cacheId, pageUrl.trim());
            notify.success("Facebook/Instagram Page data retrieved");
            setPageUrl("");
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = handleError(error, "Look Up Social Page");
            notify.error("Error", { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Look Up Facebook/Instagram Page</h2>
                </div>

                <div className="p-6 space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Page URL or Username <span className="text-red-500">*</span>
                    </label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        value={pageUrl}
                        onChange={(e) => setPageUrl(e.target.value)}
                        placeholder="e.g. facebook.com/yourcompany or yourcompany"
                    />
                    <p className="text-xs text-gray-500">
                        Meta doesn&apos;t support searching Pages by company name, so paste the exact Page
                        URL or username you want to look up.
                    </p>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Look Up"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default SocialLookupModal;
