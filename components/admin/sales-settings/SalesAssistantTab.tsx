"use client";

// Settings > Sales > Asisten Penjualan.
//
// One switch, but not a trivial one: it changes what the answer bot says to
// this company's own customers. So the page spends more words than a toggle
// usually deserves on what it will and will not do, and it shows three states
// rather than one - what this company chose, whether the platform permits it,
// and whether it is therefore actually running. A green toggle that does
// nothing because the deployment flag is off would be worse than no toggle.

import { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { Info, ShieldCheck, TrendingUp } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppTextarea } from "@/components/ui/app-textarea";
import { notify } from "@/lib/notifications";
import { useSalesSettings, useUpdateSalesSettings } from "@/lib/hooks/useSalesSettings";

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID");
}

export default function SalesAssistantTab() {
  const { data, isLoading } = useSalesSettings();
  const saveMutation = useUpdateSalesSettings();
  const settings = data?.data;

  const [enabled, setEnabled] = useState(false);
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated || isLoading || !settings) return;
    setEnabled(!!settings.enabled);
    setNote(settings.note ?? "");
    setHydrated(true);
  }, [settings, isLoading, hydrated]);

  const platformEnabled = !!settings?.platform_enabled;
  const dirty =
    !!settings && (enabled !== settings.enabled || note !== (settings.note ?? ""));

  const handleSave = async () => {
    try {
      const res = await saveMutation.mutateAsync({ enabled, note: note.trim() || null });
      notify.success(res?.message || "Pengaturan tersimpan");
    } catch (error: any) {
      notify.error("Gagal menyimpan", {
        description: error?.message || "Pengaturan asisten penjualan tidak tersimpan",
      });
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#5479EE]" />
        <div className="space-y-2 text-sm text-gray-500">
          <p>
            Saat aktif, bot membaca sinyal minat beli pada percakapan (misalnya
            menanyakan harga, membandingkan pilihan, atau minta nomor rekening),
            memberi skor pada calon pembeli, dan mengikuti pedoman penjualan yang
            sesuai dengan industri yang Anda pasang.
          </p>
          <p>
            Bot tetap tidak akan mengarang klaim, menjanjikan hasil, mendesak dengan
            urgensi palsu, atau menawarkan apa pun kepada orang yang sedang dalam
            kondisi rentan &mdash; pada percakapan seperti itu penjualan otomatis
            ditutup dan tidak dibuka lagi.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat pengaturan...</p>
      ) : (
        <div className="max-w-xl space-y-5">
          {!platformEnabled && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Lapis penjualan belum diaktifkan pada deployment ini. Pilihan Anda
                tetap tersimpan, tetapi belum berjalan sampai administrator platform
                mengaktifkannya.
              </span>
            </div>
          )}

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <Switch
              size="small"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              inputProps={{ "aria-label": "Aktifkan asisten penjualan" }}
            />
            Aktifkan asisten penjualan untuk perusahaan ini
          </label>

          {settings?.effective && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Sedang berjalan sejak {formatDateTime(settings.enabled_at)}.
              </span>
            </div>
          )}

          <div>
            <AppTextarea
              isBgWhite
              label="Catatan (opsional)"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Alasan diaktifkan atau tim yang memintanya, supaya rekan Anda tahu
              kenapa perilaku bot berubah.
            </p>
          </div>

          <div>
            <AppButton
              onClick={handleSave}
              disabled={saveMutation.isPending || !dirty}
              isLoading={saveMutation.isPending}
            >
              Simpan
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}
