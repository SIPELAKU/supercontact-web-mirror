"use client";

import React, { useState, useEffect } from "react";
import { MailServer } from "@/lib/models/types";
import { useUpdateMailServer } from "@/lib/hooks/useMailServers";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { AppSelect } from "@/components/ui/app-select";
import { Switch } from "@/components/ui/switch";
import { handleError } from "@/lib/utils/errorHandler";

interface EditMailServerModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mailServer: MailServer | null;
}

const EditMailServerModal: React.FC<EditMailServerModalProps> = ({
    open,
    onClose,
    onSuccess,
    mailServer,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<Partial<MailServer>>({
        name: "",
        smtp_host: "",
        smtp_port: 587,
        smtp_encryption: "TLS(STARTTLS)",
        smtp_username: "",
        smtp_password: "", // Will be empty initially
        attachment_limit_mb: 0,
        status: "Active",
        is_default: false,
        from_email: "",
        smtp_region: "",
    });

    const [authMethod, setAuthMethod] = useState("username");

    useEffect(() => {
        if (open && mailServer) {
            setFormData({
                name: mailServer.name,
                smtp_host: mailServer.smtp_host,
                smtp_port: mailServer.smtp_port,
                smtp_encryption: mailServer.smtp_encryption,
                smtp_username: mailServer.smtp_username,
                smtp_password: "", // Don't show existing password, keep empty to indicate no change
                attachment_limit_mb: mailServer.attachment_limit_mb,
                status: mailServer.status,
                is_default: mailServer.is_default,
                from_email: mailServer.from_email || "",
                smtp_region: mailServer.smtp_region || "",
            });
            setAuthMethod("username");
        }
    }, [open, mailServer]);

    const handleChange = (field: keyof MailServer, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateMailServerMutation = useUpdateMailServer();

    const handleSubmit = async () => {
        if (!mailServer) return;
        setIsLoading(true);

        // Validation logic
        if (!formData.name || !formData.smtp_host || !formData.smtp_port || !formData.smtp_username || !formData.smtp_encryption || !formData.from_email) {
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
            // Prepare payload
            const payload: any = {
                name: formData.name,
                smtp_host: formData.smtp_host,
                smtp_port: Number(formData.smtp_port),
                smtp_username: formData.smtp_username,
                smtp_encryption: formData.smtp_encryption,
                attachment_limit_mb: Number(formData.attachment_limit_mb),
                is_default: formData.is_default,
                status: formData.status,
                from_email: formData.from_email,
                smtp_region: formData.smtp_region,
            };

            // Only include password if it's not empty
            if (formData.smtp_password) {
                payload.smtp_password = formData.smtp_password;
            }

            await updateMailServerMutation.mutateAsync({
                id: mailServer.id,
                data: payload,
            });

            notify.success("Mail Server Updated", { description: "Mail server has been updated successfully." });
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = handleError(error, "Update Mail Server");
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
                    <h2 className="text-xl font-bold text-gray-900">Edit Mail Server</h2>
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
                        </RadioGroup>
                        <p className="text-xs text-gray-500">Select the method to connect to your SMTP server.</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit_is_default"
                                checked={!!formData.is_default}
                                onCheckedChange={(checked) => handleChange("is_default", checked)}
                            />
                            <label htmlFor="edit_is_default" className="ms-2 text-sm font-medium text-gray-700 cursor-pointer select-none">Set as primary mail server</label>
                        </div>
                        <p className="text-xs text-gray-500 ml-12">If enabled, existing default mail server will be deactivated.</p>
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
                                <label className="text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                                <AppInput
                                    isBgWhite
                                    value={formData.smtp_username}
                                    onChange={(e) => handleChange("smtp_username", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Password / App Password</label>
                                <div className="relative">
                                    <AppInput
                                        isBgWhite
                                        type={showPassword ? "text" : "password"}
                                        value={formData.smtp_password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("smtp_password", e.target.value)}
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Only fill this if you want to change the password.</p>
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
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default EditMailServerModal;
