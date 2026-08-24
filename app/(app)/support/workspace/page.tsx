import { Suspense } from "react";
import WorkspaceClient from "@/components/support/workspace/WorkspaceClient";

// Conversation-first agent workspace (Zendesk-style) - a sibling to the
// contact-first Omnichannel inbox. Renders full-height under the app shell's
// 52px topbar; WorkspaceClient owns its own internal scroll regions.
export default function SupportWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <WorkspaceClient />
    </Suspense>
  );
}
