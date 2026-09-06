"use client";

// components/admin/catalog-settings/DiscountPoliciesTab.tsx
//
// Discount policies (Phase 4, spec I9): the twelfth Settings > Sales manager,
// on the `CustomerTypesTab.tsx` shape - a lazy SuperTable with an inline draft
// form, `useConfirmationPopup`, `extractFieldErrors` + `notify.error`, and a
// `mutationSeq` bump to restart the list after a write.
//
// Two things this screen must make visible, because getting either wrong is
// expensive and silent:
//
// 1. PRECEDENCE. The most specific policy wins - user, then role, then
//    company - and only ACTIVE rows are considered (spec A26 / E2.2). A
//    manager who adds a generous user-scoped policy has not "raised the
//    company limit for everyone"; they have carved out one person.
//
// 2. A ROLE-SCOPED POLICY NAMES A PLATFORM-WIDE ROLE. Admin / Manager / Staff
//    are GLOBAL rows (`roles.company_id IS NULL`), so `discount_policies`
//    cannot carry a foreign key to them and the isolation is this tenant's
//    `company_id` plus application code. The row is still scoped to this
//    workspace - it is the ROLE that is shared - and the copy says so rather
//    than letting an admin infer they are editing something global.
//
// THE COMPANY ROW IS A FIXTURE, NOT A CRUD ROW (spec A10): editable, never
// archivable, never deletable, and never creatable from here. Its uniqueness
// index has no `is_active` predicate, so deactivating it is a one-way door
// that 500s the next `ensure_company_default`.

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Pencil, Percent, Plus, RotateCcw, Save, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { notify } from "@/lib/notifications";
import { formatPercent, formatRupiah } from "@/lib/helper/currency";
import {
  archiveDiscountPolicy,
  createDiscountPolicy,
  fetchDiscountPolicies,
  updateDiscountPolicy,
  type DiscountPolicy,
  type DiscountPolicyCreate,
  type DiscountPolicyScope,
  type DiscountPolicyUpdate,
} from "@/lib/api/discount-policies";
import { fetchUsers } from "@/lib/api/users";
import { fetchWithTimeout } from "@/lib/api/api-client";
import {
  authHeaders,
  extractFieldErrors,
  getFullUrl,
  handleResponse,
} from "@/lib/api/catalog-http";
import { POLICY_VS_PROMOTION_HELP } from "@/lib/constants/promotion";
import type { RoleResponse } from "@/lib/types/Role";

// MUST equal the table's batch size or the lazy footer asks for page 2 of 25
// while showing 10, and rows 11-25 vanish without a trace.
const PAGE_LIMIT = 25;

interface Draft {
  appliesTo: DiscountPolicyScope;
  targetId: string;
  maxPercent: string;
  maxAmount: string;
  minMargin: string;
  approvalAbove: string;
  priority: string;
  isActive: boolean;
}

const EMPTY_DRAFT: Draft = {
  // `role` and not `company`: the company row is created only by the server
  // and is never offered as a create option here (A10).
  appliesTo: "role",
  targetId: "",
  maxPercent: "",
  maxAmount: "",
  minMargin: "",
  approvalAbove: "",
  priority: "0",
  isActive: true,
};

const SCOPE_LABEL: Record<DiscountPolicyScope, string> = {
  company: "Perusahaan",
  role: "Peran",
  user: "Pengguna",
};

/**
 * An optional numeric limit as the API wants it.
 *
 * A BLANK FIELD IS `null`, NOT `0`. Null means NO LIMIT, and zero means "no
 * discount at all is allowed" - the difference between a policy that behaves
 * exactly like today's 22 seeded rows and one that refuses every quotation the
 * workspace writes.
 */
