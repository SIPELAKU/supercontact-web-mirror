import { Suspense } from "react";
import QaClient from "@/components/support/qa/QaClient";

// QA Reviews (Phase 8D) - per-agent quality summary + the review list, with
// creation gated on support:qa:review. The client owns all fetching/permission
// gating.
export default function SupportQaPage() {
    return (
        <Suspense fallback={null}>
            <QaClient />
        </Suspense>
    );
}
