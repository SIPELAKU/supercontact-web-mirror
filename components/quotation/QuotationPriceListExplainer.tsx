"use client";

// components/quotation/QuotationPriceListExplainer.tsx
//
// "Daftar harga yang berlaku" (Phase 3, spec I6) - the collapsible panel that
// finally gives `usePriceListsForCustomer` a consumer. The hook shipped in
// Phase 2 with ZERO call sites; the price-source chip on a line can say WHICH
// list won, but once the chain is seven levels deep it cannot say why the
// other six did not.
//
// Everything here is the SERVER's answer. `/price-lists/for-customer` re-runs
// the same loader and the same candidate chain a quote does - which is why the
// explainer can never disagree with what the customer is actually charged -
// and it DERIVES the customer type, the segments and the regions itself rather
// than accepting them as parameters (spec F1). The only dimensions this panel
// sends are the ones the user picked on the form: the contact and the channel.
//
// Gated on `sales:config:manage`, which is what the endpoint requires. A
// seller without it sees nothing rather than a panel that 403s.

import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { CANDIDATE_LEVEL_LABELS, CANDIDATE_REASON_LABELS } from "@/lib/constants/price-list";
import { usePriceListsForCustomer } from "@/lib/hooks/usePriceLists";
import { usePermission } from "@/lib/hooks/usePermission";
import type { PriceListCandidateLevel } from "@/lib/types/PriceList";

interface QuotationPriceListExplainerProps {
  contactId?: string | null;
  crmCompanyId?: string | null;
  salesChannelId?: string | null;
}

function levelLabel(level: PriceListCandidateLevel | string): string {
  return CANDIDATE_LEVEL_LABELS[level as PriceListCandidateLevel] ?? String(level);
}

/** The server sends a CODE; an untranslated one still prints, rather than "". */
function reasonLabel(reason: string): string {
  return CANDIDATE_REASON_LABELS[reason] ?? reason;
}

export default function QuotationPriceListExplainer({
  contactId,
  crmCompanyId,
  salesChannelId,
}: QuotationPriceListExplainerProps) {
  const { can } = usePermission();
  const allowed = can("sales:config:manage");
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = usePriceListsForCustomer(
    {
      contact_id: contactId || undefined,
      crm_company_id: crmCompanyId || undefined,
      sales_channel_id: salesChannelId || undefined,
    },
    // Only fetch once the panel is actually opened: this is an explainer, not
    // part of pricing, and the quote path already paid for the real answer.
    { enabled: allowed && open && Boolean(contactId || crmCompanyId) }
  );

  if (!allowed || (!contactId && !crmCompanyId)) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Daftar harga yang berlaku
        <span className="ml-auto text-xs font-normal text-gray-400">
          Kenapa harga ini yang dipakai
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3 text-sm">
          {isLoading && <p className="text-gray-500">Menghitung…</p>}
          {isError && (
            <p className="text-gray-500">
              Tidak bisa membaca urutan daftar harga sekarang. Harga di baris quotation tetap
              dihitung server dan tidak terpengaruh.
            </p>
          )}
          {data && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Urutan dibaca dari atas: yang pertama memenuhi syarat yang dipakai. Baris yang
                  dicoret tidak dipakai, beserta alasannya.
                </p>
              </div>

              <ul className="flex flex-col gap-1.5">
                {data.candidates.map((candidate, index) => (
                  <li
                    key={`${candidate.price_list.id}-${candidate.level}-${index}`}
                    className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                  >
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                      {levelLabel(candidate.level)}
                    </span>
                    <span
                      className={
                        candidate.is_candidate
                          ? "font-medium text-gray-900"
                          : "text-gray-400 line-through"
                      }
                    >
                      {candidate.price_list.name}
                    </span>
                    {/* "via segmen Korporat Jawa Barat" - the named target, not
                        just the level, which is the whole point of the
                        seven-level chain being legible. */}
                    {candidate.target?.label && (
                      <span className="text-xs text-gray-500">
                        via {candidate.target.label}
                        {candidate.target.secondary ? ` (${candidate.target.secondary})` : ""}
                      </span>
                    )}
                    {!candidate.is_candidate && candidate.reason && (
                      <span className="text-xs text-gray-400">
                        ({reasonLabel(String(candidate.reason))})
                      </span>
                    )}
                  </li>
                ))}
                {data.candidates.length === 0 && (
                  <li className="text-gray-500">
                    Tidak ada daftar harga yang cocok - baris quotation memakai harga katalog produk.
                  </li>
                )}
              </ul>

              <p className="text-xs text-gray-500">
                {data.winning_price_list
                  ? `Yang dipakai: ${data.winning_price_list.name}.`
                  : "Yang dipakai: harga dasar katalog."}{" "}
                {data.override_allowed
                  ? "Harga manual diizinkan pada baris quotation."
                  : "Harga manual tidak diizinkan pada baris quotation."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
