"use client";

// components/quotation/QuotationApprovalCard.tsx
//
// The approval timeline on the quotation itself (Phase 4, spec I3), fed by
// `GET /quotations/{id}/approvals`.
//
// THIS IS WHY THE DECISION IS VISIBLE AT ALL. Every governance event also
// writes an `activity_logs` row, but that table is readable only through
// `/platform/activity-log` behind the backoffice grant
// `platform:audit-log:read`, and this app has no activity-log code whatsoever.
// Without this card, "the approver's decision is visible on the quote" would
// be true of the database and false of every screen a tenant user can open.
//
// It shows the thresholds FROM THE SNAPSHOT (`policy_snapshot`), never from
// the live policy: the policy that applied is frozen at submit time (A18), so
// editing it underneath a pending request must not silently rewrite the
// history of a decision already made.

import { useCallback, useEffect, useState } from "react";
import { Chip } from "@mui/material";
import { CheckCircle2, Clock, RotateCcw, ShieldQuestion, UserCheck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchQuotationApprovals } from "@/lib/api/quotations";
import { formatPercent } from "@/lib/helper/currency";
import type {
  QuotationApproval,
  QuotationApprovalReason,
  QuotationApprovalStatus,
} from "@/lib/types/Quotation";

interface QuotationApprovalCardProps {
  quotationId: string;
  /**
   * Bumped by the form after submit / recall / approve / reject so the
   * timeline reloads. A number rather than a callback: the form already owns
   * "something changed", and this card owns how it reacts to it.
   */
  refreshKey?: number;
}

function safeDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, "dd MMM yyyy HH:mm");
}

type ChipMeta = {
  label: string;
  color: "warning" | "success" | "error" | "default";
  icon: React.ReactNode;
};

const STATUS_META: Record<QuotationApprovalStatus, ChipMeta> = {
  pending: { label: "Menunggu keputusan", color: "warning", icon: <Clock size={16} /> },
  approved: { label: "Disetujui", color: "success", icon: <CheckCircle2 size={16} /> },
  rejected: { label: "Ditolak", color: "error", icon: <XCircle size={16} /> },
  cancelled: { label: "Dibatalkan pengaju", color: "default", icon: <RotateCcw size={16} /> },
};

/**
 * A17 (owner amendment, 5 Sep 2026). A self-approval must NOT wear the plain
 * green "Disetujui" chip: that chip claims a second pair of eyes, and the
 * whole point of the amendment was to let a single-approver tenant proceed
 * WITH the fact recorded rather than implied away. `activity_logs` is
 * readable only through the backoffice, so this chip is the only place a
 * tenant user can ever see it.
 *
 * Only the APPROVED state is relabelled. A self-routed request that is still
 * pending is ordinary "Menunggu keputusan", and one the requester cancelled or
 * rejected says exactly that.
 */
function chipMeta(approval: QuotationApproval): ChipMeta {
  const meta = STATUS_META[approval.status] ?? STATUS_META.pending;
  if (approval.status === "approved" && approval.self_approved) {
    return {
      label: "Disetujui sendiri (tidak ada penyetuju lain)",
      color: "warning",
      icon: <UserCheck size={16} />,
    };
  }
  return meta;
}

/** Which band of the policy fired (A1). The seller reads this to know what to
 *  change: the discount, the price, or both. */
const REASON_LABEL: Record<QuotationApprovalReason, string> = {
  discount_percent: "Diskon melewati ambang persetujuan",
  margin: "Margin di bawah batas minimum",
  both: "Diskon melewati ambang DAN margin di bawah batas",
};

/**
 * A threshold out of the frozen snapshot. The keys are the four policy limits
 * as `policy_snapshot` stores them; a missing or null one means NO LIMIT, and
 * is rendered as such rather than as zero - the difference is the whole point
 * of the nullable columns.
 */
function snapshotValue(
  snapshot: Record<string, unknown> | undefined,
  key: string
): string | null {
  const raw = snapshot?.[key];
  if (raw === undefined || raw === null || raw === "") return null;
  return String(raw);
}

