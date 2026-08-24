"use client";

// Public CSAT survey UI (route: /csat/[token]). Renders inside the (survey)
// route group's OWN ReactQueryProvider. NO auth: the opaque token is the sole
// authority. States handled:
//   loading                        -> spinner
//   pending | sent                 -> the rating form
//   already_answered | answered    -> "You've already responded"
//   expired  (status or 410)       -> neutral "no longer valid"
//   invalid  (404)                 -> neutral "no longer valid" (NO tenant leak)
//   transient error                -> generic retry
//   submit success                 -> "Thank you!"

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
  { value: 1, emoji: "😠", label: "Very unhappy" },
  { value: 2, emoji: "😕", label: "Unhappy" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Happy" },
  { value: 5, emoji: "😍", label: "Very happy" },
];

// Optional, generic reason codes (backend accepts any string; empty = skip).
const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "resolved_quickly", label: "My issue was resolved quickly" },
  { value: "helpful_agent", label: "The agent was helpful" },
  { value: "knowledgeable", label: "The agent was knowledgeable" },
  { value: "slow_response", label: "The response was too slow" },
  { value: "not_resolved", label: "My issue was not resolved" },
  { value: "hard_to_reach", label: "It was hard to reach support" },
  { value: "other", label: "Other" },
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
        This survey link is no longer valid
      </h1>
      <p className="text-center text-sm leading-relaxed text-gray-500">
        The link may have expired or already been used. You can safely close this
        page.
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

  const companyName = data?.company_display_name?.trim() || "our team";

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
          <p className="animate-pulse text-sm text-gray-500">Loading survey...</p>
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
          Something went wrong
        </h1>
        <p className="text-center text-sm leading-relaxed text-gray-500">
          We couldn&apos;t load this survey right now. Please try again in a moment.
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
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">Thank you!</h1>
        <p className="text-center text-sm leading-relaxed text-gray-500">
          Your feedback has been shared with {companyName}. We appreciate you taking
          the time.
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
          You&apos;ve already responded
        </h1>
        <p className="text-center text-sm leading-relaxed text-gray-500">
          Thanks - we&apos;ve already recorded your feedback for this survey. You can
          safely close this page.
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
          How was your experience with {companyName}?
        </h1>
        {data.agent_name && (
          <p className="mt-1 text-sm text-gray-500">
            You were helped by {data.agent_name}
          </p>
        )}
      </div>

      {/* 1..5 faces */}
      <fieldset className="mb-6">
        <legend className="sr-only">Rate your experience from 1 to 5</legend>
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
          label="What stood out? (optional)"
          placeholder="Select a reason"
          value={reasonCode}
          onChange={(e) => setReasonCode(String(e.target.value))}
          options={REASON_OPTIONS}
        />
      </div>

      {/* Optional comment */}
      <div className="mb-6">
        <AppTextarea
          isBgWhite
          label="Anything else? (optional)"
          rows={4}
          placeholder="Tell us more about your experience"
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
            We couldn&apos;t submit your response. Please try again.
          </p>
        )}

      <AppButton
        fullWidth
        onClick={handleSubmit}
        disabled={rating < 1 || submit.isPending}
        isLoading={submit.isPending}
      >
        Submit feedback
      </AppButton>
    </Card>
  );
}
