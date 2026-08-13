"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Globe } from "lucide-react";
import { notify } from "@/lib/notifications";

interface WebWidgetEmbedGuideProps {
  widgetKey: string;
}

// readonly-box + copy-button pattern lifted from
// components/smart-capture/detail/sections/ConfigurationInfo.tsx - the
// Connection & Embed section's core interaction, reused verbatim rather
// than the broken EmbedShareTab.tsx pattern (see plans/).
const CopyField: React.FC<{ value: string; multiline?: boolean }> = ({ value, multiline }) => {
  const copy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    notify.success("Copied to clipboard!");
  }, [value]);

  return (
    <div className="flex items-start gap-2">
      <div
        className={`flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 overflow-x-auto ${
          multiline ? "whitespace-pre" : "truncate"
        }`}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={copy}
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors shrink-0"
        title="Copy"
      >
        <Copy size={16} />
      </button>
    </div>
  );
};

type Platform = "html" | "wordpress" | "shopify" | "mobile";

const PLATFORM_TABS: { id: Platform; label: string }[] = [
  { id: "html", label: "Plain HTML" },
  { id: "wordpress", label: "WordPress" },
  { id: "shopify", label: "Shopify" },
  { id: "mobile", label: "Mobile App" },
];

const WebWidgetEmbedGuide: React.FC<WebWidgetEmbedGuideProps> = ({ widgetKey }) => {
  const [origin, setOrigin] = useState("");
  const [tab, setTab] = useState<Platform>("html");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const snippet = useMemo(() => {
    if (!origin) return "";
    return `<script\n  src="${origin}/widget.js"\n  data-widget-key="${widgetKey}"\n  data-api-url="${apiUrl}"\n  async\n></script>`;
  }, [origin, widgetKey, apiUrl]);

  return (
    <div className="space-y-8">
      {/* Connection & Embed */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Connection & Embed</h3>
        <p className="text-xs text-gray-500 mb-4">
          This key identifies your company to the widget — anyone with your embed snippet can start
          conversations on your behalf, so treat it like a public-but-not-advertised credential.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Widget Key
            </label>
            <CopyField value={widgetKey} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Embed Snippet
            </label>
            <CopyField value={snippet} multiline />
          </div>
        </div>
      </div>

      {/* Installation Guide */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Globe size={16} className="text-gray-400" />
          Installation Guide
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Pick the platform your website (or app) runs on for step-by-step instructions.
        </p>

        <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
          {PLATFORM_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "border-[#5479EE] text-[#5479EE]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "html" && (
          <div className="space-y-3 text-sm text-gray-700">
            <p>Paste the embed snippet above right before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag on every page you want the chat bubble to appear.</p>
            <CopyField value={snippet} multiline />
            <p className="text-xs text-gray-500">
              The bubble appears in the bottom-right corner automatically — no extra markup needed.
            </p>
          </div>
        )}

        {tab === "wordpress" && (
          <div className="space-y-3 text-sm text-gray-700">
            <p>Two options, no coding required:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Install a footer-script plugin such as <strong>Insert Headers and Footers</strong>, paste the
                embed snippet into the &quot;Footer&quot; box, and save.
              </li>
              <li>
                Or, if you edit your theme directly: open <strong>Appearance → Theme File Editor →
                footer.php</strong> and paste the snippet just before <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code>.
              </li>
            </ol>
            <p className="text-xs text-gray-500">
              Plugin route is safer — it survives theme updates that would otherwise overwrite a direct
              footer.php edit.
            </p>
          </div>
        )}

        {tab === "shopify" && (
          <div className="space-y-3 text-sm text-gray-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>From your Shopify admin, go to <strong>Online Store → Themes</strong>.</li>
              <li>On your live theme, click <strong>Edit code</strong>.</li>
              <li>Open <code className="bg-gray-100 px-1 rounded">layout/theme.liquid</code>.</li>
              <li>Paste the embed snippet just before <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code>, then click <strong>Save</strong>.</li>
            </ol>
            <p className="text-xs text-gray-500">
              This adds the chat bubble to every page of your storefront, including checkout on most plans.
            </p>
          </div>
        )}

        {tab === "mobile" && (
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              Native mobile SDKs (iOS, Android, React Native, Flutter) are on the roadmap as a headless
              client library — your app builds its own chat UI against it, using this same Widget Key.
            </p>
            <p className="text-xs text-gray-500">
              Coming soon. In the meantime, an embedded web view pointed at a page with the HTML snippet
              above is a workable stopgap for a mobile app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebWidgetEmbedGuide;
