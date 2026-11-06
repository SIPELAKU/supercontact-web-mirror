"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import { cn } from "@/lib/utils";
import {
  useKbCategories,
  useKbSections,
  useCreateKbCategory,
  useUpdateKbCategory,
  useDeleteKbCategory,
  useBulkDeleteKbCategories,
  useCreateKbSection,
  useUpdateKbSection,
  useDeleteKbSection,
  useKbPermissions,
} from "@/lib/hooks/useKnowledge";
import type { KbCategory, KbSection } from "@/lib/types/knowledge";
import {
  deleteImpact,
  keepExisting,
  selectAllState,
  toggleAll,
  toggleOne,
  type DeleteImpact,
} from "@/lib/utils/kbCategories";

const SHOWN_IN_CONFIRM = 8;

/** What goes with the deleted categories, spelled out for the confirm dialog. */
function DeleteImpactText({ impact }: { impact: DeleteImpact }) {
  const shown = impact.categories.slice(0, SHOWN_IN_CONFIRM);
  const more = impact.categories.length - shown.length;
  return (
    <div className="flex flex-col gap-2">
      {impact.countsKnown ? (
        <p>
          Ikut terhapus permanen: <strong>{impact.sections} section</strong> dan{" "}
          <strong>{impact.articles} artikel</strong>
          {impact.published > 0 && (
            <>
              {" "}
              (<strong>{impact.published} di antaranya Published</strong> dan dipakai answer bot)
            </>
          )}
          . Tindakan ini tidak bisa dibatalkan.
        </p>
      ) : (
        <p>
          Semua section dan artikel di dalamnya ikut terhapus permanen. Tindakan ini tidak bisa
          dibatalkan.
        </p>
      )}
      {impact.categories.length > 1 && (
        <p className="text-gray-500">
          {shown
            .map((c) => (c.articles === null ? c.name : `${c.name} (${c.articles} artikel)`))
            .join(" · ")}
          {more > 0 && ` · +${more} lainnya`}
        </p>
      )}
    </div>
  );
}

/** A checkbox that can also show "some picked". */
function SelectBox({
  state,
  onChange,
  label,
  disabled,
}: {
  state: "none" | "some" | "all";
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === "some";
  }, [state]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={state === "all"}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
      className="h-4 w-4 shrink-0 cursor-pointer accent-[#5479EE]"
    />
  );
}

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
  icon: string;
  position: string;
  is_public: boolean;
};

type SectionForm = {
  id?: string;
  category_id: string;
  name: string;
  description: string;
  position: string;
};

const emptyCategory: CategoryForm = {
  name: "",
  description: "",
  icon: "",
  position: "0",
  is_public: true,
};

