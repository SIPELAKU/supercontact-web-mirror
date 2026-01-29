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
  DragOverEvent,
  useDroppable,
  closestCenter,
  DragOverlay,
  DragStartEvent
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import LeadDetailModal from "../lead-detail-modal";
import { MoreVertical } from "lucide-react";
import { deleteLead } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { arrayMove } from "@dnd-kit/sortable";

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
  const { getToken } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleDeleteLead = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm(`Are you sure you want to delete lead "${lead.contact.name}"?`)) {
      try {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        onClick={(e) => {
          // Only trigger card click if not dragging and not clicking menu
          if (!isDragging && !showMenu) {
            e.stopPropagation();
            onCardClick(lead);
          }
        }}
        className="bg-white rounded-xl shadow p-4 text-black hover:shadow-md transition cursor-grab active:cursor-grabbing relative"
      >
        {/* Three dots menu */}
        <div className="absolute top-2 right-2" ref={menuRef} style={{ zIndex: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors bg-white"
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
    </div>
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [leads, setLeads] = React.useState<Lead[]>(data?.data?.leads ?? []);
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

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
     DRAG START
------------------------- */
  const handleDragStart = (event: DragStartEvent) => {
    const leadId = event.active.id;
    const lead = leads.find((l) => l.id.toString() === leadId);
    if (lead) {
      setActiveLead(lead);
    }
  };

  /* -------------------------
     DRAG OVER
  ------------------------- */
  /* -------------------------
     DRAG OVER
  ------------------------- */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeIndex = leads.findIndex((l) => l.id.toString() === activeId);
    if (activeIndex === -1) return;

    // Resolve column status and target index
    let overStatus: LeadStatus | null = null;
    let overIndex = -1;

    if (FIXED_STATUSES.includes(overId as LeadStatus)) {
      overStatus = overId as LeadStatus;
      // Dropping directly onto a column - move it to the end of that column
      // To find the right place in the flat array, we should move it after the last lead of that status
      const leadsInStatus = leads.filter(l => l.lead_status === overStatus);
      if (leadsInStatus.length > 0) {
        const lastLeadInStatus = leadsInStatus[leadsInStatus.length - 1];
        overIndex = leads.indexOf(lastLeadInStatus);
      } else {
        // If column is empty, we can't easily find an index in flat array 
        // that "belongs" to it without knowing where columns sit in the array.
        // But actually, just changing the status is enough for the filter to pick it up.
      }
    } else {
      const targetLead = leads.find((l) => l.id.toString() === overId);
      if (targetLead) {
        overStatus = targetLead.lead_status;
        overIndex = leads.indexOf(targetLead);
      }
    }

    if (!overStatus) return;

    if (activeId !== overId) {
      setLeads((prev) => {
        const activeLead = prev[activeIndex];
        const isSameStatus = activeLead.lead_status === overStatus;

        if (isSameStatus) {
          if (overIndex !== -1) {
            return arrayMove(prev, activeIndex, overIndex);
          }
          return prev;
        } else {
          // Moving between columns
          const updated = [...prev];
          const movedItem = { ...activeLead, lead_status: overStatus! };
          updated.splice(activeIndex, 1);

          // If we have a target card, insert there
          if (overIndex !== -1) {
            // Adjust overIndex if it was after the activeIndex
            const targetIdx = overIndex > activeIndex ? overIndex - 1 : overIndex;
            updated.splice(targetIdx, 0, movedItem);
          } else {
            // Just add to the end
            updated.push(movedItem);
          }
          return updated;
        }
      });
    }
  };

  /* -------------------------
     DRAG END
  ------------------------- */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) {
      // Revert to original data if dropped outside
      if (data?.data?.leads) {
        setLeads(data.data.leads);
      }
      return;
    }

    const leadId = active.id.toString();
    const overId = over.id.toString();

    // Check against original data
    const originalLead = data?.data?.leads.find(l => l.id.toString() === leadId);
    if (!originalLead) return;

    const oldStatus = originalLead.lead_status;

    // Resolve final status
    let newStatus: LeadStatus;
    if (FIXED_STATUSES.includes(overId as LeadStatus)) {
      newStatus = overId as LeadStatus;
    } else {
      const targetLead = leads.find((l) => l.id.toString() === overId);
      if (!targetLead) {
        newStatus = oldStatus;
      } else {
        newStatus = targetLead.lead_status;
      }
    }

    // If no real change, just stop
    if (newStatus === oldStatus) {
      // Ensure state is synced with props
      if (data?.data?.leads) {
        setLeads(data.data.leads);
      }
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        notify.error("Authentication required");
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lead_status: newStatus }),
      });

      notify.success(`Lead moved to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (err) {
      console.error("Failed to update status:", err);
      notify.error("Failed to update status. Reverting...");
      // Re-fetch to sync state
      queryClient.invalidateQueries({ queryKey: ["leads"] });
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
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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

      {/* DRAG OVERLAY */}
      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <div className="rotate-3 scale-105">
            <Card className="bg-white rounded-xl shadow-lg p-4 text-black border-2 border-blue-500">
              <p className="font-semibold mb-1 pr-8">{activeLead.contact.name}</p>
              <p className="text-sm opacity-80 mb-1">Status: {activeLead.lead_status}</p>
              <div className="text-sm flex items-center gap-2 opacity-80">
                {sourceIcon[activeLead.lead_source as LeadSource]}
                <span>{activeLead.lead_source}</span>
              </div>
            </Card>
          </div>
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
