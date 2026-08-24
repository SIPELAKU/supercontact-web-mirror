"use client";

import React, { useState } from "react";
import { useConnectEmail } from "@/lib/hooks/useOmnichannel";
import { Loader2, ExternalLink } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface ConnectEmailFormProps {
  onSuccess?: () => void;
}

const ConnectEmailForm: React.FC<ConnectEmailFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    app_password: "",
    display_name: "",
  });

  const connectEmailMutation = useConnectEmail();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.app_password || !formData.display_name) {
      notify.warning("Validation Error", { description: "Please fill in all required fields." });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notify.warning("Validation Error", { description: "Please enter a valid email address." });
      return;
    }

    try {
      await connectEmailMutation.mutateAsync({
        email: formData.email,
        app_password: formData.app_password,
        display_name: formData.display_name,
        imap_host: 'imap.gmail.com',
        imap_port: 993,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
      });
      
      notify.success("Email Connected", { description: "Gmail account has been connected successfully." });
      
      // Reset form
      setFormData({
        email: "",
        app_password: "",
        display_name: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      const message = handleError(error, "Connect Email");
      notify.error("Error", { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="your.email@gmail.com"
            disabled={connectEmailMutation.isPending}
          />
          <p className="text-xs text-gray-500">Your Gmail address</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            App Password <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            type="password"
            value={formData.app_password}
            onChange={(e) => handleChange("app_password", e.target.value)}
            placeholder="••••••••••••••••"
            disabled={connectEmailMutation.isPending}
          />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Generate an App Password from your Google Account</span>
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ExternalLink size={12} />
              Get App Password
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Display Name <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.display_name}
            onChange={(e) => handleChange("display_name", e.target.value)}
            placeholder="My Gmail Account"
            disabled={connectEmailMutation.isPending}
          />
          <p className="text-xs text-gray-500">A friendly name to identify this email account</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">Gmail Configuration</p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• IMAP Host: imap.gmail.com (Port: 993)</p>
            <p>• SMTP Host: smtp.gmail.com (Port: 587)</p>
            <p>• These settings are automatically configured</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <AppButton
          type="submit"
          disabled={connectEmailMutation.isPending}
          variantStyle="primary"
        >
          {connectEmailMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Connecting...
            </>
          ) : (
            "Connect Gmail"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default ConnectEmailForm;
