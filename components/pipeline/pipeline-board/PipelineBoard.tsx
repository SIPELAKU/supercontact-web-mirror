"use client"

import {
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
  SortableContext,
  type SortingStrategy,
} from "@dnd-kit/sortable"
import { useEffect, useMemo, useRef, useState } from "react"

import { AddDealModal } from "@/components/pipeline/AddDealModal"
import { DealCard } from "@/components/pipeline/pipeline-board/DealCard"
import { ColumnDropZone } from "@/components/pipeline/pipeline-board/DroppableColumn"
import SortableDeal from "@/components/pipeline/pipeline-board/SortableDeal"
import CustomSelectStage from "@/components/pipeline/SelectDealStage"
import MultiSelectDealStage from "@/components/pipeline/MultiSelectDealStage"
import { filterStagesBySelection } from "@/components/pipeline/pipeline-board/stageFilter"
import { columnCollision, dropIndex, moveDealToColumn, stageNameAt } from "@/components/pipeline/pipeline-board/boardMoves"
import {
  createMoveFeedback,
  moveDirection,
  moveFeedbackClass,
  type MoveFeedbackState,
} from "@/components/pipeline/pipeline-board/moveFeedback"

import { FilterBar } from "@/components/ui/filter"
import { formatRupiah } from "@/lib/helper/currency"
import { StageUI, isClosedOutcome } from "@/lib/helper/transformPipeline"
import { ConfirmationPopup, useConfirmationPopup } from "@/components/ui/confirmation-popup"
import { Tooltip } from "@mui/material"
import PipelineSetupEmpty from "@/components/pipeline/stage-editor/PipelineSetupEmpty"
import StageColumnMenu from "@/components/pipeline/stage-editor/StageColumnMenu"
import QuotationStageBadge from "@/components/pipeline/stage-editor/QuotationStageBadge"
import StageManageDialog from "@/components/pipeline/stage-editor/StageManageDialog"
import StageSetupDialog from "@/components/pipeline/stage-editor/StageSetupDialog"
import { canManageStages, deleteConfirmTitle, stageTint } from "@/components/pipeline/stage-editor/stageRules"
import { useAuth } from "@/lib/context/AuthContext"
import { useDeletePipelineStage, usePipelineStages } from "@/lib/hooks/usePipelineStages"

import { useGetPipelineStore } from "@/lib/store/pipeline"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Deal } from "@/lib/types/Pipeline"
import { Plus, Search, Settings } from "lucide-react"
import { notify } from "@/lib/notifications"
import { AppInput } from "@/components/ui/app-input"
import { AppButton } from "@/components/ui/app-button"



