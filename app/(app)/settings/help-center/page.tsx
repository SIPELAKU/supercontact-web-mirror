"use client";

// Settings > Help Center. Enable/brand the public portal served by the
// app/(help)/ route group. Gated on `knowledge:manage` (via the settings nav
// registration + SettingsLayout's permission guard).
//
// Saves via PUT /help-center/config. A 409 (slug taken) or 4xx (reserved /
// invalid slug) is surfaced inline next to the slug field.

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import {
  useHelpCenterAdminConfig,
  useUpdateHelpCenterConfig,
} from "@/lib/hooks/useHelpCenter";
import type { HelpCenterConfigUpdate } from "@/lib/api/help-center-admin";
import { HelpCenterAdminError } from "@/lib/api/help-center-admin";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

type FormState = {
  is_enabled: boolean;
  public_slug: string;
  display_name: string;
  logo_url: string;
  brand_color: string;
  accent_color: string;
  welcome_headline: string;
  welcome_subtext: string;
  favicon_url: string;
  support_contact_url: string;
  default_locale: string;
};

const EMPTY_FORM: FormState = {
  is_enabled: false,
  public_slug: "",
  display_name: "",
  logo_url: "",
  brand_color: "",
  accent_color: "",
  welcome_headline: "",
  welcome_subtext: "",
  favicon_url: "",
  support_contact_url: "",
  default_locale: "en",
};

const inputClass =
  "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

