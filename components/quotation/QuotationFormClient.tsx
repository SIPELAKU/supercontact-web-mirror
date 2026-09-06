"use client";

import ClientDetailsCard from "@/components/quotation/ClientDetailForm";
import TermsCard from "@/components/quotation/NotesSection";
import ProductsServicesCard, {
  round2,
  type PickerProduct,
} from "@/components/quotation/ProductsServicesTable";
import SummaryCard from "@/components/quotation/QuotationSummary";
import { QuotationStatusChip } from "@/components/quotation/QuotationTable";
import PageHeader from "@/components/ui/page-header";
import {
  createQuotation,
  decideQuotationApproval,
  fetchQuotationDefaults,
  fetchQuotationDeliveries,
  previewQuotationTotals,
  recallQuotationApproval,
  reviseQuotation,
  sendQuotation,
  submitQuotationForApproval,
  transitionQuotationStatus,
  updateQuotation,
} from "@/lib/api/quotations";
import type { QuotationLead } from "@/lib/api/quotations";
import { publicQuotationUrl } from "@/lib/api/quotations-public";
import {
  QUOTATION_STATUS,
  canDecideApproval,
  canDecideQuotation,
  canEditQuotation,
  canRecallQuotation,
  canReviseQuotation,
  canSendQuotation,
  normalizeQuotationStatus,
  quotationStatusMeta,
} from "@/lib/constants/quotation-status";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { formatMoney, formatPercent, normalizeCurrencyCode } from "@/lib/helper/currency";
import {
  buildPublishFormData,
  currencyToSend,
  exchangeRateNote,
  quotationCurrencyOptions,
} from "@/lib/utils/quotationForm";
import { fetchExchangeRateCurrencies } from "@/lib/api/exchange-rates";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { useQuotationLeads } from "@/lib/hooks/useQuotationLeads";
import { notify } from "@/lib/notifications";
import { CATALOGUE_LIMIT, useGetProductStore } from "@/lib/store/product";
import { customFieldErrorsByKey, validateCustomFieldValues } from "@/lib/utils/customFieldValues";
import QuotationCustomFieldsCard from "@/components/quotation/QuotationCustomFieldsCard";
import QuotationPriceListExplainer from "@/components/quotation/QuotationPriceListExplainer";
import QuotationPdfDocument, {
  QUOTATION_PDF_NODE_ID,
} from "@/components/quotation/QuotationPdfDocument";
import { generateQuotationPdf, quotationPdfFilename } from "@/lib/utils/quotationPdf";
import type {
  DiscountType,
  ItemRow,
  Quotation,
  QuotationDefaults,
  QuotationDelivery,
  QuotationDetail,
  QuotationItemPayload,
  QuotationTotals,
} from "@/lib/types/Quotation";
import { mapQuotationException, type MappedQuotationError } from "@/lib/utils/quotation-errors";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { listProductUnits } from "@/lib/api/products";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AppButton } from "../ui/app-button";
import { AppInput } from "../ui/app-input";
import { AppTextarea } from "../ui/app-textarea";
import { ConfirmationPopup } from "../ui/confirmation-popup";
import QuotationSuccessModal from "./QuotationSuccessModal";
import QuotationApprovalCard from "./QuotationApprovalCard";
import QuotationSendDialog from "./QuotationSendDialog";

interface QuotationFormClientProps {
  initialData?: QuotationDetail | Quotation;
}

type Decision = "accepted" | "rejected";

const PREVIEW_DEBOUNCE_MS = 300;

const newRow = (): ItemRow => ({
  product_id: "",
  title: "",
  sku: "",
  desc: "",
  qty: 1,
  unitPrice: 0,
  listPrice: 0,
  discountType: "percent",
  discountValue: 0,
  unitLabel: null,
  unitPrecision: 2,
  attributes: {},
  overridePrice: null,
  overrideReason: "",
  overrideAllowed: false,
  priceList: null,
  billingPeriod: null,
  // A row that has never been saved has no server-computed margin, and the
  // preview does not carry one. Null, never 0 - see ItemRow.
  costSnapshot: null,
  marginPercent: null,
  // COMMERCIAL Phase 5 (spec I8). `unitId` null = the product's own unit,
  // which is what every pre-Phase-5 line means; everything else is read-only
  // context the server decides and the preview fills in.
  unitId: null,
  unitOptions: [],
  variantValues: {},
  parentName: null,
  bundleComponents: null,
  promoCode: null,
  promoDiscountAmount: null,
  prePromoUnitPrice: null,
});

function toDateInput(value?: string | null, fallback?: Date): string {
  const date = value ? new Date(value) : fallback;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function safeDate(value?: string | null, pattern = "dd MMM yyyy"): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, pattern);
}

/**
 * Form rows from a stored quotation. Everything comes from the line itself -
 * `unit_price`, `list_price` and the name/SKU snapshots - never from the live
 * `product` row, which may have been renamed or re-priced since.
 */
function rowsFromQuotation(row: Quotation): ItemRow[] {
  return (row.items ?? []).map((item) => ({
    product_id: item.product_id,
    title: item.product_name_snapshot ?? item.product?.product_name ?? "",
    sku: item.sku_snapshot ?? item.product?.sku ?? "",
    desc: item.notes ?? "",
    qty: Number(item.quantity) || 1,
    unitPrice: Number(item.unit_price) || 0,
    listPrice: Number(item.list_price ?? item.unit_price) || 0,
    discountType: item.discount_type ?? "percent",
    discountValue: Number(item.discount_value ?? item.discount ?? 0) || 0,
    // The stored snapshot is the label the line was written with; the
    // precision is only a step hint and comes from the live unit (2 if none).
    unitLabel: item.unit_label_snapshot ?? item.product?.unit?.name ?? null,
    unitPrecision: item.product?.unit?.precision ?? 2,
    attributes: item.product?.custom_fields ?? {},
    // A stored manual override is seeded back into the controls. Without this,
    // reopening a draft and pressing Save would silently re-resolve the line
    // and lose both the price the seller agreed and the reason for it.
    overridePrice: item.price_source === "manual" ? Number(item.unit_price) || 0 : null,
    overrideReason: item.price_source === "manual" ? item.override_reason ?? "" : "",
    overrideAllowed: item.override_allowed ?? false,
    priceList: item.price_list ?? null,
    billingPeriod: item.billing_period ?? null,
    // Phase 4 (spec I3). Both are already `null` on the response for a caller
    // without `quotations:margin:view` (the API suppresses them), so `?? null`
    // is the whole gate - the column below hides itself when every row is null.
    costSnapshot: item.cost_snapshot ?? null,
    marginPercent: item.margin_percent ?? null,
    // COMMERCIAL Phase 5 (spec I8). Seeded from the STORED line, never from the
    // live catalogue: a read-only view has to render the variant chips, the
    // bundle sub-block and the promo chip before any preview runs, and a saved
    // quotation is a SNAPSHOT - the product may have been re-typed since.
    unitId: item.unit_id ?? null,
    // The conversions are loaded per product by the picker; a stored line seeds
    // an empty list and shows its snapshot label until then.
    unitOptions: [],
    variantValues: item.product?.variant_values ?? {},
    parentName: item.product?.parent?.product_name ?? null,
    bundleComponents: item.bundle_components ?? null,
    promoCode: item.promo_code_snapshot ?? null,
    promoDiscountAmount: item.promo_discount_amount ?? null,
    prePromoUnitPrice: item.pre_promo_unit_price ?? null,
  }));
}

