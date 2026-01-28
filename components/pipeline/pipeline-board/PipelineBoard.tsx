"use client"

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useEffect, useMemo, useState } from "react"

import { AddDealModal, dealStages } from "@/components/pipeline/AddDealModal"
import { DealCard } from "@/components/pipeline/pipeline-board/DealCard"
import { ColumnDropZone } from "@/components/pipeline/pipeline-board/DroppableColumn"
import SortableDeal from "@/components/pipeline/pipeline-board/SortableDeal"
import CustomSelectStage from "@/components/pipeline/SelectDealStage"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/ui/filter"
import { formatRupiah } from "@/lib/helper/currency"
import { StageUI } from "@/lib/helper/transformPipeline"
import { useGetPipelineStore } from "@/lib/store/pipeline"
import { Deal } from "@/lib/types/Pipeline"
import { Plus, Search } from "lucide-react"
import { notify } from "@/lib/notifications"



const stageColors: Record<string, string> = {
  Prospect: "bg-[#F3F4F6]",
  Qualified: "bg-[#F3EEFF]",
  Negotiation: "bg-[#EAF6FF]",
  Proposal: "bg-[#FFF6E8]",
  "Closed - Won": "bg-[#E8FFE8]",
  "Closed - Lost": "bg-[#FFE8E8]",
}

