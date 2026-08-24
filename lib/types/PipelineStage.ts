/** What reaching a stage MEANS, independent of what the tenant calls it.
 *  Every revenue report reads this, not the stage name - which is what lets a
 *  property developer name its winning stage "AJB" without the numbers
 *  silently dropping to zero. */
export type StageOutcome = "open" | "won" | "lost";

export interface PipelineStage {
    id: string;
    name: string;
    display_order: number;
    outcome: StageOutcome;
    default_probability: number | null;
    is_active: boolean;
    /** How many deals currently sit on this stage. Present on list only. */
    deal_count?: number | null;
}

export interface PipelineStageCreate {
    name: string;
    outcome?: StageOutcome;
    default_probability?: number | null;
    display_order?: number | null;
}

export interface PipelineStageUpdate {
    name?: string;
    outcome?: StageOutcome;
    default_probability?: number | null;
    is_active?: boolean;
}