/** The stored header + lines in the preview shape, so one summary serves both. */
function totalsFromQuotation(row: Quotation): QuotationTotals {
  return {
    currency: row.currency,
    tax_rate: row.tax_rate,
    prices_include_tax: row.prices_include_tax,
    subtotal: row.subtotal,
    line_discount_total: row.line_discount_total,
    discount_type: row.discount_type,
    discount_value: row.discount_value,
    discount_amount: row.discount_amount,
    discount_total: row.discount_total,
    taxable_amount: row.taxable_amount,
    tax_total: row.tax_total,
    grand_total: row.grand_total,
    // COMMERCIAL Phase 5 (spec D6 / A26). `promo_discount_total` is ALREADY
    // inside `subtotal`; the summary prints it as a caption, never as a row.
    exchange_rate_used: row.exchange_rate_used ?? null,
    exchange_rate_date: row.exchange_rate_date ?? null,
    promo_discount_total: row.promo_discount_total ?? null,
    lines: (row.items ?? []).map((item, index) => {
      const gross = round2(Number(item.unit_price) * Number(item.quantity));
      const discounted = Number(item.discount_amount) + Number(item.header_discount_share ?? 0);
      return {
        index,
        product_id: item.product_id,
        quantity: item.quantity,
        list_price: item.list_price,
        unit_price: item.unit_price,
        gross: gross.toFixed(2),
        discount_type: item.discount_type,
        discount_value: item.discount_value,
        discount_amount: item.discount_amount,
        header_discount_share: item.header_discount_share ?? "0.00",
        // Both tax modes satisfy taxable = line_total - tax (spec E1 step 6).
        taxable_amount: round2(Number(item.line_total) - Number(item.tax_amount)).toFixed(2),
        tax_rate: item.tax_rate,
        tax_amount: item.tax_amount,
        line_total: item.line_total,
        price_source: item.price_source,
        product_name_snapshot: item.product_name_snapshot ?? item.product?.product_name ?? "",
        sku_snapshot: item.sku_snapshot ?? item.product?.sku ?? "",
        effective_discount_percent: gross > 0 ? round2((discounted / gross) * 100).toFixed(2) : "0.00",
        unit_label_snapshot: item.unit_label_snapshot ?? null,
        unit_precision: item.product?.unit?.precision ?? 2,
        // Phase 2 (S3-6). Read-only mode returns early from the preview effect,
        // so without these five a saved or sent quotation would render its
        // price source from the CODE fallback instead of the list NAME - on the
        // very view a customer-facing seller looks at most.
        price_list: item.price_list ?? null,
        resolved_unit_price: item.resolved_unit_price ?? null,
        override_allowed: item.override_allowed ?? false,
        override_reason: item.override_reason ?? null,
        tier_min_quantity: item.tier_min_quantity ?? null,
        billing_period: item.billing_period ?? null,
        // Phase 5: the read-only view renders the same chips and sub-block the
        // editable form does, from the stored snapshot.
        promo_code: item.promo_code_snapshot ?? null,
        promo_discount_amount: item.promo_discount_amount ?? null,
        pre_promo_unit_price: item.pre_promo_unit_price ?? null,
        unit_id: item.unit_id ?? null,
        unit_label: item.unit_label_snapshot ?? null,
        unit_factor_used: item.unit_factor_used ?? null,
        bundle_components: item.bundle_components ?? null,
      };
    }),
    // A stored quotation was always priced with its customer's context.
    price_context: "lead",
  };
}

/** One line exactly as QuotationItemRequest accepts it - no `price` key. */
function itemPayload(row: ItemRow): QuotationItemPayload {
  const discountValue = round2(row.discountValue || 0);
  const payload: QuotationItemPayload = {
    product_id: row.product_id,
    quantity: round2(row.qty),
    notes: row.desc || "",
    discount: row.discountType === "percent" ? Math.round(discountValue) : 0,
    discount_type: row.discountType,
    discount_value: discountValue,
  };
  // Only when the seller actually set one AND it is complete: the schema
  // forbids unknown keys, and the server refuses a `unit_price` the winning
  // price list does not permit, or one sent without a reason.
  //
  // An INCOMPLETE override (price cleared, reason still empty) is deliberately
  // not sent: the preview runs on every keystroke, and sending it would turn
  // the whole summary into an error for the seconds it takes to type a reason.
  // `validateBeforeSave` refuses the save instead, so it can never be dropped
  // silently.
  if (isOverrideComplete(row)) {
    payload.unit_price = round2(row.overridePrice as number);
    payload.override_reason = row.overrideReason.trim();
  }
  // COMMERCIAL Phase 5 (spec D6 / I8). Sent ONLY when the seller picked a unit
  // other than the product's own: omitted means "the product's own unit", which
  // is exactly what every pre-Phase-5 line means and what the server assumes.
  if (row.unitId) payload.unit_id = row.unitId;
  return payload;
}

/** A row carries a manual price the server will accept the shape of. */
function isOverrideComplete(row: ItemRow): boolean {
  return row.overridePrice !== null && row.overridePrice > 0 && row.overrideReason.trim() !== "";
}


