"use client";

// components/admin/catalog-settings/BulkPriceUpdateDialog.tsx
//
// "Copy another list's prices, plus or minus a percentage."
//
// The preview is the SERVER's: on every parameter change the dialog calls the
// same endpoint with `dry_run: true` and renders the report it returns. That
// is the whole point - the old design recomputed the percentage and the
// rounding in JS floats and asked the user to confirm a number the server had
// never agreed to, with no affected-row count and no undo (spec S3-10).
//
// It is an AppDialog and not the toolbar's BulkActionsBar: that bar is one row
// tall, sits inline in the left toolbar slot, and cannot hold three inputs plus
// an affected-row count without bringing back the overlay defect its own
// comment records.

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { formatRupiah } from "@/lib/helper/currency";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
    useActivePriceLists,
    useBulkPricePreview,
    useBulkUpdatePrices,
} from "@/lib/hooks/usePriceLists";
import { ROUNDING_OPTIONS } from "@/lib/constants/price-list";
import { formatMinQuantity } from "@/lib/utils/priceGrid";
import type { BulkPriceUpdateRequest, PriceList, PriceListRounding } from "@/lib/types/PriceList";

export default function BulkPriceUpdateDialog({
    open,
    onClose,
    priceList,
    onDone,
}: {
    open: boolean;
    onClose: () => void;
    priceList: PriceList;
    onDone?: () => void;
}) {
    const [sourceId, setSourceId] = useState("");
    const [percent, setPercent] = useState("0");
    const [rounding, setRounding] = useState<PriceListRounding>(priceList.rounding);
    const [includeMissing, setIncludeMissing] = useState(false);
    const [validFrom, setValidFrom] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { data: listsData } = useActivePriceLists({ enabled: open });
    const applyMutation = useBulkUpdatePrices();

    useEffect(() => {
        if (!open) return;
        setSourceId("");
        setPercent("0");
        setRounding(priceList.rounding);
        setIncludeMissing(false);
        setValidFrom("");
        setFieldErrors({});
    }, [open, priceList.rounding]);

    const sourceOptions = useMemo(
        () =>
            (listsData?.price_lists ?? [])
                // Copying a list onto itself is not a percentage edit, it is a
                // no-op the server would have to refuse.
                .filter((row) => row.id !== priceList.id)
                .map((row) => ({ value: row.id, label: `${row.name} (${row.code})` })),
        [listsData, priceList.id]
    );

    const percentValue = Number(percent);
    const percentValid = percent.trim() !== "" && Number.isFinite(percentValue);

    const request: BulkPriceUpdateRequest | null = useMemo(() => {
        if (!sourceId || !percentValid) return null;
        return {
            source_price_list_id: sourceId,
            percent: percentValue,
            rounding,
            include_missing: includeMissing,
            valid_from: validFrom || null,
        };
    }, [sourceId, percentValid, percentValue, rounding, includeMissing, validFrom]);

    // Debounced so typing "-10" does not fire a request per keystroke.
    const debouncedRequest = useDebounce(request, 450);
    const {
        data: preview,
        isFetching: previewing,
        error: previewError,
    } = useBulkPricePreview(priceList.id, debouncedRequest, { enabled: open });

    const previewMessage =
        previewError instanceof Error ? previewError.message : previewError ? String(previewError) : null;

    // WHAT IS CONFIRMED MUST BE WHAT IS APPLIED. `request` is a useMemo, so
    // once the debounce settles `debouncedRequest` holds the IDENTICAL
    // reference; while it does not, the numbers on screen were computed for
    // the PREVIOUS parameters (`keepPreviousData`), and "Terapkan" would post
    // the new ones. Flipping the "termasuk produk..." switch and clicking
    // Terapkan is two clicks well inside 450 ms - it would have run over
    // every sellable product while the dialog said "12 baris".
    const previewIsCurrent = debouncedRequest === request;
    const previewIsStale = !previewIsCurrent || previewing;
    const canApply =
        !!request && !previewIsStale && !!preview && !previewMessage && !applyMutation.isPending;

    const handleApply = async () => {
        // The button is disabled in this state; the guard is here so no other
        // path (Enter, a stray click during the debounce) can apply figures
        // the preview never described.
        if (request && !canApply) return;
        if (!request) {
            setFieldErrors({
                source_price_list_id: sourceId ? "" : "Pilih daftar harga sumber",
                percent: percentValid ? "" : "Isi persentase",
            });
            return;
        }
        try {
            const result = await applyMutation.mutateAsync({
                priceListId: priceList.id,
                data: { ...request, dry_run: false },
            });
            notify.success("Harga diperbarui", {
                description: `${result.closed} baris harga ditutup, ${result.inserted} baris baru dibuat.`,
            });
            if (result.skipped.length > 0) {
                notify.warning(`${result.skipped.length} produk dilewati`, {
                    description: result.skipped
                        .slice(0, 3)
                        .map((row) => `${row.sku ?? row.product_id}: ${row.reason}`)
                        .join("; "),
                });
            }
            onDone?.();
            onClose();
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            const known = Object.keys(fe).filter((k) => k !== "_");
            if (known.length > 0) setFieldErrors(fe);
            notify.error("Gagal memperbarui harga", { description: fe._ ?? error?.message });
        }
    };

    return (
        <AppDialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            title={`Ubah harga massal - ${priceList.name}`}
            description="Salin harga dari daftar harga lain, naik atau turun sekian persen."
            actions={
                <>
                    <AppButton variantStyle="outline" onClick={onClose}>
                        Batal
                    </AppButton>
                    <AppButton
                        onClick={handleApply}
                        disabled={!canApply}
                        isLoading={applyMutation.isPending}
                    >
                        Terapkan
                    </AppButton>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium">Daftar harga sumber</label>
                        <AppSelect
                            isBgWhite
                            fullWidth
                            value={sourceId}
                            placeholder={
                                sourceOptions.length === 0 ? "Belum ada daftar harga lain" : "Pilih sumber"
                            }
                            options={sourceOptions}
                            disabled={sourceOptions.length === 0}
                            onChange={(e) => setSourceId(String(e.target.value))}
                            error={!!fieldErrors.source_price_list_id}
                            helperText={fieldErrors.source_price_list_id}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium">Persentase</label>
                        <AppInput
                            isBgWhite
                            type="number"
                            value={percent}
                            onChange={(e) => setPercent(e.target.value)}
                            inputProps={{ step: 0.01 }}
                            endIcon={<span className="text-gray-500">%</span>}
                            error={!!fieldErrors.percent}
                            helperText={fieldErrors.percent || "Negatif untuk menurunkan harga"}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium">Pembulatan</label>
                        <AppSelect
                            isBgWhite
                            fullWidth
                            value={rounding}
                            options={ROUNDING_OPTIONS}
                            onChange={(e) => setRounding(e.target.value as PriceListRounding)}
                            helperText="Pembulatan daftar harga ini tetap berlaku saat harga dipakai"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium">Berlaku dari</label>
                        <input
                            type="date"
                            aria-label="Berlaku dari"
                            value={validFrom}
                            onChange={(e) => setValidFrom(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">Kosong = mulai hari ini</p>
                    </div>
                </div>

                <label className="flex items-start gap-2 text-sm">
                    <Switch checked={includeMissing} onCheckedChange={setIncludeMissing} />
                    <span>
                        Termasuk produk yang belum ada di daftar sumber
                        <span className="block text-xs text-muted-foreground">
                            Produk tanpa harga di daftar sumber dihitung dari harga katalognya.
                        </span>
                    </span>
                </label>

                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <div className="mb-2 flex items-center gap-2 font-medium">
                        Pratinjau
                        {previewIsStale && request && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                        )}
                    </div>

                    {!request && (
                        <p className="text-muted-foreground">
                            Pilih daftar harga sumber dan isi persentase untuk melihat jumlah baris yang
                            terpengaruh.
                        </p>
                    )}

                    {/* The figures below belong to the parameters that were
                        previewed. While a change is still settling they would
                        be attributable to parameters that are no longer set,
                        so they are replaced rather than dimmed. */}
                    {request && previewIsStale && (
                        <p className="text-muted-foreground" aria-live="polite">
                            Menghitung ulang pratinjau...
                        </p>
                    )}

                    {request && !previewIsStale && previewMessage && (
                        <p className="flex items-start gap-2 text-red-600">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            {previewMessage}
                        </p>
                    )}

                    {request && !previewIsStale && !previewMessage && preview && (
                        <div className="flex flex-col gap-2">
                            <p>
                                <span className="font-semibold">{preview.closed}</span> baris harga akan
                                ditutup, <span className="font-semibold">{preview.inserted}</span> dibuat.
                            </p>
                            {preview.sample.length > 0 && (
                                <ul className="space-y-0.5 text-xs text-muted-foreground">
                                    {preview.sample.map((row) => (
                                        <li key={`${row.product_id}-${row.min_quantity}`}>
                                            {row.sku ?? row.product_id} (tier ≥{" "}
                                            {formatMinQuantity(row.min_quantity)}):{" "}
                                            {row.old_price
                                                ? formatRupiah(row.old_price, { decimals: 2 })
                                                : "belum ada"}{" "}
                                            → {formatRupiah(row.new_price, { decimals: 2 })}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {preview.skipped.length > 0 && (
                                <div className="text-xs text-amber-700">
                                    {preview.skipped.length} produk dilewati:{" "}
                                    {preview.skipped
                                        .slice(0, 3)
                                        .map((row) => `${row.sku ?? row.product_id} (${row.reason})`)
                                        .join(", ")}
                                    {preview.skipped.length > 3 ? ", ..." : ""}
                                </div>
                            )}
                            {preview.inserted === 0 && preview.closed === 0 && (
                                <p className="text-muted-foreground">
                                    Tidak ada baris yang terpengaruh dengan pengaturan ini.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Baris harga lama ditutup dan baris baru dibuat pada tanggal berlaku; harga lama tidak
                    ditimpa.
                </p>
            </div>
        </AppDialog>
    );
}
