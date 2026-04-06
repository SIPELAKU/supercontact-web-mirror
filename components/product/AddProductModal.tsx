"use client";

import CustomSelectStage from "@/components/pipeline/SelectDealStage";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchProfile } from "@/lib/api/users";
import { Product, useGetProductStore } from "@/lib/store/product";
import type { AddProductModalProps } from "@/lib/types/Products";
import { RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppInput } from "../ui/app-input";
import { AppTextarea } from "../ui/app-textarea";
import { AppButton } from "../ui/app-button";
import { Spinner } from "../ui/spinner";
import { ConfirmationPopup } from "../ui/confirmation-popup";
import { notify } from "@/lib/notifications";

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

// Helper untuk singkatan Cerdas (Smart Abbreviation)
// 1 kata -> 3 huruf pertama (e.g., "Solvera" -> "SOL")
// >1 kata -> Inisial/Acronym (e.g., "Solvera Global Teknologi" -> "SGT")
const getSmartAbbreviation = (text: string) => {
    if (!text) return "";
    const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    if (!cleanText) return "";
    const words = cleanText.split(/\s+/);

    if (words.length >= 2) {
        // Acronym: Ambil huruf pertama tiap kata
        return words.map(w => w[0].toUpperCase()).join("");
    } else {
        // Single word: Ambil 3 huruf pertama
        return cleanText.slice(0, 3).toUpperCase();
    }
};

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
    const { postFormProduct, id, listProduct, updateFormProduct, setEditId } = useGetProductStore();
    const [, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // State untuk menyimpan nama company dari API
    const [companyAcronym, setCompanyAcronym] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const storedCompany = localStorage.getItem('userCompany');
            if (storedCompany) return getSmartAbbreviation(storedCompany);
        }
        return "";
    });

    const [formData, setFormData] = useState<ProductForm>({
        productName: "",
        price: "",
        sku: "",
        taxRate: "standard",
        description: "",
    });

    // --- FETCH USER PROFILE UNTUK DAPAT NAMA COMPANY ---
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

                if (!token) {
                    console.warn("No access token found, skipping profile fetch.");
                    return;
                }

                // Check localStorage again just in case it was updated
                const storedCompany = localStorage.getItem('userCompany');
                if (storedCompany) {
                    setCompanyAcronym(getSmartAbbreviation(storedCompany));
                }

                const response = await fetchProfile(token);

                if (response.success && response.data) {
                    const companyName = response.data.company;
                    const fullname = response.data.fullname;

                    const fallback = fullname ? getSmartAbbreviation(fullname) : "";
                    const finalAcronym = companyName ? getSmartAbbreviation(companyName) : fallback;

                    if (finalAcronym) {
                        setCompanyAcronym(finalAcronym);
                    }
                }
            } catch (error) {
                console.error("Failed to load user profile:", error);
            }
        };

        if (open) {
            loadUserProfile();
        }
    }, [open]);

    // LOGIC GENERATE SKU: {PRODUK}-{COMPANY}-{NOMOR}
    const generateSKU = () => {
        const productName = formData.productName;

        // Generate Acronym Produk
        // Jika kosong, gunakan "ITEM"
        const prodPrefix = productName ? getSmartAbbreviation(productName) : "HWG";

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
            price: formatPrice(Math.floor(Number(product[0]?.price ?? 0))),
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
        setLoading(true);
        const cleanPrice = formData.price.replace(/\./g, "");

        // Auto generate SKU jika user lupa klik tombol generate tapi nama produk ada
        let finalSku = formData.sku;
        if (!finalSku && formData.productName) {
            const prodPrefix = getSmartAbbreviation(formData.productName);
            const baseSKU = `${prodPrefix}-${companyAcronym}`;

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
            "sku": finalSku || `HWG-${Date.now()}`, // Fallback terakhir banget
            "description": formData.description,
        };

        if (formData.taxRate) {
            body.tax_rate = formData.taxRate;
        }

        if (!id) {
            setLoading(true);
            const response = await postFormProduct(body)
            if (response.success) {
                notify.success("Product Saved", { description: "New product has been successfully created." });
                setLoading(false);
                onOpenChange(false);
                reset();
                setErrors({})
            } else {
                notify.error("Failed to Save", { description: response.error || "An error occurred while saving the product." });
                setLoading(false);
            }
        } else {
            setLoading(true);
            const response = await updateFormProduct(body, id)
            if (response.success) {
                notify.success("Product Updated", { description: "Product details have been successfully updated." });
                setLoading(false);
                onOpenChange(false);
                reset();
                setEditId("");
                setErrors({})
            } else {
                notify.error("Failed to Update", { description: response.error || "An error occurred while updating the product." });
                setLoading(false);
            }
        }
    };

    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setShowCloseConfirmation(true);
        } else {
            onOpenChange(isOpen);
        }
    };

    const handleConfirmClose = () => {
        setShowCloseConfirmation(false);
        onOpenChange(false);
        reset();
        setEditId("");
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange} maxWidth="md">
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
                                <AppInput
                                    name="productName"
                                    placeholder="e.g., Aplikasi CRM Enterprise"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    isBgWhite
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Price (IDR)</label>
                                <AppInput
                                    name="price"
                                    type="text"
                                    placeholder="e.g., 10.000"
                                    value={formData.price}
                                    onChange={handleChange}
                                    isBgWhite
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">
                                    SKU
                                    <span className="text-gray-400 font-normal ml-2 text-xs">
                                        (Example: {getSmartAbbreviation(formData.productName) || "HWG"}-{companyAcronym}-001)
                                    </span>
                                </label>

                                <div className="relative">
                                    <AppInput
                                        name="sku"
                                        placeholder="Auto-generated SKU"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        isBgWhite
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
                            <AppTextarea
                                name="description"
                                placeholder="Enter product description..."
                                rows={6}
                                value={formData.description}
                                onChange={handleChange}
                                isBgWhite
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-10 border-t pt-4">
                        <AppButton
                            variantStyle="outline"
                            color="primary"
                            onClick={() => {
                                reset();
                                setEditId("");
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </AppButton>
                        <AppButton
                            variantStyle="primary"
                            color="primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? <Spinner /> : id ? "Update Product" : "Save Product"}
                        </AppButton>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationPopup
                isOpen={showCloseConfirmation}
                onClose={() => setShowCloseConfirmation(false)}
                onConfirm={handleConfirmClose}
                title="Are you sure?"
                description="This will discard your current record."
                confirmText="Discard record"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}