export default function SettingsHelpCenterPage() {
  const { data: config, isLoading } = useHelpCenterAdminConfig();
  const updateMutation = useUpdateHelpCenterConfig();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  // Hydrate the form once config loads (nulls -> empty strings for inputs).
  useEffect(() => {
    if (!config) return;
    setForm({
      is_enabled: !!config.is_enabled,
      public_slug: config.public_slug ?? "",
      display_name: config.display_name ?? "",
      logo_url: config.logo_url ?? "",
      brand_color: config.brand_color ?? "",
      accent_color: config.accent_color ?? "",
      welcome_headline: config.welcome_headline ?? "",
      welcome_subtext: config.welcome_subtext ?? "",
      favicon_url: config.favicon_url ?? "",
      support_contact_url: config.support_contact_url ?? "",
      default_locale: config.default_locale || "en",
    });
  }, [config]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "public_slug" || key === "is_enabled") setSlugError(null);
  };

  const publicUrl = useMemo(() => {
    const slug = form.public_slug.trim();
    if (!slug) return "";
    return `${origin || "https://smartsales.id"}/help/${slug}`;
  }, [form.public_slug, origin]);

  const handleSave = async () => {
    setSlugError(null);
    const slug = form.public_slug.trim();

    // Can't enable a portal with no slug - it would have no reachable URL.
    if (form.is_enabled && !slug) {
      setSlugError("A public URL slug is required to enable the portal.");
      return;
    }

    // Trim strings; send null for empty optional fields.
    const orNull = (v: string) => {
      const t = v.trim();
      return t === "" ? null : t;
    };

    const body: HelpCenterConfigUpdate = {
      is_enabled: form.is_enabled,
      public_slug: slug === "" ? null : slug,
      display_name: form.display_name.trim(),
      logo_url: orNull(form.logo_url),
      brand_color: orNull(form.brand_color),
      accent_color: orNull(form.accent_color),
      welcome_headline: orNull(form.welcome_headline),
      welcome_subtext: orNull(form.welcome_subtext),
      favicon_url: orNull(form.favicon_url),
      support_contact_url: orNull(form.support_contact_url),
      default_locale: form.default_locale.trim() || "en",
    };

    try {
      await updateMutation.mutateAsync(body);
      notify.success("Help Center saved", {
        description: form.is_enabled
          ? "Your public help center is live."
          : "Settings saved.",
      });
    } catch (error) {
      // 409 = slug collision; other 4xx = reserved/invalid slug -> inline.
      if (error instanceof HelpCenterAdminError && error.status >= 400 && error.status < 500) {
        setSlugError(
          error.status === 409
            ? error.message || "That URL slug is already taken."
            : error.message || "That URL slug is reserved or invalid."
        );
        return;
      }
      notify.error("Error", { description: handleError(error, "Save Help Center") });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Help Center"
        description="Publish a branded, public self-service help center built from your Knowledge Base."
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Help Center" }]}
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending && <Loader2 className="animate-spin" size={16} />}
            Save changes
          </button>
        }
      />

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <>
          {/* Enable + slug */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Public portal</h2>
                <p className="text-sm text-gray-500 mt-1">
                  When enabled, your published, public articles are available at the URL below.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.is_enabled}
                  onChange={(e) => set("is_enabled", e.target.checked)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div className="max-w-xl">
              <label htmlFor="public_slug" className="block text-sm font-medium text-gray-700 mb-1.5">
                Public URL slug
              </label>
              <div className="flex items-center gap-0">
                <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 select-none">
                  /help/
                </span>
                <input
                  id="public_slug"
                  value={form.public_slug}
                  onChange={(e) => set("public_slug", e.target.value)}
                  placeholder="acme"
                  className={`${inputClass} rounded-l-none ${slugError ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
              </div>
              {slugError ? (
                <p className="mt-1.5 text-sm text-red-600">{slugError}</p>
              ) : publicUrl ? (
                <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
                  Public URL:
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
                  >
                    {publicUrl}
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-gray-400">
                  Choose a short, lowercase slug (letters, numbers, hyphens).
                </p>
              )}
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Branding</h2>
            <p className="text-sm text-gray-500 mb-6">
              Customize how your help center looks to visitors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Display name" htmlFor="display_name">
                <input
                  id="display_name"
                  value={form.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  placeholder="Acme Support"
                  className={inputClass}
                />
              </Field>

              <Field label="Default locale" htmlFor="default_locale">
                <select
                  id="default_locale"
                  value={form.default_locale}
                  onChange={(e) => set("default_locale", e.target.value)}
                  className={inputClass}
                >
                  <option value="en">English (en)</option>
                  <option value="id">Bahasa Indonesia (id)</option>
                </select>
              </Field>

              <Field label="Welcome headline" htmlFor="welcome_headline">
                <input
                  id="welcome_headline"
                  value={form.welcome_headline}
                  onChange={(e) => set("welcome_headline", e.target.value)}
                  placeholder="How can we help?"
                  className={inputClass}
                />
              </Field>

              <Field label="Support contact URL" htmlFor="support_contact_url">
                <input
                  id="support_contact_url"
                  value={form.support_contact_url}
                  onChange={(e) => set("support_contact_url", e.target.value)}
                  placeholder="https://acme.com/contact"
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Welcome subtext" htmlFor="welcome_subtext">
                  <textarea
                    id="welcome_subtext"
                    value={form.welcome_subtext}
                    onChange={(e) => set("welcome_subtext", e.target.value)}
                    rows={2}
                    placeholder="Search our guides or browse by category."
                    className={`${inputClass} h-auto py-2 resize-none`}
                  />
                </Field>
              </div>

              <Field label="Logo URL" htmlFor="logo_url">
                <input
                  id="logo_url"
                  value={form.logo_url}
                  onChange={(e) => set("logo_url", e.target.value)}
                  placeholder="https://acme.com/logo.png"
                  className={inputClass}
                />
              </Field>

              <Field label="Favicon URL" htmlFor="favicon_url">
                <input
                  id="favicon_url"
                  value={form.favicon_url}
                  onChange={(e) => set("favicon_url", e.target.value)}
                  placeholder="https://acme.com/favicon.ico"
                  className={inputClass}
                />
              </Field>

              <ColorField
                label="Brand color"
                value={form.brand_color}
                onChange={(v) => set("brand_color", v)}
                fallback="#4F46E5"
              />

              <ColorField
                label="Accent color"
                value={form.accent_color}
                onChange={(v) => set("accent_color", v)}
                fallback="#6366F1"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// A hex color text field with a native color-swatch picker. Stores the raw
// string (so an empty value stays empty -> saved as null -> portal default).
function ColorField({
  label,
  value,
  onChange,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fallback: string;
}) {
  const swatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
    ? value.trim()
    : fallback;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} swatch`}
          value={swatch}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 rounded-md border border-gray-200 bg-white p-1 cursor-pointer"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          className={inputClass}
        />
      </div>
    </div>
  );
}
