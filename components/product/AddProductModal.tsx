"use client";

import CustomSelectStage from "@/components/pipeline/SelectDealStage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product, useGetProductStore } from "@/lib/store/product";
import type { AddProductModalProps } from "@/lib/types/Products";
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


export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
    const { postFormProduct, id, listProduct, updateFormProduct, setEditId } = useGetProductStore()
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<ProductForm>({
        productName: "",
        price: "",
        sku: "",
        taxRate: "standard",
        description: "",
    });

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

      useEffect(()=>{
        if(!product) return ;
          setFormData({
              productName: product[0]?.product_name ?? "",
              price: String(product[0]?.price) ?? 0,
              sku: product[0]?.sku ?? "",
              taxRate: product[0]?.tax_rate ?? '11%',
              description: product[0]?.description ?? "",
          })
      },[product])
      

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSave = async() => {
        const body: ProductPayload = {
            "product_name": formData.productName,
            "price": Number(formData.price),
            "sku": formData.sku,
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

                <div className=" mt-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Product Name</label>
                            <Input
                                name="productName"
                                placeholder="e.g., Premium Subscription"
                                value={formData.productName}
                                onChange={handleChange}
                                className="h-11 bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Price</label>
                            <Input
                                name="price"
                                placeholder="e.g., 99.00"
                                value={formData.price}
                                onChange={handleChange}
                                className="h-11 bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">SKU</label>
                            <Input
                                name="sku"
                                placeholder="e.g., SKU-001"
                                value={formData.sku}
                                onChange={handleChange}
                                className="h-11 bg-white"
                            />
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
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full h-15 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
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
