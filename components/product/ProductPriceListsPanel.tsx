"use client";

// components/product/ProductPriceListsPanel.tsx
//
// "What does this product cost on each price list?" - read-only, on the product
// record itself, so a manager can answer that without opening every list.
//
// It fans out over the ACTIVE lists (`GET /price-lists/{id}/prices?product_id=`)
// because there is no single endpoint for "one product across all lists" yet.
// Two things keep that honest: it is collapsed by default, so nothing is
// fetched until somebody asks, and it is capped at MAX_LISTS lists with the
// remainder named in the footer rather than silently dropped.
//
// A dedicated `GET /products/{id}/prices` would replace the fan-out with one
// request; that is written up as a request in the WEB slice's report.

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { Chip } from "@mui/material";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchPriceListPrices } from "@/lib/api/price-lists";
import { PRICE_LISTS_KEY, useActivePriceLists } from "@/lib/hooks/usePriceLists";
import { formatRupiah } from "@/lib/helper/currency";
import {
    formatValidityRange,
    priceWindowLabel,
    priceWindowState,
    tierLabel,
} from "@/lib/utils/priceGrid";
import type { PriceList, ProductPrice } from "@/lib/types/PriceList";

const MAX_LISTS = 12;

const WINDOW_CHIP_COLOR: Record<string, "success" | "info" | "default" | "warning"> = {
    open: "success",
    scheduled: "info",
    closed: "default",
    empty: "warning",
};

export default function ProductPriceListsPanel({
    productId,
    basePrice,
}: {
    productId: string;
    /** The catalogue price, shown as the fall-through every list is read against. */
    basePrice: string | number | null;
}) {
    const { getToken } = useAuth();
    const [open, setOpen] = useState(false);

    const { data: listsData, isLoading: listsLoading } = useActivePriceLists({ enabled: open });
    const allLists: PriceList[] = useMemo(() => listsData?.price_lists ?? [], [listsData]);
    const lists = useMemo(() => allLists.slice(0, MAX_LISTS), [allLists]);

    const results = useQueries({
        queries: lists.map((list) => ({
            queryKey: [PRICE_LISTS_KEY, "prices", list.id, { product_id: productId, only_open: true }],
            queryFn: async () =>
                fetchPriceListPrices(await getToken(), list.id, {
                    page: 1,
                    limit: 25,
                    product_id: productId,
                    only_open: true,
                    include_total: false,
                }),
            enabled: open,
        })),
    });

    const loading = listsLoading || results.some((result) => result.isLoading);
    const rows: { list: PriceList; price: ProductPrice }[] = [];
    lists.forEach((list, index) => {
        const prices = results[index]?.data?.prices ?? [];
        prices.forEach((price) => rows.push({ list, price }));
    });

    return (
        <div className="rounded-lg border border-gray-200">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
                <span className="text-sm font-semibold text-gray-900">Harga di daftar harga</span>
                <span className="flex items-center gap-2 text-xs text-gray-500">
                    {open ? "Sembunyikan" : "Lihat"}
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
            </button>

            {open && (
                <div className="border-t border-gray-100 px-4 py-3">
                    <p className="mb-3 text-xs text-gray-500">
                        Harga katalog produk ini {formatRupiah(basePrice, { decimals: 2 })}. Baris di bawah
                        adalah harga yang menggantikannya untuk pelanggan yang memakai daftar harga tersebut.
                    </p>

                    {loading && (
                        <p className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memuat harga...
                        </p>
                    )}

                    {!loading && rows.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Produk ini belum punya harga khusus di daftar harga mana pun - semua quotation
                            memakai harga katalognya.
                        </p>
                    )}

                    {!loading && rows.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                                        <th className="py-1.5 pr-3 font-medium">Daftar harga</th>
                                        <th className="py-1.5 pr-3 font-medium">Tier</th>
                                        <th className="py-1.5 pr-3 font-medium">Harga</th>
                                        <th className="py-1.5 pr-3 font-medium">Masa berlaku</th>
                                        <th className="py-1.5 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(({ list, price }) => {
                                        const state = priceWindowState(price);
                                        return (
                                            <tr key={price.id} className="border-b border-gray-100">
                                                <td className="py-1.5 pr-3">
                                                    <Link
                                                        href={`/settings/sales/price-lists/${list.id}`}
                                                        className="text-[#5479EE] hover:underline"
                                                    >
                                                        {list.name}
                                                    </Link>
                                                    {list.is_default && (
                                                        <Chip
                                                            label="Bawaan"
                                                            size="small"
                                                            color="primary"
                                                            className="ml-1.5"
                                                        />
                                                    )}
                                                </td>
                                                <td className="py-1.5 pr-3">
                                                    {tierLabel(price.min_quantity, price.unit?.name ?? null)}
                                                </td>
                                                <td className="py-1.5 pr-3 font-medium">
                                                    {formatRupiah(price.price, { decimals: 2 })}
                                                </td>
                                                <td className="py-1.5 pr-3 text-xs text-gray-500">
                                                    {formatValidityRange(price)}
                                                </td>
                                                <td className="py-1.5">
                                                    <Chip
                                                        label={priceWindowLabel(state)}
                                                        color={WINDOW_CHIP_COLOR[state]}
                                                        size="small"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {allLists.length > MAX_LISTS && (
                        <p className="mt-2 text-xs text-amber-700">
                            Menampilkan {MAX_LISTS} daftar harga teratas dari {allLists.length}. Buka
                            Settings &rsaquo; Sales &rsaquo; Daftar Harga untuk sisanya.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
