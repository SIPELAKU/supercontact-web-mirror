/** What a stage DOES, independent of what the company calls it (API 1.170.0).
 *  Renaming never changes it. Reports, the locked order and the Won/Lost lock
 *  all read this, never the stage name.
 *  - entry: the first stage (Prospect by default), exactly one
 *  - quotation: the stage quotations are sent from (Proposal), exactly one
 *  - open: any other stage; every stage a company adds is open
 *  - won / lost: the closing stages, exactly one each */
export type StageOutcome = "entry" | "quotation" | "open" | "won" | "lost";

/** A deal's own outcome (`stage_outcome` on a deal) stays three-valued. */
export type DealOutcome = "open" | "won" | "lost";

export interface PipelineStage {
    id: string;
    name: string;
    display_order: number;
    outcome: StageOutcome;
    /** Hex, e.g. "#26C6F9". The deal-card badge colour; the column and the
     *  filter chip are tints of it. */
    color: string | null;
    /** Required stage (entry, quotation, won, lost): can be renamed and
     *  recoloured, never deleted or deactivated. */
    is_locked: boolean;
    default_probability?: number | null;
    is_active: boolean;
    /** Every deal on this stage, whatever the board's filters. List only. */
    deal_count?: number | null;
}

export interface PipelineStageCreate {
    name: string;
    color?: string | null;
    /** Only the old Settings page still sends it. */
    default_probability?: number | null;
}

/** `outcome` can't be changed. */
export interface PipelineStageUpdate {
    name?: string;
    color?: string | null;
    is_active?: boolean;
    /** Only the old Settings page still sends it. */
    default_probability?: number | null;
}

/** One stage of a Customize setup, in board order. A stage the company adds
 *  has no outcome (the API makes it open). */
export interface PipelineSetupStage {
    outcome?: StageOutcome;
    name: string;
    color: string;
}

export type PipelineSetupRequest =
    | { mode: "default" }
    | { mode: "custom"; stages: PipelineSetupStage[] };
