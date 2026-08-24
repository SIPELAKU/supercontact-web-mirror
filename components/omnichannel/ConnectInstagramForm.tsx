"use client";

import React, { useState } from "react";
import { useConnectInstagram } from "@/lib/hooks/useOmnichannel";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface ConnectInstagramFormProps {
  onSuccess?: () => void;
}

// Phase 9 Inc C: connect an Instagram professional account for DMs. Clone of
// ConnectMessengerForm with the IG envelope - {display_name, page_id?,
// ig_business_account_id?, page_access_token}. Either the linked Facebook
// Page ID or the IG business account ID is enough: when only the page is
// given, the backend resolves the linked IG business account via the Graph
// API. The token is verified with Meta before being stored encrypted; an IG
// account can be actively connected to only ONE company platform-wide
// (inbound webhook routing is purely by the IG business account id), so a
// duplicate here 409s even if it is connected under another company.
const ConnectInstagramForm: React.FC<ConnectInstagramFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    page_id: "",
    ig_business_account_id: "",
    page_access_token: "",
    display_name: "",
  });

  const connectInstagramMutation = useConnectInstagram();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: the token is always required; page id and IG business id
    // are one-of (the backend resolves the IG id from the page when absent).
    if (!formData.page_access_token) {
      notify.warning("Validation Error", { description: "Please provide the Page Access Token." });
      return;
    }
    if (!formData.page_id && !formData.ig_business_account_id) {
      notify.warning("Validation Error", {
        description: "Provide the linked Facebook Page ID or the Instagram business account ID.",
      });
      return;
    }

    try {
      await connectInstagramMutation.mutateAsync({
        display_name: formData.display_name.trim() || undefined,
        page_id: formData.page_id.trim() || undefined,
        ig_business_account_id: formData.ig_business_account_id.trim() || undefined,
        page_access_token: formData.page_access_token.trim(),
      });
      notify.success("Instagram Connected", { description: "Instagram account has been connected successfully." });

      // Reset form
      setFormData({
        page_id: "",
        ig_business_account_id: "",
        page_access_token: "",
        display_name: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error?.error?.code === "CHANNEL_ALREADY_EXISTS") {
        notify.error("Instagram Account Already Connected", {
          description: "That Instagram account is already actively connected on this platform. An account can only be connected to one company at a time.",
        });
        return;
      }
      if (error?.error?.code === "CHANNEL_CONNECTION_FAILED") {
        notify.error("Instagram Verification Failed", {
          description: "Meta rejected the account / access token combination. Check that the token belongs to the linked page, has the instagram_manage_messages permission, and that the page has an Instagram professional account linked.",
        });
        return;
      }
      const message = handleError(error, "Connect Instagram");
      notify.error("Error", { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Facebook Page ID</label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.page_id}
            onChange={(e) => handleChange("page_id", e.target.value)}
            placeholder="112233445566778"
            disabled={connectInstagramMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            The numeric ID of the Facebook Page your Instagram professional account is linked to.
            The linked Instagram account is resolved from it automatically.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Instagram Business Account ID</label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.ig_business_account_id}
            onChange={(e) => handleChange("ig_business_account_id", e.target.value)}
            placeholder="17841400000000000"
            disabled={connectInstagramMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            Optional if the Page ID is filled in. Provide it directly to skip the page lookup.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <AppInput
            fullWidth
            isBgWhite
            value={formData.display_name}
            onChange={(e) => handleChange("display_name", e.target.value)}
            placeholder="e.g. Support Instagram - Jakarta"
            disabled={connectInstagramMutation.isPending}
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
            disabled={connectInstagramMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            A Page Access Token (for the linked Facebook Page) with the instagram_manage_messages
            permission, generated in the{" "}
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
          disabled={connectInstagramMutation.isPending}
          variantStyle="primary"
        >
          {connectInstagramMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Connecting...
            </>
          ) : (
            "Connect Instagram"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default ConnectInstagramForm;
