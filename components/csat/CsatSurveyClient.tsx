"use client";

// Public CSAT survey UI (route: /csat/[token]). Renders inside the (survey)
// route group's OWN ReactQueryProvider. NO auth: the opaque token is the sole
// authority. States handled:
//   loading                        -> spinner
//   pending | sent                 -> the rating form
//   already_answered | answered    -> "Anda sudah mengisi survei ini"
//   expired  (status or 410)       -> neutral "no longer valid"
//   invalid  (404)                 -> neutral "no longer valid" (NO tenant leak)
//   transient error                -> generic retry
//   submit success                 -> "Terima kasih!"
//
// The customer reads this page, so its text is Indonesian only.

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { CheckCircle2, Link2Off, MessageSquareHeart } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { useCsatSurvey, useSubmitCsatSurvey } from "@/lib/hooks/useCsatPublic";
import { CsatApiError } from "@/lib/api/csat-public";

// 1..5 faces (😠 -> 😍). Kept simple + language-neutral; labels aid a11y.
const FACES: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😠", label: "Sangat tidak puas" },
  { value: 2, emoji: "😕", label: "Tidak puas" },
  { value: 3, emoji: "😐", label: "Biasa saja" },
  { value: 4, emoji: "🙂", label: "Puas" },
  { value: 5, emoji: "😍", label: "Sangat puas" },
];

// Optional, generic reason codes (backend accepts any string; empty = skip).
const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "resolved_quickly", label: "Masalah saya cepat selesai" },
  { value: "helpful_agent", label: "Agen sangat membantu" },
  { value: "knowledgeable", label: "Agen menguasai masalahnya" },
  { value: "slow_response", label: "Respons terlalu lambat" },
  { value: "not_resolved", label: "Masalah saya belum selesai" },
  { value: "hard_to_reach", label: "Tim dukungan sulit dihubungi" },
  { value: "other", label: "Lainnya" },
];

const COMMENT_MAX = 1000;

// A centered branded card wrapping every survey state.
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
      {children}
    </div>
  );
}

// Generic, tenant-agnostic "link no longer valid" - shown for BOTH an expired
// survey and an invalid/unknown token so we never leak whether a tenant exists.
function InvalidState() {
  return (
    <Card>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Link2Off size={34} />
      </div>
      <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
        Link survei ini sudah tidak berlaku
      </h1>
      <p className="text-center text-sm leading-relaxed text-gray-500">
        Link mungkin sudah kedaluwarsa atau sudah digunakan. Anda bisa menutup
        halaman ini.
      </p>
    </Card>
  );
}

