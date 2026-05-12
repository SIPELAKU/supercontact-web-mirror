"use client";

import React, { useState, useEffect } from "react";
import { MailServer } from "@/lib/models/types";
import { useCreateMailServer } from "@/lib/hooks/useMailServers";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { AppSelect } from "@/components/ui/app-select";
import { Switch } from "@/components/ui/switch";
import { handleError } from "@/lib/utils/errorHandler";

interface AddMailServerModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddMailServerModal: React.FC<AddMailServerModalProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<Partial<MailServer>>({
        name: "",
        smtp_host: "",
        smtp_port: 587,
        smtp_encryption: "TLS(STARTTLS)",
        smtp_username: "",
        smtp_password: "",
        attachment_limit_mb: 0,
        status: "Active",
        is_default: false,
        from_email: "",
        smtp_region: "",
        limit_per_minute: 0,
        limit_per_hour: 0,
        limit_per_day: 0,
        limit_per_month: 0,
    });

    const [authMethod, setAuthMethod] = useState("username"); // 'username' or 'ssl'

    useEffect(() => {
        if (open) {
            setFormData({
                name: "",
                smtp_host: "",
                smtp_port: 587,
                smtp_encryption: "TLS(STARTTLS)",
                smtp_username: "",
                smtp_password: "",
                attachment_limit_mb: 0,
                status: "Active",
                is_default: false,
                from_email: "",
                smtp_region: "",
                limit_per_minute: 0,
                limit_per_hour: 0,
                limit_per_day: 0,
                limit_per_month: 0,
            });
            setAuthMethod("username");
        }
    }, [open]);

    const handleChange = (field: keyof MailServer, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const createMailServerMutation = useCreateMailServer();

    const handleSubmit = async () => {
        setIsLoading(true);

        // Validation logic
        if (!formData.name || !formData.smtp_host || !formData.smtp_port || !formData.smtp_username || !formData.smtp_password || !formData.smtp_encryption || !formData.from_email) {
            notify.warning("Validation Error", { description: "Please fill in all required fields." });
            setIsLoading(false);
            return;
        }

        if (!formData.from_email.includes("@")) {
            notify.warning("Validation Error", { description: "Please enter a valid sender email address." });
            setIsLoading(false);
            return;
        }


        try {
            await createMailServerMutation.mutateAsync({
                name: formData.name,
                smtp_host: formData.smtp_host,
                smtp_port: Number(formData.smtp_port),
                smtp_username: formData.smtp_username,
                smtp_password: formData.smtp_password,
                smtp_encryption: formData.smtp_encryption,
                is_default: formData.is_default,
                from_email: formData.from_email,
                smtp_region: formData.smtp_region,
                attachment_limit_mb: Number(formData.attachment_limit_mb),
                limit_per_minute: Number(formData.limit_per_minute),
                limit_per_hour: Number(formData.limit_per_hour),
                limit_per_day: Number(formData.limit_per_day),
                limit_per_month: Number(formData.limit_per_month),
            });

            notify.success("Mail Server Added", { description: "New mail server has been added successfully." });
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = handleError(error, "Add Mail Server");
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
                className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add New Mail Server</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Servers Name <span className="text-red-500">*</span></label>
                            <AppInput
                                fullWidth
                                isBgWhite
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="Name that is easy to recognize, e.g: 'Email Office'"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Authenticate with</label>
                        <RadioGroup
                            row
                            value={authMethod}
                            onChange={(e) => setAuthMethod(e.target.value)}
                        >
                            <FormControlLabel value="username" control={<Radio />} label="Username" />
                            {/* <FormControlLabel value="ssl" control={<Radio />} label="SSL Certificate" /> */}
                        </RadioGroup>
                        <p className="text-xs text-gray-500">Select the method to connect to your SMTP server.</p>
                    </div>

                    <div className="space-y-2">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!formData.is_default}
                                    onCheckedChange={(checked) => handleChange("is_default", checked)}
                                />
                            }
                            label={<span className="ms-2 text-sm font-medium text-gray-700">Set as primary mail server</span>}
                        />
                        <p className="text-xs text-gray-500 ml-8">If enabled, existing default mail server will be deactivated.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Server SMTP <span className="text-red-500">*</span></label>
                                <AppInput
                                    isBgWhite
                                    value={formData.smtp_host}
                                    onChange={(e) => handleChange("smtp_host", e.target.value)}
                                    placeholder="Example: smtp.gmail.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Port <span className="text-red-500">*</span></label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={formData.smtp_port?.toString()}
                                    onChange={(e) => handleChange("smtp_port", parseInt(e.target.value))}
                                    placeholder="587"
                                />
                                <p className="text-xs text-gray-500">Example: 587 or 465</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Connection Encryption <span className="text-red-500">*</span></label>
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    size="small"
                                    value={formData.smtp_encryption}
                                    onChange={(e) => handleChange("smtp_encryption", e.target.value)}
                                    displayEmpty
                                    options={[
                                        { value: "TLS(STARTTLS)", label: "TLS (STARTTLS)" },
                                        { value: "SSL/TLS", label: "SSL/TLS" },
                                        { value: "None", label: "None" },
                                    ]}
                                />
                                <p className="text-xs text-gray-500">Recommended. Encryption is requested at the start of the SMTP session.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Region</label>
                                <AppInput
                                    isBgWhite
                                    value={formData.smtp_region}
                                    onChange={(e) => handleChange("smtp_region", e.target.value)}
                                    placeholder="Example: ap-southeast-1"
                                />
                                <p className="text-xs text-gray-500">Region code for the SMTP server if applicable.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Username<span className="text-red-500">*</span></label>
                                <AppInput
                                    isBgWhite
                                    value={formData.smtp_username}
                                    onChange={(e) => handleChange("smtp_username", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Password / App Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <AppInput
                                        isBgWhite
                                        type={showPassword ? "text" : "password"}
                                        value={formData.smtp_password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("smtp_password", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sender Email <span className="text-red-500">*</span></label>
                            <AppInput
                                fullWidth
                                isBgWhite
                                value={formData.from_email}
                                onChange={(e) => handleChange("from_email", e.target.value)}
                                placeholder="Example: noreply@yourdomain.com"
                            />
                            <p className="text-xs text-gray-500">The email address that will appear in the 'From' field of sent messages.</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sending Limits</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Per Minute</label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={formData.limit_per_minute?.toString()}
                                    onChange={(e) => handleChange("limit_per_minute", parseInt(e.target.value) || 0)}
                                    placeholder="60"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Per Hour</label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={formData.limit_per_hour?.toString()}
                                    onChange={(e) => handleChange("limit_per_hour", parseInt(e.target.value) || 0)}
                                    placeholder="1000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Per Day</label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={formData.limit_per_day?.toString()}
                                    onChange={(e) => handleChange("limit_per_day", parseInt(e.target.value) || 0)}
                                    placeholder="10000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Per Month</label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={formData.limit_per_month?.toString()}
                                    onChange={(e) => handleChange("limit_per_month", parseInt(e.target.value) || 0)}
                                    placeholder="250000"
                                />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 italic">
                            Tip: Set these limits based on your SMTP provider's recommendations to avoid being flagged as spam. Use 0 for unlimited.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default AddMailServerModal;
