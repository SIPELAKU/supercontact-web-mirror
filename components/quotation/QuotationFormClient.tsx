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
  fetchQuotationDefaults,
  previewQuotationTotals,
  transitionQuotationStatus,
  updateQuotation,
} from "@/lib/api/quotations";
import type { QuotationLead } from "@/lib/api/quotations";
import {
  QUOTATION_STATUS,
  canDecideQuotation,
  canEditQuotation,
  normalizeQuotationStatus,
  quotationStatusMeta,
} from "@/lib/constants/quotation-status";
import { useAuth } from "@/lib/context/AuthContext";
import { formatPercent, formatRupiah } from "@/lib/helper/currency";
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
  QuotationDetail,
  QuotationItemPayload,
  QuotationTotals,
} from "@/lib/types/Quotation";
import { mapQuotationException, type MappedQuotationError } from "@/lib/utils/quotation-errors";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AppButton } from "../ui/app-button";
import { AppInput } from "../ui/app-input";
import { ConfirmationPopup } from "../ui/confirmation-popup";
import QuotationSuccessModal from "./QuotationSuccessModal";

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
  return payload;
}

/** A row carries a manual price the server will accept the shape of. */
function isOverrideComplete(row: ItemRow): boolean {
  return row.overridePrice !== null && row.overridePrice > 0 && row.overrideReason.trim() !== "";
}


export default function QuotationFormClient({ initialData }: QuotationFormClientProps) {
  const router = useRouter();
  const { getToken } = useAuth();

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

  // Only active products can go on a new line; the server refuses archived
  // ones anyway, so the picker does not offer them.
  useEffect(() => {
    if (readOnly) return;
    fetchCatalogue();
  }, [fetchCatalogue, readOnly]);

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
  });

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ id: "", number: "", pdfUrl: "" });

  // What the hidden PDF template renders: the STORED row after a draft save.
  const [pdfQuotation, setPdfQuotation] = useState<Quotation | null>(null);

  const [decision, setDecision] = useState<Decision | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

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
      }));
    return [...leadItems, ...rest];
  }, [catalogue, selectedLead]);

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
  ]);

  const fallbackSubtotal = useMemo(
    () => items.reduce((sum, row) => sum + round2(row.qty * Number(row.unitPrice)), 0),
    [items]
  );

  // The save's errors win over the preview's: they are the most recent word.
  const errors = saveError ?? previewError;

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

      // Step 2 - the PDF, from the stored response.
      const pdfBlob = await generatePDF(savedRow);
      if (!pdfBlob) {
        notify.warning("Draft tersimpan, PDF gagal dibuat", {
          description: "Quotation tetap berstatus draft. Coba kirim lagi.",
        });
        if (isNew) router.replace(`/sales/quotation/${savedRow.id}`);
        return;
      }

      // Step 3 - publish: status and attachment only, no items.
      const publishForm = new FormData();
      publishForm.append("action", "publish");
      publishForm.append("attachments", pdfBlob, `quotation-${savedRow.quotation_number}.pdf`);
      const published = await updateQuotation(token, savedRow.id, publishForm);
      // The row is now `sent`: the stored totals are final. Retire any preview
      // still in flight so it cannot land on top of them.
      previewSeq.current += 1;
      setPreviewing(false);
      setQuotation(published.data);
      setTotals(totalsFromQuotation(published.data));

      if (!clientData.emailAddress) {
        notify.warning("Kontak tanpa alamat email", {
          description: "Quotation terkirim tanpa email; unduh PDF-nya untuk dibagikan.",
        });
      }
      setSuccessData({
        id: published.data.id,
        number: published.data.quotation_number,
        pdfUrl: URL.createObjectURL(pdfBlob),
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
      case QUOTATION_STATUS.SENT:
        return `Terkirim ke pelanggan pada ${safeDate(quotation.sent_at, "dd MMM yyyy HH:mm")}. Quotation yang sudah terkirim tidak bisa diedit.`;
      case QUOTATION_STATUS.ACCEPTED:
        return `Diterima pelanggan pada ${safeDate(quotation.accepted_at, "dd MMM yyyy HH:mm")}.`;
      case QUOTATION_STATUS.REJECTED:
        return "Ditolak pelanggan. Buat quotation baru untuk penawaran berikutnya.";
      default:
        return `Quotation berstatus ${quotationStatusMeta(status).label} dan tidak bisa diedit.`;
    }
  }, [quotation, readOnly, status]);

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
          {canDecideQuotation(status) && (
            <div className="flex gap-2">
              <AppButton
                variantStyle="primary"
                color="success"
                onClick={() => setDecision("accepted")}
                disabled={isDeciding}
              >
                Tandai diterima
              </AppButton>
              <AppButton
                variantStyle="outline"
                color="danger"
                onClick={() => setDecision("rejected")}
                disabled={isDeciding}
              >
                Tandai ditolak
              </AppButton>
            </div>
          )}
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
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />

          <ProductsServicesCard
            items={items}
            updateQty={updateQty}
            updateItemField={updateItemField}
            addItem={addItem}
            removeItem={removeItem}
            listProduct={availableProducts}
            totals={totals}
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
                    Kirim ke Pelanggan
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
      <QuotationPdfDocument quotation={pdfQuotation} productDefinitions={productDefinitions} />
    </div>
  );
}
