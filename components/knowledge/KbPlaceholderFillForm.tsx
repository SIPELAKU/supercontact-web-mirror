"use client";

// components/knowledge/KbPlaceholderFillForm.tsx
//
// Fills the raw {{VAR}} placeholders that template-installed articles still
// carry, in every affected article at once (Content Gaps). Shared by the Bot
// Playground's Content Gaps tab and the end of Setup Cepat, where a blueprint
// installs KB packs whose own variables it never asks for.

import React, { useState } from "react";
import { Check, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useContentGaps, useFillPlaceholders } from "@/lib/hooks/useBotPlayground";
import { placeholderPayload, splitOwnPlaceholder } from "@/lib/utils/kbPlaceholders";

interface KbPlaceholderFillFormProps {
  /** The widget whose bot readiness should refresh after a fill, if any. */
  accountId?: string;
  /** Explanation shown beside the Apply button. */
  intro: React.ReactNode;
}

export default function KbPlaceholderFillForm({ accountId, intro }: KbPlaceholderFillFormProps) {
  const { data: gaps, isLoading, isError, refetch } = useContentGaps();
  const fillMutation = useFillPlaceholders(accountId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [openVar, setOpenVar] = useState<string | null>(null);

  const filledCount = Object.keys(placeholderPayload(values)).length;

  const apply = async () => {
    const payload = placeholderPayload(values);
    if (Object.keys(payload).length === 0) return;
    try {
      const report = await fillMutation.mutateAsync(payload);
      notify.success(
        `${report.variables_applied.length} nilai diterapkan ke ${report.articles_updated} artikel`,
        {
          description:
            report.articles_remaining > 0
              ? `${report.articles_remaining} artikel masih menunggu nilai lain.`
              : "Semua artikel bersih dari placeholder. 🎉",
        },
      );
      setValues({});
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Fill Placeholders") });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="text-sm text-gray-600 flex-1 min-w-[260px]">{intro}</div>
        <button
          type="button"
          onClick={() => void apply()}
          disabled={fillMutation.isPending || filledCount === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {fillMutation.isPending ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <Check size={15} />
          )}
          Apply {filledCount > 0 ? `${filledCount} value${filledCount > 1 ? "s" : ""}` : "values"}
        </button>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-red-600">
            Failed to load — the server may still be deploying or unreachable.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={13} /> Retry
          </button>
        </div>
      ) : isLoading || !gaps ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-gray-400" size={22} />
        </div>
      ) : gaps.variables.length === 0 ? (
        <p className="text-sm text-emerald-700 text-center py-8 inline-flex items-center gap-1.5 justify-center">
          <CheckCircle2 size={16} /> All articles are clean — no template placeholders left.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            <strong>{gaps.variables.length}</strong> variables across{" "}
            <strong>{gaps.articles_with_placeholders}</strong> articles.
          </p>
          <ul className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
            {gaps.variables.map((v) => (
              <li key={v.key} className="p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-semibold">{v.key}</code>
                  {v.label && <span className="text-sm text-gray-700">{v.label}</span>}
                  <button
                    type="button"
                    onClick={() => setOpenVar(openVar === v.key ? null : v.key)}
                    className="ml-auto text-[11px] text-gray-500 hover:text-gray-700"
                  >
                    {v.articles.length} article{v.articles.length > 1 ? "s" : ""}{" "}
                    {openVar === v.key ? "▴" : "▾"}
                  </button>
                </div>
                {v.context && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    …
                    {splitOwnPlaceholder(v.context, v.key).map((piece, i) =>
                      piece.own ? (
                        <mark key={i} className="rounded bg-blue-50 px-0.5 font-semibold text-blue-700">
                          {piece.text}
                        </mark>
                      ) : (
                        <React.Fragment key={i}>{piece.text}</React.Fragment>
                      )
                    )}
                    …
                  </p>
                )}
                <input
                  value={values[v.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v.key]: e.target.value }))}
                  placeholder={v.example ? `contoh: ${v.example}` : "isi nilai sebenarnya…"}
                  maxLength={500}
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {openVar === v.key && (
                  <ul className="text-xs text-gray-500 list-disc pl-5">
                    {v.articles.map((a) => (
                      <li key={a.id}>{a.title}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
