"use client";

import React from "react";
import { Card } from "../../ui/card";
import { cn } from "@/lib/utils";
import { sourceIcon } from "./columns";
import { Lead, leadResponse, LeadSource, LeadStatus } from "@/lib/models/types";

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDroppable,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* -------------------------
   FIXED STATUS ORDER
------------------------- */
const FIXED_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Closed - Won",
  "Closed - Lost",
];

/* -------------------------
   STATUS COLORS
------------------------- */
const statusColors: Record<string, string> = {
  New: "bg-[#6D788D]/20",
  Contacted: "bg-[#26C6F9]/20",
  Qualified: "bg-[#666CFF]/20",
  Proposal: "bg-[#FDB528]/20",
  "Closed - Won": "bg-[#72E128]/20",
  "Closed - Lost": "bg-[#FF4D49]/20",
};

/* -------------------------
   SORTABLE CARD
------------------------- */
function SortableCard({ lead }: { lead: Lead }) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: lead.id.toString() });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl shadow p-4 text-black hover:shadow-md transition cursor-grab active:cursor-grabbing"
    >
      <p className="font-semibold mb-1">{lead.lead_name}</p>
      <p className="text-sm opacity-80 mb-1">Status: {lead.status}</p>

      <div className="text-sm flex items-center gap-2 opacity-80">
        {sourceIcon[lead.source as LeadSource]}
        <span>{lead.source}</span>
      </div>
    </Card>
  );
}

/* -------------------------
   DROPPABLE COLUMN
------------------------- */
function DroppableColumn({
  status,
  children,
}: {
  status: LeadStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        statusColors[status],
        "min-w-[320px] w-[320px] rounded-xl shadow text-white"
      )}
    >
      <div className="p-4 font-semibold">{status}</div>
      {children}
    </div>
  );
}

/* -------------------------
   MAIN KANBAN COMPONENT
------------------------- */
type KanbanBoardProps = { data: leadResponse };

export default function KanbanView({ data }: KanbanBoardProps) {
  const [leads, setLeads] = React.useState<Lead[]>(data?.data?.leads ?? []);

  /* -------------------------
     FIX: Always use fixed statuses
  ------------------------- */
  const statuses = FIXED_STATUSES;

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter((lead) => lead.status === status);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /* -------------------------
     FIXED COLLISION DETECTION
     Only column IDs count as drop targets
  ------------------------- */
  const collisionDetection = React.useCallback(
    (args: any) => {
      const pointerHits = pointerWithin(args).filter((hit) =>
        statuses.includes(hit.id as LeadStatus)
      );
      if (pointerHits.length) return pointerHits;

      const rectHits = rectIntersection(args).filter((hit) =>
        statuses.includes(hit.id as LeadStatus)
      );
      return rectHits;
    },
    [statuses]
  );

  /* -------------------------
     DRAG END
  ------------------------- */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id.toString();
    const newStatus = over.id as LeadStatus;
    const oldStatus = leads.find((l) => l.id.toString() === leadId)?.status;

    if (!oldStatus || newStatus === oldStatus) return;

    // update UI
    setLeads((prev) =>
      prev.map((l) =>
        l.id.toString() === leadId ? { ...l, status: newStatus } : l
      )
    );

    // persist to backend
    try {
      await fetch(`/api/v1/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  /* -------------------------
     RENDER
  ------------------------- */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-10 pt-6 min-w-max">
          {statuses.map((status) => (
            <DroppableColumn key={status} status={status}>
              <SortableContext
                id={status}
                items={getLeadsByStatus(status).map((l) => l.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="p-3 flex flex-col gap-3">
                  {getLeadsByStatus(status).map((lead) => (
                    <SortableCard key={lead.id.toString()} lead={lead} />
                  ))}
                </div>
              </SortableContext>
            </DroppableColumn>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