export default function PipelineBoard() {
  const {
    listPipeline,
    salespersonFilter,
    dateRangeFilter,
    setDateRangeFilter,
    setSalespersonFilter,
    loading,
    listActiveUser,
    isModalOpen,
    setIsModalOpen,
    updateStagePipeline,
    fetchPipeline
  } = useGetPipelineStore();
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [stages, setStages] = useState(listPipeline)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  // Track how many deals are visible per stage (defaults to 20)
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (listPipeline.length > 0) {
      setStages(listPipeline)
    }
  }, [listPipeline])


  const computeStageTotals = useMemo(() => {
    return (currentStages: StageUI[]) => {
      return currentStages.map(stage => ({
        ...stage,
        value: stage.deals.reduce((sum, d) => sum + (d.amount || 0), 0)
      }))
    }
  }, [])

  const searchQueryLower = searchQuery.toLowerCase();

  const searchPipeline = useMemo(() => {

    if (!searchQueryLower) return stages;

    return stages.map((stage) => {
      const filteredDeals = stage.deals.filter((deal) => {
        const dealName = deal.deal_name.toLowerCase();
        const companyName = deal.company.name.toLowerCase();

        return (
          dealName.includes(searchQueryLower) ||
          companyName.includes(searchQueryLower)
        );
      });

      return { ...stage, deals: filteredDeals };
    });

  }, [searchQueryLower, stages]);



  const filteredStages = useMemo(() => {

    const stageFiltered =
      statusFilter === "all"
        ? searchPipeline
        : searchPipeline.map((stage) => {
          const normalized = stage.name.replace(/\s*-\s*/g, " - ").toLowerCase();
          const target = statusFilter.toLowerCase();

          if (normalized === target) return stage;

          return { ...stage, deals: [] };
        });

    // Reset visible counts when filters change
    setVisibleCounts({})
    return stageFiltered

  }, [searchPipeline, statusFilter]);



  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )


  const findDeal = (
    id: string,
    stages: StageUI[]
  ): { stageIndex: number; dealIndex: number } | null => {
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      const dealIndex = stages[stageIndex].deals.findIndex(
        (d) => String(d.id) === id
      );

      if (dealIndex !== -1) return { stageIndex, dealIndex };
    }
    return null;
  };


  const handleDragStart = (
    event: DragStartEvent,
    stages: StageUI[],
    setActiveDeal: (deal: Deal | null) => void
  ) => {
    const loc = findDeal(String(event.active.id), stages);
    if (!loc) return;

    setActiveDeal(stages[loc.stageIndex].deals[loc.dealIndex]);
  };

  const handleDragOver = (event: DragOverEvent,
    stages: StageUI[],
    setStages: (s: StageUI[]) => void) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const from = findDeal(activeId, stages);
    if (!from) return;

    const isOverColumn = overId.startsWith("column-") || stages.some(s => s.name === overId);

    if (isOverColumn) {
      const stageName = overId.replace("column-", "");
      const toStageIndex = stages.findIndex(s => s.name === stageName);

      if (toStageIndex !== -1 && from.stageIndex !== toStageIndex) {
        const updated = [...stages];
        updated[from.stageIndex] = { ...updated[from.stageIndex], deals: [...updated[from.stageIndex].deals] };
        updated[toStageIndex] = { ...updated[toStageIndex], deals: [...updated[toStageIndex].deals] };

        const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1);
        updated[toStageIndex].deals.push(moved);
        setStages(updated);
      }
    } else {
      const to = findDeal(overId, stages);
      if (!to) return;

      if (from.stageIndex === to.stageIndex) return;

      const updated = [...stages];
      updated[from.stageIndex] = { ...updated[from.stageIndex], deals: [...updated[from.stageIndex].deals] };
      updated[to.stageIndex] = { ...updated[to.stageIndex], deals: [...updated[to.stageIndex].deals] };

      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1);
      updated[to.stageIndex].deals.splice(to.dealIndex, 0, moved);
      setStages(updated);
    }
  };


  const handleDragEnd = async (
    event: DragEndEvent,
    stages: StageUI[],
    setStages: (s: StageUI[]) => void,
    setActiveDeal: (deal: Deal | null) => void,
  ) => {
    const { active, over } = event
    setActiveDeal(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Find the original stage from the store (not the optimistic state)
    const originalStage = listPipeline.find(s => s.deals.some(d => String(d.id) === activeId))?.name;

    const from = findDeal(activeId, stages)
    if (!from) return

    const updated = [...stages]
    updated[from.stageIndex] = { ...updated[from.stageIndex], deals: [...updated[from.stageIndex].deals] }

    if (overId.startsWith("column-")) {
      const toStageName = overId.replace("column-", "")
      const toStageIndex = updated.findIndex((s: StageUI) => s.name === toStageName)

      if (from.stageIndex === toStageIndex) return



      updated[toStageIndex] = { ...updated[toStageIndex], deals: [...updated[toStageIndex].deals] }

      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[toStageIndex].deals.push(moved)


      const updatedWithTotals = computeStageTotals(updated)
      setStages(updatedWithTotals)

      if (originalStage && originalStage !== toStageName) {
        try {
          await updateStagePipeline(activeId, toStageName);
          notify.success(`Moved to ${toStageName}`);
        } catch (error) {
          console.error("Failed to update stage:", error);
          notify.error("Failed to update stage. Reverting...");
          await fetchPipeline(); // Revert local state by re-fetching
        }
      }

      return
    }

    const to = findDeal(overId, updated)
    if (!to) return

    if (from.stageIndex === to.stageIndex) {
      updated[from.stageIndex].deals = arrayMove(updated[from.stageIndex].deals, from.dealIndex, to.dealIndex)
    } else {
      updated[to.stageIndex] = { ...updated[to.stageIndex], deals: [...updated[to.stageIndex].deals] }
      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[to.stageIndex].deals.splice(to.dealIndex, 0, moved)
    }


    const updatedWithTotals = computeStageTotals(updated)
    setStages(updatedWithTotals)

    const toStage = updated[to.stageIndex].name;

    if (originalStage && originalStage !== toStage) {
      try {
        await updateStagePipeline(activeId, toStage);
        notify.success(`Moved to ${toStage}`);
      } catch (error) {
        console.error("Failed to update stage:", error);
        notify.error("Failed to update stage. Reverting...");
        await fetchPipeline();
      }
    }
  }


  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8 animate-pulse">

        <div className="px-6 pt-5">
          <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>

          <div className="flex gap-4">
            <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <div className="border-b w-full border-gray-300" />

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-6 w-full">
          <div className="h-10 lg:w-[50%] w-full bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-40 bg-gray-300 rounded-lg"></div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide pb-6 pt-1 px-6">
          <div className="inline-flex gap-6 min-w-full mt-4">

            {[1, 2, 3, 4, 5].map((col) => (
              <div key={col} className="w-70 shrink-0">
                <div className="rounded-xl p-4 min-h-75 shadow-sm border border-gray-200 bg-gray-50">

                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="h-5 w-24 bg-gray-300 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((card) => (
                      <div
                        key={card}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                      >
                        <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8">
      <AddDealModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="px-6 pt-5">
        <h2 className="font-medium pb-2">Filters</h2>
        <FilterBar
          width="100%"
          filters={[
            {
              type: "custom",
              component: (
                <CustomSelectStage
                  placeholder="Select All"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  data={dealStages}
                  className="bg-white rounded-lg font-normal"
                />
              )
            },
            {
              type: "custom",
              component: (
                <CustomSelectStage
                  placeholder="Select Assigned To"
                  value={salespersonFilter}
                  onChange={setSalespersonFilter}
                  data={listActiveUser}
                  className="bg-white rounded-lg font-normal"
                />
              )
            },
            {
              type: "custom",
              component: (
                <CustomSelectStage
                  placeholder="Select By Date Range"
                  value={dateRangeFilter}
                  onChange={setDateRangeFilter}
                  data={[
                    { label: "All", value: "all" },
                    { label: "Today", value: "today" },
                    { label: "This Week", value: "this_week" },
                    { label: "Last Week", value: "last_week" },
                    { label: "This Month", value: "this_month" },
                    { label: "Last Month", value: "last_month" }
                  ]}
                  className="bg-white rounded-lg font-normal"
                />
              )
            },
          ]}
        />
      </div>

      <div className="border-b w-full p-0 border-gray-300" />

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-6 w-full">

        <div
          className="
            flex items-center
            lg:w-[50%] w-full
            h-10 rounded-lg bg-white border border-[#E5E7EB] px-3
            hover:border-[#D1D5DB]
            focus-within:border-[#60A5FA] focus-within:ring-1 focus-within:ring-[#60A5FA]
            transition-all
          "
        >
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by name or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <Button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="
            w-full sm:w-auto
            bg-[#4F6DF5] hover:bg-[#3f58ce]
            text-white gap-2 h-10 px-4 rounded-lg
            flex justify-center
          "
        >
          <Plus className="h-4 w-4" />
          <span className="hidden font-semibold sm:inline">Add New Pipeline</span>
          <span className="sm:hidden font-semibold">Add</span>
        </Button>

      </div>

      <div className="w-full overflow-x-auto scrollbar-hide pb-6 pt-1 px-6">

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => handleDragStart(event, stages, setActiveDeal)}
          onDragOver={(event) => handleDragOver(event, stages, setStages)}
          onDragEnd={(event) => handleDragEnd(event, stages, setStages, setActiveDeal)}
        >
          <div className="inline-flex gap-6 min-w-full mt-4">

            {filteredStages.map((stage) => (
              <ColumnDropZone key={stage.id} id={`column-${stage.name}`}>
                <div className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-220px)]">

                  <div
                    className={`rounded-xl p-4 flex flex-col h-full shadow-sm border border-gray-200 ${stageColors[stage.name]}`}
                  >

                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="text-sm font-medium text-gray-600">
                        {formatRupiah(stage.value)}
                      </span>
                    </div>

                    {(() => {
                      const limit = visibleCounts[stage.name] || 20;
                      const visibleDeals = stage.deals.slice(0, limit);

                      // If active deal is in this stage but hidden by lazy loading, add it to the list
                      // This is critical for dnd-kit to not lose track of the active item
                      const dealsToShow = [...visibleDeals];
                      if (activeDeal) {
                        const activeDealInStageIndex = stage.deals.findIndex(d => d.id === activeDeal.id);
                        if (activeDealInStageIndex !== -1) {
                          const isAlreadyVisible = visibleDeals.some(d => d.id === activeDeal.id);
                          if (!isAlreadyVisible) {
                            dealsToShow.push(stage.deals[activeDealInStageIndex]);
                          }
                        }
                      }

                      return (
                        <SortableContext
                          items={dealsToShow.map((d) => d.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex flex-col gap-3 min-h-25 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            {stage.deals.length === 0 && (
                              <div className="h-24 flex shrink-0 items-center justify-center text-gray-400 text-sm rounded-xl border border-gray-200 bg-white shadow-inner">
                                Drag deals here
                              </div>
                            )}

                            {dealsToShow.map((deal) => (
                              <div key={deal.id} className="pointer-events-auto shrink-0">
                                <SortableDeal id={deal.id}>
                                  <DealCard {...deal} stageName={stage.name} />
                                </SortableDeal>
                              </div>
                            ))}

                            {stage.deals.length > limit && (
                              <div className="pt-2 pb-1">
                                <Button
                                  variant="ghost"
                                  className="w-full text-xs text-gray-500 hover:text-gray-900 h-8"
                                  onClick={() => setVisibleCounts(prev => ({
                                    ...prev,
                                    [stage.name]: (prev[stage.name] || 20) + 20
                                  }))}
                                >
                                  Load More ({stage.deals.length - limit} remaining)
                                </Button>
                              </div>
                            )}
                          </div>
                        </SortableContext>
                      );
                    })()}

                  </div>
                </div>
              </ColumnDropZone>
            ))}


          </div>

          <DragOverlay dropAnimation={null}>
            {activeDeal ? (
              <div className="rotate-3 scale-105">
                <DealCard {...activeDeal} stageName={""} />
              </div>
            ) : null}
          </DragOverlay>

        </DndContext>
      </div>
    </div>
  )
}
