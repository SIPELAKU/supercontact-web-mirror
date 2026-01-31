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
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [assignedto, setAssignedto] = useState("All");

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });

  const assignedToOptions = Array.from(
    new Set(leads.map((l) => l.user.fullname).filter(Boolean)),
  );

  useEffect(() => {
    let filtered = [...leads];

    if (status && status !== "All") {
      filtered = filtered.filter(
        (l) => l.lead_status.toLowerCase() === status.toLowerCase(),
      );
    }

    if (source && source !== "All") {
      filtered = filtered.filter(
        (l) => l.lead_source.toLowerCase() === source.toLowerCase(),
      );
    }

    if (assignedto && assignedto !== "All") {
      filtered = filtered.filter(
        (l) =>
          l.user.fullname.trim().toLowerCase() ===
          assignedto.trim().toLowerCase(),
      );
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);

      filtered = filtered.filter((l) => {
        const dateString = l.contact.last_contacted?.created_at;
        if (!dateString) return false;
        const date = new Date(dateString);
        return date >= from && date <= to;
      });
    }

    setFilteredLeads(filtered);
  }, [status, source, assignedto, dateRange, leads, setFilteredLeads]);

  return (
    <div className="flex gap-4 items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Select Status */}
      <div className="flex-1 min-w-0">
        <AppSelect
          placeholder="Select Status"
          value={status}
          onChange={(e: any) => setStatus(e.target.value)}
          options={[
            { value: "All", label: "All Status" },
            { value: "New", label: "New" },
            { value: "Contacted", label: "Contacted" },
            { value: "Qualified", label: "Qualified" },
            { value: "Proposal", label: "Proposal" },
            { value: "Closed - Won", label: "Closed - Won" },
            { value: "Closed - Lost", label: "Closed - Lost" },
          ]}
          isBgWhite
        />
      </div>

      {/* Select Source */}
      <div className="flex-1 min-w-0">
        <AppSelect
          placeholder="Select Source"
          value={source}
          onChange={(e: any) => setSource(e.target.value)}
          options={[
            { value: "All", label: "All Source" },
            { value: "Web Form", label: "Web Form" },
            { value: "WhatsApp", label: "WhatsApp" },
            { value: "Manual Entry", label: "Manual Entry" },
          ]}
          isBgWhite
        />
      </div>

      {/* Select Assigned To */}
      <div className="flex-1 min-w-0">
        <AppSelect
          placeholder="Select Assigned To"
          value={assignedto}
          onChange={(e: any) => setAssignedto(e.target.value)}
          options={[
            { value: "All", label: "All Assigned To" },
            ...assignedToOptions.map((user) => ({
              value: user,
              label: user,
            })),
          ]}
          isBgWhite
        />
      </div>

      <div className="flex-1 min-w-0 flex gap-2">
        <AppDatePicker
          mode="range"
          value={[dateRange.from || null, dateRange.to || null]}
          isBgWhite={true}
          onChange={(val: any) => {
            if (Array.isArray(val)) {
              setDateRange({
                from: val[0] || undefined,
                to: val[1] || undefined,
              });
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
