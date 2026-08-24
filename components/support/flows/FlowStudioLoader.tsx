"use client";

// components/support/flows/FlowStudioLoader.tsx
// Client-side dynamic import boundary for the studio: @xyflow/react touches
// window/ResizeObserver and does not SSR, so the canvas is loaded with
// ssr:false from inside a client component (App Router requirement).

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const FlowStudio = dynamic(() => import("./FlowStudio"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100vh-52px)] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#5479EE]" />
        </div>
    ),
});

export default function FlowStudioLoader({ flowId }: { flowId: string }) {
    return <FlowStudio flowId={flowId} />;
}
