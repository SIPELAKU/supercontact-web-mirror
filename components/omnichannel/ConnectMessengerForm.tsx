"use client";

import React, { useState } from "react";
import { useConnectMessenger } from "@/lib/hooks/useOmnichannel";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface ConnectMessengerFormProps {
  onSuccess?: () => void;
}

// Phase 9 Inc B: connect a Facebook Page for Messenger. Clone of
// ConnectSmsForm with the Meta envelope - {display_name, page_id,
// page_access_token}. The backend verifies the token against the Graph API
// before storing it encrypted; a page can be actively connected to only ONE
// company platform-wide (inbound webhook routing is purely by page id), so
// a duplicate here 409s even if the page is connected under another company.
const ConnectMessengerForm: React.FC<ConnectMessengerFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    page_id: "",
    page_access_token: "",
    display_name: "",
  });

  const connectMessengerMutation = useConnectMessenger();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.page_id || !formData.page_access_token) {
      notify.warning("Validation Error", { description: "Please fill in all required fields." });
      return;
    }

    try {
      await connectMessengerMutation.mutateAsync({
        display_name: formData.display_name.trim() || undefined,
        page_id: formData.page_id.trim(),
        page_access_token: formData.page_access_token.trim(),
      });
      notify.success("Messenger Connected", { description: "Facebook Page has been connected successfully." });

      // Reset form
      setFormData({
        page_id: "",
        page_access_token: "",
        display_name: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error?.error?.code === "CHANNEL_ALREADY_EXISTS") {
        notify.error("Page Already Connected", {
          description: "That Facebook Page is already actively connected on this platform. A page can only be connected to one company at a time.",
        });
        return;
      }
      if (error?.error?.code === "CHANNEL_CONNECTION_FAILED") {
        notify.error("Page Verification Failed", {
          description: "Meta rejected the Page ID / access token combination. Check that the token belongs to this page and has the pages_messaging permission.",
        });
        return;
      }
      const message = handleError(error, "Connect Messenger");
      notify.error("Error", { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Facebook Page ID <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.page_id}
            onChange={(e) => handleChange("page_id", e.target.value)}
            placeholder="112233445566778"
            disabled={connectMessengerMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            The numeric Page ID from your page&apos;s About section (or Meta Business Suite).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.display_name}
            onChange={(e) => handleChange("display_name", e.target.value)}
            placeholder="e.g. Support Messenger - Jakarta"
            disabled={connectMessengerMutation.isPending}
          />
          <p className="text-xs text-gray-500">Optional. Defaults to your name if left blank.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Page Access Token <span className="text-red-500">*</span>
          </label>
          <AppInput
            fullWidth
            isBgWhite
            type="password"
            value={formData.page_access_token}
            onChange={(e) => handleChange("page_access_token", e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••"
            disabled={connectMessengerMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            A Page Access Token with the pages_messaging permission, generated in the{" "}
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Meta developer tools
            </a>
            . It is verified with Meta and stored encrypted.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <AppButton
          type="submit"
          disabled={connectMessengerMutation.isPending}
          variantStyle="primary"
        >
          {connectMessengerMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Connecting...
            </>
          ) : (
            "Connect Messenger"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default ConnectMessengerForm;
