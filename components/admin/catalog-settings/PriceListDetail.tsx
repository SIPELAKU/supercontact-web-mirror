"use client";

import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import { Pencil, Percent } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppTabs } from "@/components/ui/app-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import BulkPriceUpdateDialog from "@/components/admin/catalog-settings/BulkPriceUpdateDialog";
import PriceListAssignmentsTab from "@/components/admin/catalog-settings/PriceListAssignmentsTab";
import PriceListPricesTab from "@/components/admin/catalog-settings/PriceListPricesTab";
import { ROUNDING_LABELS, ROUNDING_OPTIONS } from "@/lib/constants/price-list";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { usePriceList, useUpdatePriceList } from "@/lib/hooks/usePriceLists";
import { formatValidityRange } from "@/lib/utils/priceGrid";
import {
    PRICE_LIST_NAME_MAX_LENGTH,
    type PriceList,
    type PriceListRounding,
    type PriceListUpdate,
} from "@/lib/types/PriceList";

type TabValue = "prices" | "assignments";

interface EditDraft {
    name: string;
    priority: string;
    rounding: PriceListRounding;
    markupPercent: string;
    isDefault: boolean;
    allowManualOverride: boolean;
    validFrom: string;
    validUntil: string;
}

function draftFrom(row: PriceList): EditDraft {
    return {
        name: row.name,
        priority: String(row.priority ?? 0),
        rounding: row.rounding,
        markupPercent: row.markup_percent ?? "",
        isDefault: row.is_default,
        allowManualOverride: row.allow_manual_override,
        validFrom: row.valid_from ?? "",
        validUntil: row.valid_until ?? "",
    };
}

