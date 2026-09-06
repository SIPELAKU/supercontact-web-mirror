"use client";

// components/admin/catalog-settings/CustomerSegmentDetail.tsx
//
// One segment (Phase 3, spec I2): the `PriceListDetail.tsx` shell - a header
// card of chips, an `AppTabs` switch, an edit dialog - carrying the criteria
// builder.
//
// The two facts this screen has to STATE rather than assume the reader knows,
// because both are counter-intuitive and both are settled spec decisions:
//
//   A11  a quotation stores the highest-priority MATCHING segment. That is not
//        necessarily the segment whose price list won the line: the top segment
//        may carry no assignment while the second one prices it. The explainer
//        on the quotation names the PRICING segment separately.
//   A14  `{"all": []}` matches NOBODY. A segment with no clause is inert, not
//        universal - which is what makes a half-built segment safe.
//
// Saving criteria is `serializeSegmentClauses`, which returns null when no
// clause is complete; the screen then REFUSES the save rather than writing an
// empty criteria that would silently make the segment inert.

import { useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Info, Pencil, Save } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppInput } from "@/components/ui/app-input";
import { AppTabs } from "@/components/ui/app-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import SegmentCriteriaBuilder from "@/components/admin/catalog-settings/SegmentCriteriaBuilder";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { useCustomerSegment, useUpdateCustomerSegment } from "@/lib/hooks/useCommercialContext";
import {
    COMMERCIAL_NAME_MAX_LENGTH,
    MAX_SEGMENT_CLAUSES,
} from "@/lib/constants/commercial-context";
import {
    clausesFromCriteria,
    criteriaSignature,
    serializeSegmentClauses,
    type SegmentClauseDraft,
} from "@/lib/utils/segmentCriteria";
import type { CustomerSegmentUpdate } from "@/lib/types/CommercialContext";

type TabValue = "criteria" | "how";

