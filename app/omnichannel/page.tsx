import { Suspense } from "react";
import OmnichannelClient from "@/components/omnichannel/OmnichannelClient";

export default function OmnichannelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={null}>
        <OmnichannelClient />
      </Suspense>
    </div>
  );
}
