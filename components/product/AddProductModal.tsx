"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fetchProfile } from "@/lib/api/users";
import {
    BILLING_PERIOD_LABELS,
    PRODUCT_STATUS_LABELS,
    useGetProductStore,
    type BillingPeriod,
    type ProductPayload,
    type ProductStatus,
    type ProductType,
} from "@/lib/store/product";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/constants/product-type";
import type { AddProductModalProps } from "@/lib/types/Products";
import { useAuth } from "@/lib/context/AuthContext";
import { useProductCategoryTree } from "@/lib/hooks/useProductCategories";
import { useActiveUnits } from "@/lib/hooks/useUnits";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { flattenTree } from "@/lib/utils/categoryTree";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    customFieldErrorsByKey,
    isBlankCustomValue,
    validateCustomFieldValues,
} from "@/lib/utils/customFieldValues";
import CustomFieldsPanel from "@/components/custom-fields/CustomFieldsPanel";
import ProductImageUploadField from "@/components/product/ProductImageUploadField";
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
    categoryId: string;
    unitId: string;
    customFields: Record<string, unknown>;
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
    categoryId: "",
    unitId: "",
    customFields: {},
};

/** API field names -> the form control that owns them (spec I4 error routing). */
const API_FIELD_TO_FORM: Record<string, keyof ProductForm> = {
    sku: "sku",
    product_name: "productName",
    price: "price",
    cost: "cost",
    description: "description",
    product_type: "productType",
    billing_period: "billingPeriod",
    image_url: "imageUrl",
    file: "imageUrl",
    category_id: "categoryId",
    unit_id: "unitId",
    status: "status",
};

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

