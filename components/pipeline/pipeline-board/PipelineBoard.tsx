"use client"

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { useEffect, useMemo, useState } from "react"

import SortableDeal from "@/components/pipeline/pipeline-board/SortableDeal"
import { ColumnDropZone } from "@/components/pipeline/pipeline-board/DroppableColumn"
import { DealCard } from "@/components/pipeline/pipeline-board/DealCard"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui-mui/button"
import { Deal } from "@/lib/type/Pipeline"
import { FilterBar } from "@/components/ui-mui/filter"
import { AddDealModal, dealStages } from "@/components/pipeline/AddDealModal"
import { useGetPipelineStore } from "@/lib/store/pipeline"
import { StageUI } from "@/lib/helper/transformPipeline"
import { formatRupiah } from "@/lib/helper/currency"
import CustomSelectStage from "@/components/pipeline/SelectDealStage"



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
    updateStagePipeline
  } = useGetPipelineStore();
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [stages, setStages] = useState(listPipeline)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  useEffect(() => {
    if (listPipeline.length > 0) {
      setStages(listPipeline)
    }
  }, [listPipeline])


  const computeStageTotals = (stages: StageUI[]) => {
    return stages.map(stage => ({
      ...stage,
      value: stage.deals.reduce((sum, d) => sum + (d.amount || 0), 0)
    }))
  }

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

    return stageFiltered

  }, [searchPipeline, statusFilter, dateRangeFilter]);



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

    const updated = JSON.parse(JSON.stringify(stages));

    const isOverColumn = overId.startsWith("column-") || stages.some(s => s.name === overId);

    if (isOverColumn) {

      const stageName = overId.replace("column-", "");
      const toStageIndex = stages.findIndex(s => s.name === stageName);

      if (toStageIndex !== -1 && from.stageIndex !== toStageIndex) {
        const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1);
        updated[toStageIndex].deals.push(moved);
        setStages(updated);
      }

      return;
    }

    const to = findDeal(overId, updated);
    if (!to) return;

    const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1);
    updated[to.stageIndex].deals.splice(to.dealIndex, 0, moved);

    setStages(computeStageTotals(updated));
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

    const from = findDeal(activeId, stages)
    if (!from) return

    const updated = JSON.parse(JSON.stringify(stages))

    if (overId.startsWith("column-")) {

      const toStageName = overId.replace("column-", "")
      const toStageIndex = updated.findIndex((s: StageUI) => s.name === toStageName)

      await updateStagePipeline(activeId, toStageName);
      if (from.stageIndex === toStageIndex) return

      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[toStageIndex].deals.push(moved)
      setStages(updated)
      return
    }

    const to = findDeal(overId, updated)
    if (!to) return

    if (from.stageIndex === to.stageIndex) {
      updated[from.stageIndex].deals = arrayMove(updated[from.stageIndex].deals, from.dealIndex, to.dealIndex)
    } else {
      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[to.stageIndex].deals.splice(to.dealIndex, 0, moved)
    }

    const updatedWithTotals = computeStageTotals(updated)

    setStages(updatedWithTotals)
    const toStage = updated[to.stageIndex].name;

    if (from !== to) {
      await updateStagePipeline(activeId, toStage);
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
              <div key={col} className="w-[280px] shrink-0">
                <div className="rounded-xl p-4 min-h-[300px] shadow-sm border border-gray-200 bg-gray-50">

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
                <div className="w-[280px] shrink-0">

                  <div
                    className={`rounded-xl p-4 min-h-[150px] shadow-sm border border-gray-200 ${stageColors[stage.name]}`}
                  >

                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="text-sm font-medium text-gray-600">
                        {formatRupiah(stage.value)}
                      </span>
                    </div>

                    <SortableContext
                      items={stage.deals.map((d: Deal) => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4 min-h-[100px]">

                        {stage.deals.length === 0 && (
                          <div className="h-24 flex items-center justify-center text-gray-400 text-sm rounded-xl border border-gray-200 bg-white shadow-inner">
                            Drag deals here
                          </div>
                        )}

                        {stage.deals.map((deal: Deal) => (
                          <div key={deal.id} className="pointer-events-auto">
                            <SortableDeal id={deal.id}>
                              <DealCard {...deal} stageName={stage.name} />
                            </SortableDeal>
                          </div>
                        ))}

                      </div>
                    </SortableContext>


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
