"use client";

// components/data-intelligence/company-profile/CrmCompanyCommercialCard.tsx
//
// The editable legal-and-address card on Company 360 (Phase 3, spec I5) - a
// third Overview card beside `LegalRegistryCard` and
// `CrmCompanyCustomFieldsCard`, copying the latter's shape exactly: a local
// `draft` seeded from props, a `dirty` diff, a Save gated on
// `usePermission().can("companies")`, a read-only render for a
// `companies:read`-only user, and `extractFieldErrors` mapping the 400 back
// onto the fields.
//
// WHY THIS CARD EXISTS AT ALL. Before Phase 3 the ONLY mutating route on a
// saved CRM company was the single-key custom-fields PATCH, so `npwp`,
// `address_line`, `kecamatan`, `kabupaten` and `postal_code` had NO WRITE PATH
// in the product: they arrived from the intelligence cache or not at all, and
// the quotation PDF that prints them had nothing to print (npwp and
// address_line are NULL on 100% of the 206 crm_companies rows fleet-wide).
// This card is that write path, through
// `PATCH /company-intelligence/my-target-companies/{id}/commercial`.
//
// And it is safe to type into: the cache-to-CRM copy became FILL-IF-BLANK for
// these five columns in the same phase (spec E8), so re-saving the company
// from its cache no longer overwrites what a human entered here.
//
// `LegalRegistryCard` drops these five rows when `profile.source === "saved"`,
// so exactly one card owns each value and the editable one wins (spec 0.20).

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { usePermission } from "@/lib/hooks/usePermission";
import { notify } from "@/lib/notifications";
import {
    useActiveCustomerTypes,
    useRegionTree,
    useUpdateCrmCompanyCommercial,
} from "@/lib/hooks/useCommercialContext";
import { flattenTree } from "@/lib/utils/categoryTree";
import type { CrmCompanyCommercialUpdate } from "@/lib/types/CommercialContext";

export interface CrmCompanyCommercialValues {
    customerTypeId: string | null;
    regionId: string | null;
    npwp: string | null;
    addressLine: string | null;
    kecamatan: string | null;
    kabupaten: string | null;
    postalCode: string | null;
}

interface CrmCompanyCommercialCardProps {
    crmCompanyId: string;
    values: CrmCompanyCommercialValues;
    /** Names for the read-only render, when the ids alone would say nothing. */
    customerTypeName?: string | null;
    regionName?: string | null;
    onSaved: (values: CrmCompanyCommercialValues) => void;
}

interface Draft {
    customer_type_id: string;
    region_id: string;
    npwp: string;
    address_line: string;
    kecamatan: string;
    kabupaten: string;
    postal_code: string;
}

function draftFrom(values: CrmCompanyCommercialValues): Draft {
    return {
        customer_type_id: values.customerTypeId ?? "",
        region_id: values.regionId ?? "",
        npwp: values.npwp ?? "",
        address_line: values.addressLine ?? "",
        kecamatan: values.kecamatan ?? "",
        kabupaten: values.kabupaten ?? "",
        postal_code: values.postalCode ?? "",
    };
}

