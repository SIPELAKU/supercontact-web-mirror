"use client";

// components/quotation/QuotationPdfDocument.tsx
//
// The quotation PDF template (Phase 3, spec I7.1), extracted from the ~160
// hidden lines that used to sit inline at the bottom of
// `QuotationFormClient.tsx`. It had ONE mount and one caller, so the template
// was unreachable for an already-published quotation - which is why the
// "Unduh PDF" row action on the quotation list could not exist. Now both
// mount this component and hand its node to `generateQuotationPdf`.
//
// Three mechanical constraints, all pre-existing, all still true:
//
//  (a) it renders from the STORED row the server returned, never from form
//      state, so every number, snapshot and brief is the server's;
//  (b) every element carries an INLINE colour (`#000000` / `#6b7280` / ...)
//      because html2canvas cannot resolve the app's CSS custom properties -
//      a themed class here would rasterise as black-on-black;
//  (c) the capture is a single fixed-width page, so multi-line text uses
//      `whitespace-pre-wrap` rather than anything that would overflow.
//
// PHASE 3 ADDS THE "Kepada" ADDRESS BLOCK (spec I7.2/I7.3). The four lines
// were name / free-text company / email / phone; a tax invoice needs the legal
// entity's NPWP and address, and until this phase there was no write path for
// either. The rules:
//
//   * NPWP and the assembled address come from the quotation's linked CRM
//     company (`crm_company`), which the server fills FROM THE LEAD at create
//     and re-snapshots only on an update carrying `items` (spec A15) - so the
//     printed entity can never disagree with the priced lines;
//   * when there is no linked CRM company, or its address is blank, the block
//     falls back to `contacts.address` and OMITS THE NPWP LINE ENTIRELY
//     (spec I7.3). Printing an empty "NPWP:" label on an invoice-like document
//     is worse than printing nothing: it reads as "this customer has none".
//     That fallback matters today: `npwp` and `address_line` are NULL on 100%
//     of the 206 `crm_companies` rows fleet-wide, while 1,052 production
//     contacts DO carry a free-text address.

import { format } from "date-fns";
import CustomFieldsReadOnly from "@/components/custom-fields/CustomFieldsReadOnly";
import {
  formatMoney,
  formatPercent,
  formatQuantity,
  normalizeCurrencyCode,
} from "@/lib/helper/currency";
import { formatQuantityWithUnit } from "@/lib/helper/quantity";
import { billingPeriodSuffix } from "@/lib/utils/priceSource";
import { promoChipLabel } from "@/lib/constants/promotion";
import { variantValueChips } from "@/lib/utils/variantMatrix";
import { publicQuotationUrl } from "@/lib/api/quotations-public";
import type { CustomFieldDefinition } from "@/lib/types/CustomFieldDefinition";
import type { DiscountType, Quotation } from "@/lib/types/Quotation";

/** The id `generateQuotationPdf` is handed; kept stable for both callers. */
export const QUOTATION_PDF_NODE_ID = "quotation-content";

function safeDate(value?: string | null, pattern = "dd MMM yyyy"): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, pattern);
}

function discountLabel(
  type: DiscountType,
  value: string | number,
  currency: string
): string {
  return type === "percent" ? `${formatPercent(value)}%` : formatMoney(value, currency);
}

/**
 * The address the PDF prints, and where it came from.
 *
 * The CRM company's five columns are joined in postal order and only the
 * non-blank parts are kept, so a company carrying only `address_line` prints
 * one line rather than "Jl. Merdeka 1, , , ".
 */
export function buildPdfAddressBlock(quotation: Quotation): {
  npwp: string | null;
  address: string | null;
  companyName: string | null;
} {
  const crm = quotation.crm_company ?? null;
  const parts = [crm?.address_line, crm?.kecamatan, crm?.kabupaten, crm?.postal_code]
    .map((part) => (part ?? "").trim())
    .filter(Boolean);
  const crmAddress = parts.length > 0 ? parts.join(", ") : null;

  if (crmAddress) {
    return {
      npwp: (crm?.npwp ?? "").trim() || null,
      address: crmAddress,
      companyName: (crm?.name ?? "").trim() || null,
    };
  }

  // No linked company, or it has no address: fall back to the contact's own
  // free-text address and print NO npwp line (spec I7.3).
  const contactAddress = (quotation.lead?.contact?.address ?? "").trim();
  return {
    npwp: null,
    address: contactAddress || null,
    companyName: (crm?.name ?? "").trim() || null,
  };
}

