"use client";

// components/admin/catalog-settings/PromotionsTab.tsx
//
// Promotions (COMMERCIAL Phase 5, spec I6): the THIRTEENTH Settings > Sales
// manager, built on `DiscountPoliciesTab.tsx`'s shape - the nearest analogue,
// being scoped rules with precedence, a validity window and an active flag -
// as a lazy SuperTable at limit 25 with an inline draft form,
// `useConfirmationPopup`, `extractFieldErrors` + `notify.error`, and
// `mutationSeq` bumped into `resetPageKey`.
//
// THE COPY MUST SEPARATE TWO THINGS THE NAV NOW SHOWS SIDE BY SIDE (spec I6):
//
//   A discount POLICY is a CEILING on what the SELLER may give away.
//   A PROMOTION is a price the COMPANY itself gives - folded into the unit
//   price BEFORE the seller's discount, and OUTSIDE that ceiling (A7).
//
// Get that wrong and a manager reads "Promosi 20%" as "sellers may discount
// 20%", which is a different number with a different owner. Both screens carry
// one sentence naming the other; the sentences live in lib/constants/promotion.ts.
//
// THE ORDER IS TOTAL AND DECLARED (A24), and the row shows every term of it:
// scope specificity (product > category > all), then priority DESC, then
// valid_from DESC, then code, then id. NON-STACKABLE BY DEFAULT - the walk
// takes the first rule and stops unless every rule taken AND the candidate are
// stackable - which is why the switch carries its copy verbatim.
//
// `min_quantity` IS ALWAYS IN THE PRODUCT'S OWN (BASE) UNIT (A14). A promotion
// must not depend on which unit a seller happened to pick, so `discount_rules`
// carries no unit column at all and the label says so.

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Eye, Pencil, Plus, RotateCcw, Save, Tag, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import CatalogProductPicker, {
  type ProductPickerOption,
} from "@/components/admin/catalog-settings/CatalogProductPicker";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { formatMoney, formatPercent, formatQuantity } from "@/lib/helper/currency";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
  archivePromotion,
  createPromotion,
  fetchPromotions,
  previewPromotions,
  restorePromotion,
  updatePromotion,
} from "@/lib/api/promotions";
import { useActiveSalesChannels } from "@/lib/hooks/useCommercialContext";
import { useProductCategoryTree } from "@/lib/hooks/useProductCategories";
import { flattenTree } from "@/lib/utils/categoryTree";
import {
  PROMOTION_DISCOUNT_TYPE_OPTIONS,
  PROMOTION_MIN_QUANTITY_HELP,
  PROMOTION_NAME_MAX_LENGTH,
  PROMOTION_SCOPE_LABELS,
  PROMOTION_SCOPE_OPTIONS,
  PROMOTION_STACKABLE_HELP,
  PROMOTION_VS_POLICY_HELP,
  PROMO_CODE_MAX_LENGTH,
  PROMO_CODE_PATTERN,
  type PromotionDiscountType,
  type PromotionScope,
} from "@/lib/constants/promotion";
import type {
  DiscountRule,
  DiscountRuleCreate,
  DiscountRulePreviewResponse,
  DiscountRuleUpdate,
} from "@/lib/types/Promotion";

// MUST equal the table's batch size or the lazy footer asks for page 2 of 25
// while showing 10, and rows 11-25 vanish without a trace.
const PAGE_LIMIT = 25;

interface Draft {
  code: string;
  name: string;
  scope: PromotionScope;
  targetProductId: string;
  targetProduct: ProductPickerOption | null;
  targetCategoryId: string;
  discountType: PromotionDiscountType;
  discountValue: string;
  minQuantity: string;
  salesChannelId: string;
  validFrom: string;
  validUntil: string;
  stackable: boolean;
  priority: string;
  isActive: boolean;
}

function todayInput(): string {
  return new Date().toISOString().split("T")[0];
}

