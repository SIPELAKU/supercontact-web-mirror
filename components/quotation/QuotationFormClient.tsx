"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { TextField } from "@mui/material";
import ClientDetailsCard from "@/components/quotation/ClientDetailForm";
import NotesCard from "@/components/quotation/NotesSection";
import ProductsServicesCard from "@/components/quotation/ProductsServicesTable";
import SummaryCard from "@/components/quotation/QuotationSummary";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import type { ItemRow } from "@/lib/types/Quotation";
import { createQuotation, updateQuotation, sendQuotationEmail } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useQuotationLeads } from "@/lib/hooks/useQuotationLeads";
import type { QuotationLead } from "@/lib/api/quotations";
import { useGetProductStore } from "@/lib/store/product";

import { notify } from "@/lib/notifications";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
import { Spinner } from "../ui/spinner";
import QuotationSuccessModal from "./QuotationSuccessModal";


interface QuotationFormClientProps {
  initialData?: any;
}

export default function QuotationFormClient({ initialData }: QuotationFormClientProps) {
  const { getToken } = useAuth();
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const { data: leadsResponse, isLoading: isLoadingLeads } = useQuotationLeads(
    1,
    100,
    clientSearchQuery,
    { enabled: !initialData || clientSearchQuery.length > 0 }
  );
  const leads = leadsResponse?.data?.leads || [];

  const { listProduct, fetchProduct } = useGetProductStore();

  useEffect(() => {
    fetchProduct({ limit: 100 });
  }, [fetchProduct]);

  const [clientData, setClientData] = useState<Record<string, any>>({
    lead_id: "",
    clientName: "",
    companyName: "",
    officeLocation: "",
    phoneNumber: "",
    emailAddress: "",
    quotationTitle: "New Project Proposal",
    quotationId: "",
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    salesperson: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ id: "", number: "", pdfUrl: "" });
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Ensure current lead is in the list for editing
  const leadsWithCurrent = useMemo(() => {
    // Cast leads to any to avoid type mismatch during initialData check
    if (initialData?.lead && !leads.find((l) => l.id === initialData.lead.id)) {
      // Create a compatible object if initialData.lead is different
      return [initialData.lead as QuotationLead, ...leads];
    }
    return leads;
  }, [leads, initialData]);

  // Derive available products from the selected lead's items
  const availableProducts = useMemo(() => {
    const selectedLead = leadsWithCurrent.find(l => l.id === clientData.lead_id);
    const leadItems = selectedLead?.items ? selectedLead.items.map(item => ({
      id: item.id,
      product_name: item.product_name,
      sku: item.sku,
      price: Number(item.price),
      description: item.notes || ""
    })) : [];

    // If "Show All" is toggled or there's no lead selected, include all products
    if (showAllProducts || !clientData.lead_id) {
      // Merge lead items with global products, ensuring no duplicates by SKU
      const globalProducts = listProduct.map(p => ({
        ...p,
        price: Number(p.price)
      }));

      // Combine and deduplicate by SKU
      const combined = [...leadItems];
      globalProducts.forEach(gp => {
        if (!combined.find(li => li.sku === gp.sku)) {
          combined.push(gp as any);
        }
      });
      return combined;
    }

    return leadItems;
  }, [listProduct, leadsWithCurrent, clientData.lead_id, showAllProducts]);

  const [items, setItems] = useState<ItemRow[]>([
    { product_id: "", title: "", sku: "", desc: "", qty: 1, discount: 0, unitPrice: 0 },
  ]);

  // Populate form if initialData is provided
  useEffect(() => {
    if (initialData) {
      // Map initial data to form state
      setClientData({
        lead_id: initialData.lead?.id || "",
        clientName: initialData.lead?.contact?.name || "",
        companyName: initialData.lead?.contact?.company || "",
        officeLocation: initialData.lead?.office_location || "",
        phoneNumber: initialData.lead?.contact?.phone_number || "",
        emailAddress: initialData.lead?.contact?.email || "",
        quotationTitle: initialData.quotation_title || "New Project Proposal",
        quotationId: initialData.quotation_number || "", // Assuming number is the ID/Display ID
        issueDate: initialData.created_at ? new Date(initialData.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: initialData.expire_date ? new Date(initialData.expire_date).toISOString().split('T')[0] : "",
        salesperson: initialData.lead?.user?.fullname || "",
      });

      const rawItems = initialData.items || initialData.quotation_items || [];
      const rawItemOthers = initialData.item_others || [];

      // Merge both types of items
      const allRawItems = [...rawItems, ...rawItemOthers];

      if (allRawItems.length > 0) {
        setItems(allRawItems.map((item: any) => ({
          product_id: item.product_id,
          title: item.product?.product_name || "Unknown Product",
          sku: item.product?.sku || "",
          desc: item.notes || "",
          qty: item.quantity || 1,
          discount: item.discount || 0,
          unitPrice: item.product?.price || 0,
        })));
      }

      if (initialData.notes) {
        setNotes(initialData.notes);
      }
    }
  }, [initialData]);

  const [taxEnabled, setTaxEnabled] = useState(true);
  const [notes, setNotes] = useState(
    "It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * Number(i.unitPrice), 0),
    [items]
  );

  const discountAmount = useMemo(
    () => items.reduce((sum, i) => {
      const itemTotal = i.qty * Number(i.unitPrice);
      const itemDiscount = (itemTotal * (i.discount || 0)) / 100;
      return sum + itemDiscount;
    }, 0),
    [items]
  );

  const taxAmount = useMemo(
    () => (taxEnabled ? (subtotal - discountAmount) * 0.11 : 0),
    [subtotal, discountAmount, taxEnabled]
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
      notify.error("Validation Error", { description: "Please select a lead first" });
      return;
    }

    const missingProduct = items.find(item => !item.product_id);
    if (missingProduct) {
      notify.error("Validation Error", { description: "Please select a product for all items" });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      // Generate PDF first if publishing
      let pdfBlob: Blob | null = null;
      if (action === "publish") {
        pdfBlob = await generatePDF();
        if (!pdfBlob) {
          setIsSubmitting(false);
          return; // generatePDF already handles the user notification
        }
      }

      const payload = new FormData();
      payload.append("action", action);
      payload.append("lead_id", clientData.lead_id);
      payload.append("quotation_title", clientData.quotationTitle || "Untitled Quotation");
      payload.append("expire_date", clientData.expiryDate ? new Date(clientData.expiryDate).toISOString() : new Date().toISOString());

      // Append items as JSON strings
      items.forEach((item) => {
        const itemData = {
          product_id: item.product_id,
          quantity: item.qty, // Map qty to quantity
          notes: item.desc || "", // Map desc to notes
          discount: item.discount || 0,
          price: item.unitPrice // Add price if needed by backend
        };
        payload.append("items", JSON.stringify(itemData));
      });

      // Append PDF to payload if available
      if (pdfBlob) {
        payload.append("attachments", pdfBlob, "quotation.pdf");
      }

      // 1. Save or Update the quotation
      let result;
      if (initialData?.id || initialData?.quotation_number) {
        // It's an update
        const quotationId = initialData.id || initialData.quotation_number;
        result = await updateQuotation(token, quotationId, payload);

        if (action === "publish") {
          notify.success("Success", { description: "Quotation updated and sent successfully!" });
        } else {
          notify.success("Success", { description: "Quotation updated successfully!" });
        }
      } else {
        // It's a creation
        result = await createQuotation(token, payload);

        if (action === "publish") {
          notify.success("Success", { description: "Quotation saved and sent successfully!" });
        } else {
          notify.success("Success", { description: "Quotation saved as draft successfully!" });
        }
      }

      // 2. If action is "publish", we no longer need to manually call send-email API
      // as the backend handles it when action is "publish" and attachment is present.
      if (action === "publish" && pdfBlob) {
        // Logic mainly to facilitate PDF generation for attachment; 
        if (!clientData.emailAddress) {
          throw new Error("Client email address is required to send the quotation");
        }

        const realQuotationUuid = result?.data?.id || initialData?.id || "";
        const realQuotationNumber = result?.data?.quotation_number || initialData?.quotation_number || "NEW-QUOTATION";

        if (pdfBlob) {
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setSuccessData({
            id: realQuotationUuid,
            number: realQuotationNumber,
            pdfUrl
          });
          setShowSuccessModal(true);
        }
      }
    } catch (error: any) {
      console.error("Failed to process quotation:", error);
      notify.error("Error", { description: error.message || "Failed to process quotation" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    const originalElement = document.getElementById("quotation-content");
    if (!originalElement) {
      notify.error("Error", { description: "Quotation template not found" });
      return null;
    }

    // Clone the element to ensure it's visible during capture
    const element = originalElement.cloneNode(true) as HTMLElement;

    // Style the clone to be visible to html2canvas but unobtrusive to user
    // We use a high z-index but place it behind a white overlay or just rely on speed
    // Actually, z-index -1 works best usually, as long as it's within the viewport
    element.style.position = "absolute";
    element.style.top = "0";
    element.style.left = "0";
    element.style.zIndex = "-1000"; // Behind everything
    element.style.width = "800px"; // Fixed A4-like width
    element.style.backgroundColor = "#ffffff"; // Ensure background is white
    element.style.display = "block";

    document.body.appendChild(element);

    try {
      // Small timeout to ensure DOM render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduced scale to optimize size (was 2)
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Use JPEG with 0.75 quality instead of PNG to significantly reduce size
      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true // Enable PDF compression
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      const blob = pdf.output("blob");

      document.body.removeChild(element);
      return blob;
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      notify.error("PDF Error", { description: error.message || "Failed to generate PDF" });

      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
      return null;
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
            leads={leadsWithCurrent}
            isLoadingLeads={isLoadingLeads}
            onClientSearch={setClientSearchQuery}
            isReadOnlyClient={!!initialData}
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />

          <ProductsServicesCard
            items={items}
            updateQty={updateQty}
            updateItemField={updateItemField}
            addItem={addItem}
            removeItem={removeItem}
            listProduct={availableProducts}
            clientData={clientData}
            showAllProducts={showAllProducts}
            setShowAllProducts={setShowAllProducts}
          // loading={isLoadingProducts} // Removed as we don't have this loading state anymore
          />
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <div className="flex items-center justify-between px-6">
            <section className="flex items-center gap-4">
              <label htmlFor="salesperson" className="text-foreground font-medium">
                Salesperson:
              </label>
              <AppInput
                id="salesperson"
                value={clientData.salesperson || ""}
                onChange={(e) => setClientData({ ...clientData, salesperson: e.target.value })}
                placeholder="Select client to view salesperson"
                disabled={true}
                isBgWhite
                height="40px"
              />
            </section>
            <SummaryCard
              subtotal={subtotal}
              discountAmount={discountAmount}
              taxEnabled={taxEnabled}
              taxAmount={taxAmount}
              grandTotal={grandTotal}
              setTaxEnabled={setTaxEnabled}
            />
          </div>
          <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
          <NotesCard notes={notes} onChange={setNotes} />
          <div className="flex justify-end items-center mb-8 px-6">
            <div className="flex gap-3">
              <Link href="/sales/quotation">
                <AppButton variantStyle="danger" color="danger">
                  Cancel
                </AppButton>
              </Link>

              <AppButton
                variantStyle="outline"
                color="primary"
                onClick={() => handleSave("draft")}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Save As Draft"}
              </AppButton>

              <AppButton
                variantStyle="primary"
                color="primary"
                onClick={() => handleSave("publish")}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Publish"}
              </AppButton>
            </div>
          </div>

          <QuotationSuccessModal
            open={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            quotationId={successData.id}
            quotationNumber={successData.number}
            pdfUrl={successData.pdfUrl}
          />
        </div>
      </div>


      {/* Hidden printable area for PDF generation */}
      <div id="quotation-content" className="absolute top-[-10000px] left-[-10000px] w-[800px] p-8 border"
        style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#000000" }}>{clientData.quotationTitle}</h1>
          <p style={{ color: "#6b7280" }}>{clientData.quotationId === "QT-2024-001" ? "DRAFT" : clientData.quotationId}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8" style={{ color: "#000000" }}>
          <div>
            <h3 className="font-bold mb-2">Client Details</h3>
            <p>Name: {clientData.clientName}</p>
            <p>Company: {clientData.companyName}</p>
            <p>Email: {clientData.emailAddress}</p>
            <p>Phone: {clientData.phoneNumber}</p>
          </div>
          <div className="text-right">
            <p>Issue Date: {clientData.issueDate}</p>
            <p>Expiry Date: {clientData.expiryDate}</p>
          </div>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-b-2" style={{ borderColor: "#1f2937" }}>
              <th className="text-left py-2" style={{ color: "#000000" }}>Item</th>
              <th className="text-right py-2" style={{ color: "#000000" }}>Qty</th>
              <th className="text-right py-2" style={{ color: "#000000" }}>Price</th>
              <th className="text-right py-2" style={{ color: "#000000" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                <td className="py-2">
                  <p className="font-bold" style={{ color: "#000000" }}>{item.title}</p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>{item.desc}</p>
                </td>
                <td className="text-right py-2" style={{ color: "#000000" }}>{item.qty}</td>
                <td className="text-right py-2" style={{ color: "#000000" }}>${item.unitPrice.toLocaleString()}</td>
                <td className="text-right py-2" style={{ color: "#000000" }}>${(item.qty * item.unitPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end" style={{ color: "#000000" }}>
          <div className="w-64">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount:</span>
              <span>-${discountAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (21%):</span>
              <span>${taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: "#1f2937" }}>
              <span>Total:</span>
              <span>${grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-8 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="font-bold mb-2" style={{ color: "#000000" }}>Notes</h3>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "#4b5563" }}>{notes}</p>
          </div>
        )}
      </div>
    </div >
  );
}