interface QuotationPdfDocumentProps {
  /** The STORED row, as the draft save returned it. Null renders an empty node. */
  quotation: Quotation | null;
  /** Product definitions, so "Brand: X" prints under the line like on screen. */
  productDefinitions: CustomFieldDefinition[];
  /** Overridable so two mounts on one page cannot collide on the id. */
  nodeId?: string;
  /**
   * COMMERCIAL Phase 5 (spec I10). The COMPANY's currency, for the rupiah
   * equivalents printed under the foreign totals. Defaults to IDR, which is
   * every tenant today, so an un-updated caller prints exactly what it did.
   */
  companyCurrency?: string;
}

export default function QuotationPdfDocument({
  quotation,
  productDefinitions,
  nodeId = QUOTATION_PDF_NODE_ID,
  companyCurrency = "IDR",
}: QuotationPdfDocumentProps) {
  // COMMERCIAL Phase 5 (spec I10). EVERY amount on this document prints in the
  // QUOTATION's currency. Eight `formatRupiah` calls lived here, and a USD 3.20
  // line printed "Rp 3" on the customer's own PDF: the wrong symbol AND the
  // wrong number.
  const currency = normalizeCurrencyCode(quotation?.currency);
  const base = normalizeCurrencyCode(companyCurrency);
  const money = (value: string | number | null | undefined) => formatMoney(value, currency);
  const baseMoney = (value: string | number | null | undefined) => formatMoney(value, base);
  const isForeign = currency !== base;

  const rate = quotation?.exchange_rate_used ?? null;
  const rateNumber = Number(rate);
  const hasRate = isForeign && !!rate && Number.isFinite(rateNumber) && rateNumber > 0;
  /** "Kurs 1 USD = Rp 16.250 per 6 Sep 2026" - printed WITH the totals. */
  const rateNote = hasRate
    ? `Kurs 1 ${currency} = ${baseMoney(rate)}${
        quotation?.exchange_rate_date ? ` per ${safeDate(quotation.exchange_rate_date)}` : ""
      }`
    : "";

  const promoTotal = quotation?.promo_discount_total ?? null;
  const showPromo = promoTotal !== null && promoTotal !== undefined && Number(promoTotal) > 0;

  const taxNote = quotation
    ? quotation.prices_include_tax
      ? "Harga sudah termasuk PPN"
      : "Harga belum termasuk PPN"
    : "";

  const block = quotation ? buildPdfAddressBlock(quotation) : null;

  // The server's own `acceptance_url` wins; `public_code` is the fallback for
  // a row written by a leg that predates the field. A quotation still in draft
  // has neither, and prints no acceptance block at all - printing a dead link
  // would be worse than printing none.
  const acceptanceLink =
    quotation?.acceptance_url?.trim() ||
    (quotation?.public_code ? publicQuotationUrl(quotation.public_code) : null);

  return (
    <div
      id={nodeId}
      className="absolute -top-2500 -left-2500 w-200 p-8 border"
      style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}
    >
      {quotation && (
        <>
          <div className="mb-8 flex justify-between items-start gap-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#000000" }}>
                {quotation.quotation_title}
              </h1>
              <p style={{ color: "#6b7280" }}>{quotation.quotation_number}</p>
            </div>
            <div className="text-right text-sm" style={{ color: "#000000" }}>
              <p>Tanggal: {safeDate(quotation.created_at)}</p>
              <p>Berlaku hingga: {safeDate(quotation.expire_date)}</p>
              {/* THE CURRENCY LINE (spec I10), beside Tanggal / Berlaku hingga,
                  so the reader knows what money this is BEFORE reaching the
                  totals - not after mentally adding up an unfamiliar symbol. */}
              <p>Mata uang: {currency}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8" style={{ color: "#000000" }}>
            <div>
              <h3 className="font-bold mb-2">Kepada</h3>
              <p>{quotation.lead?.contact?.name || "-"}</p>
              {/* The legal entity's name when there is one, otherwise the
                  free-text `contacts.company` string the form has always
                  printed - they are not the same thing. */}
              <p>{block?.companyName || quotation.lead?.contact?.company || ""}</p>
              {block?.npwp && <p>NPWP: {block.npwp}</p>}
              {block?.address && (
                <p className="whitespace-pre-wrap">{block.address}</p>
              )}
              <p>{quotation.lead?.contact?.email || ""}</p>
              <p>{quotation.lead?.contact?.phone_number || ""}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold mb-2">Sales</h3>
              <p>{quotation.lead?.user?.fullname || "-"}</p>
              <p>{quotation.lead?.user?.email || ""}</p>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2" style={{ borderColor: "#1f2937" }}>
                <th className="text-left py-2" style={{ color: "#000000" }}>Item</th>
                <th className="text-right py-2" style={{ color: "#000000" }}>Qty</th>
                <th className="text-right py-2" style={{ color: "#000000" }}>Harga satuan</th>
                <th className="text-right py-2" style={{ color: "#000000" }}>Diskon</th>
                <th className="text-right py-2" style={{ color: "#000000" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, idx) => (
                <tr key={item.id ?? idx} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                  <td className="py-2">
                    <p className="font-bold" style={{ color: "#000000" }}>
                      {item.product_name_snapshot ?? item.product?.product_name ?? "-"}
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      {item.sku_snapshot ?? item.product?.sku ?? ""}
                    </p>
                    {/* VARIANT VALUES beside the name snapshot (spec I10 / D6).
                        Read from the EMBEDDED product object - which is exactly
                        why `class Product` had to gain `variant_values`: without
                        it a saved quotation has no wire path for this at all. */}
                    {variantValueChips(item.product?.variant_values).length > 0 && (
                      <p className="text-xs" style={{ color: "#6b7280" }}>
                        {variantValueChips(item.product?.variant_values)
                          .map((chip) => chip.label)
                          .join(" · ")}
                      </p>
                    )}
                    {/* "Brand: X" under the product - the LIVE attributes, read-only. */}
                    <CustomFieldsReadOnly
                      entityType="product"
                      values={item.product?.custom_fields}
                      definitions={productDefinitions}
                      className="mt-0.5 text-xs"
                      style={{ color: "#6b7280" }}
                    />
                    {/* BUNDLE COMPONENTS as an indented block INSIDE the Item
                        cell (spec I10) - never as extra table rows, because the
                        Total column would then imply per-component money that
                        does not exist (A5). */}
                    {item.bundle_components && item.bundle_components.length > 0 && (
                      <div className="mt-1 pl-3" style={{ borderLeft: "2px solid #e5e7eb" }}>
                        <p className="text-xs font-bold" style={{ color: "#4b5563" }}>
                          Isi paket
                        </p>
                        {item.bundle_components.map((component, index) => (
                          <p
                            key={`${component.product_id}-${index}`}
                            className="text-xs"
                            style={{ color: "#6b7280" }}
                          >
                            {formatQuantity(component.quantity)}
                            {component.unit_label ? ` ${component.unit_label}` : ""} &times;{" "}
                            {component.product_name}
                          </p>
                        ))}
                      </div>
                    )}
                    {/* The promotion the COMPANY gave, named on the customer's
                        copy and captioned separately from the seller's discount
                        column (spec I8 / A26). */}
                    {item.promo_code_snapshot && (
                      <p className="text-xs" style={{ color: "#047857" }}>
                        {promoChipLabel(item.promo_code_snapshot)}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm" style={{ color: "#6b7280" }}>{item.notes}</p>
                    )}
                  </td>
                  <td className="text-right py-2 whitespace-nowrap" style={{ color: "#000000" }}>
                    {formatQuantityWithUnit(
                      item.quantity,
                      item.unit_label_snapshot,
                      item.product?.unit?.precision ?? 2
                    )}
                  </td>
                  <td className="text-right py-2" style={{ color: "#000000" }}>
                    {money(item.unit_price)}
                    {/* A recurring line says so on the CUSTOMER's copy too:
                        "Rp 500.000/bulan" against a 12-period total is not
                        the same offer as "Rp 500.000". The snapshot travels
                        on the stored row, so the PDF keeps saying it after
                        the product is re-typed. */}
                    {billingPeriodSuffix(item.billing_period) && (
                      <span style={{ color: "#6b7280" }}>
                        {billingPeriodSuffix(item.billing_period)}
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2" style={{ color: "#000000" }}>
                    {Number(item.discount_value) > 0
                      ? discountLabel(item.discount_type, item.discount_value, currency)
                      : "-"}
                  </td>
                  <td className="text-right py-2" style={{ color: "#000000" }}>
                    {money(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end" style={{ color: "#000000" }}>
            <div className="w-72">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{money(quotation.subtotal)}</span>
              </div>
              {/* A26: the promo is ALREADY inside Subtotal, so it is a caption
                  and never a third minus row - a third row would make the
                  column the customer is adding up stop adding up. */}
              {showPromo && (
                <p className="text-xs mb-2" style={{ color: "#6b7280" }}>
                  Termasuk promo {money(promoTotal)}
                </p>
              )}
              <div className="flex justify-between mb-2">
                <span>
                  Diskon
                  {Number(quotation.discount_value) > 0
                    ? ` (header ${discountLabel(quotation.discount_type, quotation.discount_value, currency)})`
                    : ""}
                </span>
                <span>- {money(quotation.discount_total)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Jumlah kena pajak</span>
                <span>{money(quotation.taxable_amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>PPN {formatPercent(quotation.tax_rate)}%</span>
                <span>{money(quotation.tax_total)}</span>
              </div>
              <div
                className="flex justify-between font-bold text-lg border-t pt-2"
                style={{ borderColor: "#1f2937" }}
              >
                <span>Grand Total</span>
                <span>{money(quotation.grand_total)}</span>
              </div>
              {/* THE RATE AND ITS DATE, printed with the totals (spec I10), and
                  the RUPIAH EQUIVALENT of the PPN and the grand total under
                  them - this block already asserts a PPN rate, and an
                  Indonesian tax document is read in rupiah. */}
              {hasRate && (
                <>
                  <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{rateNote}</p>
                  <div className="flex justify-between text-xs mt-1" style={{ color: "#4b5563" }}>
                    <span>PPN dalam {base}</span>
                    <span>{baseMoney(Number(quotation.tax_total) * rateNumber)}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "#4b5563" }}>
                    <span>Grand Total dalam {base}</span>
                    <span>{baseMoney(Number(quotation.grand_total) * rateNumber)}</span>
                  </div>
                </>
              )}
              {/* Kept VERBATIM (spec I10). */}
              <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{taxNote}</p>
            </div>
          </div>

          {(quotation.payment_terms || quotation.terms) && (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
              {quotation.payment_terms && (
                <div className="mb-4">
                  <h3 className="font-bold mb-1" style={{ color: "#000000" }}>Termin pembayaran</h3>
                  <p className="text-sm" style={{ color: "#4b5563" }}>{quotation.payment_terms}</p>
                </div>
              )}
              {quotation.terms && (
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "#000000" }}>Syarat &amp; ketentuan</h3>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "#4b5563" }}>
                    {quotation.terms}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PHASE 4 (spec I11 / A6 / 0.12): the acceptance link.
              This is only possible now because `public_code` is minted the
              moment the quotation first reaches `sent` - by publish OR by
              approval - and the web's publish no longer carries an attachment,
              so the PDF is rasterised AFTER the code exists. Before that, the
              PDF was built from a draft that had no code to print.
              The URL is printed as TEXT, not as an <a>: html2canvas rasterises
              the page, so a hyperlink would not survive anyway, and a customer
              reading a printed copy needs the address itself. Inline colours,
              like every other element here - html2canvas cannot resolve the
              app's CSS custom properties. */}
          {acceptanceLink && (
            <div className="mt-8 pt-4 border-t" style={{ borderColor: "#e5e7eb" }}>
              <h3 className="font-bold mb-1 text-sm" style={{ color: "#000000" }}>
                Setujui penawaran ini secara online
              </h3>
              <p className="text-sm" style={{ color: "#4b5563" }}>
                Buka tautan berikut untuk menyetujui penawaran ini:
              </p>
              <p className="text-sm font-medium break-all" style={{ color: "#1d4ed8" }}>
                {acceptanceLink}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
