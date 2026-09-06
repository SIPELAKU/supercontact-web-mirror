"use client";

import { useParams } from "next/navigation";
import ProductDetailClient from "@/components/product/ProductDetailClient";

// COMMERCIAL Phase 5 (spec I4). The first product DETAIL route: variants,
// bundle composition and unit conversions all need an existing product id, and
// `AddProductModal` saves in one POST/PATCH - so on create they cannot live
// inside it.
export default function ProductDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <ProductDetailClient productId={id} />
        </div>
    );
}
