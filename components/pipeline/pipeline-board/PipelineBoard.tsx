"use client"

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { useEffect, useMemo, useState } from "react"

import SortableDeal from "@/components/pipeline/pipeline-board/SortableDeal"
import { DroppableColumn } from "@/components/pipeline/pipeline-board/DroppableColumn"
import { DealCard } from "@/components/pipeline/pipeline-board/DealCard"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui-mui/button"
import { Deal } from "@/lib/type/Pipeline"
import { FilterBar } from "@/components/ui-mui/filter"
import { AddDealModal } from "@/components/pipeline/AddDealModal"
import { useGetPipelineStore } from "@/lib/store/pipeline"
import { StageUI } from "@/lib/helper/transformPipeline"
import { formatRupiah } from "@/lib/helper/currency"


const stageColors: Record<string, string> = {
  Prospect: "bg-[#F3F4F6]",
  Qualified: "bg-[#F3EEFF]",
  Negotiation: "bg-[#EAF6FF]",
  Proposal: "bg-[#FFF6E8]",
  "Closed - Won": "bg-[#E8FFE8]",
  "Closed - Lost": "bg-[#FFE8E8]",
}

export default function PipelineBoard() {
  const { listPipeline } = useGetPipelineStore();
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stages, setStages] = useState(listPipeline)
  const [statusFilter, setStatusFilter] = useState("all")
  const [salespersonFilter, setSalespersonFilter] = useState("all")
  const [dateRangeFilter, setDateRangeFilter] = useState("all")
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

  
  const filteredStages = useMemo(() => {
    return stages.map((stage) => {
      const filteredDeals = stage.deals.filter((deal: Deal) => {
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && !deal.wonDate) ||
          (statusFilter === "closed" && deal.wonDate)

        const matchDate =
          dateRangeFilter === "all" ||
          dateRangeFilter === "month" ||
          dateRangeFilter === "quarter"

        return matchStatus && matchDate
      })

      return { ...stage, deals: filteredDeals }
    })
  }, [stages, statusFilter, salespersonFilter, dateRangeFilter])


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )


  const findDeal = (id: string) => {
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      const dealIndex = stages[stageIndex].deals.findIndex(
        (d: Deal) => String(d.id) === String(id)
      )
      if (dealIndex !== -1) return { stageIndex, dealIndex }
    }
    return null
  }

  const handleDragStart = (event: any) => {
    const loc = findDeal(event.active.id)
    if (!loc) return
    setActiveDeal(stages[loc.stageIndex].deals[loc.dealIndex])
  }

  const handleDragOver = (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const from = findDeal(activeId)
    if (!from) return

    const updated = JSON.parse(JSON.stringify(stages))

    if (overId.startsWith("column-")) {
      const toStageName = overId.replace("column-", "")
      const toStageIndex = updated.findIndex((s: any) => s.name === toStageName)

      if (from.stageIndex === toStageIndex) return

      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[toStageIndex].deals.push(moved)
      setStages(updated)
      return
    }

    const to = findDeal(overId)
    if (!to) return

    const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
    updated[to.stageIndex].deals.splice(to.dealIndex, 0, moved)

    setStages(computeStageTotals(updated))
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    setActiveDeal(null)
    if (!over) return

    const activeId = active.id
    const overId = over.id
    const from = findDeal(activeId)
    if (!from) return

    const updated = JSON.parse(JSON.stringify(stages))

    if (overId.startsWith("column-")) {
      const toStageName = overId.replace("column-", "")
      const toStageIndex = updated.findIndex((s: any) => s.name === toStageName)

      if (from.stageIndex === toStageIndex) return

      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[toStageIndex].deals.push(moved)
      setStages(updated)
      return
    }

    const to = findDeal(overId)
    if (!to) return

    if (from.stageIndex === to.stageIndex) {
      updated[from.stageIndex].deals = arrayMove(
        updated[from.stageIndex].deals,
        from.dealIndex,
        to.dealIndex
      )
    } else {
      const [moved] = updated[from.stageIndex].deals.splice(from.dealIndex, 1)
      updated[to.stageIndex].deals.splice(to.dealIndex, 0, moved)
    }

    const updatedWithTotals = computeStageTotals(updated)
    setStages(updatedWithTotals)
  }

  console.log(stages);
  

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8">
      <AddDealModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="px-6 pt-5">
        <h2 className="font-medium pb-2">Filters</h2>
        <FilterBar
          width="420px"
          filters={[
            {
              label: "Select All",
              value: statusFilter,
              options: [
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Closed", value: "closed" }
              ],
              onChange: setStatusFilter,
            },
            {
              label: "Select Assigned To",
              value: salespersonFilter,
              options: [
                { label: "All", value: "all" },
                { label: "John Doe", value: "john" },
                { label: "Jane Smith", value: "jane" },
              ],
              onChange: setSalespersonFilter,
            },
            {
              label: "Select By Date Range",
              value: dateRangeFilter,
              options: [
                { label: "All Time", value: "all" },
                { label: "This Month", value: "month" },
                { label: "This Quarter", value: "quarter" },
              ],
              onChange: setDateRangeFilter,
            },
          ]}
        />
      </div>

      <div className="border-b w-full p-0 border-gray-300" />

      <div className="flex justify-between items-center gap-4 px-6 w-full">
        <div
          className="flex items-center min-w-[550px] h-10 rounded-lg bg-white border border-[#E5E7EB] px-3 hover:border-[#D1D5DB] focus-within:border-[#60A5FA] focus-within:ring-1 focus-within:ring-[#60A5FA] transition-all"
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

        <Button onClick={()=>setIsModalOpen(!isModalOpen)} className="bg-[#4F6DF5] hover:bg-[#3f58ce] text-white gap-2 h-10 px-4 rounded-lg">
          <Plus className="h-4 w-4" />
          <span className="hidden font-semibold sm:inline">Add New Pipeline</span>
          <span className="sm:hidden font-semibold">Add</span>
        </Button>
      </div>



      <div className="w-full overflow-x-auto scrollbar-hide pb-6 pt-1 px-6">

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="inline-flex gap-6 min-w-full mt-4">

            {filteredStages.map((stage) => (
              <DroppableColumn key={stage.name} id={`column-${stage.name}`}>

                <div className="w-[280px] shrink-0">

                  <div
                    className={`rounded-xl p-4 min-h-fit shadow-sm border border-gray-200 ${stageColors[stage.name]}`}
                  >

                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="text-sm font-medium text-gray-600">{formatRupiah(stage.value)}</span>
                    </div>

                    <SortableContext
                      items={stage.deals.map((d: Deal) => String(d.id))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4">

                        {/* Empty State */}
                        {stage.deals.length === 0 && (
                          <div className="h-24 flex items-center justify-center text-gray-400 text-sm rounded-xl border border-gray-200 bg-white shadow-inner">
                            Drag deals here
                          </div>
                        )}

                        {/* Deal Cards */}
                        {stage.deals.map((deal: Deal) => (
                          <SortableDeal key={String(deal.id)} id={String(deal.id)}>
                            <DealCard {...deal} />
                          </SortableDeal>
                        ))}

                      </div>
                    </SortableContext>
                  </div>

                </div>

              </DroppableColumn>
            ))}

          </div>

          <DragOverlay dropAnimation={null}>
            {activeDeal ? (
              <div className="rotate-3 scale-105">
                <DealCard {...activeDeal} />
              </div>
            ) : null}
          </DragOverlay>

        </DndContext>
      </div>
    </div>
  )
}
