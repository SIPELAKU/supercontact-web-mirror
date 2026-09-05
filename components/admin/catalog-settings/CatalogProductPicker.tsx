"use client";

// components/admin/catalog-settings/CatalogProductPicker.tsx
//
// A product picker backed by SERVER-SIDE search (`GET /products?search=`).
//
// Deliberately not the store's `catalogue` slice: that slice is page 1 at
// `CATALOGUE_LIMIT = 100` active rows, sized for the quotation and deal
// pickers. A tenant with 209 products (dev today) would silently not be able
// to price product 101 through a picker fed from it - and the failure looks
// exactly like "that product does not exist".
//
// It is also NOT a SuperTable filter: `SuperTableFilterDef` has no async or
// autocomplete type, and a fixed `options` list is the very thing above.
// The page owns this control, writes `product_id` into its params and bumps
// `resetPageKey` (S3-4).

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { useAuth } from "@/lib/context/AuthContext";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { fetchProductsPage } from "@/lib/api/products";
import type { Product } from "@/lib/store/product";

export interface ProductPickerOption {
    value: string;
    label: string;
    sku: string;
    productName: string;
    price: string;
    unitId: string | null;
    unitName: string | null;
    unitPrecision: number | null;
}

function toOption(product: Product): ProductPickerOption {
    return {
        value: product.id,
        label: `${product.sku} — ${product.product_name}`,
        sku: product.sku,
        productName: product.product_name,
        price: product.price,
        unitId: product.unit_id ?? null,
        unitName: product.unit?.name ?? null,
        unitPrecision: product.unit?.precision ?? null,
    };
}

export default function CatalogProductPicker({
    value,
    onChange,
    label,
    placeholder = "Cari nama atau SKU produk",
    disabled = false,
    error,
    helperText,
    /** Keeps a chosen product readable after a page change wipes the search. */
    selectedOption = null,
}: {
    value: string | null;
    onChange: (option: ProductPickerOption | null) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    selectedOption?: ProductPickerOption | null;
}) {
    const { getToken } = useAuth();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 350);
    const [sticky, setSticky] = useState<ProductPickerOption | null>(selectedOption);

    useEffect(() => {
        if (selectedOption) setSticky(selectedOption);
    }, [selectedOption]);

    const { data, isFetching } = useQuery({
        queryKey: ["products", "picker", debouncedSearch],
        queryFn: async () =>
            fetchProductsPage(await getToken(), {
                page: 1,
                limit: 25,
                status: "active",
                search: debouncedSearch || undefined,
                include_total: false,
                sort_by: "product_name",
                sort_order: "asc",
            }),
        enabled: !disabled,
    });

    const options = useMemo(() => {
        const rows = (data?.products ?? []).map(toOption);
        // The chosen row may not be in the current search result; keep it in
        // the list so the field renders its name rather than a bare uuid.
        if (sticky && !rows.some((row) => row.value === sticky.value)) return [sticky, ...rows];
        return rows;
    }, [data, sticky]);

    const current = value ? options.find((option) => option.value === value) ?? sticky : null;

    return (
        <AppAutocomplete<ProductPickerOption, false, false, false>
            isBgWhite
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            helperText={helperText}
            loading={isFetching}
            value={current ?? null}
            options={options}
            // The server already filtered; filtering again in the browser would
            // hide rows whose match is in a column the label does not show.
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
            onInputChange={(_event, next, reason) => {
                if (reason === "input") setSearch(next);
                if (reason === "clear") setSearch("");
            }}
            onChange={(_event, next) => {
                setSticky(next ?? null);
                onChange(next ?? null);
            }}
            noOptionsText={debouncedSearch ? "Produk tidak ditemukan" : "Ketik untuk mencari produk"}
        />
    );
}
