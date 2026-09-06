"use client"

import { Label } from "@/components/ui/label"
import { QuotationLead } from "@/lib/api/quotations"
import { AppInput } from "../ui/app-input"
import { AppDatePicker } from "../ui/app-datepicker"
import { AppAutocomplete } from "../ui/app-autocomplete"
import { AppSelect } from "../ui/app-select"
import { format } from "date-fns"
import { useState, useCallback, useRef, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useActiveSalesChannels } from "@/lib/hooks/useCommercialContext"
import { usePermission } from "@/lib/hooks/usePermission"
import { useAuth } from "@/lib/context/AuthContext"
import { fetchPipelines } from "@/lib/api/pipelines"
import { fetchPipelineStages } from "@/lib/api/pipeline-stages"
import type { PipelineStage } from "@/lib/types/PipelineStage"

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
  /**
   * Phase 4 (spec I10): the contact this quotation is for, so the deal picker
   * can offer only THAT customer's open deals. `GET /pipelines` has no
   * contact filter today, so the match happens here on `client_account`.
   */
  contactId?: string | null
  /**
   * COMMERCIAL Phase 5 (spec I8). The currency picker's options, fed by
   * `GET /exchange-rates/currencies` plus the company default, so a currency
   * with no rate is NEVER offered and the A25 refusal ("belum ada kurs yang
   * berlaku pada tanggal itu") can never reach a seller as a save error on work
   * they already typed.
   *
   * Owned by the form, not fetched here: the same list drives what the form
   * sends, and two fetches would let the picker and the payload disagree.
   */
  currencyOptions?: { value: string; label: string }[]
  /** The in-force rate sentence for the chosen currency, or "" for the base. */
  exchangeRateNote?: string
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
  /** Phase 4 (spec I10): the deal acceptance moves. Not a pricing input. */
  pipeline_id?: string;
  /** Phase 5 (spec I8): a RESOLUTION INPUT - changing it re-prices every line. */
  currency?: string;
}


