"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lead } from "@/lib/models/types"
import { DropdownSelectSearch } from "../ui/dropdown-menu"

interface ClientDetailsProps {
  clientData?: Record<string, any>
  setClientData?: (data: Record<string, any>) => void
  leads?: Lead[]
  isLoadingLeads?: boolean
}

interface ClientDetailsData {
  lead_id?: string;
  clientName?: string;
  companyName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  quotationTitle?: string;
  quotationId?: string;
  issueDate?: string;
  expiryDate?: string;
}


export default function ClientDetailsSection({
  clientData = {},
  setClientData = () => { },
  leads = [],
  isLoadingLeads = false,
}: ClientDetailsProps) {
  const handleChange = (
    field: keyof ClientDetailsData,
    value: any
  ) => {
    setClientData({
      ...clientData,
      [field]: value,
    });
  };

  const handleLeadChange = (leadId: string) => {
    const selectedLead = leads.find(l => l.id === leadId);
    if (selectedLead) {
      setClientData({
        ...clientData,
        lead_id: leadId,
        clientName: selectedLead.contact.name,
        companyName: selectedLead.contact.company,
        phoneNumber: selectedLead.contact.phone_number,
        emailAddress: selectedLead.contact.email,
        quotationTitle: `Quotation for ${selectedLead.contact.name}`,
      });
    }
  };

  return (
    <div className="bg-white px-6 pt-6">
      <h2 className="mb-6 text-base font-semibold text-gray-900">
        Client Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="space-y-2">
          <Label>Client Name</Label>
          <DropdownSelectSearch
            value={clientData.lead_id || ""}
            options={leads.map(lead => ({
              value: lead.id,
              label: lead.contact.name
            }))}
            onChange={handleLeadChange}
            placeholder={isLoadingLeads ? "Loading Leads..." : "Select Client"}
            className="w-full border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input
            placeholder="Enter company name"
            value={clientData.companyName || ""}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            placeholder="Enter phone number"
            type="tel"
            value={clientData.phoneNumber || ""}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            placeholder="Enter email address"
            type="email"
            value={clientData.emailAddress || ""}
            onChange={(e) => handleChange("emailAddress", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Quotation Title</Label>
          <Input
            placeholder="Enter quotation title"
            value={clientData.quotationTitle || ""}
            onChange={(e) => handleChange("quotationTitle", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Quotation ID</Label>
          <Input
            placeholder="Enter quotation ID"
            value={clientData.quotationId || ""}
            onChange={(e) => handleChange("quotationId", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Issue Date</Label>
          <Input
            type="date"
            value={clientData.issueDate || ""}
            onChange={(e) => handleChange("issueDate", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <Input
            type="date"
            value={clientData.expiryDate || ""}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>
      </div>
    </div>
  )
}