export default function KnowledgeCategoriesClient() {
  const router = useRouter();
  const { canManage } = useKbPermissions();
  const { confirm, confirmationPopup } = useConfirmationPopup();

  const { data: categories = [], isLoading } = useKbCategories();
  const { data: sections = [] } = useKbSections();

  const createCategory = useCreateKbCategory();
  const updateCategory = useUpdateKbCategory();
  const deleteCategory = useDeleteKbCategory();
  const bulkDelete = useBulkDeleteKbCategories();
  const createSection = useCreateKbSection();
  const updateSection = useUpdateKbSection();
  const deleteSection = useDeleteKbSection();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm | null>(null);

  // Categories picked for "delete several at once". A pick whose category is
  // gone (deleted, here or in another tab) quietly drops out.
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const allIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const selected = useMemo(() => keepExisting(picked, allIds), [picked, allIds]);
  const allState = selectAllState(selected, allIds);

  const sectionsByCategory = useMemo(() => {
    const map = new Map<string, KbSection[]>();
    sections.forEach((s) => {
      const arr = map.get(s.category_id) ?? [];
      arr.push(s);
      map.set(s.category_id, arr);
    });
    // Keep each category's sections ordered by position.
    map.forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [sections]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ---- Category CRUD ----------------------------------------------------------

  const openNewCategory = () => setCategoryForm({ ...emptyCategory });
  const openEditCategory = (c: KbCategory) =>
    setCategoryForm({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      icon: c.icon ?? "",
      position: String(c.position ?? 0),
      is_public: !!c.is_public,
    });

  const submitCategory = async () => {
    if (!categoryForm || !categoryForm.name.trim()) {
      notify.error("Name required");
      return;
    }
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || null,
      icon: categoryForm.icon.trim() || null,
      position: Number(categoryForm.position) || 0,
      is_public: categoryForm.is_public,
    };
    try {
      if (categoryForm.id) {
        await updateCategory.mutateAsync({ id: categoryForm.id, data: payload });
        notify.success("Category updated");
      } else {
        await createCategory.mutateAsync(payload);
        notify.success("Category created");
      }
      setCategoryForm(null);
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Failed to save category") });
    }
  };

  const removeCategory = (c: KbCategory) => {
    confirm({
      variant: "danger",
      title: `Hapus kategori "${c.name}"?`,
      description: <DeleteImpactText impact={deleteImpact(categories, new Set([c.id]))} />,
      confirmText: "Hapus permanen",
      onConfirm: async () => {
        try {
          await deleteCategory.mutateAsync(c.id);
          setPicked((prev) => keepExisting(prev, allIds.filter((id) => id !== c.id)));
          notify.success("Kategori dihapus");
        } catch (err) {
          notify.error("Error", { description: getErrorMessage(err, "Failed to delete category") });
        }
      },
    });
  };

  // All or nothing on the API side: one failure and nothing is deleted.
  const removeSelected = () => {
    const ids = allIds.filter((id) => selected.has(id));
    if (ids.length === 0) return;
    confirm({
      variant: "danger",
      title: `Hapus ${ids.length} kategori?`,
      description: <DeleteImpactText impact={deleteImpact(categories, selected)} />,
      confirmText: "Hapus permanen",
      onConfirm: async () => {
        try {
          const report = await bulkDelete.mutateAsync(ids);
          setPicked(new Set());
          notify.success(
            `${report.deleted_categories} kategori dihapus (${report.deleted_articles} artikel)`
          );
        } catch (err) {
          notify.error("Gagal menghapus kategori", {
            description: `${getErrorMessage(err, "Failed to delete categories")} Tidak ada kategori yang dihapus.`,
          });
        }
      },
    });
  };

  // ---- Section CRUD -----------------------------------------------------------

  const openNewSection = (categoryId: string) =>
    setSectionForm({ category_id: categoryId, name: "", description: "", position: "0" });
  const openEditSection = (s: KbSection) =>
    setSectionForm({
      id: s.id,
      category_id: s.category_id,
      name: s.name,
      description: s.description ?? "",
      position: String(s.position ?? 0),
    });

  const submitSection = async () => {
    if (!sectionForm || !sectionForm.name.trim()) {
      notify.error("Name required");
      return;
    }
    if (!sectionForm.category_id) {
      notify.error("Category required");
      return;
    }
    try {
      if (sectionForm.id) {
        await updateSection.mutateAsync({
          id: sectionForm.id,
          data: {
            category_id: sectionForm.category_id,
            name: sectionForm.name.trim(),
            description: sectionForm.description.trim() || null,
            position: Number(sectionForm.position) || 0,
          },
        });
        notify.success("Section updated");
      } else {
        await createSection.mutateAsync({
          category_id: sectionForm.category_id,
          name: sectionForm.name.trim(),
          description: sectionForm.description.trim() || null,
          position: Number(sectionForm.position) || 0,
        });
        notify.success("Section created");
      }
      setSectionForm(null);
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Failed to save section") });
    }
  };

  const removeSection = (s: KbSection) => {
    confirm({
      variant: "danger",
      title: "Delete section",
      description: `Delete "${s.name}"? This cannot be undone.`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteSection.mutateAsync(s.id);
          notify.success("Section deleted");
        } catch (err) {
          notify.error("Error", { description: getErrorMessage(err, "Failed to delete section") });
        }
      },
    });
  };

  const savingCategory = createCategory.isPending || updateCategory.isPending;
  const savingSection = createSection.isPending || updateSection.isPending;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-16">
      <div className="mb-6 flex items-center justify-between gap-3">
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
            <h1 className="text-xl font-bold text-gray-900">Categories & sections</h1>
            <p className="text-[12.5px] text-gray-400">Organize your help center content.</p>
          </div>
        </div>
        {canManage && (
          <AppButton startIcon={<Plus size={16} />} onClick={openNewCategory}>
            New category
          </AppButton>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No categories yet"
          description="Categories group your help center sections and articles."
          action={canManage ? { label: "New category", onClick: openNewCategory, icon: <Plus size={16} /> } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {canManage && (
            <div className="flex flex-col gap-3 rounded-xl border border-[#C7D5F8] bg-[#F5F8FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                <SelectBox
                  state={allState}
                  onChange={() => setPicked(toggleAll(selected, allIds))}
                  label="Pilih semua kategori"
                  disabled={bulkDelete.isPending}
                />
                {selected.size > 0 ? (
                  <span>
                    <span className="font-semibold">{selected.size}</span> kategori dipilih
                  </span>
                ) : (
                  <span>Pilih semua</span>
                )}
              </label>
              {selected.size > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <AppButton
                    variantStyle="danger"
                    startIcon={
                      bulkDelete.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />
                    }
                    disabled={bulkDelete.isPending}
                    onClick={removeSelected}
                  >
                    Hapus ({selected.size})
                  </AppButton>
                  <AppButton
                    variantStyle="outline"
                    startIcon={<X size={16} />}
                    disabled={bulkDelete.isPending}
                    onClick={() => setPicked(new Set())}
                  >
                    Batal pilih
                  </AppButton>
                </div>
              )}
            </div>
          )}
          {categories.map((c) => {
            const catSections = sectionsByCategory.get(c.id) ?? [];
            const isOpen = expanded[c.id];
            return (
              <div key={c.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center gap-3 px-4 py-3">
                  {canManage && (
                    <SelectBox
                      state={selected.has(c.id) ? "all" : "none"}
                      onChange={() => setPicked(toggleOne(selected, c.id))}
                      label={`Pilih kategori ${c.name}`}
                      disabled={bulkDelete.isPending}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => toggle(c.id)}
                    className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{c.name}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-500">
                        {c.slug}
                      </span>
                      {!c.is_public && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          Private
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-gray-400">{c.description}</p>
                    )}
                  </div>
                  <span className="text-[12px] text-gray-400">
                    {catSections.length} sections
                    {typeof c.article_count === "number" && ` · ${c.article_count} articles`}
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openNewSection(c.id)}
                        title="Add section"
                        className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditCategory(c)}
                        title="Edit category"
                        className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCategory(c)}
                        title="Delete category"
                        className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                    {catSections.length === 0 ? (
                      <p className="py-2 text-[13px] text-gray-400">No sections in this category.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {catSections.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13.5px] font-medium text-gray-700">{s.name}</span>
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10.5px] text-gray-400">
                                  {s.slug}
                                </span>
                              </div>
                              {s.description && (
                                <p className="mt-0.5 line-clamp-1 text-[12px] text-gray-400">{s.description}</p>
                              )}
                            </div>
                            <span className="text-[11.5px] text-gray-400">#{s.position}</span>
                            {canManage && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditSection(s)}
                                  title="Edit section"
                                  className="grid h-7 w-7 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSection(s)}
                                  title="Delete section"
                                  className="grid h-7 w-7 place-items-center rounded-md text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category dialog */}
      <Dialog open={!!categoryForm} onOpenChange={(o) => !o && setCategoryForm(null)} maxWidth="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoryForm?.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          {categoryForm && (
            <div className="space-y-4">
              <AppInput
                label="Name"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                isBgWhite
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5479EE]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  label="Icon"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="e.g. book"
                  isBgWhite
                />
                <AppInput
                  label="Position"
                  type="number"
                  value={categoryForm.position}
                  onChange={(e) => setCategoryForm({ ...categoryForm, position: e.target.value })}
                  isBgWhite
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Public</p>
                  <p className="text-[11.5px] text-gray-400">Visible in the public help center.</p>
                </div>
                <Switch
                  checked={categoryForm.is_public}
                  onCheckedChange={(v) => setCategoryForm({ ...categoryForm, is_public: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <AppButton variantStyle="outline" color="gray" onClick={() => setCategoryForm(null)}>
              Cancel
            </AppButton>
            <AppButton onClick={submitCategory} isLoading={savingCategory}>
              {categoryForm?.id ? "Save" : "Create"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section dialog */}
      <Dialog open={!!sectionForm} onOpenChange={(o) => !o && setSectionForm(null)} maxWidth="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sectionForm?.id ? "Edit section" : "New section"}</DialogTitle>
          </DialogHeader>
          {sectionForm && (
            <div className="space-y-4">
              <AppSelect
                label="Category"
                value={sectionForm.category_id}
                placeholder="Select category"
                onChange={(e) => setSectionForm({ ...sectionForm, category_id: String(e.target.value) })}
                options={categoryOptions}
                isBgWhite
              />
              <AppInput
                label="Name"
                required
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                isBgWhite
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">Description</label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5479EE]"
                />
              </div>
              <AppInput
                label="Position"
                type="number"
                value={sectionForm.position}
                onChange={(e) => setSectionForm({ ...sectionForm, position: e.target.value })}
                isBgWhite
              />
            </div>
          )}
          <DialogFooter>
            <AppButton variantStyle="outline" color="gray" onClick={() => setSectionForm(null)}>
              Cancel
            </AppButton>
            <AppButton onClick={submitSection} isLoading={savingSection}>
              {sectionForm?.id ? "Save" : "Create"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmationPopup}
    </div>
  );
}