export default function QuotationFormClient({ initialData }: QuotationFormClientProps) {
  const router = useRouter();
  // `userProfile.id` answers the one question every approval control depends
  // on: is the caller the person who ASKED for the approval? A17 forbids a
  // self-approval, so the requester sees Batalkan pengajuan and never
  // Setujui/Tolak - and the server refuses it anyway if this ever drifts.
  const { getToken, userProfile } = useAuth();
  const { can } = usePermission();

  // The saved row, if any. Updated after every create, update and status
  // transition so the buttons, the chip and the PDF always describe what the
  // server has - never what the form guesses.
  const [quotation, setQuotation] = useState<Quotation | null>(initialData ?? null);
  const status = normalizeQuotationStatus(quotation?.quotation_status);
  const isNew = !quotation;
  const readOnly = !isNew && !canEditQuotation(status);

  const [defaults, setDefaults] = useState<QuotationDefaults | null>(null);

  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const { data: leadsResponse, isLoading: isLoadingLeads } = useQuotationLeads(
    1,
    100,
    clientSearchQuery,
    { enabled: isNew || clientSearchQuery.length > 0 }
  );
  const leads = useMemo(() => leadsResponse?.data?.leads || [], [leadsResponse]);

  // The picker reads the store's `catalogue` slice, never the product page's
  // list: that list carries whatever page/search/status/sort the user left
  // it at, and a picker fed from it once offered batch 3 of an archived-only
  // filter as "the catalogue" (S3-1). `fetchCatalogue` is always page 1,
  // limit 100, status=active.
  const { catalogue, fetchCatalogue } = useGetProductStore();

  // ── COMMERCIAL Phase 5: the picker searches the SERVER (spec I9 / A34) ────
  //
  // `fetchCatalogue()` was called ONCE with no arguments, for the first 100
  // active products. Dev's largest tenant holds 193, so 93 were ALREADY
  // unreachable with no error and no marker - the seller simply saw "that
  // product does not exist". Variants make that structurally worse: 20 products
  // with 6 variants each is 120 rows, and after A8 the VARIANT is the sellable
  // thing, so "a variant quotes" could not be demonstrated on a real catalogue
  // until this was fixed.
  //
  // `include_variants` is passed because `GET /products` became TOP-LEVEL ONLY
  // (E5.1) - without it the children would be unpickable entirely.
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch, 350);
  useEffect(() => {
    if (readOnly) return;
    fetchCatalogue({ search: debouncedProductSearch, includeVariants: true });
  }, [fetchCatalogue, readOnly, debouncedProductSearch]);

  // The tenant's definitions: quotation fields drive the header card and the
  // multipart `custom_fields`; product fields label the read-only line attributes.
  const { definitions: quotationDefinitions } = useCustomFieldDefinitionsFor("quotation");
  const { definitions: productDefinitions } = useCustomFieldDefinitionsFor("product");

  const [clientData, setClientData] = useState<Record<string, any>>({
    lead_id: "",
    clientName: "",
    companyName: "",
    officeLocation: "",
    phoneNumber: "",
    emailAddress: "",
    quotationTitle: "New Project Proposal",
    quotationId: "",
    issueDate: toDateInput(null, new Date()),
    expiryDate: toDateInput(null, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    salesperson: "",
    pipeline_id: "",
    // COMMERCIAL Phase 5 (spec I8). The quotation's own currency. Empty until
    // the defaults land, then the company currency - a quotation in the
    // company currency behaves exactly as it did before this phase.
    currency: "",
  });

  // ── COMMERCIAL Phase 5: the quotation currency (spec I8 / A16 / A25) ─────
  //
  // The picker is fed by `GET /exchange-rates/currencies` PLUS the company
  // default, so a currency with no rate is never offered and the A25 refusal -
  // "belum ada kurs yang berlaku pada tanggal itu" - never reaches a seller as
  // a save error on work they have already typed.
  //
  // Changing it re-prices EVERY line through the existing debounced preview.
  // The Kanal Penjualan select is the precedent: a header field that is a
  // pricing input has to be in the preview's dependency array, or the previous
  // value's prices stay on screen.
  const { data: currencyData } = useQuery({
    queryKey: ["exchange-rate-currencies"],
    queryFn: async () => fetchExchangeRateCurrencies(await getToken()),
    // Read-only rows never re-price, so they never need the picker's options.
    enabled: !readOnly,
  });
  // The stored row wins for a saved quotation - it is what the document says -
  // then the defaults, then the rates response. Never a hard-coded "IDR".
  const companyCurrency = normalizeCurrencyCode(
    defaults?.currency ?? currencyData?.base_currency ?? quotation?.currency
  );
  const currencyOptions = useMemo(
    () =>
      quotationCurrencyOptions(companyCurrency, [
        ...(currencyData?.currencies ?? []),
        // THE STORED CURRENCY IS ALWAYS AN OPTION, even when the rates query is
        // disabled (read-only) or the tenant has since DELETED that rate (A27
        // makes a rate genuinely deletable). Without it the select would render
        // BLANK on a saved USD quotation - on the very view an approver reads.
        // `quotationCurrencyOptions` normalises and de-duplicates, so an absent
        // one folds into the base entry rather than adding a phantom row.
        quotation?.currency ?? "",
      ]),
    [companyCurrency, currencyData, quotation?.currency]
  );
  const [items, setItems] = useState<ItemRow[]>([newRow()]);
  const [headerDiscountType, setHeaderDiscountType] = useState<DiscountType>("percent");
  const [headerDiscountValue, setHeaderDiscountValue] = useState(0);
  const [terms, setTerms] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  // Header-level custom fields (strict against the `quotation` definitions).
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const [totals, setTotals] = useState<QuotationTotals | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<MappedQuotationError | null>(null);
  const [saveError, setSaveError] = useState<MappedQuotationError | null>(null);

  /**
   * The currency EVERY amount on this screen is printed in.
   *
   * Preference order matters: the preview's answer is the freshest statement of
   * what the server would save, the stored row is what a read-only quotation
   * actually says, and the picker is what the seller just chose. A stale
   * fallback here prints the wrong symbol on real money.
   */
  const displayCurrency = normalizeCurrencyCode(
    totals?.currency || clientData.currency || quotation?.currency || companyCurrency
  );
  /**
   * "Kurs 1 USD = Rp 16.250 per 6 Sep 2026" (spec I8 / I10).
   *
   * The rate that PRICED the quotation, not today's - the preview answers it
   * for a draft and the stored row carries it afterwards, so a published
   * document and the form that made it always say the same number.
   */
  const rateNote = exchangeRateNote(
    displayCurrency,
    totals?.exchange_rate_used ?? quotation?.exchange_rate_used ?? null,
    totals?.exchange_rate_date ?? quotation?.exchange_rate_date ?? null,
    companyCurrency,
    (value) => formatMoney(value, companyCurrency)
  );


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // `publicUrl` is the CUSTOMER-facing /q/{code} link (A6), not the internal
  // /sales/quotation/{id} URL the modal used to copy - which required a login
  // and a `quotations` grant, so pasting it to a customer produced a login
  // screen.
  const [successData, setSuccessData] = useState({ id: "", number: "", pdfUrl: "", publicUrl: "" });

  // What the hidden PDF template renders: the STORED row after a draft save.
  const [pdfQuotation, setPdfQuotation] = useState<Quotation | null>(null);

  const [decision, setDecision] = useState<Decision | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  // ── Phase 4 governance state ─────────────────────────────────────────────
  //
  // `governanceBusy` names the action in flight rather than being a bare
  // boolean, so every button can disable itself while exactly one of them
  // shows a spinner.
  const [governanceBusy, setGovernanceBusy] = useState<
    null | "submit" | "recall" | "approve" | "reject" | "revise"
  >(null);
  // Bumped after every governance write so QuotationApprovalCard reloads its
  // timeline from the server rather than being handed a guess.
  const [approvalSeq, setApprovalSeq] = useState(0);
  const [approvalDecision, setApprovalDecision] = useState<null | "approve" | "reject">(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [reviseOpen, setReviseOpen] = useState(false);
  const [reviseReason, setReviseReason] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
  // The delivery rows for THIS quotation. `null` = not loaded yet, which is
  // deliberately different from `[]` = loaded and genuinely empty: only the
  // second one may claim "belum ada pengiriman tercatat" (A20 / 0.31).
  const [deliveries, setDeliveries] = useState<QuotationDelivery[] | null>(null);

  // ── Company defaults (tax basis, terms, discount ceiling) ────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const data = await fetchQuotationDefaults(token);
        if (!cancelled) setDefaults(data);
      } catch (err) {
        console.error("Failed to load quotation defaults:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  // A new quotation starts from the company's terms. Seeded once, and only
  // into fields the user has not typed into.
  const termsSeededRef = useRef(false);
  useEffect(() => {
    if (!defaults || !isNew || termsSeededRef.current) return;
    termsSeededRef.current = true;
    setTerms((current) => current || defaults.terms || "");
    setPaymentTerms((current) => current || defaults.payment_terms || "");
    // COMMERCIAL Phase 5 (spec I8): a new quotation starts in the COMPANY's
    // currency, which is exactly today's behaviour. `currencyToSend` then keeps
    // the key off the request entirely while it stays the default (A23).
    setClientData((current: Record<string, any>) => ({
      ...current,
      currency: current.currency || normalizeCurrencyCode(defaults.currency),
    }));
  }, [defaults, isNew]);

  // ── Seed from the stored row ─────────────────────────────────────────────
  useEffect(() => {
    if (!initialData) return;
    setQuotation(initialData);
    setClientData({
      lead_id: initialData.lead?.id || initialData.lead_id || "",
      clientName: initialData.lead?.contact?.name || "",
      companyName: initialData.lead?.contact?.company || "",
      officeLocation: initialData.lead?.office_location || "",
      phoneNumber: initialData.lead?.contact?.phone_number || "",
      emailAddress: initialData.lead?.contact?.email || "",
      quotationTitle: initialData.quotation_title || "New Project Proposal",
      quotationId: initialData.quotation_number || "",
      issueDate: toDateInput(initialData.created_at, new Date()),
      expiryDate: toDateInput(initialData.expire_date),
      salesperson: initialData.lead?.user?.fullname || "",
      // Phase 3: seed the STORED channel, not "none". The picker and the
      // debounced preview both read this field, so leaving it out made an
      // edit re-price against the LEAD's channel (the server falls back to
      // `leads.sales_channel_id` when the preview sends null) while the save
      // fell back to `quotation.sales_channel_id` - the totals on screen were
      // then not the totals stored.
      //
      // Clearing the channel back to "Tanpa kanal" on an EXISTING quotation
      // is not expressible today: the update path treats an absent /
      // null `sales_channel_id` as "keep the stored one", so the picker can
      // move the channel but not remove it. Making it removable needs an API
      // change (a sentinel or `exclude_unset` handling) - recorded as a
      // request to the CONTEXT-API slice, not worked around here.
      sales_channel_id: initialData.sales_channel_id ?? "",
      // Phase 4 (spec I10): the deal acceptance will move. Seeded from the
      // stored row for the same reason the channel is - the picker and the
      // save must agree about what is currently linked.
      pipeline_id: initialData.pipeline_id ?? "",
      // COMMERCIAL Phase 5 (spec I8). Seeded from the STORED row: the document
      // says what money it is in, and a picker that opened on the company
      // default would re-price a USD draft into rupiah on the first edit.
      currency: initialData.currency ?? "",
    });

    // Only the quotation's own lines. `item_others` are Proposal-stage
    // suggestions, not part of this quotation.
    const rows = rowsFromQuotation(initialData);
    setItems(rows.length > 0 ? rows : [newRow()]);
    setHeaderDiscountType(initialData.discount_type ?? "percent");
    setHeaderDiscountValue(Number(initialData.discount_value) || 0);
    setTerms(initialData.terms ?? "");
    setPaymentTerms(initialData.payment_terms ?? "");
    setCustomFields({ ...(initialData.custom_fields ?? {}) });
    setTotals(totalsFromQuotation(initialData));
  }, [initialData]);

  // Ensure the current lead is in the list when editing
  const leadsWithCurrent = useMemo(() => {
    if (initialData?.lead && !leads.find((l) => l.id === initialData.lead.id)) {
      return [initialData.lead as unknown as QuotationLead, ...leads];
    }
    return leads;
  }, [leads, initialData]);

  // Picker options: the lead's Proposal-stage products first, then the active
  // catalogue, keyed by product id.
  //
  // Lead items carry no status (GET /quotations/lead), so they are checked
  // against the active catalogue: an archived product would only earn a 400
  // from the preview and the save. When the catalogue fetch came back full
  // (CATALOGUE_LIMIT rows) it may be truncated, so absence from it is not
  // proof of archival and the lead item is kept - the server filters
  // archived products out of the lead payload as well.
  // The lead the form is currently bound to. Hoisted to component scope in
  // Phase 3 because the price-list explainer needs its `contact_id` and its
  // CRM-company brief too, not only its Proposal-stage items.
  const selectedLead = useMemo(
    () => leadsWithCurrent.find((l) => l.id === clientData.lead_id),
    [leadsWithCurrent, clientData.lead_id]
  );

  const availableProducts = useMemo<PickerProduct[]>(() => {
    const active = catalogue.filter((p) => p.status !== "archived");
    const activeIds = new Set(active.map((p) => p.id));
    const catalogueMayBeTruncated = catalogue.length >= CATALOGUE_LIMIT;
    const leadItems: PickerProduct[] = (selectedLead?.items ?? [])
      .filter((item) => activeIds.has(item.id) || catalogueMayBeTruncated)
      .map((item) => ({
        id: item.id,
        product_name: item.product_name,
        sku: item.sku,
        price: item.price,
        unit: item.unit ?? null,
        custom_fields: item.custom_fields ?? {},
        // Phase 2 (spec D6): the lead picker knows this customer's price.
        resolvedPrice: item.resolved_unit_price ?? null,
      }));
    const seen = new Set(leadItems.map((p) => p.id));
    const rest: PickerProduct[] = active
      .filter((p) => !seen.has(p.id))
      .map((p) => ({
        id: p.id,
        product_name: p.product_name,
        sku: p.sku,
        price: p.price,
        unit: p.unit,
        custom_fields: p.custom_fields,
        billing_period: p.billing_period,
        // COMMERCIAL Phase 5 (spec I8 / I9): a variant's axes, and the family
        // it belongs to, so the option label can name both.
        variant_values: p.variant_values ?? {},
        parent_name: p.parent?.product_name ?? null,
      }));
    return [...leadItems, ...rest];
  }, [catalogue, selectedLead]);

  // ── COMMERCIAL Phase 5: the per-line unit select's options (spec I8) ──────
  //
  // One request per DISTINCT product actually on a line - not per line, and not
  // per catalogue row. A tenant with no conversions gets an empty list and the
  // Qty cell keeps its plain unit label, which is exactly the pre-Phase-5 look.
  const lineProductIds = useMemo(
    () => Array.from(new Set(items.map((row) => row.product_id).filter(Boolean))),
    [items]
  );
  const unitQueries = useQueries({
    queries: lineProductIds.map((productId) => ({
      queryKey: ["product-units", "quotation-line", productId],
      queryFn: async () => listProductUnits(await getToken(), productId),
      enabled: !readOnly,
      // Conversions change about as often as the catalogue does, and the form
      // re-runs this effect on every row edit.
      staleTime: 5 * 60 * 1000,
    })),
  });
  const unitOptionsByProduct = useMemo(() => {
    const map = new Map<string, { id: string; label: string; precision: number }[]>();
    lineProductIds.forEach((productId, index) => {
      const rows = unitQueries[index]?.data?.items ?? [];
      map.set(
        productId,
        rows
          // Only ACTIVE conversions can price a new line; a deactivated one
          // still explains a stored line but must not be offerable.
          .filter((row) => row.is_active)
          .map((row) => ({
            id: row.unit_id,
            label: row.unit?.name ?? row.unit_id,
            precision: row.unit?.precision ?? 2,
          }))
      );
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineProductIds, unitQueries.map((query) => query.dataUpdatedAt).join("|")]);

  // The rows the table renders: form state plus the conversions loaded above,
  // so the select has options without the table owning a request.
  const itemsWithUnits = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        unitOptions:
          row.unitOptions.length > 0
            ? row.unitOptions
            : unitOptionsByProduct.get(row.product_id) ?? [],
      })),
    [items, unitOptionsByProduct]
  );

  // ── Server-side preview (debounced) ──────────────────────────────────────
  const previewSeq = useRef(0);
  useEffect(() => {
    if (readOnly) return;
    const ready = items.length > 0 && items.every((row) => row.product_id && row.qty > 0);
    if (!ready) {
      setPreviewing(false);
      return;
    }
    const seq = ++previewSeq.current;
    setPreviewing(true);
    // A change to the rows makes the last save's errors stale.
    setSaveError(null);
    const timer = setTimeout(async () => {
      try {
        const token = await getToken();
        const result = await previewQuotationTotals(token, {
          items: items.map(itemPayload),
          discount_type: headerDiscountType,
          discount_value: round2(headerDiscountValue || 0),
          // The customer context prices the lines. Without it the server
          // prices with the company default list only and answers
          // `price_context: "none"` - and that same context is what an
          // override is validated against (spec A12/A14).
          lead_id: clientData.lead_id || null,
          // Phase 3: the channel is a resolution level too, so it has to be
          // carried by the PREVIEW as well as the save - and it has to be in
          // the dependency array below for the same reason `lead_id` is, or
          // the previous channel's prices stay on screen.
          sales_channel_id: clientData.sales_channel_id || null,
          // COMMERCIAL Phase 5 (spec D6, M-a). The currency is a RESOLUTION
          // INPUT, so the PREVIEW must carry it too - without it the form would
          // show company-currency prices for a quote that saves in USD, and
          // SQLModel's default `extra="ignore"` would drop it SILENTLY.
          currency: clientData.currency || null,
        });
        if (seq !== previewSeq.current) return;
        setTotals(result);
        setPreviewError(null);
      } catch (err) {
        if (seq !== previewSeq.current) return;
        setTotals(null);
        setPreviewError(mapQuotationException(err));
      } finally {
        if (seq === previewSeq.current) setPreviewing(false);
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `clientData.lead_id` belongs in here: changing the client changes the
    // price, and leaving it out left the previous customer's prices on screen.
  }, [
    items,
    headerDiscountType,
    headerDiscountValue,
    readOnly,
    getToken,
    clientData.lead_id,
    clientData.sales_channel_id,
    // Phase 5: the currency belongs here for the same reason `lead_id` and the
    // channel do - changing it changes every price on the screen.
    clientData.currency,
  ]);

  const fallbackSubtotal = useMemo(
    () => items.reduce((sum, row) => sum + round2(row.qty * Number(row.unitPrice)), 0),
    [items]
  );

  // The save's errors win over the preview's: they are the most recent word.
  const errors = saveError ?? previewError;

  // ── Phase 4: who may do what to this row ─────────────────────────────────
  //
  // Every flag below mirrors a server guard exactly (spec E5/E6/E8). None of
  // them is a substitute for the server check - they only stop the UI from
  // offering an action that would come back 400 or 403.
  const approval = quotation?.approval ?? null;
  const isRequester =
    !!approval && !!userProfile?.id && approval.requested_by === userProfile.id;
  // The caller's grant, preferring what the SERVER resolved for this request
  // (`GET /quotations/defaults`) and falling back to the profile's own
  // permission list. The fallback is not belt-and-braces: `can_approve` is a
  // NEW field, and this web build may run for a while against a leg that does
  // not send it yet - defaulting to `false` there would silently hide the
  // approve buttons from every Admin in the tenant. An explicit `false` from
  // the server still wins, because `??` only falls through on null/undefined.
  const canApproveGrant = defaults?.can_approve ?? can("quotations:approve");
  const hasRevision = quotation?.has_revision ?? false;

  // A17 (owner amendment): a request routed to its own requester because the
  // tenant has no second `quotations:approve` holder. Without this the flag is
  // written on the row, refused at the button, and the quotation is stuck on
  // `pending_approval` with recall as its only way out.
  const isSelfApproval = !!approval?.self_approved;
  const showApprove =
    !!quotation && canDecideApproval(status, canApproveGrant, isRequester, isSelfApproval);
  const showRecall = !!quotation && canRecallQuotation(status, isRequester);
  const showRevise = !!quotation && canReviseQuotation(status, hasRevision);
  const showSend = !!quotation && canSendQuotation(status);

  // `null` while unloaded; only a loaded, genuinely empty list may claim there
  // is nothing recorded.
  const deliveriesCount = deliveries?.length ?? null;
  const noDeliveriesYet = deliveriesCount === 0;
  // Rows exist but none of them actually left. The spec's zero-row case (A20 /
  // 0.31) and this one are the same situation from the customer's side -
  // nothing reached them - and the banner must not claim otherwise just
  // because a `failed` row was written.
  const allDeliveriesFailed =
    !!deliveries && deliveries.length > 0 && !deliveries.some((row) => row.status === "sent");
  const nothingDelivered = noDeliveriesYet || allDeliveriesFailed;

  // The delivery history is what decides whether the banner says "siap
  // dikirim" and whether Kirim is the primary action (A20 / 0.31). Loaded only
  // for a `sent` row - the only status that can be delivered - so a draft
  // never spends a request on it.
  useEffect(() => {
    if (!quotation?.id || !canSendQuotation(status)) {
      setDeliveries(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const rows = await fetchQuotationDeliveries(token, quotation.id);
        if (!cancelled) setDeliveries(rows);
      } catch {
        // Context, not an action: a failure leaves the banner in its neutral
        // "unknown" shape rather than asserting there were no deliveries.
        if (!cancelled) setDeliveries(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quotation?.id, status, getToken, approvalSeq]);

  // ── Row editing ──────────────────────────────────────────────────────────
  const updateQty = (index: number, qty: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty };
      return updated;
    });
  };

  const updateItemField = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => setItems((p) => [...p, newRow()]);

  const removeItem = (index: number) => setItems((p) => p.filter((_, i) => i !== index));

  const handleHeaderDiscountChange = (type: DiscountType, value: number) => {
    setHeaderDiscountType(type);
    setHeaderDiscountValue(value);
  };

  // ── Save / publish ───────────────────────────────────────────────────────
  const buildDraftForm = (): FormData => {
    const payload = new FormData();
    payload.append("action", "draft");
    payload.append("lead_id", clientData.lead_id);
    payload.append("quotation_title", clientData.quotationTitle || "Untitled Quotation");
    payload.append("expire_date", new Date(clientData.expiryDate).toISOString());
    items.forEach((row) => payload.append("items", JSON.stringify(itemPayload(row))));
    payload.append("discount_type", headerDiscountType);
    payload.append("discount_value", String(round2(headerDiscountValue || 0)));
    payload.append("terms", terms);
    payload.append("payment_terms", paymentTerms);
    // Only when set: an empty string is not a uuid and would 422, and a
    // tenant that never touches the picker keeps sending the Phase 0 form.
    if (clientData.sales_channel_id) {
      payload.append("sales_channel_id", clientData.sales_channel_id);
    }
    // COMMERCIAL Phase 5 (spec I8 / A23). Sent ONLY when it says something:
    // the endpoint reads three states, and an empty string means "clear me back
    // to the company default". `currencyToSend` owns that decision and is
    // unit-tested, because getting it wrong relabels a USD quotation as IDR
    // while leaving its USD amounts untouched.
    //
    // NOTE: FastAPI SILENTLY DROPS an undeclared multipart field - that is how
    // the Phase 4 `pipeline_id` defect shipped inert - so this and the
    // endpoint's `Form` declaration are one change, not two.
    {
      const currency = currencyToSend(
        clientData.currency,
        companyCurrency,
        quotation?.currency
      );
      if (currency) payload.append("currency", currency);
    }
    // Unlike the channel above, the deal link IS removable. `POST /send`-side
    // the API distinguishes "not sent" (leave the stored link alone) from
    // "sent empty" (unlink), which is what makes the picker's "Tanpa deal"
    // mean something on an existing quotation.
    //
    // The blank is sent ONLY when a link that EXISTS is being cleared. Sending
    // it unconditionally would unlink the deal of any quotation saved from a
    // form whose picker never rendered - it is hidden without the deals grant,
    // and a save must not silently undo what the user cannot see.
    if (clientData.pipeline_id) {
      payload.append("pipeline_id", clientData.pipeline_id);
    } else if (quotation?.pipeline_id) {
      payload.append("pipeline_id", "");
    }
    // Header custom fields travel as one JSON object string (spec A8/D5),
    // and only when the tenant has quotation definitions - a tenant without
    // them sends the Phase 0 form unchanged.
    if (quotationDefinitions.length > 0) {
      payload.append("custom_fields", JSON.stringify(prepareCustomFields().values));
    }
    return payload;
  };

  /**
   * Header custom fields as the API wants them: defined keys only, blanks as
   * null, numbers normalised. The save always writes a draft first, so the
   * visibility built-in at validation time is `draft`; the server validates
   * again and its refusal lands under the same control via `fieldsHeader`.
   */
  const prepareCustomFields = () => {
    const result = validateCustomFieldValues(quotationDefinitions, customFields, {
      entityType: "quotation",
      mode: "strict",
      enforceRequired: true,
      builtIns: { quotation_status: "draft" },
      // The draft's stored values: a key left by a DEACTIVATED definition is
      // seeded into the form with no control to clear it and must not block
      // save/send (the server keeps it too).
      storedValues: quotation?.custom_fields ?? null,
    });
    const values: Record<string, unknown> = {};
    for (const def of quotationDefinitions) {
      if (def.is_active === false) continue;
      const value = result.values[def.field_key];
      if (Object.prototype.hasOwnProperty.call(customFields, def.field_key) || value !== undefined) {
        values[def.field_key] = value === undefined || value === "" ? null : value;
      }
    }
    return { values, errors: customFieldErrorsByKey(result.errors) };
  };

  const validateBeforeSave = (): string | null => {
    if (!clientData.lead_id) return "Pilih klien terlebih dahulu";
    if (!clientData.expiryDate) return "Isi tanggal kedaluwarsa";
    if (items.length === 0) return "Tambahkan minimal satu baris produk";
    if (items.some((row) => !row.product_id)) return "Pilih produk untuk setiap baris";
    if (items.some((row) => !(row.qty > 0))) return "Qty setiap baris harus lebih dari 0";
    // An override that is set but incomplete is never sent (itemPayload), so it
    // has to stop the save rather than vanish out of it.
    const badPrice = items.findIndex((row) => row.overridePrice !== null && !(row.overridePrice > 0));
    if (badPrice >= 0) return `Harga manual baris ${badPrice + 1} harus lebih dari 0`;
    const noReason = items.findIndex(
      (row) => row.overridePrice !== null && row.overrideReason.trim() === ""
    );
    if (noReason >= 0) return `Alasan harga manual baris ${noReason + 1} wajib diisi`;
    if (quotationDefinitions.length > 0) {
      const { errors: cfErrors } = prepareCustomFields();
      setCustomFieldErrors(cfErrors);
      if (Object.keys(cfErrors).length > 0) return "Periksa field tambahan quotation";
    }
    return null;
  };

  const handleSave = async (action: "draft" | "publish") => {
    setSaveError(null);
    const problem = validateBeforeSave();
    if (problem) {
      notify.error("Validasi", { description: problem });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();

      // Step 1 - always a draft save. The number, the snapshots and every
      // total are the server's; the PDF below is rendered from what came back.
      const draftForm = buildDraftForm();
      const saved = quotation?.id
        ? await updateQuotation(token, quotation.id, draftForm)
        : await createQuotation(token, draftForm);
      const savedRow = saved.data;
      setQuotation(savedRow);
      setTotals(totalsFromQuotation(savedRow));
      setItems(rowsFromQuotation(savedRow));
      setCustomFields({ ...(savedRow.custom_fields ?? {}) });
      setCustomFieldErrors({});

      if (action === "draft") {
        notify.success("Draft tersimpan", {
          description: `Quotation ${savedRow.quotation_number} disimpan sebagai draft`,
        });
        if (isNew) router.replace(`/sales/quotation/${savedRow.id}`);
        return;
      }

      // Step 2 - the approval gate (spec I3 / A2). The preview already told
      // us whether the policy routes this quotation for approval (E4.2), and
      // the draft we just saved carries exactly the lines it was computed
      // from. Submitting explicitly - rather than letting the publish route
      // itself - keeps "this went for approval" a separate, named outcome
      // instead of a publish that quietly did something else.
      //
      // `NO_ELIGIBLE_APPROVER` is RETIRED (owner amendment to A17, 5 Sep
      // 2026): a tenant with nobody but the requester holding
      // `quotations:approve` no longer gets a refusal here - the request is
      // routed to the requester and the row is marked `self_approved`.
      //
      // NO PDF AND NO ATTACHMENT on this path: the quotation has not left the
      // building, and rasterising one would only invite it to be sent.
      if (totals?.approval_required) {
        const submitted = await submitQuotationForApproval(token, savedRow.id);
        previewSeq.current += 1;
        setPreviewing(false);
        setQuotation(submitted);
        setTotals(totalsFromQuotation(submitted));
        setApprovalSeq((n) => n + 1);
        notify.info("Menunggu persetujuan", {
          description: `Quotation ${submitted.quotation_number} diajukan untuk persetujuan dan belum dikirim ke pelanggan.`,
        });
        if (isNew) router.replace(`/sales/quotation/${submitted.id}`);
        return;
      }

      // Step 3 - publish WITH NO ATTACHMENT (A6 / 0.9). `attachments` is
      // optional on publish as of Phase 4, and that is what makes step 4
      // possible: the response carries `public_code` / `acceptance_url`, so
      // the PDF can print the acceptance link it could never carry before,
      // when the code was minted after the PDF had already been rasterised.
      // EXACTLY {action: publish} and nothing else (A22 / A23). An empty
      // `currency` here would be read as "clear me back to the company
      // default", relabelling a USD draft as IDR - and the PDF is rasterised
      // FROM this published row. The key set is pinned by a vitest case.
      const published = await updateQuotation(token, savedRow.id, buildPublishFormData());
      // The row is now `sent` (or `pending_approval`): the stored totals are
      // final. Retire any preview still in flight so it cannot land on top.
      previewSeq.current += 1;
      setPreviewing(false);
      setQuotation(published.data);
      setTotals(totalsFromQuotation(published.data));

      // The SERVER decides, not the preview: it re-evaluates the stored lines
      // against the policy resolved for this caller, and a preview that was a
      // few seconds stale (or a policy edited underneath) can differ. Branch
      // on the RESULTING STATUS, never on the action - that is the exact bug
      // 0.8 records, where the publish-time email was keyed on the action and
      // mailed the customer a quotation that was still awaiting approval.
      if (
        normalizeQuotationStatus(published.data.quotation_status) ===
        QUOTATION_STATUS.PENDING_APPROVAL
      ) {
        setApprovalSeq((n) => n + 1);
        notify.info("Menunggu persetujuan", {
          description: `Quotation ${published.data.quotation_number} diajukan untuk persetujuan dan belum dikirim ke pelanggan.`,
        });
        if (isNew) router.replace(`/sales/quotation/${published.data.id}`);
        return;
      }

      // Step 4 - the PDF, rendered FROM THE PUBLISHED ROW so its footer
      // carries the acceptance link, then `POST /send`.
      const pdfBlob = await generatePDF(published.data);
      if (!pdfBlob) {
        notify.warning("Quotation terkirim, PDF gagal dibuat", {
          description: "Statusnya sudah Terkirim. Pakai tombol Kirim untuk mencoba lagi.",
        });
        if (isNew) router.replace(`/sales/quotation/${published.data.id}`);
        return;
      }

      if (!clientData.emailAddress) {
        // Nothing to email. The row is published and the dialog is the honest
        // next step: it is where WhatsApp and an explicit recipient live.
        notify.warning("Kontak tanpa alamat email", {
          description: "Quotation berstatus Terkirim. Pilih kanal pengiriman lewat tombol Kirim.",
        });
        // No `setSendOpen` when we are about to navigate: `router.replace`
        // unmounts this screen and the dialog state would go with it. The
        // toast names the button, and the row's own banner then says there is
        // nothing delivered yet.
        if (isNew) router.replace(`/sales/quotation/${published.data.id}`);
        else setSendOpen(true);
        return;
      }

      let sentRow = published.data;
      try {
        const sendResult = await sendQuotation(token, published.data.id, {
          channel: "email",
          pdf: pdfBlob,
          filename: quotationPdfFilename(published.data.quotation_number),
        });
        setDeliveries(sendResult.deliveries ?? []);
        sentRow = {
          ...published.data,
          pdf_url: sendResult.pdf_url ?? published.data.pdf_url ?? null,
          public_code: sendResult.public_code ?? published.data.public_code ?? null,
          acceptance_url: sendResult.acceptance_url ?? published.data.acceptance_url ?? null,
          deliveries_count: (sendResult.deliveries ?? []).length,
        };
        setQuotation(sentRow);
      } catch (sendError: any) {
        // The quotation IS published - that write succeeded and must not be
        // reported as a failure. Only the delivery failed, and the seller can
        // retry it from the dialog without republishing anything.
        //
        // BUT A TIMEOUT IS NOT PROOF THAT NOTHING WAS SENT. The API's
        // TimeoutMiddleware answers 408 without stopping the endpoint, which
        // keeps running headless - so the upload, the customer's email and the
        // delivery row can all land after this catch fired. Only the PDF
        // upload is de-duplicated (by SHA-256); the dispatch is not, so an
        // uninformed retry mails the customer a second time. Load the delivery
        // history first and say what actually happened.
        const httpStatus = (sendError as { status?: number } | null)?.status;
        let landed: QuotationDelivery[] = [];
        if (!httpStatus || httpStatus === 408 || httpStatus >= 500) {
          try {
            landed = await fetchQuotationDeliveries(token, published.data.id);
            setDeliveries(landed);
          } catch {
            // History is context; failing to read it must not change the
            // message the seller gets about the send itself.
          }
        }
        const anySent = landed.some((row) => row.status === "sent");
        if (anySent) {
          notify.success("Quotation terkirim", {
            description:
              "Jaringan terputus sebelum jawabannya sampai, tetapi pengiriman tercatat berhasil. Periksa riwayat sebelum mengirim ulang.",
          });
        } else {
          notify.warning("Quotation terkirim, pengiriman gagal", {
            description: mapQuotationException(sendError).message,
          });
        }
        if (isNew) router.replace(`/sales/quotation/${published.data.id}`);
        else setSendOpen(true);
        return;
      }

      setSuccessData({
        id: sentRow.id,
        number: sentRow.quotation_number,
        pdfUrl: URL.createObjectURL(pdfBlob),
        publicUrl: sentRow.acceptance_url ?? publicQuotationUrl(sentRow.public_code) ?? "",
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Failed to process quotation:", error);
      const mapped = mapQuotationException(error);
      setSaveError(mapped);
      notify.error("Gagal memproses quotation", { description: mapped.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // The page was /add; the row now has an address of its own.
    if (!initialData && quotation?.id) router.replace(`/sales/quotation/${quotation.id}`);
  };

  // ── sent -> accepted | rejected ──────────────────────────────────────────
  const handleConfirmDecision = async () => {
    if (!decision || !quotation) return;
    setIsDeciding(true);
    try {
      const token = await getToken();
      const updated = await transitionQuotationStatus(token, quotation.id, { status: decision });
      setQuotation(updated);
      setTotals(totalsFromQuotation(updated));
      notify.success(
        decision === "accepted" ? "Quotation ditandai diterima" : "Quotation ditandai ditolak"
      );
      setDecision(null);
    } catch (error: any) {
      notify.error("Gagal mengubah status", {
        description: mapQuotationException(error).message,
      });
    } finally {
      setIsDeciding(false);
    }
  };

  // ── Phase 4 governance actions ───────────────────────────────────────────
  //
  // Each one replaces the whole stored row with what the server returned, so
  // the chip, the banner, the buttons and the read-only freeze can never
  // disagree with the database about what state this quotation is in.

  const applyGovernanceResult = (row: Quotation) => {
    previewSeq.current += 1;
    setPreviewing(false);
    setQuotation(row);
    setTotals(totalsFromQuotation(row));
    setItems(rowsFromQuotation(row));
    setApprovalSeq((n) => n + 1);
  };

  /** The requester cancels their own pending request; the row returns to
   *  `draft` so they can lower the discount and try again (E5.4). */
  const handleRecall = async () => {
    if (!quotation) return;
    setGovernanceBusy("recall");
    try {
      const token = await getToken();
      applyGovernanceResult(await recallQuotationApproval(token, quotation.id));
      notify.success("Pengajuan dibatalkan", {
        description: "Quotation kembali ke Draft dan bisa diedit lagi.",
      });
    } catch (error: any) {
      notify.error("Gagal membatalkan pengajuan", {
        description: mapQuotationException(error).message,
      });
    } finally {
      setGovernanceBusy(null);
    }
  };

  /**
   * Approve or reject (E5.3). Approve lands the quotation on `sent` and mints
   * its `public_code` - it does NOT deliver anything (A20), which is exactly
   * why the banner then puts Kirim in the primary position.
   */
  const handleConfirmApproval = async () => {
    if (!quotation || !approvalDecision) return;
    const approved = approvalDecision === "approve";
    setGovernanceBusy(approved ? "approve" : "reject");
    try {
      const token = await getToken();
      applyGovernanceResult(
        await decideQuotationApproval(token, quotation.id, approved, approvalComment)
      );
      notify.success(approved ? "Quotation disetujui" : "Quotation ditolak", {
        description: approved
          ? "Statusnya kini Terkirim. Kirim ke pelanggan lewat tombol Kirim."
          : "Quotation dikembalikan ke Draft untuk diperbaiki pengaju.",
      });
      setApprovalDecision(null);
      setApprovalComment("");
    } catch (error: any) {
      notify.error("Gagal memproses persetujuan", {
        description: mapQuotationException(error).message,
      });
    } finally {
      setGovernanceBusy(null);
    }
  };

  /**
   * Create the revision (A5). The server answers with the NEW draft, so the
   * page navigates to it: staying on the superseded parent - which is now
   * `expired` and carries no `public_code` - would be the wrong document to
   * be looking at.
   */
  const handleConfirmRevise = async () => {
    if (!quotation) return;
    setGovernanceBusy("revise");
    try {
      const token = await getToken();
      const revision = await reviseQuotation(token, quotation.id, reviseReason);
      setReviseOpen(false);
      setReviseReason("");
      notify.success("Revisi dibuat", {
        description: `Quotation ${revision.quotation_number} dibuat sebagai draft baru.`,
      });
      router.push(`/sales/quotation/${revision.id}`);
    } catch (error: any) {
      const mapped = mapQuotationException(error);
      // A5's `409 QUOTATION_ALREADY_REVISED` names the child that already
      // exists, so the seller is pointed at it instead of retrying.
      const childId = mapped.details?.revision_id;
      notify.error("Gagal membuat revisi", {
        description: childId
          ? `${mapped.message} (revisi ${mapped.details?.revision_number ?? childId})`
          : mapped.message,
      });
    } finally {
      setGovernanceBusy(null);
    }
  };

  // ── PDF ──────────────────────────────────────────────────────────────────
  const generatePDF = async (row: Quotation): Promise<Blob | null> => {
    // Commit the stored row to the hidden template synchronously, then let
    // the browser paint it, so the capture below sees the server's numbers.
    flushSync(() => setPdfQuotation(row));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const node = document.getElementById(QUOTATION_PDF_NODE_ID);
    if (!node) {
      notify.error("Error", { description: "Template quotation tidak ditemukan" });
      return null;
    }

    try {
      // The clone, the two dynamic imports and the A4 page live in
      // lib/utils/quotationPdf.ts so the list screen can reuse them.
      return await generateQuotationPdf(node, quotationPdfFilename(row.quotation_number));
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      notify.error("PDF Error", { description: error?.message || "Gagal membuat PDF" });
      return null;
    }
  };

  // ── Read-only banner copy ────────────────────────────────────────────────
  const bannerText = useMemo(() => {
    if (!quotation || !readOnly) return "";
    switch (status) {
      // Phase 4. The row is frozen because someone ELSE has to act, so the
      // banner names who: an approval nobody is told about is an approval
      // nobody gives.
      case QUOTATION_STATUS.PENDING_APPROVAL:
        return isRequester
          ? isSelfApproval && canApproveGrant
            ? "Menunggu persetujuan Anda sendiri: tidak ada pengguna lain di workspace ini yang punya hak \u201cSetujui quotation\u201d. Keputusan Anda dicatat sebagai disetujui sendiri."
            : "Menunggu persetujuan. Pengaju tidak bisa menyetujui pengajuannya sendiri - batalkan pengajuan untuk mengedit lagi."
          : canApproveGrant
            ? `Menunggu persetujuan Anda. Diajukan ${approval?.requester_name || "pengguna"} pada ${safeDate(approval?.requested_at, "dd MMM yyyy HH:mm")}.`
            : `Menunggu persetujuan pemegang hak "Setujui quotation". Diajukan ${approval?.requester_name || "pengguna"} pada ${safeDate(approval?.requested_at, "dd MMM yyyy HH:mm")}.`;
      case QUOTATION_STATUS.SENT:
        // A20 / 0.31: approval lands the row on `sent` BEFORE anything is
        // delivered, so "Terkirim" can be true of the status and false of the
        // world. With zero delivery rows the banner says so plainly and Kirim
        // becomes the primary action. The same is already true of an ordinary
        // publish whose delivery failed.
        if (noDeliveriesYet) {
          return "Disetujui dan siap dikirim - belum ada pengiriman tercatat. Pakai Kirim untuk meneruskannya ke pelanggan.";
        }
        if (allDeliveriesFailed) {
          return "Belum ada pengiriman yang berhasil - percobaan terakhir gagal. Pakai Kirim untuk mencoba lagi; rinciannya ada di dialog pengiriman.";
        }
        return `Terkirim ke pelanggan pada ${safeDate(quotation.sent_at, "dd MMM yyyy HH:mm")}. Quotation yang sudah terkirim tidak bisa diedit - pakai Revisi untuk versi baru.`;
      case QUOTATION_STATUS.ACCEPTED:
        return quotation.accepted_by_name
          ? `Diterima ${quotation.accepted_by_name} pada ${safeDate(quotation.accepted_at, "dd MMM yyyy HH:mm")}.`
          : `Diterima pelanggan pada ${safeDate(quotation.accepted_at, "dd MMM yyyy HH:mm")}.`;
      case QUOTATION_STATUS.REJECTED:
        return "Ditolak pelanggan. Pakai Revisi untuk menawarkan versi berikutnya.";
      case QUOTATION_STATUS.EXPIRED:
        return hasRevision
          ? "Digantikan oleh revisi yang lebih baru."
          : "Kedaluwarsa. Pakai Revisi untuk menawarkan versi berikutnya.";
      default:
        return `Quotation berstatus ${quotationStatusMeta(status).label} dan tidak bisa diedit.`;
    }
  }, [
    quotation,
    readOnly,
    status,
    isRequester,
    isSelfApproval,
    canApproveGrant,
    approval,
    noDeliveriesYet,
    allDeliveriesFailed,
    hasRevision,
  ]);

  return (
    <div className="p-6">
      <PageHeader
        title={isNew ? "Quotation Builder" : quotation.quotation_number}
        breadcrumbs={[
          { label: "Sales" },
          { label: "Quotation Builder", href: "/sales/quotation" },
          { label: isNew ? "Add Quotation" : quotation.quotation_number },
        ]}
        actions={
          quotation ? (
            <QuotationStatusChip
              status={quotation.quotation_status}
              expireDate={quotation.expire_date}
            />
          ) : undefined
        }
      />

      {readOnly && quotation && (
        <div
          className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="status"
        >
          <div className="flex items-center gap-3">
            <QuotationStatusChip
              status={quotation.quotation_status}
              expireDate={quotation.expire_date}
            />
            <p className="text-sm text-gray-700">{bannerText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Phase 4. Kirim is FIRST and primary on a `sent` row with no
                delivery recorded (A20 / 0.31): that row reads "Terkirim" but
                nothing has actually reached the customer, and the seller's
                next act is to send it. Once a delivery exists it steps back
                to an outline button beside the customer-decision pair. */}
            {showSend && (
              <AppButton
                variantStyle={nothingDelivered ? "primary" : "outline"}
                color="primary"
                onClick={() => setSendOpen(true)}
                disabled={!!governanceBusy}
              >
                Kirim
              </AppButton>
            )}
            {/* The approve / reject pair, beside the customer-decision pair
                below and never instead of it: they answer different
                questions - "may this discount go out" vs "did the customer
                say yes". */}
            {showApprove && (
              <>
                <AppButton
                  variantStyle="primary"
                  color="success"
                  onClick={() => {
                    setApprovalComment("");
                    setApprovalDecision("approve");
                  }}
                  disabled={!!governanceBusy}
                  isLoading={governanceBusy === "approve"}
                >
                  Setujui
                </AppButton>
                <AppButton
                  variantStyle="outline"
                  color="danger"
                  onClick={() => {
                    setApprovalComment("");
                    setApprovalDecision("reject");
                  }}
                  disabled={!!governanceBusy}
                  isLoading={governanceBusy === "reject"}
                >
                  Tolak
                </AppButton>
              </>
            )}
            {showRecall && (
              <AppButton
                variantStyle="outline"
                color="gray"
                onClick={() => void handleRecall()}
                disabled={!!governanceBusy}
                isLoading={governanceBusy === "recall"}
              >
                Batalkan pengajuan
              </AppButton>
            )}
            {showRevise && (
              <AppButton
                variantStyle="outline"
                color="primary"
                onClick={() => {
                  setReviseReason("");
                  setReviseOpen(true);
                }}
                disabled={!!governanceBusy}
                isLoading={governanceBusy === "revise"}
              >
                Revisi
              </AppButton>
            )}
            {canDecideQuotation(status) && (
              <>
                <AppButton
                  variantStyle={nothingDelivered ? "outline" : "primary"}
                  color="success"
                  onClick={() => setDecision("accepted")}
                  disabled={isDeciding || !!governanceBusy}
                >
                  Tandai diterima
                </AppButton>
                <AppButton
                  variantStyle="outline"
                  color="danger"
                  onClick={() => setDecision("rejected")}
                  disabled={isDeciding || !!governanceBusy}
                >
                  Tandai ditolak
                </AppButton>
              </>
            )}
          </div>
        </div>
      )}

      {/* The approval timeline. Rendered for every saved quotation, not only
          a pending one: after a decision it is the ONLY place a tenant user
          can read who approved what and why (activity_logs is backoffice-only).
          It returns null when the quotation was never routed. */}
      {quotation && <QuotationApprovalCard quotationId={quotation.id} refreshKey={approvalSeq} />}

      {/* An editable draft that the CURRENT numbers will route for approval.
          Said before the seller presses the primary button, because pressing
          it and landing in a queue is a surprise; reading it first is a
          choice. `approval_required` comes from the preview (E4.2), which no
          longer 400s on the approval band. */}
      {!readOnly && totals?.approval_required && (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
          role="status"
        >
          <p className="text-sm font-medium text-amber-900">
            Diskon ini butuh persetujuan sebelum dikirim ke pelanggan.
          </p>
          <p className="mt-1 text-sm text-amber-800">
            {totals.approval_threshold_percent
              ? `Ambang persetujuan ${formatPercent(totals.approval_threshold_percent)}%.`
              : ""}{" "}
            {totals.approval_min_margin_percent
              ? `Margin minimum ${formatPercent(totals.approval_min_margin_percent)}%.`
              : ""}{" "}
            Menekan &ldquo;Kirim ke Pelanggan&rdquo; akan mengajukan quotation ini untuk
            disetujui, bukan mengirimkannya.
          </p>
        </div>
      )}

      <div className="flex flex-col rounded-2xl border border-gray-300 p-2">
        <div className="lg:col-span-2 space-y-8">
          <ClientDetailsCard
            clientData={clientData}
            setClientData={setClientData}
            leads={leadsWithCurrent}
            isLoadingLeads={isLoadingLeads}
            onClientSearch={setClientSearchQuery}
            isReadOnlyClient={!isNew}
            readOnly={readOnly}
            contactId={selectedLead?.contact_id ?? quotation?.contact_id ?? null}
            // COMMERCIAL Phase 5 (spec I8). The picker offers only currencies
            // the tenant actually holds a rate for, plus the company default.
            currencyOptions={currencyOptions}
            exchangeRateNote={rateNote}
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />

          <ProductsServicesCard
            items={itemsWithUnits}
            updateQty={updateQty}
            updateItemField={updateItemField}
            addItem={addItem}
            removeItem={removeItem}
            listProduct={availableProducts}
            totals={totals}
            // Every amount in the line table prints in the QUOTATION's money,
            // not the company's (spec I8).
            currency={displayCurrency}
            // Server-side search (spec I9): the picker no longer shows only the
            // first 100 products, and variants are selectable.
            onSearchProducts={setProductSearch}
            searching={productSearch !== debouncedProductSearch}
            rowErrors={errors?.fieldsByRow ?? {}}
            rowMessages={errors?.byRow ?? {}}
            readOnly={readOnly}
            productDefinitions={productDefinitions}
            // A row with no server line yet is showing the CATALOGUE price,
            // which is provisional until the preview lands - and plain wrong to
            // show at all once the preview has failed.
            previewing={previewing}
            previewFailed={!!previewError}
            priceContext={totals?.price_context ?? "none"}
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between px-6">
            <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor="salesperson" className="text-foreground font-medium">
                Salesperson:
              </label>
              <AppInput
                id="salesperson"
                value={clientData.salesperson || ""}
                onChange={(e) => setClientData({ ...clientData, salesperson: e.target.value })}
                placeholder="Select client to view salesperson"
                disabled={true}
                isBgWhite
                height="40px"
              />
            </section>
            <div className="flex flex-col items-stretch gap-2">
              {!readOnly && totals?.price_context === "none" && (
                <p
                  className="self-end rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900"
                  role="status"
                >
                  Harga sementara - pilih pelanggan untuk harga final
                </p>
              )}
              <SummaryCard
                totals={totals}
                fallbackSubtotal={fallbackSubtotal}
                defaultTaxRate={quotation?.tax_rate ?? defaults?.tax_rate ?? null}
                defaultPricesIncludeTax={
                  quotation?.prices_include_tax ?? defaults?.prices_include_tax ?? null
                }
                currency={displayCurrency}
                exchangeRateNote={rateNote}
                headerDiscountType={headerDiscountType}
                headerDiscountValue={headerDiscountValue}
                onHeaderDiscountChange={handleHeaderDiscountChange}
                // The policy refusal (details.header) or a header-field refusal
                // on the discount value itself (details.errors[]).
                headerError={errors?.header ?? errors?.fieldsHeader?.discount_value}
                maxDiscountPercent={defaults?.max_discount_percent ?? null}
                readOnly={readOnly}
                previewing={previewing}
                previewFailed={!!previewError}
              />

              {/* Why THIS price list won, once the chain is seven levels deep
                  (Phase 3, spec I6). Read-only, server-derived, and gated on
                  the config grant the endpoint itself requires. */}
              <QuotationPriceListExplainer
                contactId={selectedLead?.contact_id ?? quotation?.contact_id ?? null}
                crmCompanyId={
                  selectedLead?.crm_company?.id ?? quotation?.crm_company_id ?? null
                }
                salesChannelId={clientData.sales_channel_id || null}
              />
            </div>
          </div>
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <TermsCard
            terms={terms}
            paymentTerms={paymentTerms}
            onTermsChange={setTerms}
            onPaymentTermsChange={setPaymentTerms}
            readOnly={readOnly}
          />
          <QuotationCustomFieldsCard
            values={customFields}
            onChange={(fieldKey, value) => {
              setCustomFields((prev) => ({ ...prev, [fieldKey]: value }));
              if (customFieldErrors[fieldKey]) {
                setCustomFieldErrors((prev) => ({ ...prev, [fieldKey]: "" }));
              }
            }}
            definitions={quotationDefinitions}
            status={status}
            errors={{ ...customFieldErrors, ...(errors?.fieldsHeader ?? {}) }}
            readOnly={readOnly}
          />
          <div className="flex justify-end items-center mb-8 px-6">
            <div className="flex flex-wrap justify-end gap-3">
              {readOnly ? (
                <Link href="/sales/quotation">
                  <AppButton variantStyle="outline" color="primary">
                    Kembali ke daftar
                  </AppButton>
                </Link>
              ) : (
                <>
                  <Link href="/sales/quotation">
                    <AppButton variantStyle="danger" color="danger">
                      Cancel
                    </AppButton>
                  </Link>

                  <AppButton
                    variantStyle="outline"
                    color="primary"
                    onClick={() => handleSave("draft")}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Simpan sebagai Draft
                  </AppButton>

                  <AppButton
                    variantStyle="primary"
                    color="primary"
                    onClick={() => handleSave("publish")}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {/* The label follows the ACTUAL outcome. Pressing "Kirim
                        ke Pelanggan" and getting an approval queue instead is
                        the kind of surprise that gets read as a bug. */}
                    {totals?.approval_required ? "Ajukan Persetujuan" : "Kirim ke Pelanggan"}
                  </AppButton>
                </>
              )}
            </div>
          </div>

          <QuotationSuccessModal
            open={showSuccessModal}
            onClose={handleSuccessClose}
            quotationId={successData.id}
            quotationNumber={successData.number}
            pdfUrl={successData.pdfUrl}
            publicUrl={successData.publicUrl}
          />

          {/* Approve / reject, with the comment the decision is recorded
              with. `activity_logs` is append-only under
              trg_activity_logs_immutable on all three tiers, so a decision
              made in error can never be edited - only compensated by another
              one. The confirmation step is the last chance to not make it. */}
          <ConfirmationPopup
            isOpen={!!approvalDecision}
            onClose={() => setApprovalDecision(null)}
            onConfirm={handleConfirmApproval}
            title={approvalDecision === "approve" ? "Setujui quotation" : "Tolak quotation"}
            description={
              approvalDecision === "approve"
                ? `Setujui diskon pada quotation ${quotation?.quotation_number ?? ""}? Statusnya menjadi Terkirim dan siap dikirim ke pelanggan.`
                : `Tolak quotation ${quotation?.quotation_number ?? ""}? Quotation kembali ke Draft agar pengaju bisa memperbaikinya.`
            }
            confirmText={approvalDecision === "approve" ? "Setujui" : "Tolak"}
            cancelText="Batal"
            variant={approvalDecision === "approve" ? "info" : "warning"}
            isLoading={governanceBusy === "approve" || governanceBusy === "reject"}
          >
            <AppTextarea
              isBgWhite
              label="Catatan (opsional)"
              rows={3}
              placeholder="Alasan keputusan ini - terbaca oleh pengaju"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value.slice(0, 1000))}
              inputProps={{ maxLength: 1000 }}
            />
          </ConfirmationPopup>

          <ConfirmationPopup
            isOpen={reviseOpen}
            onClose={() => setReviseOpen(false)}
            onConfirm={handleConfirmRevise}
            title="Buat revisi"
            description={`Buat draft baru dari quotation ${quotation?.quotation_number ?? ""}. Quotation ini berhenti berlaku dan tautan persetujuan pelanggannya dinonaktifkan. Satu quotation hanya bisa direvisi sekali.`}
            confirmText="Buat revisi"
            cancelText="Batal"
            variant="warning"
            isLoading={governanceBusy === "revise"}
          >
            <AppTextarea
              isBgWhite
              label="Alasan revisi (opsional)"
              rows={3}
              placeholder="mis. pelanggan minta penyesuaian volume"
              value={reviseReason}
              onChange={(e) => setReviseReason(e.target.value.slice(0, 500))}
              inputProps={{ maxLength: 500 }}
            />
          </ConfirmationPopup>

          <QuotationSendDialog
            open={sendOpen}
            onClose={() => setSendOpen(false)}
            quotation={quotation}
            contactEmail={quotation?.lead?.contact?.email ?? clientData.emailAddress}
            contactPhone={quotation?.lead?.contact?.phone_number ?? clientData.phoneNumber}
            onGeneratePdf={generatePDF}
            onSent={(rows, acceptanceUrl) => {
              setDeliveries(rows);
              setQuotation((current) =>
                current
                  ? {
                      ...current,
                      deliveries_count: rows.length,
                      acceptance_url: acceptanceUrl ?? current.acceptance_url ?? null,
                    }
                  : current
              );
            }}
          />

          <ConfirmationPopup
            isOpen={!!decision}
            onClose={() => setDecision(null)}
            onConfirm={handleConfirmDecision}
            title={decision === "accepted" ? "Tandai diterima" : "Tandai ditolak"}
            description={
              decision === "accepted"
                ? `Tandai quotation ${quotation?.quotation_number ?? ""} sebagai diterima pelanggan? Status tidak bisa diubah kembali.`
                : `Tandai quotation ${quotation?.quotation_number ?? ""} sebagai ditolak pelanggan? Status tidak bisa diubah kembali.`
            }
            confirmText={decision === "accepted" ? "Tandai diterima" : "Tandai ditolak"}
            cancelText="Batal"
            variant={decision === "accepted" ? "info" : "warning"}
            isLoading={isDeciding}
          />
        </div>
      </div>

      {/* The PDF template, extracted in Phase 3 (spec I7.1). It renders from
          the STORED row (`pdfQuotation`), set right after the draft save,
          never from the form's own state - and it is now a component, so the
          quotation LIST can mount the same template for its "Unduh PDF"
          action instead of the template being unreachable once a quotation is
          published. */}
      {/* The COMPANY's currency is passed so the PDF can print the rupiah
          equivalent of the PPN and the grand total under the foreign totals
          (spec I10) - an Indonesian tax document is read in rupiah. */}
      <QuotationPdfDocument
        quotation={pdfQuotation}
        productDefinitions={productDefinitions}
        companyCurrency={companyCurrency}
      />
    </div>
  );
}
