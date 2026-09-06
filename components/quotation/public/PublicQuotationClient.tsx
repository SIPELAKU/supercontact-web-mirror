"use client";

// components/quotation/public/PublicQuotationClient.tsx
//
// The public quotation acceptance UI (route: /q/[code]). Renders inside the
// (quote) route group's OWN ReactQueryProvider, on a neutral shell with no
// SmartSales nav, footer or chat widget: this page belongs to the TENANT'S
// customer, not to us.
//
// NO AUTH. The opaque 22-character `public_code` is the sole authority, so
// this component uses lib/api/quotations-public.ts and never
// lib/utils/axiosClient.
//
// The five states, kept distinct on purpose:
//
//   loading                       -> spinner
//   valid + status `sent`         -> the summary, a name input, one Terima
//   already decided (status, 409) -> "sudah diputuskan", no action
//   dead link (404 / 410)         -> a deliberately TENANT-AGNOSTIC message
//   accepted just now             -> the thank-you, with the number
//
// The dead-link copy names nothing - not the tenant, not whether the code ever
// existed - because the API refuses to distinguish an unknown code from an
// expired one (spec A30) and it would be pointless to hide that server-side
// and then leak it in the browser.
//
// Colours are literal Tailwind utilities, not theme tokens: this page is
// rendered for strangers on unknown devices and must look the same
// everywhere, and (per the Tailwind v4 note) nothing here injects CSS of its
// own that could out-rank a utility layer.

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { CheckCircle2, FileDown, Link2Off, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import {
  formatMoney,
  formatPercent,
  formatQuantity,
  normalizeCurrencyCode,
} from "@/lib/helper/currency";
import { promoChipLabel } from "@/lib/constants/promotion";
import { PUBLIC_ACCEPT_NAME_MAX, QuotationPublicApiError } from "@/lib/api/quotations-public";
import {
  isTerminalPublicQuotationError,
  useAcceptPublicQuotation,
  usePublicQuotation,
} from "@/lib/hooks/usePublicQuotation";

function safeDate(value?: string | null, pattern = "dd MMM yyyy"): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, pattern);
}

/** The white card every state is rendered inside. */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
      {children}
    </div>
  );
}

