"use client";

// Add Deal › "AI Recommendation Product": a button that opens a dropdown with
// how many products to suggest (1-20) and an arrow to fetch them, then the
// suggestions for the chosen lead. Adding one puts it straight on the item
// list; the row then asks for the fields it still needs.
//
// Look: the logo's blue-to-green (globals.css ai-* utilities). While the API
// works, a spinning ring and status lines that name what the BE actually reads
// (lead profile, won deals in the same segment, the catalogue); results then
// rise in one by one. `source` says whether the AI ranked them: on
// "rule_fallback" (AI not set up for the company, or it failed/timed out -
// the API does not say which) the list is marked as not from AI.

import { useEffect, useRef, useState } from "react";
import { Popover } from "@mui/material";
import { ArrowRight, Check, ChevronDown, Info, Loader2, Plus, RotateCw, Sparkles } from "lucide-react";
import {
  fetchRecommendedProducts,
  RECOMMENDATION_LIMIT,
  type RecommendedProduct,
  type RecommendedProductsResponse,
} from "@/lib/api/pipelines";
import { parseLimit } from "./dealItems";

type Props = {
  leadId: string;
  isTaken: (productId: string) => boolean;
  onAdd: (product: RecommendedProduct) => void;
  /** e.g. the 50-item limit is reached. */
  addDisabledReason?: string;
};

// What the recommendation service reads, in its own order.
const THINKING_STEPS = [
  "Reading this lead's profile and notes…",
  "Checking recent chats with this contact…",
  "Looking at deals won in similar companies…",
  "Matching your product catalogue…",
  "Ranking the best fits…",
];
const STEP_MS = 1300;

function useThinkingStep(active: boolean) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    setStep(0);
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1)), STEP_MS);
    return () => window.clearInterval(timer);
  }, [active]);
  return THINKING_STEPS[step];
}