export default function CustomerSegmentDetail({ segmentId }: { segmentId: string }) {
    const { data: segment, isLoading, isError, refetch } = useCustomerSegment(segmentId);
    const updateMutation = useUpdateCustomerSegment();

    const [tab, setTab] = useState<TabValue>("criteria");
    const [clauses, setClauses] = useState<SegmentClauseDraft[]>([]);
    const [criteriaError, setCriteriaError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [draft, setDraft] = useState<{ name: string; priority: string } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Re-seed the builder whenever the server's copy changes; editing works on
    // a deep copy, so the loaded segment is never mutated in place.
    useEffect(() => {
        if (segment) setClauses(clausesFromCriteria(segment.criteria));
    }, [segment]);

    // Both sides go through `criteriaSignature`, never raw `JSON.stringify`:
    // the stored copy comes back from a JSONB column with its keys re-ordered
    // by Postgres, so comparing serialised objects reported "unsaved changes"
    // on every segment the moment it loaded.
    const stored = useMemo(() => criteriaSignature(segment?.criteria), [segment]);
    const pending = useMemo(
        () => criteriaSignature(serializeSegmentClauses(clauses)),
        [clauses]
    );
    const dirty = stored !== pending;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner />
            </div>
        );
    }

    if (isError || !segment) {
        return (
            <EmptyState
                title="Segment not found"
                description="It may have been removed, or it belongs to another workspace."
                action={{ label: "Coba lagi", onClick: () => refetch() }}
            />
        );
    }

    const handleSaveCriteria = async () => {
        const criteria = serializeSegmentClauses(clauses);
        if (criteria === null) {
            // Refuse rather than write `{"all": []}`: an empty criteria matches
            // NOBODY, so saving one by accident would silently switch the
            // segment off instead of reporting the incomplete row.
            setCriteriaError(
                clauses.length === 0
                    ? "Tambahkan minimal satu syarat. Segmen tanpa syarat tidak cocok dengan siapa pun."
                    : "Tidak ada syarat yang lengkap. Lengkapi nilainya, atau hapus baris yang kosong."
            );
            return;
        }
        if (criteria.all.length > MAX_SEGMENT_CLAUSES) {
            setCriteriaError(`Maksimal ${MAX_SEGMENT_CLAUSES} syarat`);
            return;
        }
        setCriteriaError(null);
        try {
            await updateMutation.mutateAsync({ id: segment.id, data: { criteria } });
            notify.success("Syarat segmen disimpan", {
                description: "Berlaku untuk quotation berikutnya; quotation yang sudah ada tidak berubah.",
            });
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            setCriteriaError(fe.criteria ?? fe._ ?? error?.message ?? "Gagal menyimpan syarat");
            notify.error("Gagal menyimpan syarat", { description: fe.criteria ?? fe._ ?? error?.message });
        }
    };

    const openEditor = () => {
        setDraft({ name: segment.name, priority: String(segment.priority ?? 0) });
        setFieldErrors({});
        setEditOpen(true);
    };

    const handleSaveHeader = async () => {
        if (!draft) return;
        const name = draft.name.trim();
        if (!name) {
            setFieldErrors({ name: "Nama wajib diisi" });
            return;
        }
        if (name.length > COMMERCIAL_NAME_MAX_LENGTH) {
            setFieldErrors({ name: `Maksimal ${COMMERCIAL_NAME_MAX_LENGTH} karakter` });
            return;
        }
        const priority = Number(draft.priority) || 0;
        const patch: CustomerSegmentUpdate = {};
        if (name !== segment.name) patch.name = name;
        if (priority !== segment.priority) patch.priority = priority;
        if (Object.keys(patch).length === 0) {
            notify.info("Tidak ada perubahan");
            setEditOpen(false);
            return;
        }
        try {
            await updateMutation.mutateAsync({ id: segment.id, data: patch });
            notify.success("Segmen diubah");
            setEditOpen(false);
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            const known = Object.keys(fe).filter((k) => k !== "_");
            if (known.length > 0) setFieldErrors(fe);
            if (known.length === 0 || fe._)
                notify.error("Gagal menyimpan", { description: fe._ ?? error?.message });
        }
    };

    const clauseCount = segment.criteria?.all?.length ?? 0;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">{segment.name}</h2>
                        <span className="font-mono text-xs text-gray-500">{segment.code}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Chip
                            label={segment.status === "active" ? "Aktif" : "Diarsipkan"}
                            color={segment.status === "active" ? "success" : "default"}
                            size="small"
                        />
                        <Chip label={`Prioritas ${segment.priority}`} size="small" variant="outlined" />
                        <Chip
                            label={clauseCount === 0 ? "Tanpa syarat - tidak cocok siapa pun" : `${clauseCount} syarat`}
                            color={clauseCount === 0 ? "warning" : "default"}
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
                </div>
            </div>

            <AppTabs<TabValue>
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: "criteria", label: "Syarat" },
                    { value: "how", label: "Cara kerja" },
                ]}
            />

            {tab === "criteria" ? (
                <div className="flex flex-col gap-3">
                    <SegmentCriteriaBuilder
                        clauses={clauses}
                        onChange={(next) => {
                            setClauses(next);
                            setCriteriaError(null);
                        }}
                        disabled={updateMutation.isPending}
                    />
                    {criteriaError && (
                        <p className="text-sm text-red-600">{criteriaError}</p>
                    )}
                    <div className="flex items-center gap-3">
                        <AppButton
                            onClick={handleSaveCriteria}
                            disabled={!dirty || updateMutation.isPending}
                            isLoading={updateMutation.isPending}
                        >
                            <Save className="mr-1.5 h-4 w-4" />
                            Simpan syarat
                        </AppButton>
                        {dirty && <span className="text-xs text-amber-700">Ada perubahan yang belum disimpan.</span>}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3 rounded-xl border bg-white p-5 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <p className="font-medium">
                            Segmen dievaluasi ulang setiap kali quotation dibuat. Keanggotaannya tidak
                            pernah disimpan di database.
                        </p>
                    </div>
                    <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                        <li>
                            <strong>Semua syarat harus terpenuhi.</strong> Syarat digabung dengan DAN,
                            maksimal {MAX_SEGMENT_CLAUSES} syarat. Segmen tanpa syarat tidak cocok dengan
                            siapa pun - bukan dengan semua orang.
                        </li>
                        <li>
                            <strong>Quotation menyimpan segmen dengan prioritas tertinggi yang cocok</strong>,
                            dan itu belum tentu segmen yang daftar harganya dipakai untuk satu baris:
                            segmen teratas bisa saja tidak punya penetapan daftar harga, sementara segmen
                            berikutnya punya. Panel &quot;Daftar harga yang berlaku&quot; di quotation
                            menyebut segmen yang MEMBERI HARGA secara terpisah.
                        </li>
                        <li>
                            <strong>Tag</strong> membaca tag milik kontak itu sendiri (huruf besar/kecil
                            dianggap sama), dan <strong>Status lead</strong> membaca kumpulan status dari
                            lead-lead kontak tersebut. Kontak tanpa tag - atau tanpa lead - tidak pernah
                            cocok pada syarat itu.
                        </li>
                        <li>
                            <strong>Wilayah</strong> cocok pada wilayah kontak (atau perusahaannya)
                            beserta wilayah induknya, jadi syarat &quot;Jawa Barat&quot; ikut mencakup
                            kabupaten di bawahnya.
                        </li>
                        <li>
                            Mengubah syarat tidak mengubah quotation yang sudah tersimpan: segmen dan
                            harganya dipotret saat quotation dibuat atau saat barisnya diubah.
                        </li>
                    </ul>
                </div>
            )}

            <AppDialog
                open={editOpen && !!draft}
                onClose={() => setEditOpen(false)}
                title="Ubah segmen"
                description="Kode tidak bisa diubah setelah dibuat."
                maxWidth="sm"
                actions={
                    <>
                        <AppButton variantStyle="outline" onClick={() => setEditOpen(false)}>
                            Batal
                        </AppButton>
                        <AppButton
                            onClick={handleSaveHeader}
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
                                inputProps={{ maxLength: COMMERCIAL_NAME_MAX_LENGTH }}
                                error={!!fieldErrors.name}
                                helperText={fieldErrors.name}
                            />
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
                                helperText={fieldErrors.priority ?? "Angka lebih besar menang"}
                            />
                        </div>
                    </div>
                )}
            </AppDialog>
        </div>
    );
}