export default function CrmCompanyCommercialCard({
    crmCompanyId,
    values,
    customerTypeName,
    regionName,
    onSaved,
}: CrmCompanyCommercialCardProps) {
    const { can } = usePermission();
    const canEdit = can("companies");
    const updateMutation = useUpdateCrmCompanyCommercial();

    const { data: customerTypes } = useActiveCustomerTypes();
    const { data: regionTree } = useRegionTree();

    const [draft, setDraft] = useState<Draft>(() => draftFrom(values));
    const [errors, setErrors] = useState<Record<string, string>>({});

    // A reload of the profile (or a save) is the new baseline.
    //
    // DEPEND ON THE SEVEN PRIMITIVES, NEVER ON `values` ITSELF.
    // `CompanyProfile360Client` builds the `values` prop as a fresh object
    // literal on every render, so `[values]` re-fires on any unrelated parent
    // state change - the signals fetch resolving, the social lookup modal
    // opening, a social refresh merging metrics into `profile`, or the
    // custom-fields card below saving and calling `setProfile` - and each one
    // would silently wipe the NPWP and address the user is halfway through
    // typing, with no message. (The card this one copies,
    // `CrmCompanyCustomFieldsCard`, is passed `profile.customFields`, a stable
    // reference off the state object, which is why the same effect is safe
    // there.) `baseline` carries the identical list so `dirty` cannot drift
    // from what was actually seeded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setDraft(draftFrom(values));
        setErrors({});
    }, [
        values.customerTypeId,
        values.regionId,
        values.npwp,
        values.addressLine,
        values.kecamatan,
        values.kabupaten,
        values.postalCode,
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const baseline = useMemo(() => draftFrom(values), [
        values.customerTypeId,
        values.regionId,
        values.npwp,
        values.addressLine,
        values.kecamatan,
        values.kabupaten,
        values.postalCode,
    ]);
    const dirty = useMemo(
        () => (Object.keys(baseline) as (keyof Draft)[]).some((key) => draft[key] !== baseline[key]),
        [draft, baseline]
    );

    const typeOptions = useMemo(
        () => [
            { value: "", label: "Tanpa tipe pelanggan" },
            ...(customerTypes?.items ?? []).map((type) => ({ value: type.id, label: type.name })),
        ],
        [customerTypes]
    );

    const regionOptions = useMemo(
        () => [
            { value: "", label: "Tanpa wilayah" },
            ...flattenTree(regionTree ?? []).map((node) => ({ value: node.id, label: node.label })),
        ],
        [regionTree]
    );

    const set = (patch: Partial<Draft>) => {
        setDraft((prev) => ({ ...prev, ...patch }));
        for (const key of Object.keys(patch)) {
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
        }
    };

    const handleSave = async () => {
        // Only what CHANGED travels, and a cleared box travels as `null` so the
        // server actually clears the column rather than skipping it. The body
        // is `extra="forbid"`, so nothing else may be added here.
        const payload: CrmCompanyCommercialUpdate = {};
        const put = (key: keyof CrmCompanyCommercialUpdate, next: string, before: string) => {
            if (next === before) return;
            (payload as Record<string, unknown>)[key] = next.trim() === "" ? null : next.trim();
        };
        put("customer_type_id", draft.customer_type_id, baseline.customer_type_id);
        put("region_id", draft.region_id, baseline.region_id);
        put("npwp", draft.npwp, baseline.npwp);
        put("address_line", draft.address_line, baseline.address_line);
        put("kecamatan", draft.kecamatan, baseline.kecamatan);
        put("kabupaten", draft.kabupaten, baseline.kabupaten);
        put("postal_code", draft.postal_code, baseline.postal_code);

        if (Object.keys(payload).length === 0) {
            notify.info("Tidak ada perubahan");
            return;
        }

        try {
            await updateMutation.mutateAsync({ crmCompanyId, data: payload });
            setErrors({});
            onSaved({
                customerTypeId: draft.customer_type_id || null,
                regionId: draft.region_id || null,
                npwp: draft.npwp.trim() || null,
                addressLine: draft.address_line.trim() || null,
                kecamatan: draft.kecamatan.trim() || null,
                kabupaten: draft.kabupaten.trim() || null,
                postalCode: draft.postal_code.trim() || null,
            });
            notify.success("Data komersial perusahaan disimpan", {
                description: "NPWP dan alamat ini yang tercetak di PDF quotation.",
            });
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            const known = Object.keys(fe).filter((k) => k !== "_");
            if (known.length > 0) setErrors(fe);
            if (known.length === 0 || fe._) {
                notify.error("Gagal menyimpan", { description: fe._ ?? error?.message });
            }
        }
    };

    if (!canEdit) {
        const rows: { label: string; value: string | null }[] = [
            { label: "Tipe Pelanggan", value: customerTypeName ?? null },
            { label: "Wilayah", value: regionName ?? null },
            { label: "NPWP", value: values.npwp },
            { label: "Alamat", value: values.addressLine },
            { label: "Kelurahan/Kecamatan", value: values.kecamatan },
            { label: "Kabupaten/Kota", value: values.kabupaten },
            { label: "Kode Pos", value: values.postalCode },
        ].filter((row) => Boolean(row.value));
        if (rows.length === 0) return null;
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">Data komersial</h4>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    {rows.map((row) => (
                        <div key={row.label} className="min-w-0">
                            <dt className="mb-0.5 text-xs font-medium text-gray-400">{row.label}</dt>
                            <dd className="break-words font-medium text-gray-700">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Data komersial</h4>
                <AppButton
                    size="small"
                    onClick={handleSave}
                    disabled={!dirty || updateMutation.isPending}
                    isLoading={updateMutation.isPending}
                    startIcon={<Save size={14} />}
                >
                    Simpan
                </AppButton>
            </div>

            <p className="mb-4 text-xs text-gray-500">
                NPWP dan alamat di bawah ini yang tercetak pada PDF quotation untuk kontak yang
                tertaut ke perusahaan ini. Nilai yang diisi di sini tidak akan tertimpa saat data
                perusahaan disegarkan dari sumber intelijen.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-medium">Tipe Pelanggan</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.customer_type_id}
                        options={typeOptions}
                        onChange={(e) => set({ customer_type_id: String(e.target.value) })}
                        error={!!errors.customer_type_id}
                        helperText={errors.customer_type_id}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Wilayah</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.region_id}
                        options={regionOptions}
                        onChange={(e) => set({ region_id: String(e.target.value) })}
                        error={!!errors.region_id}
                        helperText={
                            errors.region_id ??
                            (regionOptions.length <= 1
                                ? "Belum ada wilayah - impor dulu di Settings › Sales › Wilayah"
                                : undefined)
                        }
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">NPWP</label>
                    <AppInput
                        isBgWhite
                        value={draft.npwp}
                        onChange={(e) => set({ npwp: e.target.value })}
                        placeholder="mis. 01.234.567.8-901.000"
                        error={!!errors.npwp}
                        helperText={errors.npwp}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Kode Pos</label>
                    <AppInput
                        isBgWhite
                        value={draft.postal_code}
                        onChange={(e) => set({ postal_code: e.target.value })}
                        placeholder="mis. 40115"
                        error={!!errors.postal_code}
                        helperText={errors.postal_code}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium">Alamat</label>
                    <AppInput
                        isBgWhite
                        value={draft.address_line}
                        onChange={(e) => set({ address_line: e.target.value })}
                        placeholder="Nama jalan, nomor, gedung"
                        error={!!errors.address_line}
                        helperText={errors.address_line}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Kelurahan/Kecamatan</label>
                    <AppInput
                        isBgWhite
                        value={draft.kecamatan}
                        onChange={(e) => set({ kecamatan: e.target.value })}
                        error={!!errors.kecamatan}
                        helperText={errors.kecamatan}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Kabupaten/Kota</label>
                    <AppInput
                        isBgWhite
                        value={draft.kabupaten}
                        onChange={(e) => set({ kabupaten: e.target.value })}
                        error={!!errors.kabupaten}
                        helperText={errors.kabupaten}
                    />
                </div>
            </div>
        </div>
    );
}
