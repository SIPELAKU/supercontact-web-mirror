"use client";

import CustomSelectStage from "@/components/pipeline/SelectDealStage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product, useGetProductStore } from "@/lib/store/product";
import type { AddProductModalProps } from "@/lib/types/Products";
import { RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type FormErrors = Partial<Record<keyof ProductForm, string>>;
export type ProductPayload = Omit<Product, "id">;

export type ProductForm = {
    productName: string;
    sku: string;
    price: string;
    description: string;
    taxRate?: string;
};

// --- HELPER FUNCTIONS ---

// Format Rupiah
const formatPrice = (value: string | number) => {
    if (!value) return "";
    const onlyDigits = String(value).replace(/\D/g, "");
    if (!onlyDigits) return "";
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
    }).format(Number(onlyDigits));
};

// Helper untuk mengambil huruf depan (Acronym)
// Contoh: "PT. Solvera Global Teknologi" -> "PSGT"
const getAcronym = (text: string) => {
    if (!text) return "";
    return text
        .replace(/[^a-zA-Z0-9 ]/g, "") // Hapus simbol aneh
        .split(" ") // Pisahkan per spasi
        .filter((word) => word.length > 0) // Hapus spasi ganda
        .map((word) => word[0].toUpperCase()) // Ambil huruf pertama & kapital
        .join(""); // Gabungkan
};

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
    const { postFormProduct, id, listProduct, updateFormProduct, setEditId } = useGetProductStore();
    const [errors, setErrors] = useState<FormErrors>({});

    // State untuk menyimpan nama company dari API
    const [companyAcronym, setCompanyAcronym] = useState<string>("CORP");

    const [formData, setFormData] = useState<ProductForm>({
        productName: "",
        price: "",
        sku: "",
        taxRate: "standard",
        description: "",
    });

    // --- FETCH USER PROFILE UNTUK DAPAT NAMA COMPANY ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Menggunakan process.env.NEXT_PUBLIC_API_URL (/api/proxy)
                // Pastikan Next.js Rewrites Anda sudah dikonfigurasi untuk meneruskan /api/proxy ke BACKEND_URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${baseUrl}/user-profile/profile`);

                const json = await res.json();

                if (json.success && json.data) {
                    const companyName = json.data.company;
                    const fallback = json.data.fullname ? getAcronym(json.data.fullname) : "CORP";

                    setCompanyAcronym(companyName ? getAcronym(companyName) : fallback);
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };

        if (open) {
            fetchProfile();
        }
    }, [open]);

    // LOGIC GENERATE SKU: {PRODUK}-{COMPANY}-{NOMOR}
    const generateSKU = () => {
        const productName = formData.productName;

        // Generate Acronym Produk
        // Jika kosong, gunakan "ITEM"
        const prodPrefix = productName ? getAcronym(productName) : "ITEM";

        // Generate Acronym Company (dari state yang sudah di-fetch)
        const compPrefix = companyAcronym;

        // Gabungkan Prefix Sementara: Contoh "AC-PSGT"
        const baseSKU = `${prodPrefix}-${compPrefix}`;

        // Logic Auto Increment (+1 Sequence)
        // Cari semua produk di list yang SKU-nya dimulai dengan "AC-PSGT-"
        const existingNumbers = listProduct
            .filter((p) => p.sku && p.sku.startsWith(`${baseSKU}-`))
            .map((p) => {
                // Ambil bagian nomor di belakang (AC-PSGT-001 -> 001)
                const parts = p.sku.split("-");
                const lastPart = parts[parts.length - 1];
                return parseInt(lastPart, 10);
            })
            .filter((num) => !isNaN(num)); // Pastikan valid number

        // Cari angka terbesar, jika tidak ada mulai dari 0
        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

        // Tambah 1
        const nextNumber = maxNumber + 1;

        // Format jadi 3 digit (misal: 1 -> 001, 12 -> 012)
        const formattedNumber = String(nextNumber).padStart(3, "0");

        // Set Final SKU
        const finalSKU = `${baseSKU}-${formattedNumber}`;

        setFormData((p) => ({ ...p, sku: finalSKU }));
    };

    const reset = () =>
        setFormData({
            productName: "",
            price: "",
            sku: "",
            taxRate: "standard",
            description: "",
        });

    const product = useMemo(() => {
        if (!id) return null;
        return listProduct.filter(item => item.id === id) ?? null;
    }, [id, listProduct]);

    useEffect(() => {
        if (!product || product.length === 0) return;
        setFormData({
            productName: product[0]?.product_name ?? "",
            price: formatPrice(product[0]?.price ?? 0),
            sku: product[0]?.sku ?? "",
            taxRate: product[0]?.tax_rate ?? '11%',
            description: product[0]?.description ?? "",
        })
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "price") {
            const formatted = formatPrice(value);
            setFormData((p) => ({ ...p, [name]: formatted }));
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }
    };

    const handleSave = async () => {
        const cleanPrice = formData.price.replace(/\./g, "");

        // Auto generate SKU jika user lupa klik tombol generate tapi nama produk ada
        let finalSku = formData.sku;
        if (!finalSku && formData.productName) {
            // Kita jalankan logic generate manual di sini karena state update async
            // (Versi simple: Langsung panggil ulang logic acronym di sini)
            const prodPrefix = getAcronym(formData.productName);
            const baseSKU = `${prodPrefix}-${companyAcronym}`;

            // Logic hitung nomor (sama seperti fungsi generateSKU)
            const existingNumbers = listProduct
                .filter((p) => p.sku && p.sku.startsWith(`${baseSKU}-`))
                .map((p) => parseInt(p.sku.split("-").pop() || "0", 10))
                .filter((num) => !isNaN(num));

            const nextNumber = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
            finalSku = `${baseSKU}-${String(nextNumber).padStart(3, "0")}`;
        }

        const body: ProductPayload = {
            "product_name": formData.productName,
            "price": Number(cleanPrice),
            "sku": finalSku || `SKU-${Date.now()}`, // Fallback terakhir banget
            "description": formData.description,
        };

        if (formData.taxRate) {
            body.tax_rate = formData.taxRate;
        }

        if (!id) {
            const response = await postFormProduct(body)
            if (response.success) {
                onOpenChange(false);
                reset();
                setErrors({})
            }
        } else {
            const response = await updateFormProduct(body, id)
            if (response.success) {
                onOpenChange(false);
                reset();
                setEditId("");
                setErrors({})
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
            <DialogContent
                className="
                max-w-205 
                w-full 
                px-10 py-8 
                rounded-3xl 
                bg-white
                border border-gray-200
                ">
                <div className="mt-2">
                    <h2 className="text-2xl font-semibold text-[#5479EE]">
                        {id ? "Update Product" : "Add New Product"}
                    </h2>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Product Name</label>
                            <Input
                                name="productName"
                                placeholder="e.g., Aplikasi CRM Enterprise"
                                value={formData.productName}
                                onChange={handleChange}
                                className="h-11 bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Price (IDR)</label>
                            <Input
                                name="price"
                                type="text"
                                placeholder="e.g., 10.000"
                                value={formData.price}
                                onChange={handleChange}
                                className="h-11 bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">
                                SKU
                                <span className="text-gray-400 font-normal ml-2 text-xs">
                                    (Format: {getAcronym(formData.productName) || "XX"}-{companyAcronym}-001)
                                </span>
                            </label>

                            <div className="relative">
                                <Input
                                    name="sku"
                                    placeholder="Auto-generated SKU"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="h-11 bg-white pr-12 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={generateSKU}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5479EE] transition-colors"
                                    title="Generate Smart SKU"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Tax Rate</label>
                            <CustomSelectStage
                                value={formData.taxRate ?? ""}
                                disabled={true}
                                onChange={() => null}
                                placeholder="Standard (11%)"
                                data={[{ label: "PNN", value: "he" }]}
                                className="bg-white rounded-md"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Description</label>
                        <textarea
                            name="description"
                            placeholder="Enter product description..."
                            rows={6}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full h-32 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-10 border-t pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            reset();
                            setEditId("");
                            onOpenChange(false);
                        }}
                        className="px-6"
                    >
                        Cancel
                    </Button>
                    <Button className="px-6 bg-[#5479EE] text-white hover:bg-blue-700" onClick={handleSave}>
                        {id ? "Update Product" : "Save Product"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}