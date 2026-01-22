"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormControl, MenuItem, Select as MuiSelect } from "@mui/material"

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
          <FormControl fullWidth size="small">
            <MuiSelect
              value={clientData.clientName || ""}
              onChange={(e) => handleChange("clientName", e.target.value)}
              sx={{ height: '40px', bgcolor: 'white' }}
            >
              <MenuItem value="john-doe">John Doe</MenuItem>
              <MenuItem value="jane-smith">Jane Smith</MenuItem>
              <MenuItem value="acme-corp">ACME Corp</MenuItem>
            </MuiSelect>
          </FormControl>
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
          <Input
            type="date"
            value={clientData.issueDate ? new Date(clientData.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            onChange={(e) => handleChange("issueDate", e.target.value ? new Date(e.target.value) : new Date())}
          />
        </div>

        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <Input
            type="date"
            value={clientData.expiryDate ? new Date(clientData.expiryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            onChange={(e) => handleChange("expiryDate", e.target.value ? new Date(e.target.value) : new Date())}
          />
        </div>
      </div>
    </div>
    
  )
}