// A column's cards as on screen, in column order (read once, on drop).
const cardRectsIn = (stageName: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-stage-cards="${CSS.escape(stageName)}"] > [data-deal-id]`)
  ).map((node) => node.getBoundingClientRect())

// The other cards stay put while one is dragged: there is no manual order, the
// API's sort places the card once it is dropped.
const keepInPlace: SortingStrategy = () => null

export default function PipelineBoard() {
  const {
    listPipeline,
    salespersonFilter,
    dateRangeFilter,
    dealStatusFilter,
    searchFilter,
    setDateRangeFilter,
    setDealStatusFilter,
    setSalespersonFilter,
    setSearchFilter,
    loading,
    refreshing,
    loadingMoreStages,
    listActiveUser,
    isModalOpen,
    setIsModalOpen,
    updateStagePipeline,
    fetchPipeline,
    loadMoreDeals,
    scopeUserId,
    needsSetup
  } = useGetPipelineStore();
  // Only an Admin sets up and manages stages (gear, column menu, setup +).
  const { userProfile, userRole } = useAuth()
  const canManage = canManageStages(userProfile?.role ?? userRole)
  const [setupOpen, setSetupOpen] = useState(false)
  // The gear dialog (every stage) or Edit from a column's menu (one stage).
  const [manage, setManage] = useState<{ mode: "manage" | "single"; stageId?: string } | null>(null)
  const deleteStage = useDeletePipelineStage()
  const { confirm, confirmationPopup } = useConfirmationPopup()
  // The company's active stages, for the stage filter.
  const { data: stagesData } = usePipelineStages(false)
  const stageOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      ...(stagesData?.data?.data ?? []).map((stage) => ({ value: stage.name, label: stage.name, color: stage.color })),
    ],
    [stagesData]
  )
  const reloadBoard = () => fetchPipeline({ isSilent: true })
  // What is typed. The API searches, so the board reloads once typing pauses.
  const [searchQuery, setSearchQuery] = useState<string>(searchFilter)
  const debouncedSearch = useDebounce(searchQuery, 1000)
  const [stages, setStages] = useState(listPipeline)
  // Picked stages; empty = all.
  const [stageFilter, setStageFilter] = useState<string[]>([])
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  // While dragging: the card's own column, and the column under the pointer.
  const [dragFromStage, setDragFromStage] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)
  // Board as it was when a drag began, to put a card back when a move to
  // Won/Lost is cancelled.
  const dragSnapshotRef = useRef<StageUI[] | null>(null)
  // A drop into Won/Lost waiting for the user to confirm it (it can't be undone).
  const [pendingClose, setPendingClose] = useState<{ dealId: string; toStage: string } | null>(null)
  // The card just moved to another stage: saving, fading out, or highlighted.
  const [moveFx, setMoveFx] = useState<MoveFeedbackState | null>(null)
  const feedbackRef = useRef<ReturnType<typeof createMoveFeedback> | null>(null)
  if (!feedbackRef.current) feedbackRef.current = createMoveFeedback(setMoveFx)
  const feedback = feedbackRef.current
  // A board came in while a moved card held the screen, and is not shown yet.
  const heldBoardRef = useRef(false)
  // The board as on screen, for code that runs after an await.
  const stagesRef = useRef(stages)
  stagesRef.current = stages

  useEffect(() => () => feedback.dispose(), [feedback])

  useEffect(() => {
    setSearchFilter(debouncedSearch.trim())
  }, [debouncedSearch, setSearchFilter])

  useEffect(() => {
    // While a moved card is saving or fading out, the move shows the new board itself.
    if (feedback.holdsBoard()) {
      heldBoardRef.current = true
      return
    }
    if (listPipeline.length > 0) {
      heldBoardRef.current = false
      setStages(listPipeline)
    }
  }, [listPipeline, feedback])

  // What a stage does (won/lost locks the deal), by the column's outcome.
  const outcomeOf = (stageName: string | null) => stagesRef.current.find((s) => s.name === stageName)?.outcome

  const askDeleteStage = (stage: StageUI) => {
    const stageId = stage.stageId
    if (!stageId) return
    confirm({
      title: deleteConfirmTitle(stage.name),
      description: "The stage is removed from the pipeline. Its name can be used again.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteStage.mutateAsync(stageId)
          notify.success(`${stage.name} deleted`)
        } catch (error) {
          notify.error(error instanceof Error ? error.message : "Failed to delete pipeline stage")
        }
        await reloadBoard()
      },
    })
  }

  const showLatestBoard = () => {
    heldBoardRef.current = false
    const latest = useGetPipelineStore.getState().listPipeline
    if (latest.length > 0) setStages(latest)
  }

  // The stage filter stays in the browser: the board always loads every
  // column, and the ones not picked are shown empty.
  const visibleStages = useMemo(
    () => filterStagesBySelection(stages, stageFilter),
    [stages, stageFilter]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = String(event.active.id);
    const fromStage = stageNameAt(stages, dealId);
    const deal = stages.find((s) => s.name === fromStage)?.deals.find((d) => String(d.id) === dealId);
    if (!deal) return;

    dragSnapshotRef.current = stages;
    setActiveDeal(deal);
    setDragFromStage(fromStage);
  };

  const moveDealToStage = async (dealId: string, toStage: string) => {
    const run = feedback.start(dealId);

    let reloaded: boolean;
    try {
      reloaded = await updateStagePipeline(dealId, toStage);
    } catch (error) {
      run.cancel();
      console.error("Failed to update stage:", error);
      notify.error("Failed to update stage. Reverting...");
      await fetchPipeline();
      return;
    }

    // A newer move took over; it shows the board when it is done.
    if (!run.isCurrent()) {
      notify.success(`Moved to ${toStage}`);
      return;
    }

    // Saved, but the board didn't reload: the card stays where it was dropped,
    // unless another board came in meanwhile.
    if (!reloaded) {
      run.cancel();
      if (heldBoardRef.current) showLatestBoard();
      notify.success(`Moved to ${toStage}`);
      return;
    }

    const dropped = stagesRef.current.find((s) => s.name === toStage)?.deals ?? [];
    const landed = useGetPipelineStore.getState().listPipeline.find((s) => s.name === toStage)?.deals ?? [];
    const direction = moveDirection(dropped, landed, dealId);
    notify.success(
      `Moved to ${toStage}`,
      direction === "gone"
        ? { description: "Sorted further down by probability. Use Load More to see it." }
        : undefined
    );
    run.finish(direction, showLatestBoard);
  };

  // Won and Lost are final, so a move there waits for the user to confirm.
  const requestStageMove = async (dealId: string, toStage: string) => {
    if (isClosedOutcome(outcomeOf(toStage))) {
      setPendingClose({ dealId, toStage });
      return;
    }
    await moveDealToStage(dealId, toStage);
  };

  const revertToSnapshot = () => {
    if (dragSnapshotRef.current) setStages(dragSnapshotRef.current);
  };

  // While dragging, only the column under the pointer is marked. The board
  // itself doesn't change until the drop: moving the card into each column it
  // passed changed the columns' size, which made dnd-kit pick the previous
  // column again, and so on without end ("Maximum update depth exceeded").
  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverStage(over ? stageNameAt(stages, String(over.id)) : null);
  };

  const endDrag = () => {
    setActiveDeal(null);
    setDragFromStage(null);
    setOverStage(null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    endDrag();

    const dealId = String(active.id)
    const originalStage = stageNameAt(stages, dealId);
    const toStage = over ? stageNameAt(stages, String(over.id)) : null;

    // Nothing to save when the card is dropped outside the board, or back in
    // its own column (the order inside a column is the API's sort, so there
    // is no manual order), or for a closed deal (its card can't be dragged;
    // this is the backstop).
    if (!originalStage || !toStage || toStage === originalStage || isClosedOutcome(outcomeOf(originalStage))) {
      return;
    }

    // The card goes where it was dropped, so it saves there and then fades out
    // from there toward its sorted place (up or down).
    const dropRect = active.rect.current.translated;
    const index = dropRect ? dropIndex(cardRectsIn(toStage), dropRect.top + dropRect.height / 2) : undefined;
    setStages(moveDealToColumn(stages, dealId, toStage, index));
    await requestStageMove(dealId, toStage);
  }

  const handleLoadMore = async (stageName: string) => {
    try {
      await loadMoreDeals(stageName);
    } catch (error) {
      console.error("Failed to load more deals:", error);
      notify.error("Failed to load more deals");
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

        <div className="w-full overflow-x-auto pb-6 pt-1 px-6">
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
      <ConfirmationPopup
        isOpen={Boolean(pendingClose)}
        onClose={() => {
          revertToSnapshot();
          setPendingClose(null);
        }}
        onConfirm={() => {
          const move = pendingClose;
          setPendingClose(null);
          if (move) moveDealToStage(move.dealId, move.toStage);
        }}
        title={`Move this deal to ${pendingClose?.toStage ?? "a closed stage"}?`}
        description="A Won or Lost deal is final: it can't be moved back to another stage or edited afterwards."
        confirmText="Yes, move it"
        cancelText="Cancel"
        variant="warning"
      />
      <div className="px-6 pt-5">
        <h2 className="font-medium pb-2">Filters</h2>
        <FilterBar
          width="100%"
          filters={[
            {
              type: "custom",
              component: (
                <MultiSelectDealStage
                  placeholder="Select All"
                  value={stageFilter}
                  onChange={setStageFilter}
                  data={stageOptions}
                  className="font-normal"
                />
              )
            },
            // Hidden for a user who only sees their own deals.
            ...(scopeUserId ? [] : [{
              type: "custom" as const,
              component: (
                <CustomSelectStage
                  placeholder="Select Assigned To"
                  value={salespersonFilter}
                  onChange={setSalespersonFilter}
                  data={listActiveUser}
                  className="bg-white rounded-lg font-normal"
                />
              )
            }]),
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
            // Filtered by the API. Won/Lost deals are never active or expired,
            // so with either option their columns are empty.
            {
              type: "custom",
              component: (
                <CustomSelectStage
                  placeholder="Select Status"
                  value={dealStatusFilter}
                  onChange={setDealStatusFilter}
                  data={[
                    { label: "All", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Expired", value: "expired" }
                  ]}
                  className="bg-white rounded-lg font-normal"
                />
              )
            },
          ]}
        />
      </div>

      <div className="border-b w-full p-0 border-gray-300" />

      <div className="relative flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-6 w-full">
        {/* A quiet reload (a filter change, or after a move): a thin bar in the
            gap above the columns; the board stays usable. */}
        {refreshing && (
          <div className="absolute inset-x-6 -bottom-4 h-0.5 overflow-hidden rounded-full bg-primary/15">
            <div
              role="progressbar"
              aria-label="Updating board"
              className="h-full w-1/3 rounded-full bg-primary animate-board-progress motion-reduce:animate-none"
            />
          </div>
        )}
        <div className="lg:w-[50%] w-full">
          <AppInput
            isBgWhite
            rounded="8px"
            placeholder="Search by name or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search />}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {canManage && !needsSetup && (
            <Tooltip title="Manage Stages">
              <button
                type="button"
                aria-label="Manage Stages"
                onClick={() => setManage({ mode: "manage" })}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Settings className="h-5 w-5" />
              </button>
            </Tooltip>
          )}
          {/* No deal can be added before the pipeline has stages. */}
          <AppButton
            onClick={() => setIsModalOpen(!isModalOpen)}
            variantStyle="primary"
            color="primary"
            startIcon={<Plus />}
            disabled={needsSetup}
          >
            <span className="hidden sm:inline">Add Deal</span>
          </AppButton>
        </div>

      </div>

      {needsSetup ? (
        <PipelineSetupEmpty canManage={canManage} onSetUp={() => setSetupOpen(true)} />
      ) : (
      <div className="w-full overflow-x-auto pb-6 pt-1 px-6">

        <DndContext
          sensors={sensors}
          collisionDetection={columnCollision}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={endDrag}
        >
          <div className="inline-flex gap-6 min-w-full mt-4">

            {visibleStages.map((stage) => {
              // count covers the whole column; only some of it is loaded.
              const remaining = Math.max(0, stage.count - stage.deals.length);
              const isLoadingMore = Boolean(loadingMoreStages[stage.name]);

              return (
                <ColumnDropZone key={stage.id} id={`column-${stage.name}`}>
                  <div className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-220px)]">

                    <div
                      className={`rounded-xl p-4 flex flex-col h-full flex-grow shadow-sm border border-gray-200 transition-shadow ${overStage === stage.name && overStage !== dragFromStage ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      style={{ backgroundColor: stageTint(stage.color, 0.1) }}
                    >

                      {/* The name has the top line to itself (wrapping if it is long,
                          never cut off), with the menu beside it; the count, the
                          quotation mark and the total go on the line below. */}
                      <div className="mb-4 flex flex-col gap-1.5 px-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 break-words font-semibold leading-snug text-gray-900">{stage.name}</h3>
                          {/* A stage outside the catalogue (no id) has no menu. */}
                          {canManage && stage.stageId && (
                            <StageColumnMenu
                              stageName={stage.name}
                              color={stage.color}
                              isLocked={stage.isLocked}
                              totalDeals={stage.totalDeals}
                              onEdit={() => setManage({ mode: "single", stageId: stage.stageId! })}
                              onDelete={() => askDeleteStage(stage)}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            title="Deals in this stage"
                            className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-600"
                          >
                            {stage.count}
                          </span>
                          {/* The stage quotations are built from, whatever it is called now. */}
                          {stage.outcome === "quotation" && <QuotationStageBadge variant="icon" />}
                          <span className="ml-auto truncate text-sm font-medium text-gray-600">
                            {formatRupiah(stage.value)}
                          </span>
                        </div>
                      </div>

                      <SortableContext
                        items={stage.deals.map((d) => d.id)}
                        strategy={keepInPlace}
                      >
                        <div data-stage-cards={stage.name} className="flex flex-col gap-3 flex-grow min-h-25 overflow-y-auto scrollbar-hide pr-2 -mr-2">
                          {stage.deals.length === 0 && (
                            <div className="h-24 flex shrink-0 items-center justify-center text-gray-400 text-sm rounded-xl border border-gray-200 bg-white shadow-inner">
                              Drag deals here
                            </div>
                          )}

                          {stage.deals.map((deal) => {
                            const fx = moveFx?.dealId === deal.id ? moveFx : null;
                            return (
                              <div key={deal.id} data-deal-id={deal.id} className={`pointer-events-auto shrink-0 ${moveFeedbackClass(fx)}`}>
                                {/* Not draggable while its move is still being saved or fading out. */}
                                <SortableDeal id={deal.id} disabled={isClosedOutcome(stage.outcome) || (fx !== null && fx.phase !== "entering")}>
                                  <DealCard
                                    {...deal}
                                    stageName={stage.name}
                                    stageColor={stage.color}
                                    isSaving={fx?.phase === "saving"}
                                    isHighlighted={fx?.phase === "entering"}
                                  />
                                </SortableDeal>
                              </div>
                            );
                          })}

                          {stage.nextCursor && (
                            <div className="pt-2 pb-1">
                              <AppButton
                                variantStyle="text"
                                className="w-full text-xs text-gray-500 hover:text-gray-900 h-8"
                                disabled={isLoadingMore}
                                onClick={() => handleLoadMore(stage.name)}
                              >
                                {isLoadingMore
                                  ? "Loading..."
                                  : remaining > 0 ? `Load More (${remaining} remaining)` : "Load More"}
                              </AppButton>
                            </div>
                          )}
                        </div>
                      </SortableContext>

                    </div>
                  </div>
                </ColumnDropZone>
              );
            })}


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
      )}

      {canManage && (
        <>
          <StageSetupDialog open={setupOpen} onClose={() => setSetupOpen(false)} onDone={reloadBoard} />
          <StageManageDialog
            open={manage !== null}
            mode={manage?.mode ?? "manage"}
            stageId={manage?.stageId}
            onClose={() => setManage(null)}
            onSaved={reloadBoard}
          />
        </>
      )}
      {confirmationPopup}
    </div>
  )
}
