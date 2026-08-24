"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SelectChangeEvent } from "@mui/material";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useWebWidgetConfig, useUpdateWebWidgetConfig } from "@/lib/hooks/useOmnichannel";
import { useBusinessHours } from "@/lib/hooks/useBusinessHours";
import { useConversationQueues } from "@/lib/hooks/useAgents";
import type { QuickAction, UpdateWebWidgetConfigRequest } from "@/lib/types/omnichannel";
import QuickActionsBuilder from "./QuickActionsBuilder";

interface WebWidgetConfigPanelProps {
  accountId: string;
}

// Sensible defaults so an existing widget whose stored config predates these
// fields still renders (the backend may omit them on GET). Every key here maps
// to a real WebWidgetConfig field that round-trips on PUT.
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
  // Branding
  bot_name: "Support Assistant",
  bot_avatar_url: null,
  // Home screen
  home_headline: "Hi there 👋",
  home_subtext: "How can we help you today?",
  show_home_screen: true,
  // Quick actions
  quick_actions: [],
  // Widget language (null = automatic: use embed data-locale / widget default)
  default_locale: null,
  // Presence & response time
  response_time_label: "Usually replies instantly",
  show_presence: true,
  // Human handoff
  enable_human_handoff: true,
  handoff_label: "Talk to a human",
  handoff_queue_id: null,
  // Privacy
  privacy_footer_text: null,
  privacy_url: null,
  // AI Answer Bot
  answer_bot_enabled: false,
  answer_bot_max_articles: 3,
  answer_bot_use_llm: false,
  answer_bot_min_confidence: 0.3,
  answer_bot_intro_text: null,
  answer_bot_no_answer_text: null,
  auto_close_idle_enabled: false,
  idle_warn_minutes: 30,
  idle_close_minutes: 30,
  idle_warn_text: null,
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

const Section: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="space-y-4 border-t border-gray-200 pt-6">
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    {children}
  </section>
);