function optionalNumber(raw: string): number | null {
  const text = raw.trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function displayLimit(value: string | null | undefined, suffix = "%"): string {
  if (value === null || value === undefined || value === "") return "Tanpa batas";
  return `${formatPercent(value)}${suffix}`;
}

export default function DiscountPoliciesTab() {
  const { getToken } = useAuth();
  const { can } = usePermission();
  const { confirm, confirmationPopup } = useConfirmationPopup();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  // Forwarded to the server, because the table is `manualSorting`: MRT's own
  // sort row model is off, so a header arrow that is not sent reorders nothing.
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mutationSeq, setMutationSeq] = useState(0);
  const bump = () => setMutationSeq((n) => n + 1);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<DiscountPolicy | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "discount-policies",
      page,
      search,
      includeInactive,
      sortBy,
      sortOrder,
      mutationSeq,
    ],
    queryFn: async () =>
      fetchDiscountPolicies(await getToken(), {
        page,
        limit: PAGE_LIMIT,
        search: search.trim() || undefined,
        // `is_active` is what the endpoint actually declares; the old
        // `include_inactive` key was discarded server-side, so archived
        // policies were listed even with the toggle off - on the one screen
        // whose job is showing which limits are in force. OMITTED (not
        // `false`) when the toggle is on: the tri-state means "both".
        is_active: includeInactive ? undefined : true,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });
  const rows: DiscountPolicy[] = data?.policies ?? [];

  // ── The two target pickers ─────────────────────────────────────────────
  //
  // `target_id` must be a REAL `users.id` / `roles.id`, so where the ids come
  // from matters more than it looks:
  //
  //  * USERS come from `GET /users`, which is company-scoped, needs only
  //    authentication, and returns `users.id`. NOT from `GET /manage-users`:
  //    that endpoint's `id` is the `manage_users` ROW id (its `user_id` is not
  //    even in the response), so a policy written from it would target a row
  //    that no quotation resolution will ever match - silently, with no error
  //    anywhere, for as long as nobody checked.
  //  * ROLES need `role_permissions`, which `sales:config:manage` does NOT
  //    imply, so that picker is fetched only when the caller holds the grant
  //    and otherwise says so instead of rendering an empty dropdown.
  const canReadRoles = can("role_permissions");

  // Deliberately NOT `lib/hooks/useRoles.ts`: that hook has no `enabled`
  // switch, so it would fire a request that 403s for every manager who holds
  // `sales:config:manage` but not `role_permissions` - which is most of them.
  const { data: rolesResponse } = useQuery({
    queryKey: ["roles", "discount-policy-picker"],
    queryFn: async () => {
      const res = await fetchWithTimeout(getFullUrl("/role-permissions?page=1&limit=100"), {
        headers: authHeaders(await getToken()),
      });
      const json = await handleResponse<RoleResponse>(res, "Failed to load roles");
      return json.data;
    },
    enabled: canReadRoles,
  });
  const roleOptions = useMemo(
    () =>
      (rolesResponse?.roles ?? []).map((role) => ({
        value: role.id,
        label: role.role_name,
      })),
    [rolesResponse]
  );

  const { data: usersResponse } = useQuery({
    queryKey: ["users", "discount-policy-picker"],
    queryFn: async () => fetchUsers(await getToken(), 1, 200),
  });
  const userOptions = useMemo(
    () =>
      (usersResponse?.data?.users ?? []).map((user) => ({
        value: user.id,
        label: user.fullname || user.email,
      })),
    [usersResponse]
  );

  const targetOptions = draft.appliesTo === "role" ? roleOptions : userOptions;
  // Only the ROLE picker can be unavailable; `GET /users` needs no grant.
  const targetPickerAvailable = draft.appliesTo !== "role" || canReadRoles;

  const resetForm = () => {
    setAdding(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setFieldErrors({});
  };

  const beginEdit = (row: DiscountPolicy) => {
    setAdding(false);
    setEditing(row);
    setDraft({
      appliesTo: row.applies_to,
      targetId: row.target_id ?? "",
      maxPercent: row.max_discount_percent ?? "",
      maxAmount: row.max_discount_amount ?? "",
      minMargin: row.min_margin_percent ?? "",
      approvalAbove: row.approval_above_percent ?? "",
      priority: String(row.priority ?? 0),
      isActive: row.is_active,
    });
    setFieldErrors({});
  };

  const handleServerError = (error: any, title: string) => {
    const fe = extractFieldErrors(error);
    const known = Object.keys(fe).filter((key) => key !== "_");
    if (known.length > 0) setFieldErrors(fe);
    if (known.length === 0 || fe._) {
      notify.error(title, { description: fe._ ?? error?.message });
    }
  };

  const handleSave = async () => {
    const problems: Record<string, string> = {};
    const maxPercent = Number(draft.maxPercent);
    const approvalAbove = optionalNumber(draft.approvalAbove);
    const maxAmount = optionalNumber(draft.maxAmount);
    const minMargin = optionalNumber(draft.minMargin);
    const priority = draft.priority.trim() === "" ? 0 : Number(draft.priority);

    if (draft.maxPercent.trim() === "" || !Number.isFinite(maxPercent)) {
      problems.max_discount_percent = "Batas diskon wajib diisi";
    } else if (maxPercent < 0 || maxPercent > 100) {
      problems.max_discount_percent = "Antara 0 dan 100";
    }
    if (approvalAbove !== null && (approvalAbove < 0 || approvalAbove > 100)) {
      problems.approval_above_percent = "Antara 0 dan 100";
    }
    // Mirrors the schema's model validator. An approval band ABOVE the refusal
    // band can never fire: anything past `max_discount_percent` is refused
    // outright, so the threshold would silently never route anything.
    if (
      approvalAbove !== null &&
      Number.isFinite(maxPercent) &&
      approvalAbove > maxPercent
    ) {
      problems.approval_above_percent =
        "Ambang persetujuan tidak boleh di atas batas diskon - tidak akan pernah aktif";
    }
    if (minMargin !== null && (minMargin < 0 || minMargin > 100)) {
      problems.min_margin_percent = "Antara 0 dan 100";
    }
    if (maxAmount !== null && maxAmount < 0) {
      problems.max_discount_amount = "Tidak boleh negatif";
    }
    if (!Number.isInteger(priority)) problems.priority = "Harus bilangan bulat";
    if (!editing && draft.appliesTo !== "company" && !draft.targetId) {
      problems.target_id =
        draft.appliesTo === "role" ? "Pilih peran" : "Pilih pengguna";
    }
    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (editing) {
        const patch: DiscountPolicyUpdate = {
          max_discount_percent: maxPercent,
          max_discount_amount: maxAmount,
          min_margin_percent: minMargin,
          approval_above_percent: approvalAbove,
          priority,
        };
        // `is_active` is never sent for the company row: the server forces it
        // true and sending false is a refusal, not a no-op.
        if (editing.applies_to !== "company") patch.is_active = draft.isActive;
        await updateDiscountPolicy(token, editing.id, patch);
        notify.success("Kebijakan diskon diubah");
      } else {
        const payload: DiscountPolicyCreate = {
          applies_to: draft.appliesTo === "user" ? "user" : "role",
          target_id: draft.targetId,
          max_discount_percent: maxPercent,
          max_discount_amount: maxAmount,
          min_margin_percent: minMargin,
          approval_above_percent: approvalAbove,
          priority,
          is_active: draft.isActive,
        };
        await createDiscountPolicy(token, payload);
        notify.success("Kebijakan diskon ditambahkan", {
          description:
            "Berlaku untuk quotation berikutnya. Quotation yang sudah tersimpan tidak berubah.",
        });
      }
      resetForm();
      bump();
    } catch (error: any) {
      handleServerError(error, "Gagal menyimpan kebijakan");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = (row: DiscountPolicy) => {
    confirm({
      variant: "warning",
      title: "Arsipkan kebijakan diskon",
      description: `Kebijakan untuk "${row.effective_scope_label}" tidak akan dipakai lagi saat quotation dihitung. Quotation yang sudah tersimpan tidak berubah, dan pemakainya kembali mengikuti kebijakan yang lebih umum.`,
      confirmText: "Arsipkan",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await archiveDiscountPolicy(await getToken(), row.id);
          notify.success("Kebijakan diarsipkan");
          bump();
        } catch (error: any) {
          notify.error("Gagal mengarsipkan", { description: error?.message });
        }
      },
    });
  };

  const handleRestore = async (row: DiscountPolicy) => {
    try {
      await updateDiscountPolicy(await getToken(), row.id, { is_active: true });
      notify.success("Kebijakan diaktifkan kembali");
      bump();
    } catch (error: any) {
      notify.error("Gagal mengaktifkan", { description: error?.message });
    }
  };

  const handleStateChange = useCallback((state: SuperTableState) => {
    setPage(state.pagination.pageIndex + 1);
    setSearch(state.globalFilter || "");
    setIncludeInactive(Boolean(state.filters?.include_inactive));
    const sort = state.sorting?.[0];
    setSortBy(sort?.id);
    setSortOrder(sort?.desc === false ? "asc" : "desc");
  }, []);

  const columns = useMemo<MRT_ColumnDef<DiscountPolicy>[]>(
    () => [
      {
        id: "scope",
        accessorFn: (row) => row.effective_scope_label || SCOPE_LABEL[row.applies_to],
        header: "Berlaku untuk",
        size: 220,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.effective_scope_label || SCOPE_LABEL[row.original.applies_to]}
            </span>
            <span className="text-xs text-gray-500">{SCOPE_LABEL[row.original.applies_to]}</span>
          </div>
        ),
        // The DEFAULT order already is the resolution order (user > role >
        // company), which is what this column shows and the reason the list
        // reads the way the resolver decides. A sort arrow here would either
        // duplicate that or break it.
        enableSorting: false,
      },
      {
        id: "max_discount_percent",
        accessorFn: (row) => `${formatPercent(row.max_discount_percent)}%`,
        header: "Batas diskon",
        size: 130,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "approval_above_percent",
        accessorFn: (row) => displayLimit(row.approval_above_percent),
        header: "Ambang persetujuan",
        size: 170,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "max_discount_amount",
        accessorFn: (row) =>
          row.max_discount_amount ? formatRupiah(row.max_discount_amount) : "Tanpa batas",
        header: "Batas nilai diskon",
        size: 170,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "min_margin_percent",
        accessorFn: (row) => displayLimit(row.min_margin_percent),
        header: "Margin minimum",
        size: 150,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      { accessorKey: "priority", header: "Prioritas", size: 110 },
      {
        id: "is_active",
        accessorFn: (row) => (row.is_active ? "Aktif" : "Diarsipkan"),
        header: "Status",
        size: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <Chip
            label={row.original.is_active ? "Aktif" : "Diarsipkan"}
            color={row.original.is_active ? "success" : "default"}
            size="small"
          />
        ),
      },
    ],
    []
  );

  const isCompanyRow = editing?.applies_to === "company";

  const editorRow = (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Cakupan</label>
          <AppSelect
            isBgWhite
            fullWidth
            value={draft.appliesTo}
            // Immutable on an existing row: moving a policy between scopes
            // would silently re-target every quotation it governs.
            disabled={!!editing}
            options={
              editing
                ? [{ value: draft.appliesTo, label: SCOPE_LABEL[draft.appliesTo] }]
                : [
                    { value: "role", label: "Peran" },
                    { value: "user", label: "Pengguna" },
                  ]
            }
            onChange={(e) =>
              setDraft({
                ...draft,
                appliesTo: String(e.target.value) as DiscountPolicyScope,
                targetId: "",
              })
            }
            helperText={editing ? "Cakupan tidak bisa diubah" : "Yang lebih spesifik menang"}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            {draft.appliesTo === "user" ? "Pengguna" : "Peran"}
          </label>
          {isCompanyRow ? (
            <AppInput isBgWhite value="Seluruh workspace" disabled helperText="Baris bawaan" />
          ) : !targetPickerAvailable ? (
            <AppInput
              isBgWhite
              value=""
              disabled
              error
              helperText="Butuh hak Role Permissions untuk memilih peran"
            />
          ) : (
            <AppSelect
              isBgWhite
              fullWidth
              value={draft.targetId}
              disabled={!!editing}
              options={
                editing
                  ? [
                      {
                        value: draft.targetId,
                        label: editing.target_name || editing.effective_scope_label,
                      },
                    ]
                  : targetOptions
              }
              onChange={(e) => setDraft({ ...draft, targetId: String(e.target.value) })}
              helperText={
                fieldErrors.target_id ??
                (editing
                  ? "Target tidak bisa diubah"
                  : draft.appliesTo === "role"
                    ? "Peran dipakai bersama seluruh platform; kebijakan ini tetap milik workspace Anda"
                    : "Berlaku hanya untuk pengguna ini")
              }
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Batas diskon (%)</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.maxPercent}
            onChange={(e) => setDraft({ ...draft, maxPercent: e.target.value })}
            inputProps={{ step: 0.01, min: 0, max: 100 }}
            error={!!fieldErrors.max_discount_percent}
            helperText={fieldErrors.max_discount_percent ?? "Di atas ini quotation DITOLAK"}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Ambang persetujuan (%)</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.approvalAbove}
            onChange={(e) => setDraft({ ...draft, approvalAbove: e.target.value })}
            inputProps={{ step: 0.01, min: 0, max: 100 }}
            error={!!fieldErrors.approval_above_percent}
            helperText={
              fieldErrors.approval_above_percent ?? "Kosong = tanpa persetujuan"
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Batas nilai diskon</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.maxAmount}
            onChange={(e) => setDraft({ ...draft, maxAmount: e.target.value })}
            inputProps={{ step: 0.01, min: 0 }}
            error={!!fieldErrors.max_discount_amount}
            helperText={fieldErrors.max_discount_amount ?? "Kosong = tanpa batas nilai"}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Margin minimum (%)</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.minMargin}
            onChange={(e) => setDraft({ ...draft, minMargin: e.target.value })}
            inputProps={{ step: 0.01, min: 0, max: 100 }}
            error={!!fieldErrors.min_margin_percent}
            helperText={
              fieldErrors.min_margin_percent ?? "Hanya berlaku untuk produk yang punya HPP"
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Prioritas</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            inputProps={{ step: 1 }}
            error={!!fieldErrors.priority}
            helperText={fieldErrors.priority ?? "Dipakai bila cakupannya sama"}
          />
        </div>

        <div className="flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <Switch
              checked={isCompanyRow ? true : draft.isActive}
              disabled={isCompanyRow}
              onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })}
            />
            Aktif
          </label>
          {isCompanyRow && (
            <p className="text-[11px] text-gray-500">
              Kebijakan perusahaan selalu aktif - ia adalah dasar yang dipakai saat tidak ada
              kebijakan yang lebih spesifik.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <AppButton onClick={handleSave} disabled={saving} isLoading={saving}>
          <Save className="mr-1.5 h-4 w-4" />
          Simpan
        </AppButton>
        <AppButton variantStyle="outline" onClick={resetForm} aria-label="Batal">
          <X className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {confirmationPopup}

      <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
        <p className="font-medium">
          Kebijakan diskon punya dua ambang: satu yang MENOLAK, satu yang MEMINTA PERSETUJUAN.
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>
            Yang paling spesifik menang: <b>pengguna</b>, lalu <b>peran</b>, lalu{" "}
            <b>perusahaan</b>. Hanya kebijakan aktif yang dihitung.
          </li>
          <li>
            Di atas <b>batas diskon</b> quotation ditolak; di antara <b>ambang persetujuan</b> dan
            batas diskon, quotation masuk antrean persetujuan.
          </li>
          <li>
            Kolom kosong berarti <b>tanpa batas</b> - bukan nol. Mengisinya 0 berarti tidak boleh
            ada diskon sama sekali.
          </li>
          <li>
            Kebijakan berbasis <b>peran</b> menunjuk peran yang dipakai bersama di seluruh
            platform (Admin, Manager, Staff), tetapi kebijakannya tetap milik workspace ini saja.
          </li>
          <li>
            Baris <b>Perusahaan</b> adalah dasar workspace: boleh diubah, tidak bisa dihapus dan
            tidak bisa dinonaktifkan.
          </li>
          {/* COMMERCIAL Phase 5 (spec I6). The two screens now sit side by side
              in the nav and are easy to confuse: a POLICY caps the SELLER, a
              PROMOTION is the COMPANY's own price. Each screen names the other
              in one sentence. */}
          <li>{POLICY_VS_PROMOTION_HELP}</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!adding && !editing && (
          <AppButton
            onClick={() => {
              setAdding(true);
              setDraft(EMPTY_DRAFT);
              setFieldErrors({});
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah kebijakan
          </AppButton>
        )}
      </div>

      {(adding || editing) && editorRow}

      <SuperTable<DiscountPolicy>
        tableId="discount-policies-table"
        urlKey=""
        entityLabel="kebijakan diskon"
        searchPlaceholder="Cari peran atau pengguna"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Kebijakan diskon gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={typeof data?.total === "number" ? data.total : undefined}
        manualPagination
        manualFiltering
        manualSorting
        onStateChange={handleStateChange}
        resetPageKey={mutationSeq}
        filters={[
          { id: "include_inactive", label: "Tampilkan yang diarsipkan", type: "boolean" },
        ]}
        rowActions={[
          {
            id: "edit",
            label: "Ubah",
            icon: <Pencil size={16} />,
            onClick: (row) => beginEdit(row),
          },
          {
            id: "restore",
            label: "Aktifkan kembali",
            icon: <RotateCcw size={16} />,
            hidden: (row) => row.is_active || row.applies_to === "company",
            onClick: (row) => void handleRestore(row),
          },
          {
            id: "archive",
            label: "Arsipkan",
            icon: <Archive size={16} />,
            destructive: true,
            hidden: (row) => !row.is_active,
            // Disabled WITH the reason rather than hidden: the action exists
            // for every other row, and silently omitting it here would read as
            // a rendering bug rather than as a rule.
            disabled: (row) =>
              row.applies_to === "company"
                ? "Kebijakan perusahaan adalah dasar workspace dan tidak bisa dinonaktifkan"
                : false,
            onClick: (row) => handleArchive(row),
          },
        ]}
        renderEmptyState={({ hasActiveFilters, hasSearch }) => (
          <EmptyState
            icon={Percent}
            title={
              hasActiveFilters || hasSearch
                ? "Tidak ada kebijakan yang cocok"
                : "Belum ada kebijakan khusus"
            }
            description="Tanpa kebijakan khusus, semua orang mengikuti batas diskon perusahaan."
          />
        )}
        features={{
          pagination: true,
          globalFilter: true,
          sorting: true,
          columnFilters: false,
          urlSync: true,
          rowSelection: "none",
        }}
      />
    </div>
  );
}