export default function PriceListDetail({ priceListId }: { priceListId: string }) {
    const { data: priceList, isLoading, isError, refetch } = usePriceList(priceListId);
    const updateMutation = useUpdatePriceList();

    const [tab, setTab] = useState<TabValue>("prices");
    const [bulkOpen, setBulkOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [draft, setDraft] = useState<EditDraft | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    // Bumped after a bulk run so the prices table restarts from batch 1.
    const [mutationSeq, setMutationSeq] = useState(0);

    useEffect(() => {
        if (priceList && editOpen && draft === null) setDraft(draftFrom(priceList));
    }, [priceList, editOpen, draft]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner />
            </div>
        );
    }

    if (isError || !priceList) {
        return (
            <EmptyState
                title="Price list not found"
                description="It may have been removed, or it belongs to another workspace."
                action={{ label: "Coba lagi", onClick: () => refetch() }}
            />
        );
    }

    const openEditor = () => {
        setDraft(draftFrom(priceList));
        setFieldErrors({});
        setEditOpen(true);
    };

    const handleSave = async () => {
        if (!draft) return;
        const name = draft.name.trim();
        const problems: Record<string, string> = {};
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > PRICE_LIST_NAME_MAX_LENGTH)
            problems.name = `Maksimal ${PRICE_LIST_NAME_MAX_LENGTH} karakter`;
        if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom)
            problems.valid_until = "Tanggal berakhir harus setelah tanggal mulai";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }

        const priority = Number(draft.priority) || 0;
        const markup = draft.markupPercent.trim() === "" ? null : Number(draft.markupPercent);
        const patch: PriceListUpdate = {};
        if (name !== priceList.name) patch.name = name;
        if (priority !== priceList.priority) patch.priority = priority;
        if (draft.rounding !== priceList.rounding) patch.rounding = draft.rounding;
        if (
            (markup === null ? null : String(markup)) !==
            (priceList.markup_percent === null ? null : String(Number(priceList.markup_percent)))
        )
            patch.markup_percent = markup;
        if (draft.isDefault !== priceList.is_default) patch.is_default = draft.isDefault;
        if (draft.allowManualOverride !== priceList.allow_manual_override)
            patch.allow_manual_override = draft.allowManualOverride;
        if ((draft.validFrom || null) !== (priceList.valid_from ?? null))
            patch.valid_from = draft.validFrom || null;
        if ((draft.validUntil || null) !== (priceList.valid_until ?? null))
            patch.valid_until = draft.validUntil || null;

        if (Object.keys(patch).length === 0) {
            notify.info("Tidak ada perubahan");
            setEditOpen(false);
            return;
        }

        try {
            await updateMutation.mutateAsync({ id: priceList.id, data: patch });
            notify.success("Daftar harga diubah");
            setEditOpen(false);
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            const known = Object.keys(fe).filter((k) => k !== "_");
            if (known.length > 0) setFieldErrors(fe);
            if (known.length === 0 || fe._)
                notify.error("Gagal menyimpan", { description: fe._ ?? error?.message });
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">{priceList.name}</h2>
                        <span className="font-mono text-xs text-gray-500">{priceList.code}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {priceList.is_default && <Chip label="Bawaan" color="primary" size="small" />}
                        <Chip
                            label={priceList.status === "active" ? "Aktif" : "Diarsipkan"}
                            color={priceList.status === "active" ? "success" : "default"}
                            size="small"
                        />
                        <Chip label={priceList.currency} size="small" variant="outlined" />
                        <Chip label={`Prioritas ${priceList.priority}`} size="small" variant="outlined" />
                        <Chip label={ROUNDING_LABELS[priceList.rounding]} size="small" variant="outlined" />
                        {priceList.markup_percent !== null && (
                            <Chip
                                label={`Cost-plus ${priceList.markup_percent}%`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        <Chip
                            label={
                                priceList.allow_manual_override
                                    ? "Harga manual diizinkan"
                                    : "Harga manual dilarang"
                            }
                            color={priceList.allow_manual_override ? "warning" : "default"}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            label={
                                priceList.valid_from || priceList.valid_until
                                    ? formatValidityRange({
                                          valid_from: priceList.valid_from ?? "",
                                          valid_until: priceList.valid_until,
                                      })
                                    : "Selalu berlaku"
                            }
                            size="small"
                            variant="outlined"
                        />
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <AppButton variantStyle="outline" onClick={openEditor}>
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Ubah
                    </AppButton>
                    <AppButton variantStyle="outline" onClick={() => setBulkOpen(true)}>
                        <Percent className="mr-1.5 h-4 w-4" />
                        Ubah harga massal
                    </AppButton>
                </div>
            </div>

            <AppTabs<TabValue>
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: "prices", label: "Harga produk" },
                    { value: "assignments", label: "Penetapan pelanggan" },
                ]}
            />

            {tab === "prices" ? (
                <PriceListPricesTab priceList={priceList} refreshKey={mutationSeq} />
            ) : (
                <PriceListAssignmentsTab priceList={priceList} />
            )}

            <BulkPriceUpdateDialog
                open={bulkOpen}
                onClose={() => setBulkOpen(false)}
                priceList={priceList}
                onDone={() => setMutationSeq((s) => s + 1)}
            />

            <AppDialog
                open={editOpen && !!draft}
                onClose={() => setEditOpen(false)}
                title="Ubah daftar harga"
                description="Kode tidak bisa diubah setelah dibuat."
                maxWidth="sm"
                actions={
                    <>
                        <AppButton variantStyle="outline" onClick={() => setEditOpen(false)}>
                            Batal
                        </AppButton>
                        <AppButton
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            isLoading={updateMutation.isPending}
                        >
                            Simpan
                        </AppButton>
                    </>
                }
            >
                {draft && (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium">Nama</label>
                            <AppInput
                                isBgWhite
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                inputProps={{ maxLength: PRICE_LIST_NAME_MAX_LENGTH }}
                                error={!!fieldErrors.name}
                                helperText={fieldErrors.name}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium">Prioritas</label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={draft.priority}
                                    onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                                    inputProps={{ step: 1 }}
                                    helperText="Angka lebih besar menang"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Pembulatan</label>
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    value={draft.rounding}
                                    options={ROUNDING_OPTIONS}
                                    onChange={(e) =>
                                        setDraft({ ...draft, rounding: e.target.value as PriceListRounding })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Markup cost-plus (%)</label>
                                <AppInput
                                    isBgWhite
                                    type="number"
                                    value={draft.markupPercent}
                                    onChange={(e) => setDraft({ ...draft, markupPercent: e.target.value })}
                                    placeholder="kosong = mati"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    error={!!fieldErrors.markup_percent}
                                    helperText={fieldErrors.markup_percent}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Berlaku dari</label>
                                <input
                                    type="date"
                                    aria-label="Berlaku dari"
                                    value={draft.validFrom}
                                    onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                                />
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
                                {fieldErrors.valid_until && (
                                    <p className="mt-1 text-xs text-red-600">{fieldErrors.valid_until}</p>
                                )}
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <Switch
                                checked={draft.isDefault}
                                onCheckedChange={(checked) => setDraft({ ...draft, isDefault: checked })}
                            />
                            Jadikan daftar harga bawaan
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Switch
                                checked={draft.allowManualOverride}
                                onCheckedChange={(checked) =>
                                    setDraft({ ...draft, allowManualOverride: checked })
                                }
                            />
                            Izinkan harga manual di quotation
                        </label>
                    </div>
                )}
            </AppDialog>
        </div>
    );
}
