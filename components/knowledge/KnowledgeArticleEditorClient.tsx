"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  History,
  Loader2,
  Save,
  Send,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import {
  useKbArticle,
  useKbCategories,
  useKbSections,
  useCreateKbArticle,
  useUpdateKbArticle,
  usePublishKbArticle,
  useUnpublishKbArticle,
  useArchiveKbArticle,
  useDeleteKbArticle,
  useAiAdaptKbArticle,
  useKbPermissions,
} from "@/lib/hooks/useKnowledge";
import { MarkdownEditor } from "./MarkdownEditor";
import { KbStatusBadge } from "./KbStatusBadge";
import { ArticleVersionHistoryDrawer } from "./ArticleVersionHistoryDrawer";
import { ArticleFlagsPanel } from "./ArticleFlagsPanel";

interface KnowledgeArticleEditorClientProps {
  articleId?: string;
}

export default function KnowledgeArticleEditorClient({ articleId }: KnowledgeArticleEditorClientProps) {
  const router = useRouter();
  const isNew = !articleId;
  const { canWrite, canPublish, canManage } = useKbPermissions();
  const readOnly = !canWrite;

  const { confirm, confirmationPopup } = useConfirmationPopup();

  const { data: article, isLoading, isError } = useKbArticle(articleId);
  const { data: categories = [] } = useKbCategories();

  // Form state.
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [locale, setLocale] = useState("en");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelDraft, setLabelDraft] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const { data: sections = [] } = useKbSections(categoryId || undefined);

  // Prefill once when the article resolves (edit mode).
  const initializedRef = useRef(false);
  useEffect(() => {
    if (isNew) return;
    if (initializedRef.current) return;
    if (!article) return;
    initializedRef.current = true;
    setTitle(article.title ?? "");
    setBody(article.body ?? "");
    setExcerpt(article.excerpt ?? "");
    setCategoryId(article.category_id ?? "");
    setSectionId(article.section_id ?? "");
    setLocale(article.locale ?? "en");
    setLabels(Array.isArray(article.labels) ? article.labels : []);
    setIsPublic(!!article.is_public);
  }, [article, isNew]);

  const createMutation = useCreateKbArticle();
  const updateMutation = useUpdateKbArticle();
  const publishMutation = usePublishKbArticle();
  const unpublishMutation = useUnpublishKbArticle();
  const archiveMutation = useArchiveKbArticle();
  const deleteMutation = useDeleteKbArticle();
  const aiAdaptMutation = useAiAdaptKbArticle();

  const savingDraft = createMutation.isPending || updateMutation.isPending;
  const statusChanging =
    publishMutation.isPending || unpublishMutation.isPending || archiveMutation.isPending;

  const categoryOptions = useMemo(
    () => [{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories]
  );
  const sectionOptions = useMemo(
    () => [{ value: "", label: "No section" }, ...sections.map((s) => ({ value: s.id, label: s.name }))],
    [sections]
  );

  const addLabel = () => {
    const v = labelDraft.trim();
    if (!v) return;
    if (!labels.includes(v)) setLabels((prev) => [...prev, v]);
    setLabelDraft("");
  };

  const buildPayload = () => ({
    title: title.trim(),
    body,
    excerpt: excerpt.trim() ? excerpt.trim() : null,
    section_id: sectionId || null,
    locale: locale.trim() || "en",
    labels,
    is_public: isPublic,
  });

  const handleSave = async () => {
    if (!title.trim()) {
      notify.error("Title required", { description: "Give the article a title before saving." });
      return;
    }
    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(buildPayload());
        notify.success("Draft saved", { description: "Your article has been created." });
        router.replace(`/knowledge-base/articles/${created.id}`);
      } else {
        await updateMutation.mutateAsync({ id: articleId!, data: buildPayload() });
        notify.success("Saved", { description: "Your changes have been saved." });
      }
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Failed to save article") });
    }
  };

  const handleAiAdapt = async () => {
    if (!articleId) return;
    try {
      const result = await aiAdaptMutation.mutateAsync(articleId);
      if (!result.available || !result.suggested_body) {
        notify.error("AI not available", {
          description: "This workspace doesn't have an AI provider configured yet.",
        });
        return;
      }
      setAiSuggestion(result.suggested_body);
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Failed to generate a suggestion") });
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setBody(aiSuggestion);
    setAiSuggestion(null);
    notify.success("Suggestion applied", { description: "Review it below, then Save to keep it." });
  };

  const runStatus = async (
    fn: () => Promise<unknown>,
    success: string
  ) => {
    try {
      await fn();
      notify.success(success);
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Action failed") });
    }
  };

  const handleDelete = () => {
    if (!articleId) return;
    confirm({
      variant: "danger",
      title: "Delete article",
      description: "Are you sure you want to delete this article? This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(articleId);
          notify.success("Article deleted");
          router.push("/knowledge-base");
        } catch (err) {
          notify.error("Error", { description: getErrorMessage(err, "Failed to delete article") });
        }
      },
    });
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading article…
      </div>
    );
  }

  if (!isNew && isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-sm text-red-500">Couldn't load this article.</p>
        <button
          type="button"
          onClick={() => router.push("/knowledge-base")}
          className="mt-3 text-sm font-semibold text-[#3E63D8] hover:underline"
        >
          Back to Knowledge Base
        </button>
      </div>
    );
  }

  const status = article?.status;

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-16">
      {/* Header / actions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/knowledge-base")}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {isNew ? "New article" : "Edit article"}
              </h1>
              {status && <KbStatusBadge status={status} />}
              {readOnly && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                  Read only
                </span>
              )}
            </div>
            {!isNew && article && (
              <p className="mt-0.5 text-[12px] text-gray-400">
                {article.view_count} views · {article.helpful_count} helpful ·{" "}
                {article.not_helpful_count} not helpful
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew && (
            <AppButton
              variantStyle="outline"
              color="gray"
              startIcon={<History size={16} />}
              onClick={() => setShowVersions(true)}
            >
              History
            </AppButton>
          )}

          {/* Publish / Unpublish / Archive - gated on knowledge:publish. */}
          {!isNew && canPublish && status !== "published" && (
            <AppButton
              variantStyle="primary"
              color="success"
              startIcon={<Send size={16} />}
              disabled={statusChanging}
              onClick={() => runStatus(() => publishMutation.mutateAsync(articleId!), "Article published")}
            >
              Publish
            </AppButton>
          )}
          {!isNew && canPublish && status === "published" && (
            <AppButton
              variantStyle="outline"
              startIcon={<Undo2 size={16} />}
              disabled={statusChanging}
              onClick={() => runStatus(() => unpublishMutation.mutateAsync(articleId!), "Article unpublished")}
            >
              Unpublish
            </AppButton>
          )}
          {!isNew && canPublish && status !== "archived" && (
            <AppButton
              variantStyle="outline"
              color="gray"
              startIcon={<Archive size={16} />}
              disabled={statusChanging}
              onClick={() => runStatus(() => archiveMutation.mutateAsync(articleId!), "Article archived")}
            >
              Archive
            </AppButton>
          )}

          {canWrite && (
            <AppButton
              startIcon={savingDraft ? undefined : <Save size={16} />}
              isLoading={savingDraft}
              onClick={handleSave}
            >
              {isNew ? "Save draft" : "Save"}
            </AppButton>
          )}

          {!isNew && canManage && (
            <AppButton
              variantStyle="outline"
              color="danger"
              startIcon={<Trash2 size={16} />}
              onClick={handleDelete}
            >
              Delete
            </AppButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <AppInput
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            disabled={readOnly}
            isBgWhite
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-600">Body</label>
              {!isNew && canWrite && (
                <button
                  type="button"
                  onClick={handleAiAdapt}
                  disabled={aiAdaptMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#5479EE]/30 bg-[#5479EE]/5 px-2.5 py-1 text-[12px] font-semibold text-[#3E63D8] hover:bg-[#5479EE]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiAdaptMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate with AI
                </button>
              )}
            </div>
            <MarkdownEditor value={body} onChange={setBody} disabled={readOnly} />

            {aiSuggestion && (
              <div className="mt-3 rounded-xl border border-[#5479EE]/30 bg-[#5479EE]/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3E63D8]">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI-personalized draft — review before applying
                  </p>
                  <button
                    type="button"
                    onClick={() => setAiSuggestion(null)}
                    aria-label="Dismiss suggestion"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-[13px] text-gray-700">
                  {aiSuggestion}
                </div>
                <p className="mt-2 text-[11.5px] text-gray-400">
                  This only fills the Body field below — nothing is saved until you click Save.
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <AppButton variantStyle="outline" color="gray" onClick={() => setAiSuggestion(null)}>
                    Discard
                  </AppButton>
                  <AppButton onClick={applyAiSuggestion}>Use this draft</AppButton>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={readOnly}
              rows={2}
              placeholder="Short summary shown in listings and search results (optional)."
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5479EE] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <AppSelect
              label="Category"
              value={categoryId}
              placeholder="No category"
              disabled={readOnly}
              onChange={(e) => {
                setCategoryId(String(e.target.value));
                setSectionId(""); // section must belong to the chosen category
              }}
              options={categoryOptions}
              isBgWhite
            />
            <AppSelect
              label="Section"
              value={sectionId}
              placeholder="No section"
              disabled={readOnly}
              onChange={(e) => setSectionId(String(e.target.value))}
              options={sectionOptions}
              isBgWhite
            />
            <AppInput
              label="Locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="en"
              disabled={readOnly}
              isBgWhite
            />

            {/* Labels */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FD] px-2.5 py-1 text-[12px] font-medium text-[#3E63D8]"
                  >
                    {label}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => setLabels((prev) => prev.filter((l) => l !== label))}
                        aria-label={`Remove ${label}`}
                        className="text-[#3E63D8]/70 hover:text-[#3E63D8]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!readOnly && (
                <input
                  value={labelDraft}
                  onChange={(e) => setLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addLabel();
                    }
                  }}
                  onBlur={addLabel}
                  placeholder="Add a label and press Enter"
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5479EE]"
                />
              )}
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Public</p>
                <p className="text-[11.5px] text-gray-400">Visible in the public help center.</p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={readOnly ? undefined : setIsPublic}
                disabled={readOnly}
              />
            </div>
          </div>

          {!isNew && articleId && <ArticleFlagsPanel articleId={articleId} canManage={canManage} />}
        </div>
      </div>

      {!isNew && articleId && (
        <ArticleVersionHistoryDrawer
          articleId={articleId}
          open={showVersions}
          onClose={() => setShowVersions(false)}
        />
      )}
      {confirmationPopup}
    </div>
  );
}
