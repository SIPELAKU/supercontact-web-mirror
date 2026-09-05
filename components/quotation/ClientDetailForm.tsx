"use client"

import { Label } from "@/components/ui/label"
import { QuotationLead } from "@/lib/api/quotations"
import { AppInput } from "../ui/app-input"
import { AppDatePicker } from "../ui/app-datepicker"
import { AppAutocomplete } from "../ui/app-autocomplete"
import { AppSelect } from "../ui/app-select"
import { format } from "date-fns"
import { useState, useCallback, useRef, useMemo } from "react"
import { useActiveSalesChannels } from "@/lib/hooks/useCommercialContext"

interface ClientDetailsProps {
  clientData?: Record<string, any>
  setClientData?: (data: Record<string, any>) => void
  leads?: QuotationLead[]
  isLoadingLeads?: boolean
  onClientSearch?: (query: string) => void
  /** The client cannot be swapped on an existing quotation. */
  isReadOnlyClient?: boolean
  /** Nothing is editable: the quotation is no longer a draft. */
  readOnly?: boolean
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
  salesperson?: string;
  /** Phase 3 (spec I6): a RESOLUTION LEVEL, so changing it re-prices. */
  sales_channel_id?: string;
}


export default function ClientDetailsSection({
  clientData = {},
  setClientData = () => { },
  leads = [],
  isLoadingLeads = false,
  onClientSearch = () => { },
  isReadOnlyClient = false,
  readOnly = false,
}: ClientDetailsProps) {
  // `comm02seed` seeds four channels for EVERY company (spec A20), so this
  // picker is non-empty on day one for every tenant - it never renders as an
  // empty select that looks broken.
  const { data: channelPage } = useActiveSalesChannels();
  const channelOptions = useMemo(
    () => [
      { value: "", label: "Tanpa kanal" },
      ...(channelPage?.items ?? []).map((channel) => ({
        value: channel.id,
        label: channel.name,
      })),
    ],
    [channelPage]
  );

  // Did the USER pick the channel, or did `handleLeadChange` seed it a moment
  // ago? Reading `clientData.sales_channel_id` alone cannot tell the two
  // apart, and treating the seed as a deliberate pick meant a quotation
  // written against client B was previewed and SAVED on client A's channel -
  // a price list assigned to that channel then priced every line. Reset
  // whenever the selected lead is dropped, so the next pick re-seeds.
  const channelTouchedRef = useRef(false);

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
        salesperson: selectedLead.user?.fullname || "",
        // Seed the channel from the lead's own unless the user picked one
        // by hand: `leads.sales_channel_id` is derived from `lead_source` on
        // create (spec B7), so the lead already knows where it came from.
        // Unconditional when untouched - otherwise a channel seeded from the
        // PREVIOUS lead survives the swap.
        sales_channel_id: channelTouchedRef.current
          ? clientData.sales_channel_id || ""
          : selectedLead.sales_channel?.id ?? "",
      });
    }
  };

  // Debounce search to avoid too many API calls
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchInputChange = useCallback((event: any, value: string, reason: string) => {
    // Clear selection if user is typing and it doesn't match the current selection
    if (reason === 'input' && clientData.lead_id && value !== clientData.clientName) {
      // The channel goes with the client it came from: leaving it set here is
      // how the previous customer's channel ended up pricing the next one.
      channelTouchedRef.current = false;
      setClientData({
        ...clientData,
        lead_id: "",
        clientName: "",
        companyName: "",
        officeLocation: "",
        phoneNumber: "",
        emailAddress: "",
        quotationTitle: "New Project Proposal",
        salesperson: "",
        sales_channel_id: "",
      });
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onClientSearch(value);
    }, 300); // 300ms debounce
  }, [onClientSearch, clientData, setClientData]);

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
            {isReadOnlyClient ? (
              <AppInput
                value={clientData.clientName || ""}
                disabled={true}
                isBgWhite
                height="48px"
                rounded="8px"
              />
            ) : (
              <AppAutocomplete
                options={leads.map(lead => ({
                  value: lead.id,
                  label: lead.contact.name
                }))}
                value={clientData.lead_id ?
                  { value: clientData.lead_id, label: clientData.clientName || "" } :
                  null
                }
                onChange={(event, newValue) => {
                  if (newValue && typeof newValue === 'object' && 'value' in newValue) {
                    handleLeadChange(newValue.value);
                  } else {
                    // Clear client data when autocomplete is cleared
                    setClientData({
                      ...clientData,
                      lead_id: "",
                      clientName: "",
                      companyName: "",
                      officeLocation: "",
                      phoneNumber: "",
                      emailAddress: "",
                      quotationTitle: "New Project Proposal",
                      salesperson: "",
                    });
                  }
                }}
                filterOptions={(options) => options}
                getOptionKey={(option) => {
                  if (typeof option === 'string') return option;
                  return option.value;
                }}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.label || '';
                }}
                isOptionEqualToValue={(option, value) => {
                  if (typeof option === 'string' || typeof value === 'string') return false;
                  return option.value === value.value;
                }}
                onInputChange={handleSearchInputChange}
                placeholder={isLoadingLeads ? "Loading Leads..." : "Search client name..."}
                isBgWhite
                height="48px"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Company Name</Label>
            <AppInput
              placeholder="Enter company name"
              value={clientData.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
            {/* AppDatePicker has no disabled prop, so a read-only quotation
                shows its expiry as a disabled field: out of reach for mouse,
                keyboard and screen reader alike, like every other field. */}
            {readOnly ? (
              <AppInput
                value={clientData.expiryDate ? format(new Date(clientData.expiryDate), "dd MMM yyyy") : "-"}
                disabled={true}
                isBgWhite
                height="48px"
                rounded="8px"
              />
            ) : (
              <AppDatePicker
                isBgWhite
                value={clientData.expiryDate ? new Date(clientData.expiryDate) : null}
                onChange={(date: any) => handleChange("expiryDate", date ? format(date, "yyyy-MM-dd") : "")}
              />
            )}
          </div>
        </div>

        {/* Row 4: Sales channel (Phase 3, spec I6). It sits beside the two
            fields on this card the user actually edits, and it is a pricing
            input: a price list can be assigned to a channel, so changing it
            re-runs the preview. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Kanal Penjualan</Label>
            <AppSelect
              isBgWhite
              fullWidth
              height="48px"
              rounded="8px"
              value={clientData.sales_channel_id || ""}
              options={channelOptions}
              disabled={readOnly}
              onChange={(e) => {
                channelTouchedRef.current = true;
                handleChange("sales_channel_id", String(e.target.value));
              }}
              helperText="Dari mana penjualan ini datang. Bisa memengaruhi daftar harga yang dipakai."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
