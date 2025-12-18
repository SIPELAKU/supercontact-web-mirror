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
import LeadDetailModal from "../lead-detail-modal";
import { MoreVertical } from "lucide-react";
import { deleteLead } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

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
function SortableCard({ lead, onCardClick }: { lead: Lead; onCardClick: (lead: Lead) => void }) {
  const [showMenu, setShowMenu] = React.useState(false);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);
  
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id.toString() });

  const handleDeleteLead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete lead "${lead.contact.name}"?`)) {
      try {
        const token = await getToken();
        await deleteLead(token, lead.id);
        
        // Refresh the leads data
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        
        console.log("Lead deleted successfully!");
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Failed to delete lead. Please try again.");
      }
    }
    
    setShowMenu(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger card click if not dragging and not clicking menu
        if (!isDragging && !showMenu) {
          e.stopPropagation();
          onCardClick(lead);
        }
      }}
      className={cn(
        "bg-white rounded-xl shadow p-4 text-black hover:shadow-md transition cursor-grab active:cursor-grabbing relative",
        isDragging && "opacity-0" // HIDE original card when dragging
      )}
    >
      {/* Three dots menu */}
      <div className="absolute top-2 right-2" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
        
        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[140px] z-50">
            <button
              onClick={handleDeleteLead}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Remove card
            </button>
          </div>
        )}
      </div>

      <p className="font-semibold mb-1 pr-8">{lead.contact.name}</p>
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
type KanbanBoardProps = { 
  data: leadResponse | undefined;
  isLoading: boolean;
  error: Error | null;
};

export default function KanbanView({ data, isLoading, error }: KanbanBoardProps) {
  const [leads, setLeads] = React.useState<Lead[]>(data?.data?.leads ?? []);
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const { getToken } = useAuth();

  // Update leads when data changes
  React.useEffect(() => {
    if (data?.data?.leads) {
      setLeads(data.data.leads);
    }
  }, [data]);

  const statuses = FIXED_STATUSES;

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter((lead) => lead.lead_status === status);

  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-10 pt-6 min-w-max">
          {FIXED_STATUSES.map((status) => (
            <div
              key={status}
              className={cn(
                statusColors[status],
                "min-w-[320px] w-[320px] rounded-xl shadow text-white"
              )}
            >
              <div className="p-4 font-semibold">{status}</div>
              <div className="p-3 flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/20 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/30 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-white/30 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Error: {error.message}</p>
        <p className="text-gray-500 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  // No data state
  if (!data || !data.data?.leads || data.data.leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No leads found.</p>
        <p className="text-gray-400 mt-2">Start by adding your first lead</p>
      </div>
    );
  }

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
                    <SortableCard 
                      key={lead.id.toString()} 
                      lead={lead} 
                      onCardClick={handleCardClick}
                    />
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

      {/* Lead Detail Modal */}
      <LeadDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        lead={selectedLead}
      />
    </DndContext>
  );
}
