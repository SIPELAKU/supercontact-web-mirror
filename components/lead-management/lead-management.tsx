"use client";

import { useState } from "react";


import { columns } from "./lead-management-table/columns";
import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "../kanban-view";
import {useViewMode} from "@/lib/hooks/useLeadStore";
import { Lead } from "@/lib/types";

type Props = {
  data: Lead[];
};

export default function LeadManagement({ data }: Props) {
  const [status, setStatus] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [assignedto, setAssignedto] = useState<string>("");
  // const [viewMode, setViewMode] = useState<"table-view" | "kanban-view">(
  //   "table-view"
  // );
  const {viewMode} = useViewMode();
  return (
    <div className=" min-h-screen max-w-screen p-4">
      {/* Main container: width adapts to screen, max capped */}
      
        {/* Header Card */}
        

        {/* Content */}
        <div className="">
          {viewMode === "table-view" && (
            <DataTable columns={columns} data={data} />
          )}

          {viewMode === "kanban-view" && (
            <div className="overflow-x-auto">
              <KanbanView data={data} />
            </div>
          )}
        </div>
      </div>
  );
}
