"use client";

// components/admin/catalog-settings/ExchangeRatesTab.tsx
//
// Exchange rates (COMMERCIAL Phase 5, spec I7): the FOURTEENTH Settings > Sales
// manager, on the same page/tab shape as Promosi.
//
// THE ONE THING THIS SCREEN EXISTS TO GET RIGHT IS THE DIRECTION (A16).
//
//   `rate` is HOW MANY UNITS OF THE COMPANY'S CURRENCY one unit of `currency`
//   buys.  1 USD = 16.250 IDR  ->  currency='USD', rate=16250.000000
//
// Entering the inverse (0.0000615) is the single most likely mistake a tenant
// can make here, and it would not fail: it would silently price a USD quotation
// at a millionth of its value. So the row does NOT print a bare number in a
// column - it prints a RENDERED SENTENCE built from the response's
// `base_currency`:
//
//   1 USD = Rp 16.250   berlaku sejak 6 Sep 2026
//
// A rate is genuinely DELETED, not archived (A27) - the one Phase 5 object that
// is. A rate typed on the wrong date is a typo, not history, and no quotation
// references the row: a quotation snapshots the NUMBER.
//
// LOOKUP (A25): the server takes the newest row whose `valid_from <= date`,
// with NO fallback to a later rate, and refuses a quotation dated before any
// rate exists. The list is grouped by currency, newest first, and the row in
// force today is marked - so "which one will my quotation use" is answerable by
// looking, not by reasoning about the query.

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Coins, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { formatMoney, normalizeCurrencyCode } from "@/lib/helper/currency";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
  createExchangeRate,
  deleteExchangeRate,
  fetchExchangeRates,
  updateExchangeRate,
} from "@/lib/api/exchange-rates";
import type { ExchangeRate } from "@/lib/types/ExchangeRate";

const PAGE_LIMIT = 25;
/** ISO-4217: exactly three letters. Mirrors the schema's `^[A-Z]{3}$` (D5). */
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
/** Numeric(18,6) - the six decimals exist for the inverse-heavy currencies. */
const RATE_DECIMALS = 6;
const SOURCE_MAX_LENGTH = 32;

interface Draft {
  currency: string;
  rate: string;
  validFrom: string;
  source: string;
}

function todayInput(): string {
  return new Date().toISOString().split("T")[0];
}

const EMPTY_DRAFT: Draft = {
  currency: "",
  rate: "",
  validFrom: todayInput(),
  source: "",
};