const EMPTY_DRAFT: Draft = {
  code: "",
  name: "",
  scope: "all",
  targetProductId: "",
  targetProduct: null,
  targetCategoryId: "",
  discountType: "percent",
  discountValue: "",
  // Never blank: `min_quantity` is `gt=0` server-side and 1 is the only value
  // that means "no minimum" in a column that cannot hold zero.
  minQuantity: "1",
  salesChannelId: "",
  validFrom: todayInput(),
  validUntil: "",
  stackable: false,
  priority: "0",
  isActive: true,
};

function safeDay(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** "6 Sep 2026 - selamanya" / "6 Sep 2026 - 30 Sep 2026". */
function windowLabel(row: DiscountRule): string {
  return `${safeDay(row.valid_from)} - ${row.valid_until ? safeDay(row.valid_until) : "selamanya"}`;
}

function targetLabel(row: DiscountRule): string {
  if (row.scope === "product") {
    return row.target_product?.product_name ?? row.target_product_id ?? "-";
  }
  if (row.scope === "category") {
    return row.target_category?.name ?? row.target_category_id ?? "-";
  }
  return "Semua produk";
}

export default function PromotionsTab() {
  const { getToken } = useAuth();
  const { confirm, confirmationPopup } = useConfirmationPopup();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [mutationSeq, setMutationSeq] = useState(0);
  const bump = () => setMutationSeq((n) => n + 1);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<DiscountRule | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // The preview drawer's own state: which product, how many, on what date.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ProductPickerOption | null>(null);
  const [previewQty, setPreviewQty] = useState("1");
  const [previewDate, setPreviewDate] = useState(todayInput());
  const [previewData, setPreviewData] = useState<DiscountRulePreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["promotions", page, search, includeInactive, mutationSeq],
    queryFn: async () =>
      fetchPromotions(await getToken(), {
        page,
        limit: PAGE_LIMIT,
        include_total: true,
        search: search.trim() || undefined,
        // Tri-state, exactly like the discount-policies screen: OMITTED (not
        // `false`) when the toggle is on, because omitted means "both".
        is_active: includeInactive ? undefined : true,
      }),
  });
  const rows: DiscountRule[] = data?.promotions ?? [];

  const { data: channelPage } = useActiveSalesChannels();
  const channelOptions = useMemo(
    () => [
      { value: "", label: "Semua kanal" },
      ...((channelPage?.items ?? []).map((channel) => ({
        value: channel.id,
        label: channel.name,
      })) as { value: string; label: string }[]),
    ],
    [channelPage]
  );

  const { data: categoryTree } = useProductCategoryTree();
  const categoryOptions = useMemo(
    () => flattenTree(categoryTree ?? []).map((node) => ({ value: node.id, label: node.label })),
    [categoryTree]
  );

  const resetForm = () => {
    setAdding(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setFieldErrors({});
  };

  const beginEdit = (row: DiscountRule) => {
    setAdding(false);
    setEditing(row);
    setDraft({
      code: row.code,
      name: row.name,
      scope: row.scope,
      targetProductId: row.target_product_id ?? "",
      targetProduct: row.target_product
        ? {
            value: row.target_product.id,
            label: `${row.target_product.sku} — ${row.target_product.product_name}`,
            sku: row.target_product.sku,
            productName: row.target_product.product_name,
            price: "",
            unitId: null,
            unitName: null,
            unitPrecision: null,
          }
        : null,
      targetCategoryId: row.target_category_id ?? "",
      discountType: row.discount_type,
      discountValue: row.discount_value ?? "",
      minQuantity: row.min_quantity ?? "1",
      salesChannelId: row.sales_channel_id ?? "",
      validFrom: row.valid_from ?? todayInput(),
      validUntil: row.valid_until ?? "",
      stackable: row.stackable,
      priority: String(row.priority ?? 0),
      isActive: row.is_active,
    });
    setFieldErrors({});
  };

  const handleServerError = (error: any, title: string) => {
    const fe = extractFieldErrors(error);
    const known = Object.keys(fe).filter((key) => key !== "_");
    if (known.length > 0) setFieldErrors(fe);
    if (known.length === 0 || fe._) {
      notify.error(title, { description: fe._ ?? error?.message });
    }
  };

  const handleSave = async () => {
    const problems: Record<string, string> = {};
    const code = draft.code.trim().toUpperCase();
    const name = draft.name.trim();
    const discountValue = Number(draft.discountValue);
    const minQuantity = draft.minQuantity.trim() === "" ? 1 : Number(draft.minQuantity);
    const priority = draft.priority.trim() === "" ? 0 : Number(draft.priority);

    if (!editing) {
      // The code lands VERBATIM inside `price_source` (A11), so a space would
      // break BOTH parsers - the API's and `lib/utils/priceSource.ts`.
      if (!code) problems.code = "Kode wajib diisi";
      else if (!PROMO_CODE_PATTERN.test(code))
        problems.code = `Huruf besar, angka, - dan _ saja, 2-${PROMO_CODE_MAX_LENGTH} karakter`;
    }
    if (!name) problems.name = "Nama wajib diisi";
    else if (name.length > PROMOTION_NAME_MAX_LENGTH)
      problems.name = `Maksimal ${PROMOTION_NAME_MAX_LENGTH} karakter`;

    if (draft.discountValue.trim() === "" || !Number.isFinite(discountValue) || discountValue <= 0) {
      problems.discount_value = "Nilai potongan wajib diisi dan lebih dari 0";
    } else if (draft.discountType === "percent" && discountValue > 100) {
      // Mirrors `ck_discount_rules_percent_range`, so the caller gets a message
      // under the control instead of a 500 from the CHECK.
      problems.discount_value = "Persentase maksimal 100";
    }
    if (!Number.isFinite(minQuantity) || minQuantity <= 0) {
      problems.min_quantity = "Minimal kuantitas harus lebih dari 0";
    }
    if (!Number.isInteger(priority)) problems.priority = "Harus bilangan bulat";
    if (!draft.validFrom) problems.valid_from = "Tanggal mulai wajib diisi";
    // Mirrors `ck_discount_rules_validity`.
    if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom) {
      problems.valid_until = "Tanggal berakhir harus setelah tanggal mulai";
    }
    // Mirrors `ck_discount_rules_scope_target`.
    if (draft.scope === "product" && !draft.targetProductId) {
      problems.target_product_id = "Pilih produk";
    }
    if (draft.scope === "category" && !draft.targetCategoryId) {
      problems.target_category_id = "Pilih kategori";
    }

    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const shared = {
        name,
        scope: draft.scope,
        // Explicit null clears the other target: a rule moved from `product` to
        // `category` scope must not keep a stale product id that the CHECK
        // would then refuse with no field name.
        target_product_id: draft.scope === "product" ? draft.targetProductId : null,
        target_category_id: draft.scope === "category" ? draft.targetCategoryId : null,
        discount_type: draft.discountType,
        discount_value: discountValue,
        min_quantity: minQuantity,
        sales_channel_id: draft.salesChannelId || null,
        valid_from: draft.validFrom,
        valid_until: draft.validUntil || null,
        stackable: draft.stackable,
        priority,
      };
      if (editing) {
        // `code` is NOT updatable: it is snapshotted onto stored quotation
        // lines and inside their `price_source` (A11/D4).
        const patch: DiscountRuleUpdate = { ...shared, is_active: draft.isActive };
        await updatePromotion(token, editing.id, patch);
        notify.success("Promosi diubah", {
          description: "Berlaku untuk quotation berikutnya. Quotation tersimpan tidak berubah.",
        });
      } else {
        const payload: DiscountRuleCreate = { code, ...shared };
        await createPromotion(token, payload);
        notify.success("Promosi ditambahkan", {
          description: "Berlaku untuk quotation berikutnya. Quotation tersimpan tidak berubah.",
        });
      }
      resetForm();
      bump();
    } catch (error: any) {
      handleServerError(error, "Gagal menyimpan promosi");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = (row: DiscountRule) => {
    confirm({
      variant: "warning",
      title: "Arsipkan promosi",
      description: `Promosi "${row.code}" tidak akan dipakai lagi saat quotation dihitung. Quotation yang sudah tersimpan tetap memakai harga dan kode promo yang tercatat di barisnya.`,
      confirmText: "Arsipkan",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await archivePromotion(await getToken(), row.id);
          notify.success("Promosi diarsipkan");
          bump();
        } catch (error: any) {
          notify.error("Gagal mengarsipkan", { description: error?.message });
        }
      },
    });
  };

  const handleRestore = async (row: DiscountRule) => {
    try {
      await restorePromotion(await getToken(), row.id);
      notify.success("Promosi diaktifkan kembali");
      bump();
    } catch (error: any) {
      notify.error("Gagal mengaktifkan", { description: error?.message });
    }
  };

  const runPreview = async () => {
    if (!previewProduct) return;
    setPreviewing(true);
    setPreviewError(null);
    try {
      const result = await previewPromotions(await getToken(), {
        product_id: previewProduct.value,
        quantity: Number(previewQty) || 1,
        on_date: previewDate || undefined,
      });
      setPreviewData(result);
    } catch (error: any) {
      setPreviewData(null);
      setPreviewError(error?.message ?? "Gagal menghitung pratinjau");
    } finally {
      setPreviewing(false);
    }
  };

  const handleStateChange = useCallback((state: SuperTableState) => {
    setPage(state.pagination.pageIndex + 1);
    setSearch(state.globalFilter || "");
    setIncludeInactive(Boolean(state.filters?.include_inactive));
  }, []);

  const columns = useMemo<MRT_ColumnDef<DiscountRule>[]>(
    () => [
      {
        id: "code",
        accessorFn: (row) => row.code,
        header: "Kode",
        size: 150,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold">{row.original.code}</span>
            <span className="text-xs text-gray-500">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: "scope",
        accessorFn: (row) => `${PROMOTION_SCOPE_LABELS[row.scope]} - ${targetLabel(row)}`,
        header: "Cakupan",
        size: 220,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{PROMOTION_SCOPE_LABELS[row.original.scope]}</span>
            <span className="text-xs text-gray-500">{targetLabel(row.original)}</span>
          </div>
        ),
      },
      {
        id: "discount_value",
        accessorFn: (row) =>
          row.discount_type === "percent"
            ? `${formatPercent(row.discount_value)}%`
            : formatMoney(row.discount_value),
        header: "Potongan",
        size: 130,
        enableSorting: false,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "min_quantity",
        accessorFn: (row) => formatQuantity(row.min_quantity),
        // A14, said in the header itself: the number never depends on which
        // unit the seller picked on the line.
        header: "Min. qty (satuan dasar)",
        size: 180,
        enableSorting: false,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "sales_channel",
        accessorFn: (row) => row.sales_channel?.name ?? "Semua kanal",
        header: "Kanal",
        size: 140,
        enableSorting: false,
      },
      {
        id: "window",
        accessorFn: (row) => windowLabel(row),
        header: "Masa berlaku",
        size: 210,
        enableSorting: false,
      },
      {
        id: "stackable",
        accessorFn: (row) => (row.stackable ? "Bisa digabung" : "Tidak digabung"),
        header: "Gabung",
        size: 140,
        enableSorting: false,
        Cell: ({ row }) => (
          <Chip
            label={row.original.stackable ? "Bisa digabung" : "Tidak digabung"}
            color={row.original.stackable ? "info" : "default"}
            size="small"
            variant="outlined"
          />
        ),
      },
      { accessorKey: "priority", header: "Prioritas", size: 110, enableSorting: false },
      {
        id: "is_active",
        accessorFn: (row) => (row.is_active ? "Aktif" : "Diarsipkan"),
        header: "Status",
        size: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <Chip
            label={row.original.is_active ? "Aktif" : "Diarsipkan"}
            color={row.original.is_active ? "success" : "default"}
            size="small"
          />
        ),
      },
    ],
    []
  );

  const editorRow = (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Kode</label>
          <AppInput
            isBgWhite
            value={draft.code}
            // Immutable after create: the code is written into every promoted
            // line's `price_source` and snapshotted on the line itself.
            disabled={!!editing}
            onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
            inputProps={{ maxLength: PROMO_CODE_MAX_LENGTH }}
            error={!!fieldErrors.code}
            helperText={
              fieldErrors.code ??
              (editing
                ? "Kode tidak bisa diubah - tercatat di baris quotation"
                : "HURUF BESAR, angka, - dan _")
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Nama</label>
          <AppInput
            isBgWhite
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            inputProps={{ maxLength: PROMOTION_NAME_MAX_LENGTH }}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name ?? "Yang dibaca orang di layar ini"}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Cakupan</label>
          <AppSelect
            isBgWhite
            fullWidth
            value={draft.scope}
            options={PROMOTION_SCOPE_OPTIONS}
            onChange={(e) =>
              setDraft({
                ...draft,
                scope: String(e.target.value) as PromotionScope,
                targetProductId: "",
                targetProduct: null,
                targetCategoryId: "",
              })
            }
            helperText="Produk menang atas kategori, kategori atas semua"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Target</label>
          {draft.scope === "product" ? (
            <CatalogProductPicker
              // A product-scoped promotion may legitimately target ONE variant
              // (that is where the price lives once a family has variants).
              includeVariants
              value={draft.targetProductId || null}
              selectedOption={draft.targetProduct}
              onChange={(option) =>
                setDraft({
                  ...draft,
                  targetProductId: option?.value ?? "",
                  targetProduct: option,
                })
              }
              error={!!fieldErrors.target_product_id}
              helperText={fieldErrors.target_product_id ?? "Berlaku untuk produk ini saja"}
            />
          ) : draft.scope === "category" ? (
            <AppSelect
              isBgWhite
              fullWidth
              value={draft.targetCategoryId}
              options={categoryOptions}
              onChange={(e) => setDraft({ ...draft, targetCategoryId: String(e.target.value) })}
              error={!!fieldErrors.target_category_id}
              // The server maps a product to its category AND its ancestors
              // (A24), so a rule on a parent category bites its children.
              helperText={
                fieldErrors.target_category_id ?? "Termasuk sub-kategori di bawahnya"
              }
            />
          ) : (
            <AppInput isBgWhite value="Semua produk" disabled helperText="Tanpa target" />
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Tipe potongan</label>
          <AppSelect
            isBgWhite
            fullWidth
            value={draft.discountType}
            options={PROMOTION_DISCOUNT_TYPE_OPTIONS}
            onChange={(e) =>
              setDraft({ ...draft, discountType: String(e.target.value) as PromotionDiscountType })
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Nilai potongan</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.discountValue}
            onChange={(e) => setDraft({ ...draft, discountValue: e.target.value })}
            inputProps={{ step: 0.01, min: 0 }}
            endIcon={
              <span className="font-medium text-gray-500">
                {draft.discountType === "percent" ? "%" : "Rp"}
              </span>
            }
            error={!!fieldErrors.discount_value}
            helperText={
              fieldErrors.discount_value ??
              (draft.discountType === "percent"
                ? "Dipotong dari harga satuan"
                : // A14: the amount is read in the product's BASE unit, the same
                  // unit "Minimal kuantitas" is measured in - so a karton line
                  // is discounted by the amount times its conversion factor and
                  // one physical order costs the same in either unit.
                  "Nominal per satuan dasar produk, dalam mata uang perusahaan")
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Minimal kuantitas</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.minQuantity}
            onChange={(e) => setDraft({ ...draft, minQuantity: e.target.value })}
            inputProps={{ step: 0.01, min: 0 }}
            error={!!fieldErrors.min_quantity}
            // A14, verbatim.
            helperText={fieldErrors.min_quantity ?? PROMOTION_MIN_QUANTITY_HELP}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Kanal penjualan</label>
          <AppSelect
            isBgWhite
            fullWidth
            value={draft.salesChannelId}
            options={channelOptions}
            onChange={(e) => setDraft({ ...draft, salesChannelId: String(e.target.value) })}
            helperText="Kosong = semua kanal"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Berlaku dari</label>
          <input
            type="date"
            aria-label="Berlaku dari"
            value={draft.validFrom}
            onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none ${
              fieldErrors.valid_from ? "border-red-500" : "border-gray-200"
            }`}
          />
          {fieldErrors.valid_from && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.valid_from}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Berlaku sampai</label>
          <input
            type="date"
            aria-label="Berlaku sampai"
            value={draft.validUntil}
            onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none ${
              fieldErrors.valid_until ? "border-red-500" : "border-gray-200"
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            {fieldErrors.valid_until ?? "Kosong = tanpa batas akhir"}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Prioritas</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            inputProps={{ step: 1 }}
            error={!!fieldErrors.priority}
            helperText={fieldErrors.priority ?? "Angka lebih besar dipertimbangkan lebih dulu"}
          />
        </div>

        <div className="flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <Switch
              checked={draft.stackable}
              onCheckedChange={(checked) => setDraft({ ...draft, stackable: checked })}
            />
            Bisa digabung
          </label>
          {/* A24's default, said as the copy the spec fixes: OFF is the state
              that changes the arithmetic, so the sentence describes OFF. */}
          <p className="text-[11px] text-gray-500">{PROMOTION_STACKABLE_HELP}</p>
          {editing && (
            <label className="flex items-center gap-2 text-xs font-medium">
              <Switch
                checked={draft.isActive}
                onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })}
              />
              Aktif
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <AppButton onClick={handleSave} disabled={saving} isLoading={saving}>
          <Save className="mr-1.5 h-4 w-4" />
          Simpan
        </AppButton>
        <AppButton variantStyle="outline" onClick={resetForm} aria-label="Batal">
          <X className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {confirmationPopup}

      <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4 text-sm dark:bg-emerald-950/30">
        <p className="font-medium">
          Promosi adalah harga yang DIBERIKAN PERUSAHAAN - bukan batas diskon penjual.
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>{PROMOTION_VS_POLICY_HELP}</li>
          <li>
            Urutan yang menang sudah pasti: <b>produk</b>, lalu <b>kategori</b>, lalu{" "}
            <b>semua produk</b>; setelah itu prioritas tertinggi, lalu yang paling baru mulai
            berlaku.
          </li>
          <li>
            Secara bawaan promosi <b>{PROMOTION_STACKABLE_HELP}</b>. Promosi pertama yang menang
            menutup sisanya.
          </li>
          <li>
            <b>Minimal kuantitas dan nominal potongan selalu dihitung dalam satuan dasar
            produk</b>, bukan satuan yang dipilih penjual di baris quotation - potongan Rp 25.000
            berarti Rp 25.000 per satuan dasar, jadi 1 karton berisi 12 dipotong Rp 300.000.
          </li>
          <li>
            Quotation yang sudah tersimpan tidak ikut berubah: barisnya menyimpan harga dan kode
            promo saat dibuat.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <AppButton variantStyle="outline" onClick={() => setPreviewOpen(true)}>
          <Eye className="mr-1.5 h-4 w-4" />
          Pratinjau promosi
        </AppButton>
        {!adding && !editing && (
          <AppButton
            onClick={() => {
              setAdding(true);
              setDraft(EMPTY_DRAFT);
              setFieldErrors({});
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah promosi
          </AppButton>
        )}
      </div>

      {(adding || editing) && editorRow}

      <SuperTable<DiscountRule>
        tableId="promotions-table"
        urlKey=""
        entityLabel="promosi"
        searchPlaceholder="Cari kode atau nama promosi"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Promosi gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={typeof data?.total === "number" ? data.total : undefined}
        manualPagination
        manualFiltering
        manualSorting
        onStateChange={handleStateChange}
        resetPageKey={mutationSeq}
        filters={[
          { id: "include_inactive", label: "Tampilkan yang diarsipkan", type: "boolean" },
        ]}
        rowActions={[
          {
            id: "edit",
            label: "Ubah",
            icon: <Pencil size={16} />,
            onClick: (row) => beginEdit(row),
          },
          {
            id: "restore",
            label: "Aktifkan kembali",
            icon: <RotateCcw size={16} />,
            hidden: (row) => row.is_active,
            onClick: (row) => void handleRestore(row),
          },
          {
            id: "archive",
            label: "Arsipkan",
            icon: <Archive size={16} />,
            destructive: true,
            hidden: (row) => !row.is_active,
            onClick: (row) => handleArchive(row),
          },
        ]}
        renderEmptyState={({ hasActiveFilters, hasSearch }) => (
          <EmptyState
            icon={Tag}
            title={
              hasActiveFilters || hasSearch ? "Tidak ada promosi yang cocok" : "Belum ada promosi"
            }
            description="Tanpa promosi, harga tiap baris quotation datang dari daftar harga atau harga dasar produk."
          />
        )}
        features={{
          pagination: true,
          globalFilter: true,
          sorting: false,
          columnFilters: false,
          urlSync: true,
          rowSelection: "none",
        }}
      />

      {/* THE PREVIEW DRAWER (spec I6). It calls `GET /promotions/preview`, so a
          rule is explained THROUGH THE SAME CODE PATH THAT PRICES A QUOTE. A
          drawer that re-implemented A24's ordering in the browser would be a
          second implementation of the walk and would drift on its first edit. */}
      <AppDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Pratinjau promosi"
        description="Promosi mana yang akan didapat satu produk pada kuantitas dan tanggal tertentu - dihitung oleh server dengan aturan yang sama seperti saat quotation dibuat."
        maxWidth="sm"
        actions={
          <>
            <AppButton variantStyle="outline" onClick={() => setPreviewOpen(false)}>
              Tutup
            </AppButton>
            <AppButton onClick={runPreview} disabled={!previewProduct || previewing}>
              Hitung
            </AppButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <CatalogProductPicker
            label="Produk"
            // The preview must be able to name whatever a rule can target.
            includeVariants
            value={previewProduct?.value ?? null}
            selectedOption={previewProduct}
            onChange={(option) => {
              setPreviewProduct(option);
              setPreviewData(null);
            }}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">
                Kuantitas (satuan dasar)
              </label>
              <AppInput
                isBgWhite
                type="number"
                value={previewQty}
                onChange={(e) => setPreviewQty(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Tanggal</label>
              <input
                type="date"
                aria-label="Tanggal pratinjau"
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
              />
            </div>
          </div>

          {previewing && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
          {previewError && (
            <p className="text-sm text-red-600" role="alert">
              {previewError}
            </p>
          )}
          {previewData && !previewing && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="text-xs text-gray-500">
                Kuantitas dasar dipakai untuk minimal kuantitas:{" "}
                <b>{formatQuantity(previewData.base_quantity)}</b>
              </p>
              {previewData.eligible.length === 0 ? (
                <p className="mt-2 text-gray-600">
                  Tidak ada promosi yang memenuhi syarat untuk produk, kuantitas dan tanggal ini.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {previewData.eligible.map((entry) => (
                    <li key={entry.rule.id} className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-semibold">{entry.rule.code}</span>
                        <span className="ml-2 text-xs text-gray-500">{entry.rule.name}</span>
                        {entry.reason && (
                          <p className="text-[11px] text-gray-500">{entry.reason}</p>
                        )}
                      </div>
                      <Chip
                        label={entry.applied ? "Dipakai" : "Tidak dipakai"}
                        color={entry.applied ? "success" : "default"}
                        size="small"
                        variant={entry.applied ? "filled" : "outlined"}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </AppDialog>
    </div>
  );
}
