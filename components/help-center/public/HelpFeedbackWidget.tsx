"use client";

// "Was this helpful?" widget shown at the foot of an article. A "Yes" vote
// posts immediately; a "No" vote reveals an optional comment box before
// posting. One submission per mount (state resets on navigation to a new
// article because the parent keys it by article slug).

import { useState } from "react";
import { ThumbsDown, ThumbsUp, CheckCircle2, Loader2 } from "lucide-react";
import { useHelpFeedback } from "@/lib/hooks/useHelpCenter";

export default function HelpFeedbackWidget({
  slug,
  articleSlug,
}: {
  slug: string;
  articleSlug: string;
}) {
  const feedback = useHelpFeedback(slug, articleSlug);
  const [choice, setChoice] = useState<null | "yes" | "no">(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (helpful: boolean) => {
    try {
      await feedback.mutateAsync(
        helpful ? { helpful: true } : { helpful: false, comment: comment.trim() || undefined }
      );
      setDone(true);
    } catch {
      // Swallow: feedback is best-effort and must never break the article page.
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mt-12 rounded-2xl border border-gray-100 bg-white p-6 flex items-center gap-3 text-gray-700">
        <CheckCircle2 size={20} style={{ color: "var(--hc-brand, #4F46E5)" }} />
        <span className="text-sm font-medium">Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-2xl border border-gray-100 bg-white p-6">
      <p className="text-sm font-semibold text-gray-900 mb-4">
        Was this article helpful?
      </p>

      {choice !== "no" ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={feedback.isPending}
            onClick={() => {
              setChoice("yes");
              submit(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {feedback.isPending && choice === "yes" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ThumbsUp size={16} />
            )}
            Yes
          </button>
          <button
            type="button"
            disabled={feedback.isPending}
            onClick={() => setChoice("no")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <ThumbsDown size={16} />
            No
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="hc-feedback-comment" className="block text-sm text-gray-600 mb-2">
            Sorry to hear that. What could be better? (optional)
          </label>
          <textarea
            id="hc-feedback-comment"
            value={comment}
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--hc-brand,#4F46E5)]/25 focus:border-[var(--hc-brand,#4F46E5)] transition-all resize-none"
            placeholder="Tell us what was missing or unclear..."
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={feedback.isPending}
              onClick={() => submit(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--hc-brand, #4F46E5)" }}
            >
              {feedback.isPending && <Loader2 size={16} className="animate-spin" />}
              Submit feedback
            </button>
            <button
              type="button"
              disabled={feedback.isPending}
              onClick={() => setChoice(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
