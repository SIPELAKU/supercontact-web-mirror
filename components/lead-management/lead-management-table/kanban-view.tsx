import React from "react";
import { Card } from "../../ui/card";
import { cn } from "@/lib/utils";
import { sourceIcon } from "./columns";
import { Lead, leadResponse, LeadSource } from "@/lib/models/types";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "react-beautiful-dnd";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const statusColors: Record<string, string> = {
  "New": "bg-[#6D788D]/20",
  "Contacted": "bg-[#26C6F9]/20",
  "Qualified": "bg-[#666CFF]/20",
  "Proposal": "bg-[#FDB528]/20",
  "Closed - Won": "bg-[#72E128]/20",
  "Closed - Lost": "bg-[#FF4D49]/20",
};

type KanbanBoardProps = {
  data: leadResponse;
};

export default function KanbanView({ data }: KanbanBoardProps) {
  const [leads, setLeads] = React.useState(data?.data?.leads ?? []);

  // Automatically get unique statuses from leads
  const statuses = Array.from(new Set(leads.map((l) => l.status)));

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === draggableId ? { ...lead, status: destination.droppableId } : lead
      )
    );

    try {
      await fetch(`/api/v1/leads/${draggableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  // Group leads by status
  const getLeadsByStatus = (status: string) =>
    leads.filter((lead) => lead.status === status);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-10 pt-6 min-w-max">
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    statusColors[status] || "bg-[#4E67E8]/20",
                    "min-w-[320px] w-[320px] rounded-xl shadow text-white"
                  )}
                >
                  <div className="p-4 font-semibold flex justify-between items-center">
                    <span>{status}</span>
                  </div>

                  <div className="p-3 flex flex-col gap-3">
                    {getLeadsByStatus(status).map((lead, index) => (
                      <Draggable draggableId={lead.id} index={index} key={lead.id}>
                        {(provided: DraggableProvided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-xl shadow p-4 text-black hover:shadow-md transition"
                          >
                            <p className="font-semibold mb-1">{lead.lead_name}</p>
                            <p className="text-sm opacity-80 mb-1">Status: {lead.status}</p>
                            <div className="text-sm flex items-center gap-2 opacity-80 mb-1">
                              {sourceIcon[lead.source as LeadSource]}
                              <span>{lead.source}</span>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