function safeDay(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * THE SENTENCE (spec I7). Exported so a test - or the quotation header, which
 * prints the same fact beside the currency picker - cannot spell it differently.
 *
 * `1 USD = Rp 16.250` : the LEFT side is one unit of the foreign currency and
 * the RIGHT side is the company money it buys, which is the direction `rate`
 * actually stores.
 */
export function exchangeRateSentence(
  currency: string,
  rate: string | number,
  baseCurrency: string
): string {
  const base = normalizeCurrencyCode(baseCurrency);
  return `1 ${normalizeCurrencyCode(currency)} = ${formatMoney(rate, base, {
    // The company currency's own decimals: a rupiah rate reads "Rp 16.250" and
    // never "Rp 16.250,00", which is how a person writes it.
    decimals: base === "IDR" ? 0 : 2,
  })}`;
}

export default function ExchangeRatesTab() {
  const { getToken } = useAuth();
  const { confirm, confirmationPopup } = useConfirmationPopup();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [mutationSeq, setMutationSeq] = useState(0);
  const bump = () => setMutationSeq((n) => n + 1);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ExchangeRate | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["exchange-rates", page, mutationSeq],
    queryFn: async () =>
      fetchExchangeRates(await getToken(), { page, limit: PAGE_LIMIT, include_total: true }),
  });

  const baseCurrency = data?.base_currency ?? "";

  /**
   * GROUPED BY CURRENCY, newest `valid_from` first (spec I7).
   *
   * The API pages by row; the grouping is a READING order, not a second query.
   * Sorting client-side is safe here for exactly the reason it usually is not:
   * a tenant holds a handful of currencies with a handful of dated rows each,
   * and a rate list is not something anyone scrolls.
   */
  const rows = useMemo(() => {
    const items = [...(data?.items ?? [])];
    items.sort((a, b) => {
      if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
      return String(b.valid_from).localeCompare(String(a.valid_from));
    });
    const term = search.trim().toUpperCase();
    if (!term) return items;
    return items.filter(
      (row) =>
        row.currency.includes(term) || (row.source ?? "").toUpperCase().includes(term)
    );
  }, [data, search]);

  const resetForm = () => {
    setAdding(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setFieldErrors({});
  };

  const beginEdit = (row: ExchangeRate) => {
    setAdding(false);
    setEditing(row);
    setDraft({
      currency: row.currency,
      rate: row.rate ?? "",
      validFrom: row.valid_from ?? todayInput(),
      source: row.source ?? "",
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
    const currency = draft.currency.trim().toUpperCase();
    const rate = Number(draft.rate);

    if (!editing) {
      if (!currency) problems.currency = "Kode mata uang wajib diisi";
      else if (!CURRENCY_PATTERN.test(currency)) problems.currency = "Tiga huruf, mis. USD";
      else if (baseCurrency && currency === normalizeCurrencyCode(baseCurrency)) {
        // A rate from the company currency TO itself is always 1 and would make
        // the quotation picker offer the base currency twice.
        problems.currency = `${currency} adalah mata uang perusahaan - kursnya selalu 1`;
      }
      if (!draft.validFrom) problems.valid_from = "Tanggal mulai berlaku wajib diisi";
    }
    if (draft.rate.trim() === "" || !Number.isFinite(rate) || rate <= 0) {
      problems.rate = "Kurs wajib diisi dan lebih dari 0";
    }
    if (draft.source.trim().length > SOURCE_MAX_LENGTH) {
      problems.source = `Maksimal ${SOURCE_MAX_LENGTH} karakter`;
    }
    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (editing) {
        // `currency` and `valid_from` are the IDENTITY and are not updatable
        // (A27): a wrong date is deleted and re-entered.
        await updateExchangeRate(token, editing.id, {
          rate,
          source: draft.source.trim() || null,
        });
        notify.success("Kurs diubah", {
          description:
            "Berlaku untuk quotation berikutnya. Quotation tersimpan memakai kurs yang tercatat di dokumennya.",
        });
      } else {
        await createExchangeRate(token, {
          currency,
          rate,
          valid_from: draft.validFrom,
          source: draft.source.trim() || null,
        });
        notify.success("Kurs ditambahkan", {
          description: exchangeRateSentence(currency, rate, baseCurrency),
        });
      }
      resetForm();
      bump();
    } catch (error: any) {
      handleServerError(error, "Gagal menyimpan kurs");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (row: ExchangeRate) => {
    confirm({
      variant: "danger",
      title: "Hapus kurs",
      // Says exactly what is and is not affected: a stored quotation carries
      // the NUMBER, not a reference to this row.
      description: `Hapus ${exchangeRateSentence(row.currency, row.rate, row.base_currency || baseCurrency)}? Quotation yang sudah tersimpan tidak berubah - dokumennya menyimpan kurs yang dipakai. Quotation baru bertanggal setelah ini akan memakai kurs ${row.currency} lain yang masih berlaku, atau ditolak bila tidak ada.`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await deleteExchangeRate(await getToken(), row.id);
          notify.success("Kurs dihapus");
          bump();
        } catch (error: any) {
          notify.error("Gagal menghapus", { description: error?.message });
        }
      },
    });
  };

  const handleStateChange = useCallback((state: SuperTableState) => {
    setPage(state.pagination.pageIndex + 1);
    setSearch(state.globalFilter || "");
  }, []);

  const columns = useMemo<MRT_ColumnDef<ExchangeRate>[]>(
    () => [
      {
        id: "currency",
        accessorFn: (row) => row.currency,
        header: "Mata uang",
        size: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold">{row.original.currency}</span>
            {row.original.is_current && (
              <Chip label="Berlaku" color="success" size="small" variant="outlined" />
            )}
          </div>
        ),
      },
      {
        // THE SENTENCE, not a bare number: this column is the whole reason the
        // direction cannot be entered backwards by accident (A16 / I7).
        id: "rate",
        accessorFn: (row) =>
          exchangeRateSentence(row.currency, row.rate, row.base_currency || baseCurrency),
        header: "Kurs",
        size: 300,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {exchangeRateSentence(
                row.original.currency,
                row.original.rate,
                row.original.base_currency || baseCurrency
              )}
            </span>
            <span className="text-xs text-gray-500">
              berlaku sejak {safeDay(row.original.valid_from)}
            </span>
          </div>
        ),
      },
      {
        id: "valid_from",
        accessorFn: (row) => safeDay(row.valid_from),
        header: "Berlaku sejak",
        size: 150,
        enableSorting: false,
      },
      {
        id: "source",
        accessorFn: (row) => row.source ?? "-",
        header: "Sumber",
        size: 160,
        enableSorting: false,
      },
    ],
    [baseCurrency]
  );

  const editorRow = (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Mata uang</label>
          <AppInput
            isBgWhite
            value={draft.currency}
            disabled={!!editing}
            onChange={(e) =>
              setDraft({ ...draft, currency: e.target.value.toUpperCase().slice(0, 3) })
            }
            inputProps={{ maxLength: 3 }}
            error={!!fieldErrors.currency}
            helperText={
              fieldErrors.currency ??
              (editing ? "Tidak bisa diubah - hapus dan buat ulang" : "Tiga huruf, mis. USD")
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Kurs {draft.currency ? `(1 ${draft.currency} = ...)` : ""}
          </label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.rate}
            onChange={(e) => setDraft({ ...draft, rate: e.target.value })}
            inputProps={{ step: 10 ** -RATE_DECIMALS, min: 0 }}
            error={!!fieldErrors.rate}
            // The direction, said again right at the control - not only in the
            // banner above, which a hurried admin scrolls past.
            helperText={
              fieldErrors.rate ??
              `Berapa ${normalizeCurrencyCode(baseCurrency) || "mata uang perusahaan"} untuk SATU ${draft.currency || "unit"}`
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Berlaku sejak</label>
          <input
            type="date"
            aria-label="Berlaku sejak"
            value={draft.validFrom}
            disabled={!!editing}
            onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
              fieldErrors.valid_from ? "border-red-500" : "border-gray-200"
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            {fieldErrors.valid_from ??
              (editing
                ? "Tanggal adalah identitas baris - hapus dan buat ulang bila salah"
                : "Quotation memakai kurs terbaru yang berlaku pada tanggalnya")}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Sumber</label>
          <AppInput
            isBgWhite
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value })}
            inputProps={{ maxLength: SOURCE_MAX_LENGTH }}
            error={!!fieldErrors.source}
            helperText={fieldErrors.source ?? "Opsional, mis. BI / Bank"}
          />
        </div>
      </div>

      {/* The sentence the row will read, live, BEFORE the save. This is the
          cheapest possible guard against an inverted rate: the admin sees
          "1 USD = Rp 0" and stops. */}
      {draft.currency && draft.rate.trim() !== "" && Number(draft.rate) > 0 && (
        <p className="text-sm">
          Akan tersimpan sebagai:{" "}
          <b>{exchangeRateSentence(draft.currency, draft.rate, baseCurrency)}</b>
        </p>
      )}

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

      <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
        <p className="font-medium">
          Kurs ditulis sebagai &ldquo;satu unit mata uang asing sama dengan berapa{" "}
          {normalizeCurrencyCode(baseCurrency) || "mata uang perusahaan"}&rdquo;.
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>
            Contoh: 1 USD = Rp 16.250 ditulis sebagai mata uang <b>USD</b>, kurs{" "}
            <b>16250</b> - bukan 0,0000615.
          </li>
          <li>
            Harga, daftar harga dan kebijakan diskon tetap dihitung dalam mata uang perusahaan;
            kurs hanya dipakai saat quotation <b>diterbitkan</b> dalam mata uang lain.
          </li>
          <li>
            Quotation memakai kurs <b>terbaru yang berlaku pada tanggalnya</b>. Tidak ada kurs yang
            berlaku pada tanggal itu berarti quotation ditolak - bukan dihitung dengan kurs masa
            depan.
          </li>
          <li>
            Quotation yang sudah tersimpan menyimpan kursnya sendiri, jadi mengubah atau menghapus
            baris di sini tidak mengubah dokumen yang sudah keluar.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!adding && !editing && (
          <AppButton
            onClick={() => {
              setAdding(true);
              setDraft(EMPTY_DRAFT);
              setFieldErrors({});
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah kurs
          </AppButton>
        )}
      </div>

      {(adding || editing) && editorRow}

      <SuperTable<ExchangeRate>
        tableId="exchange-rates-table"
        urlKey=""
        entityLabel="kurs"
        searchPlaceholder="Cari mata uang atau sumber"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Kurs gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={typeof data?.total === "number" ? data.total : undefined}
        manualPagination
        manualFiltering
        manualSorting
        onStateChange={handleStateChange}
        resetPageKey={mutationSeq}
        rowActions={[
          {
            id: "edit",
            label: "Ubah kurs",
            icon: <Pencil size={16} />,
            onClick: (row) => beginEdit(row),
          },
          {
            // A REAL delete, and the only one in Phase 5 (A27).
            id: "delete",
            label: "Hapus",
            icon: <Trash2 size={16} />,
            destructive: true,
            onClick: (row) => handleDelete(row),
          },
        ]}
        renderEmptyState={({ hasSearch }) => (
          <EmptyState
            icon={Coins}
            title={hasSearch ? "Tidak ada kurs yang cocok" : "Belum ada kurs"}
            description="Tanpa kurs, quotation hanya bisa diterbitkan dalam mata uang perusahaan."
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
    </div>
  );
}
