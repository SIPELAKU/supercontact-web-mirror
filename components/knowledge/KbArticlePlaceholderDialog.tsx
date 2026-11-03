"use client";

// components/knowledge/KbArticlePlaceholderDialog.tsx
//
// Fills the {{…}} placeholders left in ONE article straight from the article
// list, without opening the editor. Fields come from Content Gaps (what is
// still blank), the sentence around each one from the article itself. The
// API fills title, excerpt and body; by default only this article, unless the
// user ticks "apply to the other articles too".

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useFillPlaceholders } from "@/lib/hooks/useBotPlayground";
import { useKbArticle } from "@/lib/hooks/useKnowledge";
import type { ContentGapsResponse } from "@/lib/types/botPlayground";
import {
  articleFillRequest,
  articlePlaceholderFields,
  otherArticlesSharing,
  placeholderSnippet,
  splitOwnPlaceholder,
} from "@/lib/utils/kbPlaceholders";

const WHERE_LABEL = { title: "Judul", excerpt: "Ringkasan", body: "Isi" } as const;

export function KbArticlePlaceholderDialog({
  article,
  gaps,
  onClose,
  onSaved,
}: {
  /** The article to fill; the dialog is open while it is set. */
  article: { id: string; title: string } | null;
  gaps: ContentGapsResponse | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={!!article} onOpenChange={(next) => (next ? undefined : onClose())} maxWidth="sm">
      {/* Keyed per article so a new one starts with empty fields. */}
      {article && <FillForm key={article.id} article={article} gaps={gaps} onClose={onClose} onSaved={onSaved} />}
    </Dialog>
  );
}

function FillForm({
  article,
  gaps,
  onClose,
  onSaved,
}: {
  article: { id: string; title: string };
  gaps: ContentGapsResponse | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: full, isLoading } = useKbArticle(article.id);
  const fill = useFillPlaceholders();
  const [values, setValues] = useState<Record<string, string>>({});
  const [applyToOthers, setApplyToOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = articlePlaceholderFields(gaps, article.id);
  const others = otherArticlesSharing(gaps, article.id, fields.map((f) => f.key));
  const request = articleFillRequest(values, article.id, applyToOthers);
  const filled = Object.keys(request.values).length;

  const save = async () => {
    if (filled === 0) return;
    setError(null);
    try {
      const report = await fill.mutateAsync(request);
      const left = fields.length - filled;
      notify.success("Placeholder disimpan", {
        description:
          left > 0
            ? `Artikel ini masih punya ${left} tanda kosong.`
            : applyToOthers
              ? `Diterapkan ke ${report.articles_updated} artikel.`
              : "Artikel ini sudah bersih dari placeholder.",
      });
      onSaved();
    } catch (err: unknown) {
      setError(handleError(err, "Fill Placeholders"));
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Isi placeholder — {article.title}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 text-sm text-gray-700">
        <p>
          Ganti tanda <code className="rounded bg-gray-100 px-1">{"{{…}}"}</code> di artikel ini dengan isi
          sebenarnya. Kolom yang dikosongkan tetap tertinggal sebagai tanda.
        </p>

        {fields.length === 0 ? (
          <p className="text-emerald-700">Artikel ini sudah tidak punya placeholder.</p>
        ) : (
          <ul className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
            {fields.map((field) => {
              const snippet = full ? placeholderSnippet(full, field.key) : null;
              return (
                <li key={field.key} className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">{field.key}</code>
                    {field.label && <span className="text-gray-700">{field.label}</span>}
                  </div>
                  {isLoading ? (
                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                  ) : (
                    snippet && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">{WHERE_LABEL[snippet.where]}:</span>{" "}
                        {splitOwnPlaceholder(snippet.text, field.key).map((piece, i) =>
                          piece.own ? (
                            <mark key={i} className="rounded bg-blue-50 px-0.5 font-semibold text-blue-700">
                              {piece.text}
                            </mark>
                          ) : (
                            <React.Fragment key={i}>{piece.text}</React.Fragment>
                          )
                        )}
                      </p>
                    )
                  )}
                  <input
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.example ? `contoh: ${field.example}` : "isi nilai sebenarnya…"}
                    maxLength={500}
                    disabled={fill.isPending}
                    className="h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </li>
              );
            })}
          </ul>
        )}

        {others > 0 && (
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={applyToOthers}
              onChange={(e) => setApplyToOthers(e.target.checked)}
              disabled={fill.isPending}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
            />
            <span>
              Terapkan juga ke <strong>{others}</strong> artikel lain yang memakai tanda yang sama
            </span>
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter>
        <AppButton variantStyle="outline" color="gray" onClick={onClose} disabled={fill.isPending}>
          Batal
        </AppButton>
        <AppButton
          variantStyle="primary"
          onClick={() => void save()}
          disabled={filled === 0 || fill.isPending}
          startIcon={fill.isPending ? <Loader2 className="animate-spin" size={15} /> : undefined}
        >
          Simpan{filled > 0 ? ` (${filled})` : ""}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  );
}