export function AiRecommendationButton({ leadId, isTaken, onAdd, addDisabledReason }: Props) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [limitInput, setLimitInput] = useState(String(RECOMMENDATION_LIMIT.default));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendedProductsResponse | null>(null);
  // Each answer gets a new key, so its cards rise in again.
  const [resultSeq, setResultSeq] = useState(0);
  // Answers for an older request (another lead, another number) are dropped.
  const requestSeq = useRef(0);
  const thinking = useThinkingStep(loading);

  // Another lead = other suggestions.
  useEffect(() => {
    requestSeq.current += 1;
    setResult(null);
    setFailed(null);
    setLoading(false);
  }, [leadId]);

  const limit = parseLimit(limitInput);

  const run = async (refresh = false) => {
    if (!limit || !leadId) return;
    const seq = ++requestSeq.current;
    setLoading(true);
    setFailed(null);
    try {
      const data = await fetchRecommendedProducts(leadId, { limit, refresh });
      if (seq === requestSeq.current) {
        setResult(data ?? null);
        setResultSeq((n) => n + 1);
      }
    } catch (err) {
      if (seq !== requestSeq.current) return;
      const status = (err as { response?: { status?: number } })?.response?.status;
      setFailed(
        status === 404
          ? "No recommendation for this lead (it may not be assigned to you)."
          : "Couldn't load recommendations. You can still add products with + Add Product."
      );
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  const openMenu = () => {
    setOpen(true);
    // The first open fetches straight away with the default number.
    if (!result && !loading) run();
  };

  const items = result?.recommendations ?? [];
  const byAi = result?.source === "ai_hybrid";

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        disabled={!leadId}
        aria-expanded={open}
        // Phone: full width, one line, slightly smaller text (it was wrapping
        // to two lines inside a 40px button). sm+: its natural width.
        className="ai-gradient relative inline-flex h-10 w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-3 text-sm font-medium text-white shadow-sm sm:w-auto sm:px-4 sm:text-base transition-[filter,box-shadow] hover:shadow-md hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        {/* A light sweeping over the button while the AI works. */}
        {loading && <span aria-hidden className="ai-shimmer pointer-events-none absolute inset-0 mix-blend-overlay" />}
        <Sparkles size={16} className={loading ? "animate-pulse" : undefined} />
        AI Recommendation Product
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, width: 440, maxWidth: "calc(100vw - 32px)", borderRadius: "12px", overflow: "hidden" } } }}
        // Escape closes this menu only, not the Add Deal dialog behind it.
        onKeyDown={(e) => {
          if (e.key === "Escape") e.stopPropagation();
        }}
      >
        {/* Blue-green strip on top; it runs like a progress bar while loading. */}
        <div className="relative h-1 overflow-hidden bg-gray-100">
          {loading ? (
            <div className="ai-gradient absolute inset-y-0 left-0 w-1/3 animate-board-progress" />
          ) : (
            <div className="ai-gradient absolute inset-0" />
          )}
        </div>

        <div className="p-4 space-y-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
          >
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-gray-600">Number of recommendations</span>
              <input
                type="number"
                inputMode="numeric"
                min={RECOMMENDATION_LIMIT.min}
                max={RECOMMENDATION_LIMIT.max}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                aria-invalid={!limit}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 ${
                  limit ? "border-gray-300 focus:ring-[#5479EE]/30" : "border-red-400 focus:ring-red-200"
                }`}
              />
            </label>
            <button
              type="submit"
              aria-label="Get recommendations"
              title="Get recommendations"
              disabled={!limit || loading}
              className="ai-gradient grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white shadow-sm transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
          <p className={`text-[11.5px] ${limit ? "text-gray-400" : "text-red-500"}`}>
            Enter a whole number from {RECOMMENDATION_LIMIT.min} to {RECOMMENDATION_LIMIT.max}.
          </p>

          <div className="border-t border-gray-100 pt-3">
            {loading ? (
              <ThinkingPanel status={thinking} cards={Math.min(limit ?? 3, 3)} />
            ) : failed ? (
              <div className="space-y-2 text-sm text-gray-600">
                <p>{failed}</p>
                <button type="button" onClick={() => run()} className="font-semibold text-[#5479EE] hover:underline">
                  Try again
                </button>
              </div>
            ) : result && items.length === 0 ? (
              <p className="text-sm text-gray-600">
                No recommendation for this lead yet. Add products with + Add Product.
              </p>
            ) : result ? (
              <div className="space-y-2">
                {byAi ? (
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles size={14} className="text-brand" />
                    <span className="ai-gradient-text">AI picks for this lead</span>
                  </p>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                    <span>
                      AI is unavailable right now, so these are ranked from your sales history and catalogue. Use
                      Refresh to try the AI again.
                    </span>
                  </div>
                )}
                <ul key={resultSeq} className="max-h-80 space-y-2 overflow-y-auto pr-0.5">
                  {items.map((rec, index) => {
                    const taken = isTaken(rec.product_id);
                    const blocked = !taken && Boolean(addDisabledReason);
                    return (
                      <li
                        key={rec.product_id}
                        className="ai-rise relative flex items-start gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-3"
                        style={{ animationDelay: `${index * 90}ms` }}
                      >
                        {/* AI picks carry the logo colours on their edge. */}
                        <span
                          aria-hidden
                          className={`absolute inset-y-0 left-0 w-1 ${byAi ? "ai-gradient" : "bg-gray-200"}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{rec.product_name}</p>
                          <p className="font-mono text-[11.5px] text-gray-500">{rec.sku}</p>
                          {rec.reason && <p className="mt-1 text-xs text-gray-600">{rec.reason}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onAdd(rec)}
                          disabled={taken || blocked}
                          title={taken ? "Already on the list" : blocked ? addDisabledReason : "Add to the deal"}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            taken
                              ? "cursor-default bg-green-50 text-green-700"
                              : "border border-[#5479EE] text-[#5479EE] hover:bg-[#EEF2FD] disabled:cursor-not-allowed disabled:opacity-50"
                          }`}
                        >
                          {taken ? <Check size={14} /> : <Plus size={14} />}
                          {taken ? "Added" : "Add"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          {result && !loading && (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-[11.5px] text-gray-500">
              <span>
                {byAi
                  ? "Ranked by AI from this lead's profile and your sales history."
                  : "Ranked by rules: no AI this time."}
              </span>
              <button
                type="button"
                onClick={() => run(true)}
                disabled={!limit}
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#5479EE] hover:underline disabled:opacity-50"
                title="Recalculate (ignores the saved result)"
              >
                <RotateCw size={12} /> Refresh
              </button>
            </div>
          )}
        </div>
      </Popover>
    </>
  );
}

/** "The AI is working": spinning ring, the current step, shimmering cards. */
function ThinkingPanel({ status, cards }: { status: string; cards: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="flex items-center gap-3">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center">
          <span aria-hidden className="ai-orbit absolute inset-0 rounded-full" />
          <span className="relative grid h-8.5 w-8.5 place-items-center rounded-full bg-white">
            <Sparkles size={16} className="animate-pulse text-brand" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="ai-gradient-text text-sm font-semibold">AI is finding the best products…</p>
          {/* Re-keyed so each new step fades in; read out for screen readers. */}
          <p key={status} className="ai-rise text-xs text-gray-500" aria-live="polite">
            {status}
          </p>
        </div>
      </div>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="relative h-18 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <span aria-hidden className="ai-shimmer absolute inset-0" style={{ animationDelay: `${i * 150}ms` }} />
          <div className="relative space-y-2 p-3">
            <div className="h-3 w-2/5 rounded bg-gray-200" />
            <div className="h-2.5 w-1/5 rounded bg-gray-200" />
            <div className="h-2.5 w-4/5 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
