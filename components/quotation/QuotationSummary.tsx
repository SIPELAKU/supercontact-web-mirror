"use client";

import { currencySymbol, formatMoney, formatPercent, normalizeCurrencyCode } from "@/lib/helper/currency";
import type { DiscountType, QuotationTotals } from "@/lib/types/Quotation";
import { AppInput } from "../ui/app-input";
import { AppSelect } from "../ui/app-select";

/**
 * Every number here is server-computed (POST /quotations/preview, or the
 * stored row when the quotation is no longer a draft). The card holds no
 * arithmetic of its own; before the first preview arrives it shows the local
 * subtotal and dashes, never a guessed tax.
 */
interface SummaryCardProps {
  totals: QuotationTotals | null;
  /** Local `sum(qty x unit price)` shown until the first preview lands. */
  fallbackSubtotal: number;
  /**
   * The last preview FAILED, so there is no server subtotal. The local sum is
   * derived from catalogue prices, which a resolved price legitimately differs
   * from - printing it would state a number the customer will never see. It
   * shows the same dash the other rows already use.
   */
  previewFailed?: boolean;
  /** Tax basis from the company defaults, so the PPN label reads right even before a preview. */
  defaultTaxRate?: string | null;
  defaultPricesIncludeTax?: boolean | null;
  headerDiscountType: DiscountType;
  headerDiscountValue: number;
  onHeaderDiscountChange: (type: DiscountType, value: number) => void;
  /** Policy refusal that names the header discount (details.header). */
  headerError?: string;
  /** Hint from GET /quotations/defaults: the company's discount ceiling. */
  maxDiscountPercent?: string | null;
  readOnly?: boolean;
  previewing?: boolean;
  /**
   * COMMERCIAL Phase 5 (spec I8). The quotation's currency - every amount in
   * this card prints in it. Defaults to the company currency, so a caller that
   * has not been updated keeps printing rupiah exactly as before.
   */
  currency?: string;
  /** "Kurs 1 USD = Rp 16.250 per 6 Sep 2026", or "" in the company currency. */
  exchangeRateNote?: string;
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  const cls = bold ? "text-foreground font-bold text-lg" : "text-foreground font-medium";
  const valCls = bold ? "text-foreground font-bold text-lg" : "text-foreground font-semibold";
  return (
    <div className="flex justify-between items-center">
      <span className={cls}>{label}</span>
      <span className={valCls}>{value}</span>
    </div>
  );
}

export default function SummaryCard({
  totals,
  fallbackSubtotal,
  previewFailed = false,
  defaultTaxRate,
  defaultPricesIncludeTax,
  headerDiscountType,
  headerDiscountValue,
  onHeaderDiscountChange,
  headerError,
  maxDiscountPercent,
  readOnly = false,
  previewing = false,
  currency,
  exchangeRateNote = "",
}: SummaryCardProps) {
  const pending = "-";
  const taxRate = totals?.tax_rate ?? defaultTaxRate ?? null;
  const includesTax = totals?.prices_include_tax ?? defaultPricesIncludeTax ?? null;

  // The preview's answer wins - it is the freshest statement of what the server
  // would save - then whatever the form passed down.
  const code = normalizeCurrencyCode(totals?.currency || currency);
  const money = (value: string | number | null | undefined) => formatMoney(value, code);

  // The amount-discount option label used to be the literal 'Rp' (spec I8): on
  // a USD quotation that read as "discount 100 rupiah" on a line the server
  // discounts by 100 dollars.
  const discountTypeOptions: { value: DiscountType; label: string }[] = [
    { value: "percent", label: "%" },
    { value: "amount", label: currencySymbol(code) },
  ];

  /**
   * A26 - THE PROMO IS SHOWN, NOT DOUBLE-COUNTED.
   *
   * This card is an ADDITIVE ledger (Subtotal, - Diskon baris, - Diskon header,
   * taxable, PPN, grand total) and the promotion is ALREADY INSIDE `subtotal`,
   * because A7 folds it into `unit_price` and gross = unit_price x quantity.
   * A third minus row would make the visible column stop adding up - on the
   * screen AND on the PDF.
   *
   * So it is a muted caption directly under Subtotal, visually OUTSIDE the
   * ledger, with no minus prefix.
   */
  const promoTotal = totals?.promo_discount_total ?? null;
  const showPromo = promoTotal !== null && promoTotal !== undefined && Number(promoTotal) > 0;

  return (
    <section className="flex justify-end">
      <aside className="w-full md:w-[26rem] space-y-3 p-6">
        <Row
          label="Subtotal"
          value={
            totals
              ? money(totals.subtotal)
              : previewFailed
                ? pending
                : money(fallbackSubtotal)
          }
        />

        {/* A26: informational, outside the ledger, NO minus prefix. */}
        {showPromo && (
          <p className="-mt-2 text-xs text-gray-500">
            Termasuk promo {money(promoTotal)}
          </p>
        )}

        <Row label="Diskon baris" value={totals ? `- ${money(totals.line_discount_total)}` : pending} />

        <div className="space-y-2">
          <div className="flex justify-between items-center gap-3">
            <span className="text-foreground font-medium">Diskon header</span>
            <span className="text-foreground font-semibold">
              {totals ? `- ${money(totals.discount_amount)}` : pending}
            </span>
          </div>
          <div className="flex gap-2 items-start">
            <div className="w-24">
              <AppSelect
                aria-label="Tipe diskon header"
                value={headerDiscountType}
                onChange={(e) =>
                  onHeaderDiscountChange(e.target.value as DiscountType, headerDiscountValue)
                }
                options={discountTypeOptions}
                isBgWhite
                height="40px"
                rounded="8px"
                disabled={readOnly}
              />
            </div>
            <div className="flex-1">
              <AppInput
                type="number"
                aria-label="Nilai diskon header"
                placeholder="0"
                value={headerDiscountValue}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (Number.isNaN(val) || val < 0) val = 0;
                  onHeaderDiscountChange(headerDiscountType, val);
                }}
                inputProps={{ min: 0, step: headerDiscountType === "percent" ? 0.01 : 1 }}
                endIcon={
                  <span className="text-gray-500 font-medium">
                    {headerDiscountType === "percent" ? "%" : currencySymbol(code)}
                  </span>
                }
                isBgWhite
                height="40px"
                rounded="8px"
                disabled={readOnly}
                error={!!headerError}
                helperText={
                  headerError ??
                  (maxDiscountPercent && !readOnly
                    ? `Batas kebijakan diskon: ${formatPercent(maxDiscountPercent)}%`
                    : undefined)
                }
              />
            </div>
          </div>
        </div>

        <Row label="Jumlah kena pajak" value={totals ? money(totals.taxable_amount) : pending} />
        <Row
          label={`PPN ${taxRate !== null ? `${formatPercent(taxRate)}%` : ""}`.trim()}
          value={totals ? money(totals.tax_total) : pending}
        />

        <div className="border-t border-border pt-3">
          <Row label="Grand Total" value={totals ? money(totals.grand_total) : pending} bold />
          {/* The rate that PRICED this quotation, beside the totals it produced
              (spec I8 / I10) - so a reader never has to ask which rate applied. */}
          {exchangeRateNote && (
            <p className="text-xs text-gray-500 mt-1">{exchangeRateNote}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {includesTax === null
              ? ""
              : includesTax
                ? "Harga sudah termasuk PPN"
                : "Harga belum termasuk PPN"}
            {previewing ? " · menghitung…" : ""}
          </p>
        </div>
      </aside>
    </section>
  );
}
