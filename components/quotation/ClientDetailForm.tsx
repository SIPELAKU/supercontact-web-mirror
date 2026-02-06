"use client"

import { Label } from "@/components/ui/label"
import { Lead } from "@/lib/models/types"
import { AppInput } from "../ui/app-input"
import { AppDatePicker } from "../ui/app-datepicker"
import { AppSelect } from "../ui/app-select"
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
  officeLocation?: string;
  phoneNumber?: string;
  emailAddress?: string;
  quotationTitle?: string;
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
        officeLocation: selectedLead.office_location || "",
        phoneNumber: selectedLead.contact.phone_number,
        emailAddress: selectedLead.contact.email,
        quotationTitle: `Quotation for ${selectedLead.contact.name}`,
      });
    }
  };

  return (
    <div className="bg-white px-6 pt-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Client Details
      </h2>

      <div className="space-y-4">
        {/* Row 1: Client Name | Company Name | Office Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Client Name</Label>
            <AppSelect
              value={clientData.lead_id || ""}
              options={leads.map(lead => ({
                value: lead.id,
                label: lead.contact.name
              }))}
              onChange={(e) => handleLeadChange(e.target.value as string)}
              placeholder={isLoadingLeads ? "Loading Leads..." : "Select Client"}
              isBgWhite
              height="48px"
              rounded="8px"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Company Name</Label>
            <AppInput
              placeholder="Enter company name"
              value={clientData.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
              isBgWhite
              height="48px"
              rounded="8px"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Office Location</Label>
            <AppInput
              placeholder="Enter office location"
              value={clientData.officeLocation || ""}
              onChange={(e) => handleChange("officeLocation", e.target.value)}
              isBgWhite
              height="48px"
              rounded="8px"
            />
          </div>
        </div>

        {/* Row 2: Phone Number | Email Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
            <AppInput
              placeholder="Enter phone number"
              type="tel"
              value={clientData.phoneNumber || ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              isBgWhite
              height="48px"
              rounded="8px"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email Address</Label>
            <AppInput
              placeholder="Enter email address"
              type="email"
              value={clientData.emailAddress || ""}
              onChange={(e) => handleChange("emailAddress", e.target.value)}
              isBgWhite
              height="48px"
              rounded="8px"
            />
          </div>
        </div>

        {/* Row 3: Quotation Title | Expiry Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Quotation Title</Label>
            <AppInput
              placeholder="Enter quotation title"
              value={clientData.quotationTitle || ""}
              onChange={(e) => handleChange("quotationTitle", e.target.value)}
              isBgWhite
              height="48px"
              rounded="8px"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
            <AppDatePicker
              isBgWhite
              value={clientData.expiryDate ? new Date(clientData.expiryDate) : null}
              onChange={(date: any) => handleChange("expiryDate", date ? format(date, "yyyy-MM-dd") : "")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