export default function ClientDetailsSection({
  clientData = {},
  setClientData = () => { },
  leads = [],
  isLoadingLeads = false,
  onClientSearch = () => { },
  isReadOnlyClient = false,
  readOnly = false,
  contactId = null,
  currencyOptions = [],
  exchangeRateNote = "",
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

  // ── Phase 4: the deal this acceptance will move (spec I10 / A16) ────────
  //
  // Gated on `pipelines`, which is the grant BOTH endpoints below require. A
  // Staff seller holding only `quotations` does not have it, so for them the
  // picker is not rendered at all rather than rendered empty or 403-ing on
  // every keystroke.
  //
  // Two shapes this has to work around, both recorded as requests to the API
  // slice rather than papered over with a guess:
  //   * `GET /pipelines` has no `contact_id` filter, so the tenant's deals are
  //     fetched and matched here on `client_account`;
  //   * `PipelineResponse` does not expose `stage_outcome`, so "open" is
  //     resolved by looking this deal's `deal_stage` NAME up in the tenant's
  //     own stage catalogue. Never compare against the literal 'Closed - Won':
  //     a tenant may name its winning stage anything (prod has two of them).
  const { can } = usePermission();
  const { getToken } = useAuth();
  const canReadPipelines = can("pipelines");
  // DISABLED UNDER readOnly, NEVER HIDDEN (spec I10) - like the five other
  // controls on this card. `readOnly` is true for every status but draft, so
  // gating VISIBILITY on it meant the row vanished from `pending_approval`
  // onward: an approver could not see that approving this quotation will,
  // on the customer's acceptance, close a specific deal; the seller could not
  // see afterwards which deal was moved; and nobody could check what a
  // revision inherited (`pipeline_id` is in `_REVISION_COPY_COLUMNS`).
  //
  // `|| !!clientData.pipeline_id` covers the legacy draft whose `contact_id`
  // is NULL: the link exists, so it must be shown even when no customer can
  // be resolved to filter the option list by.
  //
  // The fetch deliberately runs under `readOnly` too. Without it there is
  // nothing to resolve the stored id against, and the picker would show the
  // raw UUID `AppSelect.renderValue` falls back to - which answers the
  // approver's question no better than hiding the row did.
  const dealPickerEnabled =
    canReadPipelines && (!!contactId || !!clientData.pipeline_id);

  const { data: stagesResponse } = useQuery({
    queryKey: ["pipeline-stages", false],
    queryFn: async () => fetchPipelineStages(await getToken(), false),
    enabled: dealPickerEnabled,
  });

  const { data: pipelinesResponse, isLoading: isLoadingDeals } = useQuery({
    queryKey: ["pipelines", "quotation-deal-picker"],
    queryFn: async () => fetchPipelines(),
    enabled: dealPickerEnabled,
  });

  const openDealOptions = useMemo(() => {
    const stages: PipelineStage[] = stagesResponse?.data?.data ?? [];
    // A stage the catalogue does not know is treated as OPEN: refusing to
    // offer a deal because its stage was renamed would silently drop real
    // work, while offering a closed one is caught by the server (A16 moves
    // nothing when the deal is already closed).
    const closedStageNames = new Set(
      stages.filter((stage) => stage.outcome !== "open").map((stage) => stage.name)
    );
    const rows: any[] = pipelinesResponse?.data?.pipelines ?? [];
    const labelFor = (row: any) =>
      `${row?.product?.product_name ?? "Deal"} - ${row?.deal_stage ?? ""}`;
    const options = [
      { value: "", label: "Tanpa deal" },
      ...rows
        .filter(
          (row) =>
            String(row?.client_account ?? "") === String(contactId ?? "") &&
            !closedStageNames.has(String(row?.deal_stage ?? ""))
        )
        .map((row) => ({
          value: String(row.id),
          label: labelFor(row),
        })),
    ];

    // THE STORED LINK ALWAYS HAS AN OPTION. Without one, `AppSelect` renders
    // the raw UUID - which is what a read-only quotation, a deal that has
    // since closed, a deal on a later `GET /pipelines` page, and a deal
    // belonging to a DIFFERENT customer all produce. The last of those is
    // worth naming out loud rather than showing as an anonymous row: it is
    // the shape that moves the wrong customer's deal to the winning stage.
    const linked = String(clientData.pipeline_id ?? "");
    if (linked && !options.some((option) => option.value === linked)) {
      const known = rows.find((row) => String(row?.id ?? "") === linked);
      const foreign =
        known && String(known?.client_account ?? "") !== String(contactId ?? "");
      options.splice(1, 0, {
        value: linked,
        label: known
          ? `${labelFor(known)}${foreign ? " (deal pelanggan lain)" : ""}`
          : "Deal terkait tersimpan",
      });
    }
    return options;
  }, [stagesResponse, pipelinesResponse, contactId, clientData.pipeline_id]);

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
        // THE DEAL GOES WITH THE CUSTOMER IT BELONGS TO. Leaving it set here
        // is how a quotation for customer B gets saved carrying customer A's
        // `pipeline_id`: the picker below filters A's deal out of B's option
        // list (so the field shows a bare UUID), the server's
        // `_resolve_pipeline_id` checks tenant ownership and nothing else,
        // and B's acceptance then moves A's deal to the winning stage. This
        // is the same bug the `sales_channel_id` line above already documents.
        pipeline_id: "",
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
        // Same reason as in handleLeadChange: the deal belongs to the customer
        // being cleared here, not to whoever is typed in next.
        pipeline_id: "",
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
                      pipeline_id: "",
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



          {/* Row 4b: the linked deal (Phase 4, spec I10). Rendered whenever the
              user can read deals and there is something to show - a selected
              customer, or a link already stored. Under `readOnly` it is
              DISABLED like every other control on this card, never hidden:
              who the acceptance will close is exactly what an approver needs
              to see. An empty picker on a blank form still teaches nothing,
              so a form with neither is the one case that renders nothing. */}
          {dealPickerEnabled && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Deal terkait</Label>
              <AppSelect
                isBgWhite
                fullWidth
                height="48px"
                rounded="8px"
                value={clientData.pipeline_id || ""}
                options={openDealOptions}
                disabled={readOnly || isLoadingDeals}
                onChange={(e) => handleChange("pipeline_id", String(e.target.value))}
                // Says exactly what acceptance does, and - just as important -
                // what it does NOT do: the server never guesses a deal from
                // the contact, so an empty picker means nothing moves.
                helperText="Saat pelanggan menyetujui penawaran ini, deal tersebut dipindahkan ke tahap menang. Dikosongkan: tidak ada deal yang berpindah."
              />
            </div>
          )}
        </div>

        {/* Row 5: the quotation currency and its in-force rate (COMMERCIAL
            Phase 5, spec I8). A FIFTH 2-col row on this stack of grids - the
            card is a 3-col grid then a run of 2-col rows, and the currency +
            rate pair is exactly that shape.

            Changing it re-prices every line through the existing debounced
            preview; the Kanal Penjualan select above is the precedent for a
            header field that does that.

            The RATE is shown, not editable: it is resolved server-side from the
            newest row valid on the quotation's date (A25), and a seller typing
            their own rate is how a document ends up disagreeing with the books. */}
        {currencyOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Mata Uang</Label>
              <AppSelect
                isBgWhite
                fullWidth
                height="48px"
                rounded="8px"
                value={clientData.currency || ""}
                options={currencyOptions}
                disabled={readOnly}
                onChange={(e) => handleChange("currency", String(e.target.value))}
                helperText="Mata uang dokumen ini. Harga tetap dihitung dalam mata uang perusahaan lalu dikonversi dengan kurs yang berlaku."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Kurs yang dipakai</Label>
              <AppInput
                isBgWhite
                height="48px"
                rounded="8px"
                value={exchangeRateNote || "Mata uang perusahaan - tanpa konversi"}
                disabled
                helperText="Kurs disimpan bersama quotation, jadi dokumen yang sudah keluar tidak berubah saat kurs diperbarui."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
