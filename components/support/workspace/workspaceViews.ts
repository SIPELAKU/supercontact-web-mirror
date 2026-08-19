// View presets for the agent workspace's left rail. Each view is just a
// filter preset fed into useConversationInbox - selecting one pre-fills the
// queue's base filter state (status + assignment), which the queue's own
// priority/channel/status chips then refine on top of.

import { ConversationStatus } from "@/lib/types/omnichannel";

export type WorkspaceViewId =
  | "assigned_to_me"
  | "live_unassigned"
  | "all_open"
  | "solved"
  | "snoozed";

export interface WorkspaceView {
  id: WorkspaceViewId;
  label: string;
  group: string;
  // Highlights the view in an "urgent" treatment (Live & unassigned).
  live?: boolean;
  filters: {
    status?: ConversationStatus;
    assigned_to_me?: boolean;
    unassigned?: boolean;
  };
}

export const WORKSPACE_VIEWS: WorkspaceView[] = [
  {
    id: "assigned_to_me",
    label: "Assigned to me",
    group: "My work",
    filters: { assigned_to_me: true },
  },
  {
    id: "live_unassigned",
    label: "Live & unassigned",
    group: "Team queues",
    live: true,
    filters: { unassigned: true, status: "open" },
  },
  {
    id: "all_open",
    label: "All open",
    group: "Team queues",
    filters: { status: "open" },
  },
  {
    id: "solved",
    label: "Solved",
    group: "Team queues",
    filters: { status: "solved" },
  },
  {
    id: "snoozed",
    label: "Snoozed",
    group: "My work",
    filters: { status: "snoozed" },
  },
];
