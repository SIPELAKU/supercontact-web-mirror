"use client"

import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"

interface ClientDetailsProps {
  clientData?: Record<string, any>
  setClientData?: (data: Record<string, any>) => void
}

interface ClientDetailsData {
  clientName?: string;
  companyName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  quotationTitle?: string;
  quotationId?: string;
  issueDate?: Date;
  expiryDate?: Date;
}


export default function ClientDetailsSection({
  clientData = {},
  setClientData = () => {},
}: ClientDetailsProps) {
  const handleChange = <K extends keyof ClientDetailsData>(
    field: K,
    value: ClientDetailsData[K]
  ) => {
    setClientData({
      ...clientData,
      [field]: value,
    });
  };


  return (
    <div className="bg-white px-6 pt-6">
      <h2 className="mb-6 text-base font-semibold text-gray-900">
        Client Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="space-y-2">
          <Label>Client Name</Label>
          <Select
            value={clientData.clientName || ""}
            onChange={(v) => handleChange("clientName", v)}
            className="h-10 bg-white"
          >
            <SelectItem value="john-doe">John Doe</SelectItem>
            <SelectItem value="jane-smith">Jane Smith</SelectItem>
            <SelectItem value="acme-corp">ACME Corp</SelectItem>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input
            placeholder="Enter company name"
            value={clientData.companyName || ""}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            placeholder="Enter phone number"
            type="tel"
            value={clientData.phoneNumber || ""}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            placeholder="Enter email address"
            type="email"
            value={clientData.emailAddress || ""}
            onChange={(e) => handleChange("emailAddress", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label>Quotation Title</Label>
          <Input
            placeholder="Enter quotation title"
            value={clientData.quotationTitle || ""}
            onChange={(e) => handleChange("quotationTitle", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label>Quotation ID</Label>
          <Input
            placeholder="Enter quotation ID"
            value={clientData.quotationId || ""}
            onChange={(e) => handleChange("quotationId", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label>Issue Date</Label>
          <DatePicker
            value={clientData.issueDate || new Date()}
            onChange={(v) => handleChange("issueDate", v)}
          />
        </div>

        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <DatePicker
            value={clientData.expiryDate || new Date()}
            onChange={(v) => handleChange("expiryDate", v)}
          />
        </div>
      </div>
    </div>
    
  )
}
