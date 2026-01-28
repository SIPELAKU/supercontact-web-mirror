"use client";

import { Lead } from "@/lib/models/types";
import { useEffect, useState } from "react";
import { AppDatePicker } from "@/components/ui/app-datepicker";


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
      filtered = filtered.filter((l) => l.lead_status === status);
    }

    if (source && source !== "All" && source !== "placeholder-source") {
      filtered = filtered.filter((l) => l.lead_source === source);
    }

    if (assignedto && assignedto !== "All" && assignedto !== "placeholder-assigned") {
      filtered = filtered.filter((l) => l.user.fullname === assignedto);
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);

      console.log('Filtering by date range:', { from, to });

      filtered = filtered.filter((l) => {
        // Check if last_contacted exists and has created_at
        if (!l.contact.last_contacted?.created_at) {
          return false; // Exclude leads without last contacted date
        }

        const last = new Date(l.contact.last_contacted.created_at);
        const isInRange = last >= from && last <= to;

        console.log('Date check:', {
          leadName: l.contact.name,
          lastContacted: l.contact.last_contacted.created_at,
          parsedDate: last,
          isInRange
        });

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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full h-12 px-4 pr-[14px] bg-white border border-gray-300 rounded-xl text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_14px_center]"
        >
          <option value="placeholder-status" disabled>Select Status</option>
          <option value="All">All</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Closed - Won">Closed - Won</option>
          <option value="Closed - Lost">Closed - Lost</option>
        </select>
      </div>

      {/* Select Source */}
      <div className="flex-1 min-w-0">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full h-12 px-4 pr-[14px] bg-white border border-gray-300 rounded-xl text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_14px_center]"
        >
          <option value="placeholder-source" disabled>Select Source</option>
          <option value="All">All</option>
          <option value="Web Form">Web Form</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Manual Entry">Manual Entry</option>
        </select>
      </div>

      {/* Select Assigned To */}
      <div className="flex-1 min-w-0">
        <select
          value={assignedto}
          onChange={(e) => setAssignedto(e.target.value)}
          className="w-full h-12 px-4 pr-[14px] bg-white border border-gray-300 rounded-xl text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_14px_center]"
        >
          <option value="placeholder-assigned" disabled>Select Assigned To</option>
          <option value="All">All</option>
          {assignedToOptions.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-0 flex gap-2">
        <AppDatePicker
          mode="range"
          value={dateRange.from && dateRange.to ? [dateRange.from, dateRange.to] : null}
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