function ThresholdList({ approval }: { approval: QuotationApproval }) {
  const snap = approval.policy_snapshot;
  const rows: { label: string; value: string }[] = [];

  const approvalAbove = snapshotValue(snap, "approval_above_percent");
  const maxPercent = snapshotValue(snap, "max_discount_percent");
  const maxAmount = snapshotValue(snap, "max_discount_amount");
  const minMargin = snapshotValue(snap, "min_margin_percent");

  if (approvalAbove) rows.push({ label: "Ambang persetujuan", value: `> ${formatPercent(approvalAbove)}%` });
  if (maxPercent) rows.push({ label: "Batas diskon", value: `${formatPercent(maxPercent)}%` });
  if (maxAmount) rows.push({ label: "Batas nilai diskon", value: maxAmount });
  if (minMargin) rows.push({ label: "Margin minimum", value: `${formatPercent(minMargin)}%` });

  if (approval.requested_max_percent) {
    rows.push({
      label: "Diskon terburuk saat diajukan",
      value: `${formatPercent(approval.requested_max_percent)}%`,
    });
  }
  if (approval.requested_min_margin_percent) {
    rows.push({
      label: "Margin terendah saat diajukan",
      value: `${formatPercent(approval.requested_min_margin_percent)}%`,
    });
  }

  if (rows.length === 0) return null;

  return (
    <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-3">
          <dt className="text-gray-500">{row.label}</dt>
          <dd className="font-medium text-gray-800">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function QuotationApprovalCard({
  quotationId,
  refreshKey = 0,
}: QuotationApprovalCardProps) {
  const { getToken } = useAuth();
  const [approvals, setApprovals] = useState<QuotationApproval[]>([]);
  const [loading, setLoading] = useState(true);
  // A failure here must NOT be a toast: the timeline is context, not an action,
  // and a red toast on every quotation open would train sellers to dismiss it.
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!quotationId) return;
    setLoading(true);
    try {
      const token = await getToken();
      setApprovals(await fetchQuotationApprovals(token, quotationId));
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [getToken, quotationId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  // Nothing was ever routed for approval: the card would be noise. It is also
  // the common case - a tenant whose policy has no approval band never sees it.
  if (!loading && !failed && approvals.length === 0) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <header className="mb-3 flex items-center gap-2">
        <ShieldQuestion size={18} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-900">Riwayat persetujuan</h3>
      </header>

      {loading && <p className="text-sm text-gray-500">Memuat riwayat persetujuan...</p>}

      {failed && !loading && (
        <p className="text-sm text-gray-500">
          Riwayat persetujuan tidak bisa dimuat saat ini.{" "}
          <button type="button" className="text-indigo-600 underline" onClick={() => void load()}>
            Coba lagi
          </button>
        </p>
      )}

      {!loading && !failed && (
        <ol className="space-y-4">
          {approvals.map((approval) => {
            const meta = chipMeta(approval);
            return (
              <li key={approval.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    label={meta.label}
                    color={meta.color}
                    size="small"
                    icon={<span className="ml-1 flex items-center">{meta.icon}</span>}
                  />
                  <span className="text-xs text-gray-500">
                    Diajukan {approval.requester_name || "pengguna"} &middot;{" "}
                    {safeDateTime(approval.requested_at)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-700">
                  {REASON_LABEL[approval.trigger_reason] ?? approval.trigger_reason}
                </p>

                <ThresholdList approval={approval} />

                {approval.status !== "pending" && (
                  <p className="mt-2 text-xs text-gray-500">
                    {approval.status === "cancelled"
                      ? "Dibatalkan oleh pengaju"
                      : `${approval.status === "approved" ? "Disetujui" : "Ditolak"} oleh ${
                          approval.approver_name || "penyetuju"
                        }`}{" "}
                    &middot; {safeDateTime(approval.decided_at)}
                  </p>
                )}

                {approval.self_approved && (
                  <p className="mt-1 text-xs text-amber-700">
                    Diputuskan oleh pengajunya sendiri: saat pengajuan dibuat, tidak ada
                    pengguna lain di workspace ini yang memegang hak &ldquo;Setujui
                    quotation&rdquo;.
                  </p>
                )}

                {approval.comment && (
                  <p className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    &ldquo;{approval.comment}&rdquo;
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
