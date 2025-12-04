import React from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { sourceIcon } from "./lead-management/lead-management-table/columns";
import { Lead, LeadSource,} from "@/lib/types";
// Dynamically derive columns based on unique status values from data
const getStatuses = (data: Lead[]) => {
  const unique = Array.from(new Set(data.map((d) => d.status)));
  return unique.map((s) => ({ key: s, label: s }));
};

// type KanbanItem = {
//   id: string | number;
//   name: string;
//   status: string;
//   source: LeadSource;
//   assignedTo: string;
//   lastContacted: string;
// };

type KanbanBoardProps = {
  data: Lead[];
};

export default function KanbanView({ data }: KanbanBoardProps) {
  const statuses = getStatuses(data);
  const grouped = statuses.map((col) => ({
    ...col,
    items: data.filter((item) => item.status === col.key),
  }));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 pb-10 pt-6 min-w-max">
        {grouped.map((col) => (
          <div
            key={col.key}
            className={cn(
              col.label === "New" ? "bg-[#617589]" : "bg-[#4E67E8]",
              "min-w-[320px] w-[320px] rounded-xl shadow text-white"
            )}
          >
            <div className="p-4 font-semibold flex justify-between items-center">
              <span>
                {col.label} {col.items.length}
              </span>
              <span className="cursor-pointer">•••</span>
            </div>

            <div className="p-3 flex flex-col gap-3">
              {col.items.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white rounded-xl shadow p-4 text-black"
                >
                  <p className="font-semibold mb-1">{item.name}</p>
                  <p className="text-sm opacity-80 mb-1">Status: {item.status}</p>

                  <div className="text-sm flex items-center gap-2 opacity-80 mb-1">
                    {sourceIcon[item.source as LeadSource]}
                    <span>{item.source}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
