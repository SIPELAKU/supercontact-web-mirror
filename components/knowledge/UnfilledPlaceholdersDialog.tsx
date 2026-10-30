"use client";

// components/knowledge/UnfilledPlaceholdersDialog.tsx
//
// Shown instead of publishing when an article still carries a raw {{…}}
// placeholder: the answer bot reads a published article out as it is, so the
// visitor would get "Cabang utama kami di {{ALAMAT_PUSAT}}". Lists each
// article with what is left in it and a link to fill it in.

import Link from "next/link";
import { AppButton } from "@/components/ui/app-button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ArticleWithPlaceholders } from "@/lib/utils/kbPlaceholders";

const SHOWN_PER_ARTICLE = 6;

export function UnfilledPlaceholdersDialog({
  articles,
  onClose,
}: {
  /** The blocked articles; the dialog is open while there are any. */
  articles: ArticleWithPlaceholders[];
  onClose: () => void;
}) {
  return (
    <Dialog open={articles.length > 0} onOpenChange={(next) => (next ? undefined : onClose())} maxWidth="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Artikel belum bisa diterbitkan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm text-gray-700">
          <p>
            {articles.length === 1 ? "Artikel ini" : `${articles.length} artikel ini`} masih berisi isian
            kosong seperti <code className="rounded bg-gray-100 px-1">{"{{ALAMAT_PUSAT}}"}</code>. Answer bot
            akan membacakannya apa adanya ke pengunjung, jadi tidak ada yang diterbitkan. Isi dulu setiap
            artikel (Edit, ganti tandanya, Save), lalu terbitkan lagi.
          </p>
          <ul className="flex max-h-72 flex-col divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
            {articles.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-gray-900">{a.title}</span>
                  <Link
                    href={`/knowledge-base/articles/${a.id}`}
                    className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
                <p className="text-xs text-gray-500">
                  {a.placeholders
                    .slice(0, SHOWN_PER_ARTICLE)
                    .map((p) => `{{${p}}}`)
                    .join(", ")}
                  {a.placeholders.length > SHOWN_PER_ARTICLE &&
                    ` +${a.placeholders.length - SHOWN_PER_ARTICLE} lainnya`}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <AppButton variantStyle="primary" onClick={onClose}>
            Tutup
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