function CenteredCard({
  icon,
  tone,
  title,
  children,
}: {
  icon: React.ReactNode;
  tone: "gray" | "green" | "indigo";
  title: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-500"
      : tone === "indigo"
        ? "bg-indigo-50 text-indigo-500"
        : "bg-gray-100 text-gray-400";
  return (
    <Card>
      <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${toneClass}`}>
        {icon}
      </div>
      <h1 className="mb-2 text-center text-xl font-bold text-gray-900">{title}</h1>
      <div className="text-center text-sm leading-relaxed text-gray-500">{children}</div>
    </Card>
  );
}

/**
 * Shown for BOTH an unknown code and an expired one, with wording that names
 * neither the tenant nor which of the two it was.
 */
function DeadLinkState() {
  return (
    <CenteredCard icon={<Link2Off size={34} />} tone="gray" title="Tautan penawaran ini tidak berlaku lagi">
      <p>
        Tautan mungkin sudah kedaluwarsa atau diganti dengan versi yang lebih baru.
        Silakan hubungi kontak penjual Anda untuk tautan terbaru. Halaman ini aman ditutup.
      </p>
    </CenteredCard>
  );
}

export default function PublicQuotationClient() {
  const params = useParams();
  const code = (params?.code as string) ?? "";

  const { data, isLoading, error, refetch } = usePublicQuotation(code);
  const accept = useAcceptPublicQuotation(code);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [acceptedNumber, setAcceptedNumber] = useState<string | null>(null);
  // A 404/409/410 raised at ACCEPT time flips the page into a terminal state
  // even though the initial GET succeeded - someone accepted in another tab,
  // or a revision superseded the row while it sat open.
  const [terminal, setTerminal] = useState<null | "decided" | "dead">(null);

  const companyName = data?.company_display_name?.trim() || "penjual";

  const decided = useMemo(() => {
    if (!data) return false;
    // `sent` is the only status that can still be accepted; the API refuses
    // everything else, so anything else is a decision already made.
    return data.status !== "sent";
  }, [data]);

  const handleAccept = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Isi nama Anda untuk menyetujui penawaran ini");
      return;
    }
    setNameError(null);
    try {
      const result = await accept.mutateAsync({ name: trimmed });
      setAcceptedNumber(result.quotation_number || data?.quotation_number || "");
    } catch (e) {
      if (e instanceof QuotationPublicApiError) {
        if (e.status === 409) {
          setTerminal("decided");
          return;
        }
        if (e.status === 404 || e.status === 410) {
          setTerminal("dead");
          return;
        }
      }
      // Anything else is transient: the form stays so the customer can retry.
    }
  };

  // ---- Terminal / non-form states -------------------------------------------

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <CircularProgress size={30} thickness={4} sx={{ color: "#4F46E5" }} />
          <p className="animate-pulse text-sm text-gray-500">Memuat penawaran...</p>
        </div>
      </Card>
    );
  }

  if (terminal === "dead" || isTerminalPublicQuotationError(error)) {
    // A 409 on the GET would be unusual, but it still means "decided", not
    // "dead", so it is separated here rather than folded into the same card.
    if (error instanceof QuotationPublicApiError && error.status === 409) {
      return (
        <CenteredCard icon={<CheckCircle2 size={34} />} tone="indigo" title="Penawaran ini sudah diputuskan">
          <p>Terima kasih - keputusan atas penawaran ini sudah tercatat.</p>
        </CenteredCard>
      );
    }
    return <DeadLinkState />;
  }

  if (error || !data) {
    return (
      <Card>
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">Terjadi kesalahan</h1>
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-500">
          Penawaran ini tidak bisa dimuat saat ini. Coba lagi sebentar lagi.
        </p>
        <div className="flex justify-center">
          <AppButton variantStyle="outline" onClick={() => void refetch()}>
            Coba lagi
          </AppButton>
        </div>
      </Card>
    );
  }

  if (acceptedNumber !== null) {
    return (
      <CenteredCard icon={<CheckCircle2 size={36} />} tone="green" title="Penawaran disetujui">
        <p>
          Terima kasih. Persetujuan Anda atas penawaran <b>{acceptedNumber}</b> sudah
          tercatat dan {companyName} sudah diberi tahu.
        </p>
        {data.pdf_url && (
          <div className="mt-6 flex justify-center">
            <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
              <AppButton variantStyle="outline">
                <FileDown size={16} className="mr-2" />
                Unduh PDF penawaran
              </AppButton>
            </a>
          </div>
        )}
      </CenteredCard>
    );
  }

  // ---- The document ---------------------------------------------------------

  const isDecided = decided || terminal === "decided";

  // ── COMMERCIAL Phase 5 (spec I10 / D7) ───────────────────────────────────
  //
  // This page has ALWAYS received a `currency` and has ALWAYS ignored it. That
  // is the defect: a quotation issued in USD printed rupiah symbols and
  // whole-rupiah rounding on the CUSTOMER's own acceptance page - the document
  // they click "Setujui" on.
  const currency = normalizeCurrencyCode(data.currency);
  const money = (value: string | number | null | undefined) => formatMoney(value, currency);
  // The COMPANY's currency - what the rate converts INTO. The PDF has always
  // named it; this page printed a BARE number ("Kurs 1 USD = 16.250"), which
  // id-ID grouping lets a customer read as either 16.250 rupiah or 16,25
  // dollars, and it printed no equivalents at all. Two documents for ONE
  // quotation must not say different things - and this is the one the customer
  // clicks "Setujui" on. Defaults to IDR, exactly like the PDF's own
  // `companyCurrency` prop, so a leg that predates `base_currency` renders what
  // every tenant is on today.
  const base = normalizeCurrencyCode(data.base_currency);
  const baseMoney = (value: string | number | null | undefined) => formatMoney(value, base);
  const isForeign = currency !== base;
  const rate = data.exchange_rate_used ?? null;
  const rateNumber = Number(rate);
  const hasRate = isForeign && !!rate && Number.isFinite(rateNumber) && rateNumber > 0;
  const promoTotal = data.promo_discount_total ?? null;
  const showPromo = promoTotal !== null && promoTotal !== undefined && Number(promoTotal) > 0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <header className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Penawaran dari {companyName}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {data.quotation_title || data.quotation_number}
            </h1>
            <p className="text-sm text-gray-500">{data.quotation_number}</p>
          </div>
          <div className="text-sm text-gray-600 sm:text-right">
            <p>Berlaku hingga</p>
            <p className="font-semibold text-gray-900">{safeDate(data.expire_date)}</p>
            {/* The currency line, before the totals (spec I10). */}
            <p className="mt-1 text-xs text-gray-500">Mata uang: {currency}</p>
          </div>
        </header>

        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-2 py-2 font-medium">Item</th>
                <th className="px-2 py-2 text-right font-medium">Jumlah</th>
                <th className="px-2 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((line, index) => (
                <tr key={`${line.name_snapshot}-${index}`} className="border-b border-gray-100">
                  <td className="px-2 py-3 text-gray-900">
                    {line.name_snapshot}
                    {/* BUNDLE COMPONENTS inside the Item cell, never as extra
                        rows: the Total column would otherwise imply money per
                        component, and a bundle is priced as ONE line (A5).
                        The customer is entitled to know what is in the box. */}
                    {line.bundle_components && line.bundle_components.length > 0 && (
                      <ul className="mt-1 border-l-2 border-gray-200 pl-3">
                        {line.bundle_components.map((component, componentIndex) => (
                          <li
                            key={`${component.product_name}-${componentIndex}`}
                            className="text-xs text-gray-500"
                          >
                            {formatQuantity(component.quantity)}
                            {component.unit_label ? ` ${component.unit_label}` : ""} &times;{" "}
                            {component.product_name}
                          </li>
                        ))}
                      </ul>
                    )}
                    {line.promo_code_snapshot && (
                      <p className="mt-1 text-xs font-medium text-emerald-700">
                        {promoChipLabel(line.promo_code_snapshot)}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right text-gray-600">
                    {formatQuantity(line.quantity)}
                    {line.unit_label ?? line.unit_label_snapshot
                      ? ` ${line.unit_label ?? line.unit_label_snapshot}`
                      : ""}
                  </td>
                  <td className="px-2 py-3 text-right font-medium text-gray-900">
                    {money(line.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <dt>Subtotal</dt>
            <dd>{money(data.subtotal)}</dd>
          </div>
          {/* A26: already inside Subtotal, so a caption and never a third minus
              row - the column the customer is adding up has to add up. */}
          {showPromo && (
            <p className="text-right text-xs text-gray-500">
              Termasuk promo {money(promoTotal)}
            </p>
          )}
          <div className="flex justify-between text-gray-600">
            <dt>Diskon</dt>
            <dd>- {money(data.discount_total)}</dd>
          </div>
          <div className="flex justify-between text-gray-600">
            <dt>Jumlah kena pajak</dt>
            <dd>{money(data.taxable_amount)}</dd>
          </div>
          <div className="flex justify-between text-gray-600">
            <dt>PPN {formatPercent(data.tax_rate)}%</dt>
            <dd>{money(data.tax_total)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
            <dt>Total</dt>
            <dd>{money(data.grand_total)}</dd>
          </div>
          {/* The rate that priced this document, its date, and the company-
              currency equivalents of the PPN and the grand total - the SAME
              three things `QuotationPdfDocument` prints (spec I10), because the
              customer holds both documents for one quotation and an Indonesian
              tax document is read in rupiah. */}
          {hasRate && (
            <>
              <p className="text-right text-xs text-gray-500">
                Kurs 1 {currency} = {baseMoney(rate)}
                {data.exchange_rate_date ? ` per ${safeDate(data.exchange_rate_date)}` : ""}
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <dt>PPN dalam {base}</dt>
                <dd>{baseMoney(Number(data.tax_total) * rateNumber)}</dd>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <dt>Total dalam {base}</dt>
                <dd>{baseMoney(Number(data.grand_total) * rateNumber)}</dd>
              </div>
            </>
          )}
          <p className="text-right text-xs text-gray-400">
            {data.prices_include_tax ? "Harga sudah termasuk PPN" : "Harga belum termasuk PPN"}
          </p>
        </dl>

        {data.pdf_url && (
          <div className="mt-6">
            <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
              <AppButton variantStyle="outline">
                <FileDown size={16} className="mr-2" />
                Unduh PDF
              </AppButton>
            </a>
          </div>
        )}
      </Card>

      {isDecided ? (
        <CenteredCard
          icon={<CheckCircle2 size={34} />}
          tone="indigo"
          title="Penawaran ini sudah diputuskan"
        >
          <p>
            {data.accepted_at
              ? `Disetujui pada ${safeDate(data.accepted_at, "dd MMM yyyy HH:mm")}${
                  data.accepted_by_name ? ` oleh ${data.accepted_by_name}` : ""
                }.`
              : "Keputusan atas penawaran ini sudah tercatat."}{" "}
            Halaman ini aman ditutup.
          </p>
        </CenteredCard>
      ) : (
        <Card>
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 text-indigo-500">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Setujui penawaran ini</h2>
              <p className="text-sm text-gray-500">
                Tulis nama Anda untuk menyetujui. Persetujuan tercatat sekali dan tidak bisa
                dibatalkan dari halaman ini.
              </p>
            </div>
          </div>

          <AppInput
            isBgWhite
            label="Nama Anda"
            placeholder="mis. Budi Santoso"
            value={name}
            onChange={(e) => {
              setName(e.target.value.slice(0, PUBLIC_ACCEPT_NAME_MAX));
              if (nameError) setNameError(null);
            }}
            inputProps={{ maxLength: PUBLIC_ACCEPT_NAME_MAX }}
            error={!!nameError}
            helperText={nameError ?? `Maksimal ${PUBLIC_ACCEPT_NAME_MAX} karakter`}
          />

          {accept.isError && !isTerminalPublicQuotationError(accept.error) && (
            <p className="mt-3 text-sm text-red-600">
              {accept.error instanceof QuotationPublicApiError && accept.error.status === 429
                ? "Terlalu banyak percobaan. Coba lagi sebentar lagi."
                : "Persetujuan gagal dikirim. Coba lagi sebentar lagi."}
            </p>
          )}

          <div className="mt-5">
            <AppButton
              fullWidth
              onClick={handleAccept}
              disabled={accept.isPending}
              isLoading={accept.isPending}
            >
              Setujui penawaran
            </AppButton>
          </div>
        </Card>
      )}
    </div>
  );
}
