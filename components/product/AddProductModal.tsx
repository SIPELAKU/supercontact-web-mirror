"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fetchProfile } from "@/lib/api/users";
import {
    BILLING_PERIOD_LABELS,
    PRODUCT_STATUS_LABELS,
    PRODUCT_TYPE_LABELS,
    useGetProductStore,
    type BillingPeriod,
    type ProductPayload,
    type ProductStatus,
    type ProductType,
} from "@/lib/store/product";
import type { AddProductModalProps } from "@/lib/types/Products";
import { RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppInput } from "../ui/app-input";
import { AppSelect } from "../ui/app-select";
import { AppTextarea } from "../ui/app-textarea";
import { AppButton } from "../ui/app-button";
import { ConfirmationPopup } from "../ui/confirmation-popup";
import { notify } from "@/lib/notifications";

// products.sku is String(64) at the DB level (migration quot01widen).
export const PRODUCT_SKU_MAX_LENGTH = 64;

type FormErrors = Partial<Record<keyof ProductForm, string>>;

export type ProductForm = {
    productName: string;
    sku: string;
    price: string;
    description: string;
    productType: ProductType;
    cost: string;
    billingPeriod: BillingPeriod | "";
    imageUrl: string;
    status: ProductStatus;
};

const EMPTY_FORM: ProductForm = {
    productName: "",
    price: "",
    sku: "",
    description: "",
    productType: "goods",
    cost: "",
    billingPeriod: "",
    imageUrl: "",
    status: "active",
};

const PRODUCT_TYPE_OPTIONS = (Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((value) => ({
    value,
    label: PRODUCT_TYPE_LABELS[value],
}));

const BILLING_PERIOD_OPTIONS = (Object.keys(BILLING_PERIOD_LABELS) as BillingPeriod[]).map((value) => ({
    value,
    label: BILLING_PERIOD_LABELS[value],
}));

const PRODUCT_STATUS_OPTIONS = (Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((value) => ({
    value,
    label: PRODUCT_STATUS_LABELS[value],
}));

// --- HELPER FUNCTIONS ---

// Format Rupiah digits with thousand separators ("10000" -> "10.000").
const formatPrice = (value: string | number) => {
    if (!value) return "";
    const onlyDigits = String(value).replace(/\D/g, "");
    if (!onlyDigits) return "";
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
    }).format(Number(onlyDigits));
};

