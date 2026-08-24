"use client";

import React, { useState } from "react";
import { useConnectSms } from "@/lib/hooks/useOmnichannel";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface ConnectSmsFormProps {
  onSuccess?: () => void;
}

// Phase 9 Inc A: connect a Twilio number for plain SMS. Clone of
// ConnectWhatsAppForm minus the branch field - the backend envelope is
// {display_name, phone_number, twilio_account_sid, twilio_auth_token}. The
// same number can be connected as BOTH WhatsApp and SMS (two separate
// accounts/conversation streams).
const ConnectSmsForm: React.FC<ConnectSmsFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    phone_number: "",
    twilio_account_sid: "",
    twilio_auth_token: "",
    display_name: "",
  });

  const connectSmsMutation = useConnectSms();

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
      await connectSmsMutation.mutateAsync({
        display_name: formData.display_name.trim() || undefined,
        phone_number: formData.phone_number,
        twilio_account_sid: formData.twilio_account_sid,
        twilio_auth_token: formData.twilio_auth_token,
      });
      notify.success("SMS Connected", { description: "SMS number has been connected successfully." });

      // Reset form
      setFormData({
        phone_number: "",
        twilio_account_sid: "",
        twilio_auth_token: "",
        display_name: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error?.error?.code === "CHANNEL_ALREADY_EXISTS") {
        notify.error("Number Already Connected", {
          description: "That number is already connected for SMS in this company. Use a different number, or delete the existing connection below.",
        });
        return;
      }
      const message = handleError(error, "Connect SMS");
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
            disabled={connectSmsMutation.isPending}
          />
          <p className="text-xs text-gray-500">Enter phone number with country code (e.g., +1234567890)</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.display_name}
            onChange={(e) => handleChange("display_name", e.target.value)}
            placeholder="e.g. Support SMS - Jakarta"
            disabled={connectSmsMutation.isPending}
          />
          <p className="text-xs text-gray-500">Optional. Defaults to your name if left blank.</p>
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
            disabled={connectSmsMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            Your Twilio Account SID from the{" "}
            <a
              href="https://console.twilio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Twilio Console
            </a>
          </p>
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
            disabled={connectSmsMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            Your Twilio Auth Token from the{" "}
            <a
              href="https://console.twilio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Twilio Console
            </a>
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <AppButton
          type="submit"
          disabled={connectSmsMutation.isPending}
          variantStyle="primary"
        >
          {connectSmsMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Connecting...
            </>
          ) : (
            "Connect SMS"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default ConnectSmsForm;
