"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useWebWidgetConfig, useUpdateWebWidgetConfig } from "@/lib/hooks/useOmnichannel";
import { useBusinessHours } from "@/lib/hooks/useBusinessHours";
import type { UpdateWebWidgetConfigRequest } from "@/lib/types/omnichannel";

interface WebWidgetConfigPanelProps {
  accountId: string;
}

const DEFAULT_FORM: UpdateWebWidgetConfigRequest = {
  title: "Chat with us",
  greeting_message: "Hi! How can we help?",
  brand_color: "#5479EE",
  allowed_domains: [],
  is_widget_enabled: true,
  auto_create_ticket: true,
  enable_ai_triage: true,
  business_hours_calendar_id: null,
  offline_message: "",
};

const ToggleRow: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ label, description, checked, onChange, disabled }) => (
  <label className="flex items-start gap-3 py-3 cursor-pointer">
    <AppInput
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
      disabled={disabled}
    />
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </label>
);

const WebWidgetConfigPanel: React.FC<WebWidgetConfigPanelProps> = ({ accountId }) => {
  const { data: config, isLoading } = useWebWidgetConfig(accountId);
  const updateMutation = useUpdateWebWidgetConfig(accountId);
  const { data: calendarsData } = useBusinessHours();
  const calendars = calendarsData?.data?.data || [];

  const [form, setForm] = useState<UpdateWebWidgetConfigRequest>(DEFAULT_FORM);
  const [domainsInput, setDomainsInput] = useState("");

  useEffect(() => {
    if (!config) return;
    setForm({
      title: config.title,
      greeting_message: config.greeting_message,
      brand_color: config.brand_color,
      allowed_domains: config.allowed_domains || [],
      is_widget_enabled: config.is_widget_enabled,
      auto_create_ticket: config.auto_create_ticket,
      enable_ai_triage: config.enable_ai_triage,
      business_hours_calendar_id: config.business_hours_calendar_id ?? null,
      offline_message: config.offline_message ?? "",
    });
    setDomainsInput((config.allowed_domains || []).join(", "));
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allowed_domains = domainsInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      await updateMutation.mutateAsync({ ...form, allowed_domains });
      notify.success("Settings Saved", { description: "Your Web Widget configuration has been updated." });
    } catch (error: any) {
      const message = handleError(error, "Update Web Widget Config");
      notify.error("Error", { description: message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Widget Title</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Chat with us"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Brand Color</label>
          <div className="flex items-center gap-2 h-10">
            <input
              type="color"
              value={form.brand_color}
              onChange={(e) => setForm((prev) => ({ ...prev, brand_color: e.target.value }))}
              className="h-10 w-14 rounded-md border border-gray-200 cursor-pointer bg-white"
            />
            <span className="text-sm text-gray-500 font-mono">{form.brand_color}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Greeting Message</label>
        <AppInput
          fullWidth
          isBgWhite
          value={form.greeting_message}
          onChange={(e) => setForm((prev) => ({ ...prev, greeting_message: e.target.value }))}
          placeholder="Hi! How can we help?"
        />
        <p className="text-xs text-gray-500">Shown to visitors before they send their first message.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Allowed Domains</label>
        <AppInput
          fullWidth
          isBgWhite
          value={domainsInput}
          onChange={(e) => setDomainsInput(e.target.value)}
          placeholder="example.com, shop.example.com"
        />
        <p className="text-xs text-gray-500">
          Comma-separated. Optional deterrence only, not a hard security boundary — leave blank to allow any site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Business Hours</label>
          <select
            value={form.business_hours_calendar_id || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, business_hours_calendar_id: e.target.value || null }))
            }
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Always online</option>
            {calendars.map((cal: { id: string; name: string }) => (
              <option key={cal.id} value={cal.id}>
                {cal.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Offline Message</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.offline_message || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, offline_message: e.target.value }))}
            placeholder="We're offline right now — leave a message and we'll reply by email."
            disabled={!form.business_hours_calendar_id}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 divide-y divide-gray-100">
        <ToggleRow
          label="Widget Enabled"
          description="Turn off to immediately stop accepting new messages (kill switch)."
          checked={form.is_widget_enabled}
          onChange={(checked) => setForm((prev) => ({ ...prev, is_widget_enabled: checked }))}
        />
        <ToggleRow
          label="Auto-create Ticket"
          description="Automatically open a support ticket on the visitor's first message. When off, agents convert conversations to tickets manually."
          checked={form.auto_create_ticket}
          onChange={(checked) => setForm((prev) => ({ ...prev, auto_create_ticket: checked }))}
        />
        <ToggleRow
          label="Smart Triage (AI)"
          description="Suggest a priority, category, and draft reply as an internal note on every new widget ticket. Never sent to the visitor automatically."
          checked={form.enable_ai_triage}
          onChange={(checked) => setForm((prev) => ({ ...prev, enable_ai_triage: checked }))}
          disabled={!form.auto_create_ticket}
        />
      </div>

      <div className="flex justify-end">
        <AppButton type="submit" disabled={updateMutation.isPending} variantStyle="primary">
          {updateMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </AppButton>
      </div>
    </form>
  );
};

export default WebWidgetConfigPanel;
