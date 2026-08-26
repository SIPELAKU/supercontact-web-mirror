"use client";

// The platform's own sender, shown alongside a tenant's servers.
//
// Sits above the table rather than in it, and that placement is the message:
// it is not one of their rows. It has no Edit, no Delete and no Test, because
// a tenant genuinely cannot do those things - the credentials belong to the
// platform and live only in the backoffice.
//
// The one thing it must say plainly is whose address recipients will see.
// Choosing this means mail leaves from the PLATFORM's address, not the
// tenant's domain, and a tenant who discovers that from a customer rather than
// from this card has been failed by it.

import { Building2, Lock, ShieldCheck } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { useSetUsePlatformSender } from "@/lib/hooks/useMailServers";
import type { PlatformSenderOption } from "@/lib/models/types";

export default function PlatformSenderCard({
  option,
}: {
  option: PlatformSenderOption | null | undefined;
}) {
  const mutation = useSetUsePlatformSender();

  if (!option) return null;

  if (!option.available) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Pengirim platform belum tersedia
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Administrator platform belum mengaktifkan pengirim email bersama.
              Sementara ini, tambahkan mail server Anda sendiri di bawah.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const senderLine = option.from_name
    ? `${option.from_name} <${option.from_email}>`
    : option.from_email;

  async function toggle(next: boolean) {
    try {
      await mutation.mutateAsync(next);
      notify.success(
        next
          ? "Email Anda sekarang dikirim lewat pengirim platform"
          : "Berhenti memakai pengirim platform"
      );
    } catch (error: any) {
      notify.error("Gagal", { description: error?.message });
    }
  }

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        option.selected
          ? "border-[#5479EE] bg-[#F5F8FF]"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5479EE]" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Pengirim platform
              </p>
              <span className="inline-flex items-center gap-1 rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <Lock className="h-3 w-3" />
                Dikelola platform
              </span>
              {option.selected && (
                <span className="inline-flex items-center gap-1 rounded border border-[#5479EE] bg-white px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#5479EE]">
                  <ShieldCheck className="h-3 w-3" />
                  Sedang dipakai
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Dikirim lewat <b>{option.provider_label}</b> milik platform. Anda
              tidak perlu menyiapkan server atau kredensial apa pun.
            </p>
            <p className="text-sm text-gray-500">
              Penerima akan melihat{" "}
              <span className="font-mono text-[13px] text-gray-700">
                {senderLine}
              </span>{" "}
              &mdash; alamat platform, bukan domain Anda. Kalau pelanggan harus
              melihat alamat Anda sendiri, tambahkan mail server milik Anda dan
              jadikan default.
            </p>
            <p className="text-xs text-gray-400">
              Pengaturannya hanya dapat diubah administrator platform.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <AppButton
            variantStyle={option.selected ? "outline" : "primary"}
            onClick={() => toggle(!option.selected)}
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
          >
            {option.selected ? "Berhenti memakai" : "Jadikan default"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
