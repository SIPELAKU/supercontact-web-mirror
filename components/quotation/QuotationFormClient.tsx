"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TextField } from "@mui/material";
import ClientDetailsCard from "@/components/quotation/ClientDetailForm";
import NotesCard from "@/components/quotation/NotesSection";
import ProductsServicesCard from "@/components/quotation/ProductsServicesTable";
import SummaryCard from "@/components/quotation/QuotationSummary";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import type { ItemRow } from "@/lib/types/Quotation";
import { createQuotation, CreateQuotationData } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useLeads } from "@/lib/hooks/useLeads";
import { useGetProductStore } from "@/lib/store/product";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export default function QuotationFormClient() {
  const { getToken } = useAuth();
  const { data: leadsResponse, isLoading: isLoadingLeads } = useLeads(1, 100);
  const { listProduct, fetchProduct, loading: isLoadingProducts } = useGetProductStore();
  const leads = leadsResponse?.data?.leads || [];

  useEffect(() => {
    fetchProduct({ page: 1, limit: 100 });
  }, []);

  const [items, setItems] = useState<ItemRow[]>([
    { product_id: "", title: "Select Product", sku: "", desc: "Description…", qty: 1, discount: 0, unitPrice: 0 },
  ]);
  const [clientData, setClientData] = useState<Record<string, any>>({
    lead_id: "",
    clientName: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    quotationTitle: "New Project Proposal",
    quotationId: "QT-2024-001",
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [salesperson, setSalesperson] = useState("Muhammad...");
  const [discount, setDiscount] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [notes, setNotes] = useState(
    "It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      updated[index] = { ...updated[index], qty };
      return updated;
    });
  };

  const updateItemField = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () =>
    setItems((p) => [
      ...p,
      { product_id: "", title: "New Item", sku: "", desc: "", qty: 1, discount: 0, unitPrice: 0 },
    ]);

  const removeItem = (index: number) =>
    setItems((p) => p.filter((_, i) => i !== index));

  const handleSave = async (action: "draft" | "publish") => {
    if (!clientData.lead_id) {
      toast.error("Please select a lead first");
      return;
    }

    const missingProduct = items.find(item => !item.product_id);
    if (missingProduct) {
      toast.error("Please select a product for all items");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();

      const payload: CreateQuotationData = {
        action,
        lead_id: clientData.lead_id,
        quotation_title: clientData.quotationTitle || "Untitled Quotation",
        expire_date: clientData.expiryDate ? new Date(clientData.expiryDate).toISOString() : new Date().toISOString(),
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.qty,
          notes: item.desc || "",
          discount: item.discount || 0
        }))
      };

      await createQuotation(token, payload);
      toast.success(`Quotation saved as ${action} successfully!`);
      // Redirect or reset could happen here
    } catch (error: any) {
      console.error("Failed to save quotation:", error);
      toast.error(error.message || "Failed to save quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <ClientDetailsCard
            clientData={clientData}
            setClientData={setClientData}
            leads={leads}
            isLoadingLeads={isLoadingLeads}
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <ProductsServicesCard
            items={items}
            updateQty={updateQty}
            updateItemField={updateItemField}
            addItem={addItem}
            removeItem={removeItem}
            listProduct={listProduct}
            loading={isLoadingProducts}
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
                onChange={(e) => setSalesperson(e.target.value)}
                placeholder="Enter salesperson name"
                variant="outlined"
                size="small"
                sx={{
                  width: "200px",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
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
          <div className="flex justify-end items-center mb-8 px-6">
            <div className="flex gap-3">
              <Link href="/sales/quotation">
                <Button variant="outline" className="h-11 px-8 rounded-xl border-gray-300 text-gray-600">
                  Cancel
                </Button>
              </Link>

              <Button
                variant="outline"
                className="h-11 px-8 rounded-xl border-gray-300 text-gray-600"
                onClick={() => handleSave("draft")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Save as Draft"}
              </Button>

              <Button
                className="h-11 px-8 rounded-xl bg-[#5479EE] text-white hover:bg-[#4364d1]"
                onClick={() => handleSave("publish")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Save & Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
