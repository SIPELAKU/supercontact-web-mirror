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
import { formatQuantityWithUnit } from "@/lib/helper/quantity";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { useQuotationLeads } from "@/lib/hooks/useQuotationLeads";
import { notify } from "@/lib/notifications";
import { CATALOGUE_LIMIT, useGetProductStore } from "@/lib/store/product";
import { customFieldErrorsByKey, validateCustomFieldValues } from "@/lib/utils/customFieldValues";
import CustomFieldsReadOnly from "@/components/custom-fields/CustomFieldsReadOnly";
import QuotationCustomFieldsCard from "@/components/quotation/QuotationCustomFieldsCard";
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
      };
    }),
  };
}

/** One line exactly as QuotationItemRequest accepts it - no `price` key. */
function itemPayload(row: ItemRow): QuotationItemPayload {
  const discountValue = round2(row.discountValue || 0);
  return {
    product_id: row.product_id,
    quantity: round2(row.qty),
    notes: row.desc || "",
    discount: row.discountType === "percent" ? Math.round(discountValue) : 0,
    discount_type: row.discountType,
    discount_value: discountValue,
  };
}

function discountLabel(type: DiscountType, value: string | number): string {
  return type === "percent" ? `${formatPercent(value)}%` : formatRupiah(value);
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
  const availableProducts = useMemo<PickerProduct[]>(() => {
    const selectedLead = leadsWithCurrent.find((l) => l.id === clientData.lead_id);
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
      }));
    return [...leadItems, ...rest];
  }, [catalogue, leadsWithCurrent, clientData.lead_id]);

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
  }, [items, headerDiscountType, headerDiscountValue, readOnly, getToken]);

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
    // the browser paint it, so the clone below captures the server's numbers.
    flushSync(() => setPdfQuotation(row));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const originalElement = document.getElementById("quotation-content");
    if (!originalElement) {
      notify.error("Error", { description: "Template quotation tidak ditemukan" });
      return null;
    }

    // Clone the element to ensure it's visible during capture
    const element = originalElement.cloneNode(true) as HTMLElement;

    // Style the clone to be visible to html2canvas but unobtrusive to user
    element.style.position = "absolute";
    element.style.top = "0";
    element.style.left = "0";
    element.style.zIndex = "-1000"; // Behind everything
    element.style.width = "800px"; // Fixed A4-like width
    element.style.backgroundColor = "#ffffff"; // Ensure background is white
    element.style.display = "block";

    document.body.appendChild(element);

    try {
      // html2canvas-pro and jsPDF are loaded HERE, not at module scope: both
      // are large and are only needed by this one handler, so a static
      // import made every visitor of this page pay for them whether or not
      // they ever export a PDF.
      const [h2cMod, jspdfMod] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      // Resolve defensively: the browser (ESM build) and Node (CJS build)
      // expose these under different keys, so pin to whichever is a callable
      // rather than assuming one bundler resolution.
      const html2canvas = (h2cMod as any).default ?? (h2cMod as any);
      const jsPDF = (jspdfMod as any).jsPDF ?? (jspdfMod as any).default;

      // Small timeout to ensure DOM render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduced scale to optimize size (was 2)
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Use JPEG with 0.75 quality instead of PNG to significantly reduce size
      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true, // Enable PDF compression
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      const blob = pdf.output("blob");

      document.body.removeChild(element);
      return blob;
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      notify.error("PDF Error", { description: error.message || "Gagal membuat PDF" });

      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
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

  const pdfTaxNote = pdfQuotation
    ? pdfQuotation.prices_include_tax
      ? "Harga sudah termasuk PPN"
      : "Harga belum termasuk PPN"
    : "";

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
            <SummaryCard
              totals={totals}
              fallbackSubtotal={fallbackSubtotal}
              defaultTaxRate={quotation?.tax_rate ?? defaults?.tax_rate ?? null}
              defaultPricesIncludeTax={quotation?.prices_include_tax ?? defaults?.prices_include_tax ?? null}
              headerDiscountType={headerDiscountType}
              headerDiscountValue={headerDiscountValue}
              onHeaderDiscountChange={handleHeaderDiscountChange}
              // The policy refusal (details.header) or a header-field refusal
              // on the discount value itself (details.errors[]).
              headerError={errors?.header ?? errors?.fieldsHeader?.discount_value}
              maxDiscountPercent={defaults?.max_discount_percent ?? null}
              readOnly={readOnly}
              previewing={previewing}
            />
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

      {/* Hidden printable area for PDF generation - rendered from the STORED
          row (`pdfQuotation`), set right after the draft save, never from the
          form's own state. */}
      <div
        id="quotation-content"
        className="absolute -top-2500 -left-2500 w-200 p-8 border"
        style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}
      >
        {pdfQuotation && (
          <>
            <div className="mb-8 flex justify-between items-start gap-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#000000" }}>
                  {pdfQuotation.quotation_title}
                </h1>
                <p style={{ color: "#6b7280" }}>{pdfQuotation.quotation_number}</p>
              </div>
              <div className="text-right text-sm" style={{ color: "#000000" }}>
                <p>Tanggal: {safeDate(pdfQuotation.created_at)}</p>
                <p>Berlaku hingga: {safeDate(pdfQuotation.expire_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8" style={{ color: "#000000" }}>
              <div>
                <h3 className="font-bold mb-2">Kepada</h3>
                <p>{pdfQuotation.lead?.contact?.name || "-"}</p>
                <p>{pdfQuotation.lead?.contact?.company || ""}</p>
                <p>{pdfQuotation.lead?.contact?.email || ""}</p>
                <p>{pdfQuotation.lead?.contact?.phone_number || ""}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold mb-2">Sales</h3>
                <p>{pdfQuotation.lead?.user?.fullname || "-"}</p>
                <p>{pdfQuotation.lead?.user?.email || ""}</p>
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
                {pdfQuotation.items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                    <td className="py-2">
                      <p className="font-bold" style={{ color: "#000000" }}>
                        {item.product_name_snapshot ?? item.product?.product_name ?? "-"}
                      </p>
                      <p className="text-xs" style={{ color: "#6b7280" }}>
                        {item.sku_snapshot ?? item.product?.sku ?? ""}
                      </p>
                      {/* "Brand: X" under the product - the LIVE attributes, read-only. */}
                      <CustomFieldsReadOnly
                        entityType="product"
                        values={item.product?.custom_fields}
                        definitions={productDefinitions}
                        className="mt-0.5 text-xs"
                        style={{ color: "#6b7280" }}
                      />
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
                      {formatRupiah(item.unit_price)}
                    </td>
                    <td className="text-right py-2" style={{ color: "#000000" }}>
                      {Number(item.discount_value) > 0
                        ? discountLabel(item.discount_type, item.discount_value)
                        : "-"}
                    </td>
                    <td className="text-right py-2" style={{ color: "#000000" }}>
                      {formatRupiah(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end" style={{ color: "#000000" }}>
              <div className="w-72">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatRupiah(pdfQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>
                    Diskon
                    {Number(pdfQuotation.discount_value) > 0
                      ? ` (header ${discountLabel(pdfQuotation.discount_type, pdfQuotation.discount_value)})`
                      : ""}
                  </span>
                  <span>- {formatRupiah(pdfQuotation.discount_total)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Jumlah kena pajak</span>
                  <span>{formatRupiah(pdfQuotation.taxable_amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>PPN {formatPercent(pdfQuotation.tax_rate)}%</span>
                  <span>{formatRupiah(pdfQuotation.tax_total)}</span>
                </div>
                <div
                  className="flex justify-between font-bold text-lg border-t pt-2"
                  style={{ borderColor: "#1f2937" }}
                >
                  <span>Grand Total</span>
                  <span>{formatRupiah(pdfQuotation.grand_total)}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{pdfTaxNote}</p>
              </div>
            </div>

            {(pdfQuotation.payment_terms || pdfQuotation.terms) && (
              <div className="mt-8 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
                {pdfQuotation.payment_terms && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-1" style={{ color: "#000000" }}>Termin pembayaran</h3>
                    <p className="text-sm" style={{ color: "#4b5563" }}>{pdfQuotation.payment_terms}</p>
                  </div>
                )}
                {pdfQuotation.terms && (
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: "#000000" }}>Syarat &amp; ketentuan</h3>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "#4b5563" }}>
                      {pdfQuotation.terms}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
