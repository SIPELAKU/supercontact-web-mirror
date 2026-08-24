"use client";

import { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppTextarea } from "@/components/ui/app-textarea";
import { notify } from "@/lib/notifications";
import { useTicketSignature, useSaveTicketSignature } from "@/lib/hooks/useTicketCollab";

export default function SignatureSettingsTab() {
    const { data, isLoading } = useTicketSignature();
    const saveMutation = useSaveTicketSignature();

    const [body, setBody] = useState("");
    const [isActive, setIsActive] = useState(true);
    // Hydrate the form once the saved signature resolves.
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (hydrated || isLoading || !data) return;
        setBody(data.body ?? "");
        setIsActive(!!data.is_active);
        setHydrated(true);
    }, [data, isLoading, hydrated]);

    const handleSave = async () => {
        try {
            await saveMutation.mutateAsync({ body: body.trim(), is_active: isActive });
            notify.success("Signature saved");
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Failed to save signature" });
        }
    };

    return (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                Your personal signature can be appended to ticket replies with one click. When
                active, an <span className="font-medium">Insert signature</span> control appears in
                the ticket reply composer - you always decide whether to add it before sending.
            </p>

            {isLoading ? (
                <p className="text-sm text-gray-400">Loading signature...</p>
            ) : (
                <div className="max-w-2xl space-y-4">
                    <AppTextarea
                        isBgWhite
                        label="Signature"
                        rows={5}
                        placeholder={"Best regards,\nJane Doe\nSupport Team"}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <Switch
                            size="small"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            inputProps={{ "aria-label": "Signature active" }}
                        />
                        Active (show the insert-signature control in the reply composer)
                    </label>

                    <div>
                        <AppButton
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                            isLoading={saveMutation.isPending}
                        >
                            Save signature
                        </AppButton>
                    </div>
                </div>
            )}
        </div>
    );
}
