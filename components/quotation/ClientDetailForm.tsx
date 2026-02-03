"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lead } from "@/lib/models/types"
import { DropdownSelectSearch } from "../ui/dropdown-menu"
import { AppInput } from "../ui/app-input"
import { AppDatePicker } from "../ui/app-datepicker"
import { format } from "date-fns"

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
          <AppInput
            placeholder="Enter company name"
            value={clientData.companyName || ""}
            onChange={(e) => handleChange("companyName", e.target.value)}
            isBgWhite
            height="40px"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <AppInput
            placeholder="Enter phone number"
            type="tel"
            value={clientData.phoneNumber || ""}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            isBgWhite
            height="40px"
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <AppInput
            placeholder="Enter email address"
            type="email"
            value={clientData.emailAddress || ""}
            onChange={(e) => handleChange("emailAddress", e.target.value)}
            isBgWhite
            height="40px"
          />
        </div>

        <div className="space-y-2">
          <Label>Quotation Title</Label>
          <AppInput
            placeholder="Enter quotation title"
            value={clientData.quotationTitle || ""}
            onChange={(e) => handleChange("quotationTitle", e.target.value)}
            isBgWhite
            height="40px"
          />
        </div>

        <div className="space-y-2">
          <Label>Quotation ID</Label>
          <AppInput
            placeholder="Enter quotation ID"
            value={clientData.quotationId || ""}
            onChange={(e) => handleChange("quotationId", e.target.value)}
            isBgWhite
            height="40px"
          />
        </div>

        <div className="space-y-2">
          <Label>Issue Date</Label>
          <AppDatePicker
            isBgWhite
            value={clientData.issueDate ? new Date(clientData.issueDate) : null}
            onChange={(date: any) => handleChange("issueDate", date ? format(date, "yyyy-MM-dd") : "")}
          />
        </div>

        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <AppDatePicker
            isBgWhite
            value={clientData.expiryDate ? new Date(clientData.expiryDate) : null}
            onChange={(date: any) => handleChange("expiryDate", date ? format(date, "yyyy-MM-dd") : "")}
          />
        </div>
      </div>
    </div>
  )
}