const digitsOnly = (value: string) => value.replace(/\./g, "");

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
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // State untuk menyimpan nama company dari API
    const [companyAcronym, setCompanyAcronym] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const storedCompany = localStorage.getItem('userCompany');
            if (storedCompany) return getSmartAbbreviation(storedCompany);
        }
        return "";
    });

    const [formData, setFormData] = useState<ProductForm>(EMPTY_FORM);

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
    const nextSku = (productName: string) => {
        const prodPrefix = productName ? getSmartAbbreviation(productName) : "HWG";
        const baseSKU = `${prodPrefix}-${companyAcronym}`;

        // Auto increment: cari semua produk yang SKU-nya dimulai dengan "AC-PSGT-"
        const existingNumbers = listProduct
            .filter((p) => p.sku && p.sku.startsWith(`${baseSKU}-`))
            .map((p) => parseInt(p.sku.split("-").pop() || "0", 10))
            .filter((num) => !isNaN(num));

        const nextNumber = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
        return `${baseSKU}-${String(nextNumber).padStart(3, "0")}`.slice(0, PRODUCT_SKU_MAX_LENGTH);
    };

    const generateSKU = () => {
        setFormData((p) => ({ ...p, sku: nextSku(p.productName) }));
        setErrors((e) => ({ ...e, sku: undefined }));
    };

    const reset = () => {
        setFormData(EMPTY_FORM);
        setErrors({});
    };

    const product = useMemo(() => {
        if (!id) return null;
        return listProduct.find(item => item.id === id) ?? null;
    }, [id, listProduct]);

    useEffect(() => {
        if (!product) return;
        setFormData({
            productName: product.product_name ?? "",
            price: formatPrice(Math.floor(Number(product.price ?? 0))),
            sku: product.sku ?? "",
            description: product.description ?? "",
            productType: product.product_type ?? "goods",
            cost: product.cost !== null && product.cost !== undefined
                ? formatPrice(Math.floor(Number(product.cost)))
                : "",
            billingPeriod: product.billing_period ?? "",
            imageUrl: product.image_url ?? "",
            status: product.status ?? "active",
        });
        setErrors({});
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "price" || name === "cost") {
            const formatted = formatPrice(value);
            setFormData((p) => ({ ...p, [name]: formatted }));
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }
        if (errors[name as keyof ProductForm]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): FormErrors => {
        const next: FormErrors = {};
        if (!formData.productName.trim()) next.productName = "Nama produk wajib diisi";
        const price = Number(digitsOnly(formData.price));
        if (!formData.price || !(price >= 1)) next.price = "Harga minimal Rp 1";
        if (formData.sku.length > PRODUCT_SKU_MAX_LENGTH) {
            next.sku = `SKU maksimal ${PRODUCT_SKU_MAX_LENGTH} karakter`;
        }
        if (formData.productType !== "subscription" && formData.billingPeriod) {
            next.billingPeriod = "Periode tagihan hanya untuk produk langganan";
        }
        if (formData.imageUrl.length > 1024) next.imageUrl = "URL gambar maksimal 1024 karakter";
        return next;
    };

    const handleSave = async () => {
        const problems = validate();
        if (Object.keys(problems).length > 0) {
            setErrors(problems);
            return;
        }

        setLoading(true);

        // Auto generate SKU jika user lupa klik tombol generate tapi nama produk ada
        let finalSku = formData.sku;
        if (!finalSku && formData.productName) {
            finalSku = nextSku(formData.productName);
        }

        const body: ProductPayload = {
            product_name: formData.productName,
            price: Number(digitsOnly(formData.price)),
            sku: finalSku || `HWG-${Date.now()}`, // Fallback terakhir banget
            description: formData.description,
            product_type: formData.productType,
            cost: formData.cost ? Number(digitsOnly(formData.cost)) : null,
            image_url: formData.imageUrl.trim() ? formData.imageUrl.trim() : null,
            billing_period:
                formData.productType === "subscription" && formData.billingPeriod
                    ? formData.billingPeriod
                    : null,
        };
        // `status` is update-only: a new product is always active (D3.3),
        // and sending it on create would be an unknown field.
        if (id) {
            body.status = formData.status;
        }

        const response = id
            ? await updateFormProduct(body, id)
            : await postFormProduct(body);

        setLoading(false);

        if (response.success) {
            notify.success(id ? "Product Updated" : "Product Saved", {
                description: id
                    ? "Product details have been successfully updated."
                    : "New product has been successfully created.",
            });
            onOpenChange(false);
            reset();
            if (id) setEditId("");
            return;
        }

        const message = response.error || "An error occurred while saving the product.";
        // "Product already exists with this SKU" belongs under the SKU field,
        // not only in a toast that disappears.
        if (/sku/i.test(message)) {
            setErrors((prev) => ({ ...prev, sku: message }));
        } else {
            notify.error(id ? "Failed to Update" : "Failed to Save", { description: message });
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

    const isSubscription = formData.productType === "subscription";

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
                            {id ? "Update Product" : "Add Product"}
                        </h2>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Product Name</label>
                                <AppInput
                                    name="productName"
                                    placeholder="e.g., Aplikasi CRM Enterprise"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    isBgWhite
                                    error={!!errors.productName}
                                    helperText={errors.productName}
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
                                    error={!!errors.price}
                                    helperText={errors.price}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                        inputProps={{ maxLength: PRODUCT_SKU_MAX_LENGTH }}
                                        error={!!errors.sku}
                                        helperText={errors.sku}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateSKU}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-[#5479EE] transition-colors"
                                        title="Generate Smart SKU"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Type</label>
                                <AppSelect
                                    value={formData.productType}
                                    onChange={(e) => {
                                        const nextType = e.target.value as ProductType;
                                        setFormData((p) => ({
                                            ...p,
                                            productType: nextType,
                                            // Billing period only means something on a subscription.
                                            billingPeriod: nextType === "subscription" ? p.billingPeriod : "",
                                        }));
                                        setErrors((prev) => ({ ...prev, billingPeriod: undefined }));
                                    }}
                                    options={PRODUCT_TYPE_OPTIONS}
                                    isBgWhite
                                    rounded="6px"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">
                                    Cost (IDR)
                                    <span className="text-gray-400 font-normal ml-2 text-xs">(optional, internal)</span>
                                </label>
                                <AppInput
                                    name="cost"
                                    type="text"
                                    placeholder="e.g., 7.500"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    isBgWhite
                                    error={!!errors.cost}
                                    helperText={errors.cost}
                                />
                            </div>

                            {isSubscription ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Billing Period</label>
                                    <AppSelect
                                        value={formData.billingPeriod}
                                        placeholder="Pilih periode tagihan"
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, billingPeriod: e.target.value as BillingPeriod }))
                                        }
                                        options={BILLING_PERIOD_OPTIONS}
                                        isBgWhite
                                        rounded="6px"
                                        error={!!errors.billingPeriod}
                                        helperText={errors.billingPeriod}
                                    />
                                </div>
                            ) : id ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Status</label>
                                    <AppSelect
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, status: e.target.value as ProductStatus }))
                                        }
                                        options={PRODUCT_STATUS_OPTIONS}
                                        isBgWhite
                                        rounded="6px"
                                    />
                                </div>
                            ) : null}
                        </div>

                        {isSubscription && id && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Status</label>
                                    <AppSelect
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, status: e.target.value as ProductStatus }))
                                        }
                                        options={PRODUCT_STATUS_OPTIONS}
                                        isBgWhite
                                        rounded="6px"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">
                                Image URL
                                <span className="text-gray-400 font-normal ml-2 text-xs">(optional)</span>
                            </label>
                            <AppInput
                                name="imageUrl"
                                placeholder="https://..."
                                value={formData.imageUrl}
                                onChange={handleChange}
                                isBgWhite
                                inputProps={{ maxLength: 1024 }}
                                error={!!errors.imageUrl}
                                helperText={errors.imageUrl}
                            />
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
                            isLoading={loading}
                        >
                            {id ? "Update Product" : "Save Product"}
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
                variant="discard"
            />
        </>
    );
}
