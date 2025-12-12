"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui-mui/dialog";
import { Button } from "@/components/ui-mui/button";
import { Input } from "@/components/ui-mui/input";
import { Select, SelectItem } from "@/components/ui-mui/select";
import type { AddProductModalProps } from "@/lib/type/Products";

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
    const [formData, setFormData] = useState({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleTaxChange = (v: string) => {
        setFormData((p) => ({ ...p, taxRate: v }));
    };

    const handleSave = () => {
        console.log("Product saved:", formData);
        onOpenChange(false);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
            <DialogContent className="max-w-[850px] w-full px-10 py-8 rounded-2xl bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-[#5479EE]">
                        Add New Product
                    </DialogTitle>
                </DialogHeader>

                <div className=" mt-6">

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

                    <div className="grid grid-cols-2 gap-6">
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
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Tax Rate</label>
                        <Select value={formData.taxRate} onChange={handleTaxChange} className="bg-white">
                            <SelectItem value="standard">Standard (5%)</SelectItem>
                            <SelectItem value="reduced">Reduced (3%)</SelectItem>
                            <SelectItem value="zero">Zero (0%)</SelectItem>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Description</label>
                        <textarea
                            name="description"
                            placeholder="Enter product description..."
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-10 border-t pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            reset();
                            onOpenChange(false);
                        }}
                        className="px-6"
                    >
                        Cancel
                    </Button>
                    <Button className="px-6 bg-[#5479EE] text-white hover:bg-blue-700" onClick={handleSave}>
                        Save Product
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
