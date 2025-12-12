"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ClientDetailsCard from "@/components/quotation/ClientDetailForm";
import ProductsServicesCard from "@/components/quotation/ProductsServicesTable";
import NotesCard from "@/components/quotation/NotesSection";
import SummaryCard from "@/components/quotation/QuotationSummary";
import type { ItemRow } from "@/lib/type/Quotation";
import PageHeader from "@/components/ui-mui/page-header";
import { TextField } from "@mui/material";

export default function QuotationForm() {
  const [items, setItems] = useState<ItemRow[]>([
    { title: "App Design", sku: "BLJ-SA-001", desc: "Description…", qty: 1, discount: 8, unitPrice: 1800 },
  ]);
  const [salesperson, setSalesperson] = useState("Tommy Shelby")
  const [discount, setDiscount] = useState(28);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [notes, setNotes] = useState(
    "It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!"
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0),
    [items]
  );

  const discountAmount = useMemo(
    () => (subtotal * discount) / 100,
    [subtotal, discount]
  );

  const taxAmount = useMemo(
    () => (taxEnabled ? subtotal * 0.21 : 0),
    [subtotal, taxEnabled]
  );

  const grandTotal = useMemo(
    () => subtotal - discountAmount + taxAmount,
    [subtotal, discountAmount, taxAmount]
  );

  const updateQty = (index: number, qty: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].qty = qty;
      return updated;
    });
  };

  const addItem = () =>
    setItems((p) => [
      ...p,
      { title: "New Item", sku: "BLJ-SA-001", desc: "Description…", qty: 1, discount: 0, unitPrice: 0 },
    ]);

  const removeItem = (index: number) =>
    setItems((p) => p.filter((_, i) => i !== index));

  return (
    <div className="p-6">

      <PageHeader
        title="Quotation Builder"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Quotation Builder" },
          { label: "Add New Quotation" },
        ]}
      />

      <div className="flex flex-col rounded-2xl border border-gray-300 p-2">
        <div className="lg:col-span-2 space-y-8">
          <ClientDetailsCard />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <ProductsServicesCard
            items={items}
            updateQty={updateQty}
            addItem={addItem}
            removeItem={removeItem}
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <div className="flex items-center justify-between px-6">
          <section className="flex items-center gap-4">
            <label htmlFor="salesperson" className="text-foreground font-medium">
              Salesperson:
            </label>
            <TextField
              id="salesperson"
              value={salesperson}
              disabled
              onChange={(e) => setSalesperson(e.target.value)}
              placeholder="Enter salesperson name"
              variant="outlined"
              size="small"
              sx={{
                width: "200px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F3F4F6",
                },
              }}
            />
          </section>
          <SummaryCard
            subtotal={subtotal}
            discount={discount}
            discountAmount={discountAmount}
            taxEnabled={taxEnabled}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            setDiscount={setDiscount}
            setTaxEnabled={setTaxEnabled}
          />
          </div>
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <NotesCard notes={notes} onChange={setNotes} />
          <div className="flex justify-end items-center mb-8">
            <div className="flex gap-3">
              <Link href="/sales/quotation">
                <Button variant="outline" className="h-10 px-6 rounded-lg">
                  Cancel
                </Button>
              </Link>

              <Button variant="outline" className="h-10 px-6 rounded-lg">
                Save as Draft
              </Button>

              <Button className="h-10 px-6 rounded-lg bg-[#5479EE] text-white hover:bg-[#4364d1]">
                Save & Send
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
