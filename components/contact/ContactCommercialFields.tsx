"use client";

// components/contact/ContactCommercialFields.tsx
//
// The three commercial reference controls a contact form needs (Phase 3, spec
// I6): Tipe Pelanggan, Wilayah and - for a user who holds `companies` - the
// saved CRM company the contact belongs to.
//
// One component, two call sites: `EditContactModal` and the separate,
// hand-rolled `AddContactModal`. They share no form machinery at all (the add
// modal has a raw fetch and no custom-field support), so the controls are
// shared here rather than written twice and drifting.
//
// Why `crm_company_id` is on this form at all (spec 0.21): a quotation's
// `crm_company_id` - and therefore the NPWP and address the PDF prints - is
// filled FROM THE LEAD's contact. Before Phase 3 there was no web write path
// for `contacts.crm_company_id` at all, so for any tenant that did not come
// through the Data-Intelligence "save person" flow the column stayed NULL for
// ever and the PDF had nothing to print.
//
// The picker is rendered ONLY when the user holds `companies`: without that
// grant `GET /company-intelligence/my-target-companies` 403s, and a select
// that cannot load its options is worse than an absent one.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppSelect } from "@/components/ui/app-select";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { getMyTargetCompanies } from "@/lib/api/company-intelligence";
import { useActiveCustomerTypes, useRegionTree } from "@/lib/hooks/useCommercialContext";
import { flattenTree } from "@/lib/utils/categoryTree";

export interface ContactCommercialValues {
    customer_type_id: string;
    region_id: string;
    crm_company_id: string;
}

interface ContactCommercialFieldsProps {
    values: ContactCommercialValues;
    onChange: (patch: Partial<ContactCommercialValues>) => void;
    errors?: Record<string, string>;
    disabled?: boolean;
    /** Only fetch while the modal is open. */
    enabled?: boolean;
    /** The company's name as the contact already carries it, for the initial chip. */
    initialCrmCompanyName?: string | null;
}

interface CompanyOption {
    id: string;
    label: string;
}

export default function ContactCommercialFields({
    values,
    onChange,
    errors,
    disabled,
    enabled = true,
    initialCrmCompanyName,
}: ContactCommercialFieldsProps) {
    const { can } = usePermission();
    const { getToken } = useAuth();
    const canReadCompanies = can("companies");

    const { data: customerTypes } = useActiveCustomerTypes({ enabled });
    const { data: regionTree } = useRegionTree({ enabled });

    const [companyQuery, setCompanyQuery] = useState("");
    const { data: companyPage, isFetching: companiesLoading } = useQuery({
        queryKey: ["my-target-companies", "contact-picker", companyQuery],
        queryFn: async () =>
            getMyTargetCompanies(await getToken(), { search: companyQuery || undefined, page: 1, limit: 25 }),
        enabled: enabled && canReadCompanies,
    });

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

    const companyOptions: CompanyOption[] = useMemo(() => {
        const rows = (companyPage?.data ?? []).map((company) => ({
            id: company.id,
            label: company.name,
        }));
        // Keep the currently linked company selectable even when it is not on
        // the first page of the current search - otherwise opening the modal
        // and saving would silently clear the link.
        if (values.crm_company_id && !rows.some((row) => row.id === values.crm_company_id)) {
            rows.unshift({
                id: values.crm_company_id,
                label: initialCrmCompanyName || "Perusahaan tertaut",
            });
        }
        return rows;
    }, [companyPage, values.crm_company_id, initialCrmCompanyName]);

    const selectedCompany = companyOptions.find((row) => row.id === values.crm_company_id) ?? null;

    return (
        <div className="mt-6">
            <h3 className="mb-3 font-semibold text-gray-700">Data Komersial</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Pelanggan</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={values.customer_type_id}
                        options={typeOptions}
                        disabled={disabled}
                        onChange={(e) => onChange({ customer_type_id: String(e.target.value) })}
                        error={!!errors?.customer_type_id}
                        helperText={errors?.customer_type_id ?? "Dipakai untuk menentukan daftar harga dan segmen"}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Wilayah</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={values.region_id}
                        options={regionOptions}
                        disabled={disabled}
                        onChange={(e) => onChange({ region_id: String(e.target.value) })}
                        error={!!errors?.region_id}
                        helperText={
                            errors?.region_id ??
                            (regionOptions.length <= 1
                                ? "Belum ada wilayah - impor dulu di Settings › Sales › Wilayah"
                                : "Wilayah induk ikut cocok saat harga dan segmen dihitung")
                        }
                    />
                </div>
                {canReadCompanies && (
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Perusahaan CRM
                        </label>
                        <AppAutocomplete<CompanyOption, false, false, false>
                            isBgWhite
                            options={companyOptions}
                            value={selectedCompany}
                            loading={companiesLoading}
                            disabled={disabled}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, selected) => option.id === selected.id}
                            // The server already filtered on `search`; filtering
                            // again in the browser would hide rows the user can
                            // see the count of.
                            filterOptions={(options) => options}
                            onInputChange={(_event, input, reason) => {
                                if (reason === "input") setCompanyQuery(input);
                            }}
                            onChange={(_event, option) =>
                                onChange({ crm_company_id: option ? option.id : "" })
                            }
                            placeholder="Cari perusahaan tersimpan"
                            error={!!errors?.crm_company_id}
                            helperText={
                                errors?.crm_company_id ??
                                "NPWP dan alamat yang tercetak di PDF quotation diambil dari perusahaan ini"
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
