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
  CollisionDetection,
  DragOverlay,
  DragStartEvent
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/lib/context/AuthContext";

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
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id.toString() });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white rounded-xl shadow p-4 text-black hover:shadow-md transition cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0" // HIDE original card when dragging
      )}
    >
      <p className="font-semibold mb-1">{lead.contact.name}</p>
      <p className="text-sm opacity-80 mb-1">Status: {lead.lead_status}</p>

      <div className="text-sm flex items-center gap-2 opacity-80">
        {sourceIcon[lead.lead_source as LeadSource]}
        <span>{lead.lead_source}</span>
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
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);
  const { getToken } = useAuth();

  const statuses = FIXED_STATUSES;

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter((lead) => lead.lead_status === status);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /* -------------------------
     FIXED COLLISION DETECTION
------------------------- */
  const collisionDetection = React.useCallback<CollisionDetection>(
    (args) => {
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
     DRAG START
------------------------- */
  const handleDragStart = (event: DragStartEvent) => {
    const leadId = event.active.id;
    const lead = leads.find((l) => l.id.toString() === leadId);
    if (lead) setActiveLead(lead);
  };

  /* -------------------------
     DRAG END
------------------------- */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const leadId = active.id.toString();
    const newStatus = over.id as LeadStatus;
    const oldStatus = leads.find((l) => l.id.toString() === leadId)?.lead_status;

    if (!oldStatus || newStatus === oldStatus) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id.toString() === leadId ? { ...l, lead_status: newStatus } : l
      )
    );

    const token = await getToken();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lead_status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  /* -------------------------
     RENDER
------------------------- */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}      
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

      {/* ---------------------
         DRAG OVERLAY
      ---------------------- */}
      <DragOverlay>
        {activeLead ? (
          <Card className="bg-white rounded-xl shadow-2xl p-4 text-black scale-105">
            <p className="font-semibold mb-1">{activeLead.contact.name}</p>
            <p className="text-sm opacity-80 mb-1">
              Status: {activeLead.lead_status}
            </p>

            <div className="text-sm flex items-center gap-2 opacity-80">
              {sourceIcon[activeLead.lead_source as LeadSource]}
              <span>{activeLead.lead_source}</span>
            </div>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
