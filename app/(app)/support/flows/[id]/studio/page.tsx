import FlowStudioLoader from "@/components/support/flows/FlowStudioLoader";

// Flow Studio (F1) - full-viewport visual editor for one automation flow.
// The canvas itself (@xyflow/react) is client-only; FlowStudioLoader dynamic-
// imports it with ssr:false.
export default function FlowStudioPage({ params }: { params: { id: string } }) {
    return <FlowStudioLoader flowId={params.id} />;
}
