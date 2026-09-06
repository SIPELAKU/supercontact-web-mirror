"use client";

// components/contact/detail/sections/ContactTags.tsx
//
// The REAL contact-tag editor (Phase 3, spec A0.1). This file used to render
// three hard-coded strings - `MOCK_TAGS = ["Lead", "Active Customer", "High
// Priority"]` - with a colour chosen by comparing the label to the literal
// "High Priority". Nothing was stored, nothing was searchable, and the segment
// builder's `tags` clause had no source. It is now backed by `contact_tags` /
// `contact_tag_links`, so a tag renamed once follows every contact that
// carries it.
//
// Three rules the screen obeys rather than merely implements:
//
//   * `PUT /contacts/{id}/tags` replaces the WHOLE set, so removing the last
//     tag sends `[]` - "no tags" is a state the server is told about, not a
//     call that is skipped.
//   * a name is unique per tenant CASE-INSENSITIVELY, so typing "vip" when
//     "VIP" exists ATTACHES the existing tag instead of posting a duplicate
//     the unique index would refuse with a 409 the user cannot act on.
//   * creating a tag is a config act (`sales:config:manage`), because the tag
//     then exists for the whole tenant; merely attaching one is `contacts`.
//     A user without the config grant gets the picker with create-on-type
//     switched off AND the reason, never a control that silently does nothing.

import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Check, Plus, Tags, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { usePermission } from "@/lib/hooks/usePermission";
import {
    useActiveContactTags,
    useCreateContactTag,
    useReplaceContactTags,
} from "@/lib/hooks/useContactTags";
import {
    CONTACT_TAG_COLORS,
    CONTACT_TAG_NAME_MAX_LENGTH,
    addTag,
    cleanTagName,
    findTagByName,
    removeTag,
    suggestTags,
    tagChipStyle,
    tagIdsFor,
} from "@/lib/utils/contactTags";
import type { ContactTagBrief } from "@/lib/types/ContactTag";

interface ContactTagsProps {
    contactId: string;
    /** The contact's stored set, as `GET /contacts/{id}` returns it. */
    tags?: ContactTagBrief[] | null;
    /** Re-reads the contact so the header and the list agree with this card. */
    onChanged?: () => void;
}