export function AddProductModal({ open, onOpenChange, product = null, onSaved }: AddProductModalProps) {
    const { postFormProduct, listProduct, updateFormProduct } = useGetProductStore();
    const { getToken } = useAuth();
    const [errors, setErrors] = useState<FormErrors>({});
    const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // The row handed in IS the edit source of truth; no id lookup in the
    // last batch (which could only find rows of the batch last fetched).
    const isEdit = Boolean(product);
    const editId = product?.id ?? "";

    const { data: tree } = useProductCategoryTree({ enabled: open });
    const { data: unitsPage } = useActiveUnits({ enabled: open });
    const { definitions: productDefinitions } = useCustomFieldDefinitionsFor("product", { enabled: open });

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
                // The auth context is the one place the token comes from.
                const token = await getToken().catch(() => null);
                if (!token) return;

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
    }, [open, getToken]);

    // LOGIC GENERATE SKU: {PRODUK}-{COMPANY}-{NOMOR}
    // The suggestion reads the CURRENT batch only (SuperTable keeps the rest
    // to itself); the server's 400/409 on a duplicate SKU is the real guard.
    const nextSku = (productName: string) => {
        const prodPrefix = productName ? getSmartAbbreviation(productName) : "HWG";
        const baseSKU = `${prodPrefix}-${companyAcronym}`;

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
        setCustomFieldErrors({});
    };

    // Seed from the row on open; a create starts empty.
    useEffect(() => {
        if (!open) return;
        if (!product) {
            setFormData(EMPTY_FORM);
        } else {
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
                categoryId: product.category_id ?? "",
                unitId: product.unit_id ?? "",
                customFields: { ...(product.custom_fields ?? {}) },
            });
        }
        setErrors({});
        setCustomFieldErrors({});
    }, [open, product]);

    // Kategori: the active tree, indented. An archived category still assigned
    // to the row being edited stays selectable-as-is (disabled) so the form
    // shows what is stored instead of silently clearing it.
    const categoryOptions = useMemo(() => {
        const flat = flattenTree(tree ?? []);
        const options: { value: string; label: string; disabled?: boolean }[] = [
            { value: "", label: "Tanpa kategori" },
            ...flat.map((node) => ({ value: node.id, label: node.label })),
        ];
        if (product?.category_id && !flat.some((node) => node.id === product.category_id)) {
            options.push({
                value: product.category_id,
                label: `${product.category?.name ?? "Kategori"} (tidak aktif)`,
                disabled: true,
            });
        }
        return options;
    }, [tree, product]);

    // Satuan: every active unit with its precision; an archived unit still
    // assigned to the row being edited stays visible-as-is (disabled).
    const unitOptions = useMemo(() => {
        const units = unitsPage?.units ?? [];
        const options: { value: string; label: string; disabled?: boolean }[] = [
            { value: "", label: "Tanpa satuan" },
            ...units.map((u) => ({ value: u.id, label: `${u.name} (${u.precision} desimal)` })),
        ];
        if (product?.unit_id && !units.some((u) => u.id === product.unit_id)) {
            options.push({ value: product.unit_id, label: "Satuan tidak aktif", disabled: true });
        }
        return options;
    }, [unitsPage, product]);

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

    const handleCustomFieldChange = (fieldKey: string, value: unknown) => {
        setFormData((p) => ({ ...p, customFields: { ...p.customFields, [fieldKey]: value } }));
        if (customFieldErrors[fieldKey]) {
            setCustomFieldErrors((prev) => ({ ...prev, [fieldKey]: "" }));
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

    /**
     * The product attributes as the API wants them: only DEFINED keys, blanks
     * as null (an explicit clear on the merge-update), numbers normalised.
     * The server re-validates strictly; this pre-check shows the same message
     * under the same control without the round trip.
     */
    const prepareCustomFields = () => {
        const result = validateCustomFieldValues(productDefinitions, formData.customFields, {
            entityType: "product",
            mode: "strict",
            enforceRequired: true,
            builtIns: { product_type: formData.productType, status: formData.status },
            // The row's stored values: a key left by a DEACTIVATED definition
            // is seeded into the form with no control to clear it and must
            // not block the save (the server keeps it too).
            storedValues: product?.custom_fields ?? null,
        });
        const payload: Record<string, unknown> = {};
        for (const def of productDefinitions) {
            if (def.is_active === false) continue;
            const value = result.values[def.field_key];
            if (Object.prototype.hasOwnProperty.call(formData.customFields, def.field_key) || !isBlankCustomValue(value)) {
                payload[def.field_key] = isBlankCustomValue(value) ? null : value;
            }
        }
        return { payload, errors: customFieldErrorsByKey(result.errors) };
    };

    const routeServerErrors = (message: string, details: unknown) => {
        const fieldErrors = extractFieldErrors({ message, details });
        const nextErrors: FormErrors = {};
        const nextCustom: Record<string, string> = {};
        let unrouted: string | null = null;
        const definedKeys = new Set(productDefinitions.map((d) => d.field_key));

        for (const [field, text] of Object.entries(fieldErrors)) {
            const formField = API_FIELD_TO_FORM[field];
            if (formField) nextErrors[formField] = text;
            else if (definedKeys.has(field) || field === "custom_fields") nextCustom[field] = text;
            else unrouted = unrouted ? `${unrouted}; ${text}` : text;
        }
        // "Product already exists with this SKU" belongs under the SKU field,
        // not only in a toast that disappears (kept from Phase 0).
        if (Object.keys(fieldErrors).length === 0 && /sku/i.test(message)) {
            nextErrors.sku = message;
        } else if (Object.keys(fieldErrors).length === 0) {
            unrouted = message;
        }

        if (Object.keys(nextErrors).length > 0) setErrors((prev) => ({ ...prev, ...nextErrors }));
        if (Object.keys(nextCustom).length > 0) setCustomFieldErrors((prev) => ({ ...prev, ...nextCustom }));
        if (unrouted) {
            notify.error(isEdit ? "Failed to Update" : "Failed to Save", { description: unrouted });
        }
    };

    const handleSave = async () => {
        const problems = validate();
        const custom = prepareCustomFields();
        if (Object.keys(problems).length > 0 || Object.keys(custom.errors).length > 0) {
            setErrors(problems);
            setCustomFieldErrors(custom.errors);
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
            // Explicit null clears on update; on create null and absent are the same.
            category_id: formData.categoryId || null,
            unit_id: formData.unitId || null,
        };
        // Sent only when the tenant has product definitions or something is set,
        // so a tenant without custom fields sends the Phase 0 body unchanged.
        if (productDefinitions.length > 0 || Object.keys(custom.payload).length > 0) {
            body.custom_fields = custom.payload;
        }
        // `status` is update-only: a new product is always active (D3.3),
        // and sending it on create would be an unknown field.
        if (isEdit) {
            body.status = formData.status;
        }

        const response = isEdit
            ? await updateFormProduct(body, editId)
            : await postFormProduct(body);

        setLoading(false);

        if (response.success) {
            notify.success(isEdit ? "Product Updated" : "Product Saved", {
                description: isEdit
                    ? "Product details have been successfully updated."
                    : "New product has been successfully created.",
            });
            onSaved?.();
            onOpenChange(false);
            reset();
            return;
        }

        routeServerErrors(response.error || "An error occurred while saving the product.", response.details);
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
                            {isEdit ? "Update Product" : "Add Product"}
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
                                <label className="text-sm font-semibold text-gray-900">Kategori</label>
                                <AppSelect
                                    value={formData.categoryId}
                                    placeholder="Tanpa kategori"
                                    onChange={(e) => {
                                        setFormData((p) => ({ ...p, categoryId: e.target.value as string }));
                                        setErrors((prev) => ({ ...prev, categoryId: undefined }));
                                    }}
                                    options={categoryOptions}
                                    isBgWhite
                                    rounded="6px"
                                    error={!!errors.categoryId}
                                    helperText={errors.categoryId}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">
                                    Satuan
                                    <span className="text-gray-400 font-normal ml-2 text-xs">(menentukan desimal Qty di quotation)</span>
                                </label>
                                <AppSelect
                                    value={formData.unitId}
                                    placeholder="Tanpa satuan"
                                    onChange={(e) => {
                                        setFormData((p) => ({ ...p, unitId: e.target.value as string }));
                                        setErrors((prev) => ({ ...prev, unitId: undefined }));
                                    }}
                                    options={unitOptions}
                                    isBgWhite
                                    rounded="6px"
                                    error={!!errors.unitId}
                                    helperText={errors.unitId}
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
                            ) : isEdit ? (
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

                        {isSubscription && isEdit && (
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

                        <ProductImageUploadField
                            value={formData.imageUrl}
                            onChange={(url) => {
                                setFormData((p) => ({ ...p, imageUrl: url }));
                                setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                            }}
                            disabled={loading}
                            error={errors.imageUrl}
                        />

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

                        {/* Product attributes: tenant-defined, never price-bearing (spec A8). */}
                        <CustomFieldsPanel
                            entityType="product"
                            definitions={productDefinitions}
                            values={formData.customFields}
                            onChange={handleCustomFieldChange}
                            builtInValues={{ product_type: formData.productType, status: formData.status }}
                            showRequiredMarkers
                            errors={customFieldErrors}
                            title="Atribut produk"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-10 border-t pt-4">
                        <AppButton
                            variantStyle="outline"
                            color="primary"
                            onClick={() => {
                                reset();
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
                            {isEdit ? "Update Product" : "Save Product"}
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
