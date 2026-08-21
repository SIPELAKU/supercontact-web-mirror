import { Suspense } from "react";
import UnifiedFeedClient from "@/components/support/unified/UnifiedFeedClient";

// "All Work" - a unified, read-only cross-entity feed that lists BOTH tickets
// and omnichannel conversations in one place (Increment 8). Each row deep-links
// to wherever that item actually lives (ticket detail, Workspace, or the
// Omnichannel inbox). The client owns all fetching/filtering/pagination.
export default function SupportAllWorkPage() {
    return (
        <Suspense fallback={null}>
            <UnifiedFeedClient />
        </Suspense>
    );
}
