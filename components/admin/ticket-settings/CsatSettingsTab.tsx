"use client";

// Settings > Support > CSAT. Two independently permission-gated sections:
//   - Config (enable toggle + cooldown days), gated on support:csat:manage.
//   - Recent responses (avg rating + table), gated on support:csat:view.
// Mirrors the config-form + save shape of SignatureSettingsTab and the
// card styling used across the ticket-settings tabs.

import { useEffect, useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { Star } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { notify } from "@/lib/notifications";
import { usePermission } from "@/lib/hooks/usePermission";
import {
  useCsatConfig,
  useUpdateCsatConfig,
  useCsatResponses,
} from "@/lib/hooks/useCsatAdmin";
import type { CsatResponse } from "@/lib/api/csat-admin";

const RATING_FACE: Record<number, string> = { 1: "😠", 2: "😕", 3: "😐", 4: "🙂", 5: "😍" };

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function ConfigSection() {
  const { data, isLoading } = useCsatConfig();
  const saveMutation = useUpdateCsatConfig();

  const [enabled, setEnabled] = useState(false);
  const [cooldown, setCooldown] = useState<string>("30");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated || isLoading || !data) return;
    setEnabled(!!data.csat_enabled);
    setCooldown(String(data.csat_cooldown_days ?? 30));
    setHydrated(true);
  }, [data, isLoading, hydrated]);

  const handleSave = async () => {
    const days = Number.parseInt(cooldown, 10);
    if (Number.isNaN(days) || days < 0) {
      notify.warning("Validation Error", {
        description: "Cooldown must be a whole number of days (0 or more).",
      });
      return;
    }
    try {
      await saveMutation.mutateAsync({ csat_enabled: enabled, csat_cooldown_days: days });
      notify.success("CSAT settings saved");
    } catch (error: any) {
      notify.error("Error", { description: error?.message || "Failed to save CSAT settings" });
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        Automatically send a short satisfaction survey to customers when their ticket
        or conversation is resolved. Surveys are opt-in and go out over the same
        channel the conversation used.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading CSAT settings...</p>
      ) : (
        <div className="max-w-xl space-y-5">
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <Switch
              size="small"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              inputProps={{ "aria-label": "Enable CSAT surveys" }}
            />
            Enable CSAT surveys
          </label>

          <div className="max-w-xs">
            <AppInput
              isBgWhite
              type="number"
              label="Cooldown (days)"
              inputProps={{ min: 0 }}
              value={cooldown}
              onChange={(e) => setCooldown(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Don&apos;t survey the same ticket or conversation again within this many
              days.
            </p>
          </div>

          <div>
            <AppButton
              onClick={handleSave}
              disabled={saveMutation.isPending}
              isLoading={saveMutation.isPending}
            >
              Save settings
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}

function ResponsesSection() {
  const { data, isLoading, isError, refetch } = useCsatResponses({ limit: 50, offset: 0 });

  const items: CsatResponse[] = data?.items ?? [];
  const avg = data?.avg_rating ?? 0;
  const count = data?.count ?? 0;

  const avgLabel = useMemo(() => (avg > 0 ? avg.toFixed(2) : "-"), [avg]);

  return (
    <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Recent responses</h2>
          <p className="text-sm text-gray-500">
            The latest customer satisfaction ratings.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2">
          <Star size={18} className="text-indigo-500" />
          <span className="text-2xl font-bold text-indigo-600">{avgLabel}</span>
          <span className="text-xs text-gray-500">
            avg{count > 0 ? ` · ${count} responses` : ""}
          </span>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading responses...</p>
      ) : isError ? (
        <div className="space-y-3 py-6 text-center">
          <p className="text-sm text-red-500">Failed to load responses.</p>
          <AppButton variantStyle="outline" onClick={() => refetch()}>
            Retry
          </AppButton>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No responses yet"
          description="Customer satisfaction ratings will appear here once surveys start coming back."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="py-2 pr-4">Rating</th>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Comment</th>
                <th className="py-2 pr-4">Answered</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 align-top text-gray-700">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="mr-1 text-lg" aria-hidden>
                      {RATING_FACE[r.rating] ?? ""}
                    </span>
                    <span className="font-medium">{r.rating}/5</span>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{r.agent_name || "-"}</td>
                  <td className="py-3 pr-4 whitespace-nowrap capitalize">
                    {r.channel_type || "-"}
                  </td>
                  <td className="py-3 pr-4 max-w-xs">
                    {r.comment ? (
                      <span className="block whitespace-pre-wrap break-words text-gray-600">
                        {r.comment}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-gray-500">
                    {formatDateTime(r.answered_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CsatSettingsTab() {
  const { can } = usePermission();
  const canManage = can("support:csat:manage");
  const canView = can("support:csat:view");

  return (
    <div className="space-y-6">
      {canManage && <ConfigSection />}
      {canView && <ResponsesSection />}
      {!canManage && !canView && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
          You don&apos;t have permission to view CSAT settings.
        </div>
      )}
    </div>
  );
}
