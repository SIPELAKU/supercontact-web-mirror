"use client";

import { Lead } from "@/lib/models/types";
import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppSelect } from "@/components/ui/app-select";

export default function LeadFilters({
  leads,
  status,
  setStatus,
  source,
  setSource,
  assignedto,
  setAssignedto,
  dateRange,
  setDateRange,
}: {
  leads: Lead[];
  status: string;
  setStatus: (val: string) => void;
  source: string;
  setSource: (val: string) => void;
  assignedto: string;
  setAssignedto: (val: string) => void;
  dateRange: { from?: Date; to?: Date };
  setDateRange: (val: { from?: Date; to?: Date }) => void;
}) {
  const assignedToOptions = Array.from(
    new Set(leads.map((l) => l.user.fullname).filter(Boolean)),
  );

  return (
    <div className="flex gap-4 items-center mb-6 p-4 bg-white rounded-xl">
      {/* Select Status */}
      <div className="flex-1 min-w-0">
        <AppSelect
          value={status}
          onChange={(e: any) => setStatus(e.target.value as string)}
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
          height="48px"
        />
      </div>

      {/* Select Source */}
      <div className="flex-1 min-w-0">
        <AppSelect
          value={source}
          onChange={(e: any) => setSource(e.target.value as string)}
          placeholder="Select Source"
          isBgWhite={true}
          options={[
            { label: "All", value: "All" },
            { label: "Web Form", value: "Web Form" },
            { label: "WhatsApp", value: "WhatsApp" },
            { label: "Manual Entry", value: "Manual Entry" },
          ]}
          height="48px"
        />
      </div>

      {/* Select Assigned To */}
      <div className="flex-1 min-w-0">
        <AppSelect
          value={assignedto}
          onChange={(e: any) => setAssignedto(e.target.value as string)}
          placeholder="Select Assigned To"
          isBgWhite={true}
          options={[
            { label: "All", value: "All" },
            ...assignedToOptions.map((user) => ({
              label: user,
              value: user,
            })),
          ]}
          height="48px"
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
