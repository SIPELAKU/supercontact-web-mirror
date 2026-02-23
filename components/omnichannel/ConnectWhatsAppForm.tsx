"use client";

import React, { useState } from "react";
import { useConnectWhatsApp } from "@/lib/hooks/useOmnichannel";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface ConnectWhatsAppFormProps {
  onSuccess?: () => void;
}

const ConnectWhatsAppForm: React.FC<ConnectWhatsAppFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    phone_number: "",
    twilio_account_sid: "",
    twilio_auth_token: "",
  });

  const connectWhatsAppMutation = useConnectWhatsApp();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.phone_number || !formData.twilio_account_sid || !formData.twilio_auth_token) {
      notify.warning("Validation Error", { description: "Please fill in all required fields." });
      return;
    }

    try {
      await connectWhatsAppMutation.mutateAsync(formData);
      notify.success("WhatsApp Connected", { description: "WhatsApp account has been connected successfully." });
      
      // Reset form
      setFormData({
        phone_number: "",
        twilio_account_sid: "",
        twilio_auth_token: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      const message = handleError(error, "Connect WhatsApp");
      notify.error("Error", { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            placeholder="+1234567890"
            disabled={connectWhatsAppMutation.isPending}
          />
          <p className="text-xs text-gray-500">Enter phone number with country code (e.g., +1234567890)</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Twilio Account SID <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.twilio_account_sid}
            onChange={(e) => handleChange("twilio_account_sid", e.target.value)}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            disabled={connectWhatsAppMutation.isPending}
          />
          <p className="text-xs text-gray-500">Your Twilio Account SID from the Twilio Console</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Twilio Auth Token <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            type="password"
            value={formData.twilio_auth_token}
            onChange={(e) => handleChange("twilio_auth_token", e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••"
            disabled={connectWhatsAppMutation.isPending}
          />
          <p className="text-xs text-gray-500">Your Twilio Auth Token from the Twilio Console</p>
        </div>
      </div>

      <div className="flex justify-end">
        <AppButton
          type="submit"
          disabled={connectWhatsAppMutation.isPending}
          variantStyle="primary"
        >
          {connectWhatsAppMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Connecting...
            </>
          ) : (
            "Connect WhatsApp"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default ConnectWhatsAppForm;
