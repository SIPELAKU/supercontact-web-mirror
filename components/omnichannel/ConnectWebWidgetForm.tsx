"use client";

import React, { useState } from "react";
import { useConnectWebWidget } from "@/lib/hooks/useOmnichannel";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { Account } from "@/lib/types/omnichannel";

interface ConnectWebWidgetFormProps {
  onSuccess?: (account: Account) => void;
}

const ConnectWebWidgetForm: React.FC<ConnectWebWidgetFormProps> = ({ onSuccess }) => {
  const [displayName, setDisplayName] = useState("");
  const connectMutation = useConnectWebWidget();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      notify.warning("Validation Error", { description: "Please give this widget a name, e.g. \"Main Website\"." });
      return;
    }

    try {
      const account = await connectMutation.mutateAsync({ display_name: displayName.trim() });
      notify.success("Web Widget Created", { description: "Configure it below, then copy the embed snippet onto your site." });
      setDisplayName("");
      if (onSuccess) onSuccess(account);
    } catch (error: any) {
      const message = handleError(error, "Connect Web Widget");
      notify.error("Error", { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Widget Name <span className="text-red-500">*</span>
        </label>
        <AppInput
          fullWidth
          isBgWhite
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Main Website"
          disabled={connectMutation.isPending}
        />
        <p className="text-xs text-gray-500">
          An internal label so your team can tell widgets apart, e.g. per brand or website.
        </p>
      </div>

      <div className="flex justify-end">
        <AppButton type="submit" disabled={connectMutation.isPending} variantStyle="primary">
          {connectMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Creating...
            </>
          ) : (
            "Create Web Widget"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default ConnectWebWidgetForm;