export default function CsatSurveyClient() {
  const params = useParams();
  const token = (params?.token as string) ?? "";

  const { data, isLoading, error } = useCsatSurvey(token);
  const submit = useSubmitCsatSurvey(token);

  const [rating, setRating] = useState<number>(0);
  const [reasonCode, setReasonCode] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  // A 409 / 410 / 404 raised at submit time flips us into a terminal state even
  // though the initial GET succeeded (someone answered in another tab, etc.).
  const [terminal, setTerminal] = useState<null | "answered" | "invalid">(null);

  const companyName = data?.company_display_name?.trim() || "tim kami";

  const isTerminalError =
    error instanceof CsatApiError && (error.status === 404 || error.status === 410);

  const handleSubmit = async () => {
    if (rating < 1) return;
    try {
      await submit.mutateAsync({
        rating,
        reason_code: reasonCode || undefined,
        comment: comment.trim() ? comment.trim() : undefined,
      });
      setSubmitted(true);
    } catch (e) {
      if (e instanceof CsatApiError) {
        if (e.status === 409) {
          setTerminal("answered");
          return;
        }
        if (e.status === 404 || e.status === 410) {
          setTerminal("invalid");
          return;
        }
      }
      // Transient failure - keep the form so the customer can retry.
    }
  };

  // ---- Terminal / non-form states -------------------------------------------

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <CircularProgress size={30} thickness={4} sx={{ color: "#4F46E5" }} />
          <p className="animate-pulse text-sm text-gray-500">Memuat survei...</p>
        </div>
      </Card>
    );
  }

  // Invalid (404) or expired (410) token, or an expired status from a 200 GET,
  // or an invalid state discovered at submit time -> neutral message.
  if (isTerminalError || data?.status === "expired" || terminal === "invalid") {
    return <InvalidState />;
  }

  // Any other (transient) load failure with no data: generic, safe fallback.
  if (error || !data) {
    return (
      <Card>
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
          Terjadi kesalahan
        </h1>
        <p className="text-center text-sm leading-relaxed text-gray-500">
          Survei belum bisa dimuat. Silakan coba lagi beberapa saat lagi.
        </p>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-500">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">Terima kasih!</h1>
        <p className="text-center text-sm leading-relaxed text-gray-500">
          Masukan Anda sudah diterima oleh {companyName}. Terima kasih sudah
          meluangkan waktu.
        </p>
      </Card>
    );
  }

  if (data.already_answered || data.status === "answered" || terminal === "answered") {
    return (
      <Card>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
          <CheckCircle2 size={34} />
        </div>
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
          Anda sudah mengisi survei ini
        </h1>
        <p className="text-center text-sm leading-relaxed text-gray-500">
          Terima kasih, masukan Anda untuk survei ini sudah kami catat. Anda bisa
          menutup halaman ini.
        </p>
      </Card>
    );
  }

  // ---- The form (pending | sent) --------------------------------------------

  return (
    <Card>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
          <MessageSquareHeart size={30} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Bagaimana pengalaman Anda dengan {companyName}?
        </h1>
        {data.agent_name && (
          <p className="mt-1 text-sm text-gray-500">
            Anda dibantu oleh {data.agent_name}
          </p>
        )}
      </div>

      {/* 1..5 faces */}
      <fieldset className="mb-6">
        <legend className="sr-only">Beri nilai pengalaman Anda dari 1 sampai 5</legend>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {FACES.map((face) => {
            const selected = rating === face.value;
            return (
              <button
                key={face.value}
                type="button"
                onClick={() => setRating(face.value)}
                aria-pressed={selected}
                aria-label={`${face.value} - ${face.label}`}
                title={face.label}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all sm:h-14 sm:w-14 sm:text-3xl ${
                  selected
                    ? "scale-110 bg-indigo-50 ring-2 ring-indigo-400"
                    : "opacity-60 hover:scale-105 hover:opacity-100"
                }`}
              >
                <span aria-hidden>{face.emoji}</span>
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-center text-xs font-medium text-gray-500">
            {FACES.find((f) => f.value === rating)?.label}
          </p>
        )}
      </fieldset>

      {/* Optional reason */}
      <div className="mb-4">
        <AppSelect
          isBgWhite
          label="Apa yang paling berkesan? (opsional)"
          placeholder="Pilih alasan"
          value={reasonCode}
          onChange={(e) => setReasonCode(String(e.target.value))}
          options={REASON_OPTIONS}
        />
      </div>

      {/* Optional comment */}
      <div className="mb-6">
        <AppTextarea
          isBgWhite
          label="Ada tambahan lain? (opsional)"
          rows={4}
          placeholder="Ceritakan pengalaman Anda"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
          inputProps={{ maxLength: COMMENT_MAX }}
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/{COMMENT_MAX}
        </p>
      </div>

      {submit.isError &&
        !(submit.error instanceof CsatApiError &&
          [404, 409, 410].includes(submit.error.status)) && (
          <p className="mb-3 text-center text-sm text-red-500">
            Masukan Anda belum terkirim. Silakan coba lagi.
          </p>
        )}

      <AppButton
        fullWidth
        onClick={handleSubmit}
        disabled={rating < 1 || submit.isPending}
        isLoading={submit.isPending}
      >
        Kirim masukan
      </AppButton>
    </Card>
  );
}