const WebWidgetConfigPanel: React.FC<WebWidgetConfigPanelProps> = ({ accountId }) => {
  const { data: config, isLoading } = useWebWidgetConfig(accountId);
  const updateMutation = useUpdateWebWidgetConfig(accountId);
  const { data: calendarsData } = useBusinessHours();
  const calendars = calendarsData?.data?.data || [];
  const { data: queues } = useConversationQueues();

  const activeQueueOptions = (queues || [])
    .filter((q) => q.is_active)
    .map((q) => ({ value: q.id, label: q.name }));
  // Quick-action cards may be intentionally unrouted; handoff simply "none".
  const quickActionQueueOptions = [
    { value: "", label: "None (unrouted)" },
    ...activeQueueOptions,
  ];
  const handoffQueueOptions = [{ value: "", label: "None" }, ...activeQueueOptions];

  const [form, setForm] = useState<UpdateWebWidgetConfigRequest>(DEFAULT_FORM);
  const [domainsInput, setDomainsInput] = useState("");

  useEffect(() => {
    if (!config) return;
    // Coalesce every possibly-missing field to its default so partial configs
    // (widgets created before these fields existed) don't blank the form.
    setForm({
      title: config.title ?? DEFAULT_FORM.title,
      greeting_message: config.greeting_message ?? DEFAULT_FORM.greeting_message,
      brand_color: config.brand_color ?? DEFAULT_FORM.brand_color,
      allowed_domains: config.allowed_domains || [],
      is_widget_enabled: config.is_widget_enabled ?? DEFAULT_FORM.is_widget_enabled,
      auto_create_ticket: config.auto_create_ticket ?? DEFAULT_FORM.auto_create_ticket,
      enable_ai_triage: config.enable_ai_triage ?? DEFAULT_FORM.enable_ai_triage,
      business_hours_calendar_id: config.business_hours_calendar_id ?? null,
      offline_message: config.offline_message ?? "",
      bot_name: config.bot_name ?? DEFAULT_FORM.bot_name,
      bot_avatar_url: config.bot_avatar_url ?? null,
      home_headline: config.home_headline ?? DEFAULT_FORM.home_headline,
      home_subtext: config.home_subtext ?? DEFAULT_FORM.home_subtext,
      show_home_screen: config.show_home_screen ?? DEFAULT_FORM.show_home_screen,
      quick_actions: Array.isArray(config.quick_actions) ? config.quick_actions : [],
      default_locale: config.default_locale ?? null,
      response_time_label: config.response_time_label ?? DEFAULT_FORM.response_time_label,
      show_presence: config.show_presence ?? DEFAULT_FORM.show_presence,
      enable_human_handoff: config.enable_human_handoff ?? DEFAULT_FORM.enable_human_handoff,
      handoff_label: config.handoff_label ?? DEFAULT_FORM.handoff_label,
      handoff_queue_id: config.handoff_queue_id ?? null,
      privacy_footer_text: config.privacy_footer_text ?? null,
      privacy_url: config.privacy_url ?? null,
      answer_bot_enabled: config.answer_bot_enabled ?? DEFAULT_FORM.answer_bot_enabled,
      answer_bot_max_articles: config.answer_bot_max_articles ?? DEFAULT_FORM.answer_bot_max_articles,
      answer_bot_use_llm: config.answer_bot_use_llm ?? DEFAULT_FORM.answer_bot_use_llm,
      answer_bot_min_confidence: config.answer_bot_min_confidence ?? DEFAULT_FORM.answer_bot_min_confidence,
      answer_bot_intro_text: config.answer_bot_intro_text ?? null,
      answer_bot_no_answer_text: config.answer_bot_no_answer_text ?? null,
      auto_close_idle_enabled:
        config.auto_close_idle_enabled ?? DEFAULT_FORM.auto_close_idle_enabled,
      idle_warn_minutes: config.idle_warn_minutes ?? DEFAULT_FORM.idle_warn_minutes,
      idle_close_minutes:
        config.idle_close_minutes ?? DEFAULT_FORM.idle_close_minutes,
      idle_warn_text: config.idle_warn_text ?? null,
    });
    setDomainsInput((config.allowed_domains || []).join(", "));
  }, [config]);

  const setField = <K extends keyof UpdateWebWidgetConfigRequest>(
    key: K,
    value: UpdateWebWidgetConfigRequest[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setQuickActions = (quick_actions: QuickAction[]) =>
    setForm((prev) => ({ ...prev, quick_actions }));

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
      {/* Branding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Widget Title</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Chat with us"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Brand Color</label>
          <div className="flex items-center gap-2 h-10">
            <input
              type="color"
              value={form.brand_color}
              onChange={(e) => setField("brand_color", e.target.value)}
              className="h-10 w-14 rounded-md border border-gray-200 cursor-pointer bg-white"
            />
            <span className="text-sm text-gray-500 font-mono">{form.brand_color}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bot Name</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.bot_name}
            onChange={(e) => setField("bot_name", e.target.value)}
            placeholder="Support Assistant"
          />
          <p className="text-xs text-gray-500">Name shown for automated / assistant replies.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bot Avatar URL</label>
          <div className="flex items-center gap-3">
            {form.bot_avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.bot_avatar_url}
                alt="Bot avatar preview"
                className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover bg-white"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
              />
            ) : (
              <span className="h-10 w-10 shrink-0 rounded-full border border-dashed border-gray-200 bg-gray-50" />
            )}
            <AppInput
              fullWidth
              isBgWhite
              value={form.bot_avatar_url ?? ""}
              onChange={(e) => setField("bot_avatar_url", e.target.value || null)}
              placeholder="https://example.com/avatar.png"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Greeting Message</label>
        <AppInput
          fullWidth
          isBgWhite
          value={form.greeting_message}
          onChange={(e) => setField("greeting_message", e.target.value)}
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
            onChange={(e) => setField("business_hours_calendar_id", e.target.value || null)}
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
            onChange={(e) => setField("offline_message", e.target.value)}
            placeholder="We're offline right now — leave a message and we'll reply by email."
            disabled={!form.business_hours_calendar_id}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Widget Language</label>
          <select
            value={form.default_locale ?? ""}
            onChange={(e) => setField("default_locale", e.target.value || null)}
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Automatic (visitor/browser)</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
          <p className="text-xs text-gray-500">
            Automatic uses the language set on your embed code, or falls back to the widget default.
          </p>
        </div>
      </div>

      {/* Home screen */}
      <Section
        title="Home screen"
        description="The visitor's first view when they open the widget, before starting a conversation."
      >
        <div className="border-t border-gray-100">
          <ToggleRow
            label="Show home screen"
            description="Show a welcome screen with quick actions. When off, visitors go straight to the chat composer."
            checked={form.show_home_screen}
            onChange={(checked) => setField("show_home_screen", checked)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Home Headline</label>
            <AppInput
              fullWidth
              isBgWhite
              value={form.home_headline}
              onChange={(e) => setField("home_headline", e.target.value)}
              placeholder="Hi there 👋"
              disabled={!form.show_home_screen}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Home Subtext</label>
            <AppInput
              fullWidth
              isBgWhite
              value={form.home_subtext}
              onChange={(e) => setField("home_subtext", e.target.value)}
              placeholder="How can we help you today?"
              disabled={!form.show_home_screen}
            />
          </div>
        </div>
      </Section>

      {/* Quick actions */}
      <Section
        title="Quick actions"
        description="Option cards on the home screen. Each can route a new conversation to a specific queue and prefill the composer."
      >
        <QuickActionsBuilder
          actions={form.quick_actions}
          onChange={setQuickActions}
          queueOptions={quickActionQueueOptions}
          disabled={!form.show_home_screen}
        />
        {!form.show_home_screen && (
          <p className="text-xs text-gray-400">
            Quick actions only appear when the home screen is enabled.
          </p>
        )}
      </Section>

      {/* Presence & response time */}
      <Section
        title="Presence & response time"
        description="Set expectations for how quickly visitors hear back."
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Response Time Label</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.response_time_label}
            onChange={(e) => setField("response_time_label", e.target.value)}
            placeholder="Usually replies instantly"
          />
        </div>
        <div className="border-t border-gray-100">
          <ToggleRow
            label="Show presence"
            description="Show whether agents are online/offline on the widget."
            checked={form.show_presence}
            onChange={(checked) => setField("show_presence", checked)}
          />
        </div>
      </Section>

      {/* Human handoff */}
      <Section
        title="Human handoff"
        description="Give visitors a way to escalate from self-serve to a live agent."
      >
        <div className="border-t border-gray-100">
          <ToggleRow
            label="Enable human handoff"
            description='Show a "Talk to a human" action that routes the visitor to a live agent queue.'
            checked={form.enable_human_handoff}
            onChange={(checked) => setField("enable_human_handoff", checked)}
          />
        </div>
        {form.enable_human_handoff && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Handoff Label</label>
              <AppInput
                fullWidth
                isBgWhite
                value={form.handoff_label}
                onChange={(e) => setField("handoff_label", e.target.value)}
                placeholder="Talk to a human"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Handoff Queue</label>
              <AppSelect
                isBgWhite
                value={form.handoff_queue_id ?? ""}
                options={handoffQueueOptions}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setField("handoff_queue_id", (e.target.value as string) || null)
                }
              />
              <p className="text-xs text-gray-500">
                Which queue a handoff routes to. Leave as None to use default routing.
              </p>
            </div>
          </div>
        )}
      </Section>

      {/* Privacy */}
      <Section
        title="Privacy"
        description="Optional footer note and link shown at the bottom of the widget."
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Privacy Footer Text</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.privacy_footer_text ?? ""}
            onChange={(e) => setField("privacy_footer_text", e.target.value || null)}
            placeholder="By chatting you agree to our privacy policy."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Privacy Policy URL</label>
          <AppInput
            fullWidth
            isBgWhite
            value={form.privacy_url ?? ""}
            onChange={(e) => setField("privacy_url", e.target.value || null)}
            placeholder="https://example.com/privacy"
          />
        </div>
      </Section>

      {/* Idle auto-close */}
      <Section
        title="Tutup otomatis saat tidak ada balasan"
        description="Chat widget adalah sesi, bukan kotak masuk. Pengunjung yang pergi meninggalkan percakapan terbuka selamanya — memakan kuota agen dan tidak pernah menghasilkan survei CSAT."
      >
        <div className="border-t border-gray-100">
          <ToggleRow
            label="Aktifkan tutup otomatis"
            description="Bot menanyakan apakah pengunjung masih ada, lalu menandai percakapan selesai bila tidak ada jawaban. Jam diam dihitung dari pesan MANUSIA terakhir — pesan bot tidak mereset hitungannya."
            checked={form.auto_close_idle_enabled}
            onChange={(checked) => setField("auto_close_idle_enabled", checked)}
          />
        </div>

        {form.auto_close_idle_enabled && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pesan "masih di sana?"
              </label>
              <AppInput
                fullWidth
                isBgWhite
                value={form.idle_warn_text ?? ""}
                onChange={(e) => setField("idle_warn_text", e.target.value || null)}
                placeholder="Masih di sana? Chat ini akan kami tutup bila tidak ada balasan."
              />
              <p className="text-xs text-gray-500">
                Wajib diisi. Dikosongkan berarti fitur ini tidak berjalan sama
                sekali — menutup chat tanpa pernah bertanya terbaca seperti chat
                yang hilang.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Diam berapa menit sebelum ditanya
                </label>
                <AppInput
                  fullWidth
                  isBgWhite
                  type="number"
                  value={String(form.idle_warn_minutes)}
                  inputProps={{ min: 1, max: 1440 }}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    setField("idle_warn_minutes", Math.min(1440, Math.max(1, n)));
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Menit setelah ditanya sebelum ditutup
                </label>
                <AppInput
                  fullWidth
                  isBgWhite
                  type="number"
                  value={String(form.idle_close_minutes)}
                  inputProps={{ min: 1, max: 1440 }}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    setField("idle_close_minutes", Math.min(1440, Math.max(1, n)));
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Percakapan ditandai <strong>Selesai</strong>, bukan dihapus, sehingga
              survei CSAT tetap terkirim. Pengunjung yang membalas setelah
              ditanya membatalkan penutupan.
            </p>
          </>
        )}
      </Section>

      {/* AI Answer Bot */}
      <Section
        title="AI Answer Bot"
        description="Automatically answer a visitor's first message from your published Knowledge Base before an agent picks it up. The reply arrives as a normal message in the conversation."
      >
        <div className="border-t border-gray-100">
          <ToggleRow
            label="Enable answer bot"
            description="Search the published Knowledge Base on the visitor's first message and post a suggested answer. Agents and routing are unaffected."
            checked={form.answer_bot_enabled}
            onChange={(checked) => setField("answer_bot_enabled", checked)}
          />
        </div>

        {/* Deliberately OUTSIDE the answer_bot_enabled gate: this switch also
            governs the KB step inside a conversation flow, which runs whether
            or not the answer bot is on. Hiding it there left tenants unable to
            reach the switch that controls their flow's answers. */}
        <div className="border-t border-gray-100">
          <ToggleRow
            label="Use AI to compose an answer"
            description="Let AI write a grounded reply from the matched articles instead of just linking them. Applies to the answer bot and to Knowledge Base steps in your conversation flows. When off, replies use article-based content only."
            checked={form.answer_bot_use_llm}
            onChange={(checked) => setField("answer_bot_use_llm", checked)}
          />
        </div>

        {form.answer_bot_enabled && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Articles</label>
                <AppInput
                  fullWidth
                  isBgWhite
                  type="number"
                  value={String(form.answer_bot_max_articles)}
                  inputProps={{ min: 1, max: 5, step: 1 }}
                  onChange={(e) => {
                    const n = Math.round(Number(e.target.value));
                    if (!Number.isFinite(n)) return;
                    setField("answer_bot_max_articles", Math.min(5, Math.max(1, n)));
                  }}
                />
                <p className="text-xs text-gray-500">
                  How many top Knowledge Base articles to ground the answer on (1–5).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Minimum Confidence</label>
                <AppInput
                  fullWidth
                  isBgWhite
                  type="number"
                  value={String(form.answer_bot_min_confidence)}
                  inputProps={{ min: 0, max: 1, step: 0.05 }}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    setField("answer_bot_min_confidence", Math.min(1, Math.max(0, n)));
                  }}
                />
                <p className="text-xs text-gray-500">
                  Suppress answers below this match score (0.0–1.0). Higher is stricter.
                </p>
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Intro Text (optional)</label>
              <AppInput
                fullWidth
                isBgWhite
                value={form.answer_bot_intro_text ?? ""}
                onChange={(e) => setField("answer_bot_intro_text", e.target.value || null)}
                placeholder="Here's what I found that might help:"
              />
              <p className="text-xs text-gray-500">Optional line shown before an automated answer.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">No-Answer Text (optional)</label>
              <AppInput
                fullWidth
                isBgWhite
                value={form.answer_bot_no_answer_text ?? ""}
                onChange={(e) => setField("answer_bot_no_answer_text", e.target.value || null)}
                placeholder="I'll connect you with a team member who can help."
              />
              <p className="text-xs text-gray-500">
                Optional message when nothing confident enough is found. Leave blank to stay silent and let an agent reply.
              </p>
            </div>
          </>
        )}
      </Section>

      {/* Behaviour toggles */}
      <div className="border-t border-gray-200 divide-y divide-gray-100">
        <ToggleRow
          label="Widget Enabled"
          description="Turn off to immediately stop accepting new messages (kill switch)."
          checked={form.is_widget_enabled}
          onChange={(checked) => setField("is_widget_enabled", checked)}
        />
        <ToggleRow
          label="Auto-create Ticket"
          description="Automatically open a support ticket on the visitor's first message. When off, agents convert conversations to tickets manually."
          checked={form.auto_create_ticket}
          onChange={(checked) => setField("auto_create_ticket", checked)}
        />
        <ToggleRow
          label="Smart Triage (AI)"
          description="Suggest a priority, category, and draft reply as an internal note on every new widget ticket. Never sent to the visitor automatically."
          checked={form.enable_ai_triage}
          onChange={(checked) => setField("enable_ai_triage", checked)}
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
