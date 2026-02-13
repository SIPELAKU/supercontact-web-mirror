"use client";

import { AppAlert } from "@/components/ui/app-alert";
import { notify } from "@/lib/notifications";
import { Button } from "@/components/ui/button";

export default function AlertsTestPage() {
  return (
    <div className="container mx-auto p-10 space-y-10">
      <h1 className="text-3xl font-bold">Alert Components Test</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Static Components</h2>
        <div className="grid gap-4 max-w-md">
          <AppAlert variant="failed" description="Alert content" />
          <AppAlert variant="warning" description="Alert content" />
          <AppAlert variant="info" description="Alert content" />
          <AppAlert variant="success" description="Alert content" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Trigger Toasts</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            className="bg-[#F34E4E] hover:bg-[#D43F3F]"
            onClick={() =>
              notify.error("Failed", {
                description: "Sedang terjadi kesalahan sistem",
              })
            }
          >
            Show Error
          </Button>
          <Button
            className="bg-[#FFB02E] hover:bg-[#E69B26]"
            onClick={() =>
              notify.warning("Warning", {
                description: "Harap periksa kembali data Anda",
              })
            }
          >
            Show Warning
          </Button>
          <Button
            className="bg-[#3AC7FF] hover:bg-[#2EB0E6]"
            onClick={() =>
              notify.info("Info", {
                description: "Informasi terbaru telah tersedia",
              })
            }
          >
            Show Info
          </Button>
          <Button
            className="bg-[#7BDD3E] hover:bg-[#68C52E]"
            onClick={() =>
              notify.success("Success", {
                description: "Data berhasil disimpan",
              })
            }
          >
            Show Success
          </Button>
        </div>
      </section>
    </div>
  );
}
