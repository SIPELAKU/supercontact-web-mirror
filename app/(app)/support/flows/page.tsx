import { Suspense } from "react";
import FlowsListClient from "@/components/support/flows/FlowsListClient";

// Flow Studio (F1) - list of visual automation flows. The client owns all
// fetching and permission gating (conversations:routing:manage).
export default function SupportFlowsPage() {
    return (
        <Suspense fallback={null}>
            <FlowsListClient />
        </Suspense>
    );
}
