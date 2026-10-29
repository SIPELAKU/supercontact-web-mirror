import { Suspense } from "react";
import PipelineClient from "@/components/pipeline/PipelineClient";

// Suspense because PipelineClient reads ?deal=<id> (useSearchParams), the
// deep link a deal notification opens.
export default function PipelinePage() {
  return (
    <Suspense fallback={null}>
      <PipelineClient />
    </Suspense>
  );
}