export const ContactTags = ({ contactId, tags, onChanged }: ContactTagsProps) => {
    const { can } = usePermission();
    const canTag = can("contacts");
    const canCreate = can("sales:config:manage");

    const { data, isLoading } = useActiveContactTags({ enabled: canTag });
    const catalogue = useMemo(() => data?.items ?? [], [data]);

    const replaceMutation = useReplaceContactTags();
    const createMutation = useCreateContactTag();

    // Local set so a chip appears the moment it is picked; re-seeded whenever
    // the server's copy changes (after a save, after the parent reloads).
    const [selected, setSelected] = useState<ContactTagBrief[]>(tags ?? []);
    const [picking, setPicking] = useState(false);
    const [query, setQuery] = useState("");
    const [color, setColor] = useState<string>(CONTACT_TAG_COLORS[0]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setSelected(tags ?? []);
    }, [tags]);

    const suggestions = useMemo(
        () => suggestTags(catalogue, selected, query).slice(0, 8),
        [catalogue, selected, query]
    );
    // An exact (case-insensitive) hit anywhere in the tenant - including on an
    // ARCHIVED tag, which the unique index still blocks - means "attach that
    // one", never "create a second".
    const exact = findTagByName(catalogue, query);
    const typed = cleanTagName(query);
    const canOfferCreate = canCreate && typed.length > 0 && !exact;

    const busy = replaceMutation.isPending || createMutation.isPending;

    const persist = async (next: ContactTagBrief[]) => {
        const previous = selected;
        setSelected(next);
        setError(null);
        try {
            await replaceMutation.mutateAsync({ contactId, tagIds: tagIdsFor(next) });
            onChanged?.();
        } catch (err: any) {
            // Put the set back: a chip that stays on screen after the server
            // refused it is a lie the next page load silently corrects.
            setSelected(previous);
            const fe = extractFieldErrors(err);
            notify.error("Gagal menyimpan tag", { description: fe._ ?? fe.tag_ids ?? err?.message });
        }
    };

    const handleAttach = async (tag: ContactTagBrief) => {
        setQuery("");
        setPicking(false);
        await persist(addTag(selected, tag));
    };

    const handleRemove = async (tagId: string) => {
        await persist(removeTag(selected, tagId));
    };

    const handleCreate = async () => {
        const name = cleanTagName(query);
        if (!name) return;
        if (name.length > CONTACT_TAG_NAME_MAX_LENGTH) {
            setError(`Maksimal ${CONTACT_TAG_NAME_MAX_LENGTH} karakter`);
            return;
        }
        // Re-check against the catalogue at submit time, not only at keystroke
        // time: the list may have refreshed while the box was open.
        const existing = findTagByName(catalogue, name);
        if (existing) {
            await handleAttach(existing);
            return;
        }
        try {
            const created = await createMutation.mutateAsync({ name, color });
            await handleAttach({ id: created.id, name: created.name, color: created.color });
            notify.success("Tag dibuat", {
                description: `"${created.name}" kini tersedia untuk seluruh kontak.`,
            });
        } catch (err: any) {
            const fe = extractFieldErrors(err);
            setError(fe.name ?? fe._ ?? err?.message ?? "Gagal membuat tag");
        }
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Tags</h3>
                {canTag && !picking && (
                    <AppButton
                        variantStyle="outline"
                        onClick={() => {
                            setPicking(true);
                            setQuery("");
                            setError(null);
                        }}
                        disabled={busy}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah tag
                    </AppButton>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {selected.length === 0 && !picking && (
                    <p className="text-sm text-gray-500">
                        Belum ada tag. Tag dipakai untuk menyaring daftar kontak dan sebagai syarat
                        segmen pelanggan.
                    </p>
                )}
                {selected.map((tag) => {
                    const style = tagChipStyle(tag.color);
                    return (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1 text-xs font-medium"
                            style={style}
                        >
                            {tag.name}
                            {canTag && (
                                <button
                                    type="button"
                                    aria-label={`Lepas tag ${tag.name}`}
                                    className="opacity-70 hover:opacity-100 disabled:opacity-40"
                                    disabled={busy}
                                    onClick={() => handleRemove(tag.id)}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </span>
                    );
                })}
                {replaceMutation.isPending && <CircularProgress size={14} />}
            </div>

            {picking && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                    <AppInput
                        isBgWhite
                        autoFocus
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                if (exact) void handleAttach(exact);
                                else if (canOfferCreate) void handleCreate();
                            }
                            if (e.key === "Escape") setPicking(false);
                        }}
                        placeholder="Cari tag, atau ketik nama baru"
                        inputProps={{ maxLength: CONTACT_TAG_NAME_MAX_LENGTH }}
                        error={!!error}
                        helperText={error ?? undefined}
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                        {isLoading && <CircularProgress size={16} />}
                        {suggestions.map((tag) => {
                            const style = tagChipStyle(tag.color);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => handleAttach({ id: tag.id, name: tag.name, color: tag.color })}
                                    className="rounded-[8px] px-3 py-1 text-xs font-medium disabled:opacity-50"
                                    style={style}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                        {!isLoading && suggestions.length === 0 && !canOfferCreate && (
                            <p className="text-xs text-gray-500">
                                {exact
                                    ? "Tag ini sudah menempel di kontak ini."
                                    : catalogue.length === 0
                                      ? "Belum ada tag di workspace ini."
                                      : "Tidak ada tag yang cocok."}
                            </p>
                        )}
                    </div>

                    {canOfferCreate && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3">
                            <span className="text-xs text-gray-600">Buat tag baru:</span>
                            <span
                                className="rounded-[8px] px-3 py-1 text-xs font-medium"
                                style={tagChipStyle(color)}
                            >
                                {typed}
                            </span>
                            <div className="flex items-center gap-1">
                                {CONTACT_TAG_COLORS.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        aria-label={`Warna ${option}`}
                                        onClick={() => setColor(option)}
                                        className="flex h-5 w-5 items-center justify-center rounded-full border border-black/10"
                                        style={{ backgroundColor: option }}
                                    >
                                        {color === option && <Check size={12} color="#ffffff" />}
                                    </button>
                                ))}
                            </div>
                            <AppButton onClick={handleCreate} disabled={busy} isLoading={createMutation.isPending}>
                                <Tags className="mr-1.5 h-4 w-4" />
                                Buat &amp; pasang
                            </AppButton>
                        </div>
                    )}

                    {!canCreate && typed.length > 0 && !exact && (
                        // The control is absent WITH its reason rather than
                        // present-and-refused: creating a tag makes it exist
                        // for the whole tenant, which is a config act.
                        <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
                            Tag baru hanya bisa dibuat oleh pengguna dengan izin pengaturan penjualan
                            (<span className="font-mono">sales:config:manage</span>). Minta admin
                            menambahkannya di Settings › Sales › Tag Kontak.
                        </p>
                    )}

                    <div className="mt-3 flex justify-end">
                        <AppButton variantStyle="outline" onClick={() => setPicking(false)}>
                            Selesai
                        </AppButton>
                    </div>
                </div>
            )}
        </div>
    );
};
