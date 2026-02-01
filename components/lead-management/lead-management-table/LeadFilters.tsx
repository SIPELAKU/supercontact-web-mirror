"use client";

import { Lead } from "@/lib/models/types";
import { useEffect, useState } from "react";
import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppSelect } from "@/components/ui/app-select";


export default function LeadFilters({
  leads,
  setFilteredLeads,
}: {
  leads: Lead[];
  setFilteredLeads: (value: Lead[]) => void;
}) {
  // Placeholder default state
  const [status, setStatus] = useState("placeholder-status");
  const [source, setSource] = useState("placeholder-source");
  const [assignedto, setAssignedto] = useState("placeholder-assigned");

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });

  const assignedToOptions = Array.from(
    new Set(leads.map((l) => l.user.fullname).filter(Boolean))
  );

  useEffect(() => {
    console.log('LeadFilters useEffect triggered:', {
      leadsLength: leads.length,
      status,
      source,
      assignedto,
      dateRange
    });

    let filtered = [...leads];

    if (status && status !== "All" && status !== "placeholder-status") {
      filtered = filtered.filter((l) => l.lead_status.toLowerCase() === status.toLowerCase());
    }

    if (source && source !== "All" && source !== "placeholder-source") {
      filtered = filtered.filter((l) => l.lead_source.toLowerCase() === source.toLowerCase());
    }

    if (assignedto && assignedto !== "All" && assignedto !== "placeholder-assigned") {
      filtered = filtered.filter((l) => l.user.fullname.trim().toLowerCase() === assignedto.trim().toLowerCase());
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);

      console.log('Filtering by date range:', { from, to });

      filtered = filtered.filter((l) => {
        // Only filter by last_contacted date to match the "Last Contacted" column in the UI
        const dateString = l.contact.last_contacted?.created_at;

        if (!dateString) return false;

        const date = new Date(dateString);
        const isInRange = date >= from && date <= to;

        return isInRange;
      });
    }

    console.log('Final filtered results:', filtered.length);
    setFilteredLeads(filtered);
  }, [status, source, assignedto, dateRange, leads, setFilteredLeads]);

  return (
    <div className="flex gap-4 items-center mb-6 p-4 bg-white rounded-lg">
      {/* Select Status */}
      <div className="flex-1 min-w-0">
        <AppSelect
          value={status === "placeholder-status" ? "" : status}
          onChange={(val) => setStatus(val as string)}
          placeholder="Select Status"
          isBgWhite={true}
          options={[
            { label: "All", value: "All" },
            { label: "New", value: "New" },
            { label: "Contacted", value: "Contacted" },
            { label: "Qualified", value: "Qualified" },
            { label: "Proposal", value: "Proposal" },
            { label: "Closed - Won", value: "Closed - Won" },
            { label: "Closed - Lost", value: "Closed - Lost" },
          ]}
        />
      </div>

      {/* Select Source */}
      <div className="flex-1 min-w-0">
        <AppSelect
          value={source === "placeholder-source" ? "" : source}
          onChange={(val) => setSource(val as string)}
          placeholder="Select Source"
          isBgWhite={true}
          options={[
            { label: "All", value: "All" },
            { label: "Web Form", value: "Web Form" },
            { label: "WhatsApp", value: "WhatsApp" },
            { label: "Manual Entry", value: "Manual Entry" },
          ]}
        />
      </div>

      {/* Select Assigned To */}
      <div className="flex-1 min-w-0">
        <AppSelect
          value={assignedto === "placeholder-assigned" ? "" : assignedto}
          onChange={(val) => setAssignedto(val as string)}
          placeholder="Select Assigned To"
          isBgWhite={true}
          options={[
            { label: "All", value: "All" },
            ...assignedToOptions.map((user) => ({
              label: user,
              value: user,
            })),
          ]}
        />
      </div>

      <div className="flex-1 min-w-0 flex gap-2">
        <AppDatePicker
          mode="range"
          value={[dateRange.from || null, dateRange.to || null]}
          isBgWhite={true}
          onChange={(val: any) => {
            if (Array.isArray(val)) {
              setDateRange({ from: val[0] || undefined, to: val[1] || undefined });
            } else {
              setDateRange({ from: undefined, to: undefined });
            }
          }}
          placeholder="Pick a date range"
          label=""
        />
      </div>
    </div>
  );
}
