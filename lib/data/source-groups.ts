// Display grouping for company-intelligence `source` values.
//
// The cache/CRM rows carry raw provider identifiers (google_maps, serpapi,
// bulk_import, ...) plus a legacy tail ("company_intelligence" from the old
// save-to-CRM hardcode, "" on Lists rows, old "csv_import"). The UI never
// shows those raw strings directly - it shows a small icon + short label per
// GROUP, with the raw value relegated to a tooltip. Keyed by EXACT source
// value so filter UIs can translate a picked group back into the exact
// values to send to the API (`sources` query param).
import {
    CircleDashed,
    FileUp,
    Globe,
    Landmark,
    Link2,
    type LucideIcon,
    MapPin,
    PenLine,
    Sparkles,
} from "lucide-react";

export interface SourceGroup {
    label: string;
    icon: LucideIcon;
}

const MAPS_GROUP: SourceGroup = { label: "Maps", icon: MapPin };
const WEB_GROUP: SourceGroup = { label: "Web", icon: Globe };
const AI_GROUP: SourceGroup = { label: "AI", icon: Sparkles };
const IMPORT_GROUP: SourceGroup = { label: "Import", icon: FileUp };

// Anything not in the map (legacy "company_intelligence", empty string on
// Lists rows, null, or a source added server-side before the web catches up).
export const LEGACY_SOURCE_GROUP: SourceGroup = { label: "Legacy", icon: CircleDashed };

export const SOURCE_GROUPS: Record<string, SourceGroup> = {
    google_maps: MAPS_GROUP,
    serpapi: WEB_GROUP,
    serpapi_with_domain: WEB_GROUP,
    llm: AI_GROUP,
    groq: AI_GROUP,
    bulk_import: IMPORT_GROUP,
    csv_import: IMPORT_GROUP,
    pse_komdigi: { label: "PSE Registry", icon: Landmark },
    kemenperin: { label: "Kemenperin", icon: Landmark },
    manual: { label: "Manual", icon: PenLine },
    website: { label: "Website", icon: Link2 },
};

export function sourceGroup(source: string | null | undefined): SourceGroup {
    if (!source) return LEGACY_SOURCE_GROUP;
    return SOURCE_GROUPS[source] ?? LEGACY_SOURCE_GROUP;
}

export interface SourceGroupOption extends SourceGroup {
    // The exact `source` values this display group expands to - what filter
    // UIs actually send as the `sources` query param.
    values: string[];
}

// One option per UNIQUE group label, in SOURCE_GROUPS order (Maps, Web, AI,
// Import, ...). The Legacy bucket is deliberately absent: its members
// ("company_intelligence", "", null) aren't addressable as exact values.
export const SOURCE_GROUP_OPTIONS: SourceGroupOption[] = Object.entries(
    SOURCE_GROUPS
).reduce<SourceGroupOption[]>((options, [value, group]) => {
    const existing = options.find((o) => o.label === group.label);
    if (existing) {
        existing.values.push(value);
    } else {
        options.push({ ...group, values: [value] });
    }
    return options;
}, []);
