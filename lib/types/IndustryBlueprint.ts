export interface BlueprintVariable {
    key: string;
    label?: string;
    example?: string;
}

export interface BlueprintSummary {
    id: string;
    name: string;
    description?: string;
    industry?: string;
    version?: number;
    /** Module names. The listing and the detail endpoint return the SAME shape
     *  here; they used to disagree (list vs object), which crashed the wizard. */
    modules: string[];
    /** How many items each module carries. `knowledge_base` counts as 1 - it
     *  references a KB pack rather than inlining its articles. */
    counts?: Record<string, number>;
    variables?: BlueprintVariable[];
}

export interface BlueprintDetail extends BlueprintSummary {
    variables: BlueprintVariable[];
}

export interface ModuleReport {
    created: number;
    skipped: number;
    errors: Array<Record<string, unknown>>;
    items?: string[];
    /** Behaviour-driving modules land switched off; the report says so. */
    installed_disabled?: boolean;
    installed_as_draft?: boolean;
    sample_data?: boolean;
    /** A prerequisite is missing (e.g. no widget connected). Not an error. */
    note?: string;
}

export interface BlueprintInstallReport {
    blueprint_id?: string;
    dry_run?: boolean;
    modules: Record<string, ModuleReport>;
    totals: { created: number; skipped: number; failed: number };
    unsubstituted_variables?: string[];
}

export interface InstalledBlueprint {
    id: string;
    blueprint_id: string;
    name: string;
    installed_version: number;
    current_version: number | null;
    update_available: boolean;
    modules: string[] | null;
    installed_at: string;
    totals: { created: number; skipped: number; failed: number } | null;
}

export type ChecklistKind =
    | "ticket_sla_policy"
    | "conversation_sla_policy"
    | "ticket_automation_rule"
    | "flow"
    | "conversation_queue"
    /** The account is still on `legacy` automation, so published flows do not
     *  run on it. Publishing a flow without this is silent no-op. */
    | "automation_mode";

export interface ChecklistItem {
    kind: ChecklistKind;
    id: string;
    name: string | null;
    action: string;
}

export interface ActivationChecklist {
    pending: number;
    by_kind: Partial<Record<ChecklistKind, number>>;
    items: ChecklistItem[];
}
