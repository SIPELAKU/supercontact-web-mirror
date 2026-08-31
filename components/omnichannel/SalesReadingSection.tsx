"use client";

// The sales layer's reading of THIS conversation - the read surface the
// audit found missing (scores were persisted, nothing displayed them).
// Deliberately quiet: hidden while loading, on error, and when the
// conversation was never scored, so tenants without the layer see nothing.

import React from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useConversationSalesReading } from "@/lib/hooks/useOmnichannel";

const STAGE_STYLES: Record<string, string> = {
  dingin: "bg-sky-50 text-sky-700 border-sky-200",
  hangat: "bg-amber-50 text-amber-700 border-amber-200",
  panas: "bg-orange-50 text-orange-700 border-orange-200",
  siap_tutup: "bg-emerald-50 text-emerald-700 border-emerald-200",
  perlindungan: "bg-red-50 text-red-700 border-red-200",
  penanganan_keluhan: "bg-red-50 text-red-700 border-red-200",
  penolakan_halus: "bg-gray-50 text-gray-600 border-gray-200",
  tertunda: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function SalesReadingSection({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const { data } = useConversationSalesReading(conversationId);
  if (!data?.exists) return null;

  const stage = data.stage ?? "dingin";
  return (
    <div className="space-y-2 pt-4 border-t border-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
          <TrendingUp size={12} />
          Sales reading
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STAGE_STYLES[stage] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
        >
          {stage.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span>
          Skor <strong className="text-gray-900">{(data.score ?? 0).toFixed(1)}</strong>
        </span>
        {data.sales_state && (
          <span>
            State <strong className="text-gray-900">{data.sales_state.replace(/_/g, " ")}</strong>
          </span>
        )}
      </div>

      {(data.veto || data.needs_human) && (
        <div className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-100 px-2.5 py-1.5 text-xs text-red-700">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>
            {data.veto === "perlindungan"
              ? "Sinyal kerentanan - jalur penjualan dihentikan, tangani dengan hati-hati."
              : data.veto === "penanganan_keluhan"
                ? "Pelanggan menyampaikan keluhan - selesaikan dulu sebelum menjual."
                : "Butuh manusia - skor melewati ambang eskalasi."}
          </span>
        </div>
      )}

      {(data.signals?.length ?? 0) > 0 && (
        <ul className="space-y-1">
          {data.signals!.slice(0, 4).map((s, i) => (
            <li key={`${s.signal_id}-${i}`} className="flex items-center gap-2 text-[11px] text-gray-500">
              <span
                className={`shrink-0 font-semibold ${s.weight >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {s.weight >= 0 ? `+${s.weight}` : s.weight}
              </span>
              <span className="truncate">&ldquo;{s.matched_cue}&rdquo;</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
