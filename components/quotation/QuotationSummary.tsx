"use client";

import { formatPercent, formatRupiah } from "@/lib/helper/currency";
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
}

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "%" },
  { value: "amount", label: "Rp" },
];

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
}: SummaryCardProps) {
  const pending = "-";
  const taxRate = totals?.tax_rate ?? defaultTaxRate ?? null;
  const includesTax = totals?.prices_include_tax ?? defaultPricesIncludeTax ?? null;

  return (
    <section className="flex justify-end">
      <aside className="w-full md:w-[26rem] space-y-3 p-6">
        <Row
          label="Subtotal"
          value={
            totals
              ? formatRupiah(totals.subtotal)
              : previewFailed
                ? pending
                : formatRupiah(fallbackSubtotal)
          }
        />
        <Row label="Diskon baris" value={totals ? `- ${formatRupiah(totals.line_discount_total)}` : pending} />

        <div className="space-y-2">
          <div className="flex justify-between items-center gap-3">
            <span className="text-foreground font-medium">Diskon header</span>
            <span className="text-foreground font-semibold">
              {totals ? `- ${formatRupiah(totals.discount_amount)}` : pending}
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
                options={DISCOUNT_TYPE_OPTIONS}
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
                    {headerDiscountType === "percent" ? "%" : "Rp"}
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

        <Row label="Jumlah kena pajak" value={totals ? formatRupiah(totals.taxable_amount) : pending} />
        <Row
          label={`PPN ${taxRate !== null ? `${formatPercent(taxRate)}%` : ""}`.trim()}
          value={totals ? formatRupiah(totals.tax_total) : pending}
        />

        <div className="border-t border-border pt-3">
          <Row label="Grand Total" value={totals ? formatRupiah(totals.grand_total) : pending} bold />
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
