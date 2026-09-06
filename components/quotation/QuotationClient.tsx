"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import QuotationHeader from "@/components/quotation/QuotationHeader";
import QuotationTable from "@/components/quotation/QuotationTable";
import { useGetQuotationstore, Quotation, type FetchQuotationParams } from "@/lib/store/quotation";
import { SuperTableState } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
  decideQuotationApproval,
  deleteQuotation,
  reviseQuotation,
  submitQuotationForApproval,
  transitionQuotationStatus,
} from "@/lib/api/quotations";
import { handleError } from "@/lib/utils/errorHandler";
import { quotationListFilterQuery } from "@/lib/constants/quotation-status";
import { mapQuotationException } from "@/lib/utils/quotation-errors";
import { AppTextarea } from "@/components/ui/app-textarea";

type Decision = "accepted" | "rejected";

/** The governance action a confirmation popup is currently asking about. */
type GovernanceAction = "submit" | "approve" | "reject" | "revise";

/** What fetchQuotations() takes from this screen (spec D2.4). */
type QuotationQuery = Partial<FetchQuotationParams>;

export default function QuotationClient() {
  const router = useRouter();
  const { token, getToken, userProfile } = useAuth();
  const { can } = usePermission();

  const {
    fetchQuotations,
    listQuotations,
    loading,
    error,
    pagination,
  } = useGetQuotationstore();

  // Initial fetch on mount - 25 is SuperTable's lazy batch, so the first
  // "load more" asks for rows 26-50 rather than re-fetching 11-25.
  useEffect(() => {
    fetchQuotations({
      limit: 25,
      page: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The last query the table asked for. Refetches after an action (accept /
  // reject / delete / retry) replay it so the active status, search, date and
  // sort filters survive; the store's own filter fields are never set from
  // this screen, so a bare `{page, limit}` refetch would silently drop them.
  const lastQueryRef = useRef<QuotationQuery | null>(null);

  const handleTableStateChange = useCallback((newState: SuperTableState) => {
    // The date-range filter hands over two `YYYY-MM-DD` strings - the format
    // the API wants - so nothing is parsed or reformatted here.
    //
    // It used to arrive as `[Date, Date]` from MRT's own date-range input and
    // be run through date-fns `format()`. That also meant a shared or
    // bookmarked `?f=expire_date:...` URL threw on restore, because everything
    // that comes back out of a query string is a string and `format()` will
    // not take one.
    const dateFilterValue = newState.columnFilters.find((f: any) => f.id === "expire_date")?.value as [string | undefined, string | undefined] | undefined;

    // Status filter (server-side). A bookmarked legacy `Pending`/`Accepted`
    // is folded onto its canonical value, and the client-only `expired` (what
    // the chip shows for a sent row past its expiry; the API never stores it)
    // becomes `sent` plus a `date_to` cap - otherwise filtering by the status
    // just shown on screen returned nothing. The bookmarked filter value
    // itself stays `expired`; only the request is translated.
    const statusFilterValue = newState.columnFilters.find((f) => f.id === "quotation_status")?.value as string | undefined;
    const { quotation_status, date_from, date_to } = quotationListFilterQuery(statusFilterValue, dateFilterValue);

    // Sorting (server-side; sort_by/sort_order contract)
    const sort = newState.sorting?.[0];

    // Trigger API fetch with combined payload params
    const query: QuotationQuery = {
        page: newState.pagination.pageIndex + 1,
        limit: newState.pagination.pageSize,
        search: newState.globalFilter,
        date_from,
        date_to,
        quotation_status: quotation_status ?? "all",
        sort_by: sort?.id,
        sort_order: sort ? (sort.desc ? "desc" : "asc") : undefined,
    };
    lastQueryRef.current = query;
    fetchQuotations(query);

  }, [fetchQuotations]);


  const handleExportRequest = async (params: any): Promise<Quotation[]> => {
    try {
      let allData: Quotation[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // Same translation as the table fetch, so an export of "Kedaluwarsa"
      // contains the rows the table showed (and honours the date range).
      const state: SuperTableState | undefined = params.currentState;
      const statusFilterValue = state?.columnFilters?.find((f) => f.id === "quotation_status")?.value as string | undefined;
      const dateFilterValue = state?.columnFilters?.find((f) => f.id === "expire_date")?.value as [string | undefined, string | undefined] | undefined;
      const { quotation_status, date_from, date_to } = quotationListFilterQuery(statusFilterValue, dateFilterValue);

      do {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(currentPage));
        urlParams.set("limit", "50");

        if (state?.globalFilter) {
          urlParams.set("search", state.globalFilter);
        }
        if (quotation_status) {
          urlParams.set("quotation_status", quotation_status);
        }
        if (date_from) {
          urlParams.set("date_from", date_from);
        }
        if (date_to) {
          urlParams.set("date_to", date_to);
        }

        const response = await fetch(
          `/api/proxy/quotations?${urlParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        const items = data?.data?.quotations || [];
        totalPages = data?.data?.total_pages || 1;

        allData = [...allData, ...items];
        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    } catch (err) {
      console.error("Export error:", err);
      return [];
    }
  };

  const handleOpenAddForm = () => {
    router.push("/sales/quotation/add");
  };

  const handleView = (quotation: Quotation) => {
    router.push(`/sales/quotation/${quotation.id}`);
  };

  const handleEdit = (quotation: Quotation) => {
    // The [id] route renders the form; it is editable only while draft.
    router.push(`/sales/quotation/${quotation.id}`);
  };

  const refetchCurrentPage = useCallback(
    () =>
      fetchQuotations(
        lastQueryRef.current ?? { page: pagination.page, limit: pagination.limit }
      ),
    [fetchQuotations, pagination.page, pagination.limit]
  );

  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (quotation: Quotation) => {
    setDeleteTarget(quotation);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteQuotation(deleteTarget.id);
      notify.success(`Quotation ${deleteTarget.quotation_number} deleted`);
      setDeleteTarget(null);
      // Refresh the current page of results
      refetchCurrentPage();
    } catch (err: any) {
      notify.error("Error", { description: handleError(err, "Delete Quotation") });
    } finally {
      setIsDeleting(false);
    }
  };

  // sent -> accepted | rejected (POST /quotations/{id}/status)
  const [decisionTarget, setDecisionTarget] = useState<{ quotation: Quotation; status: Decision } | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  const handleConfirmDecision = async () => {
    if (!decisionTarget) return;
    setIsDeciding(true);
    try {
      const authToken = await getToken();
      await transitionQuotationStatus(authToken, decisionTarget.quotation.id, {
        status: decisionTarget.status,
      });
      notify.success(
        decisionTarget.status === "accepted"
          ? `Quotation ${decisionTarget.quotation.quotation_number} ditandai diterima`
          : `Quotation ${decisionTarget.quotation.quotation_number} ditandai ditolak`
      );
      setDecisionTarget(null);
      refetchCurrentPage();
    } catch (err: any) {
      notify.error("Error", { description: handleError(err, "Quotation status") });
    } finally {
      setIsDeciding(false);
    }
  };

  // ── Phase 4 governance from the list (spec I5) ───────────────────────────
  //
  // The grant comes from the profile's own permission list - the same
  // server-resolved `role_permissions` set the sidebar and the approvals
  // screen read - rather than from a second request to
  // `GET /quotations/defaults` on a screen that has no other use for defaults.
  // It is a hint either way: `POST /quotations/{id}/approve` enforces
  // `quotations:approve` itself, and refuses the requester on top of it.
  const canApprove = can("quotations:approve");

  const [governanceTarget, setGovernanceTarget] = useState<
    { quotation: Quotation; action: GovernanceAction } | null
  >(null);
  const [governanceNote, setGovernanceNote] = useState("");
  const [isGoverning, setIsGoverning] = useState(false);

  const openGovernance = (quotation: Quotation, action: GovernanceAction) => {
    setGovernanceNote("");
    setGovernanceTarget({ quotation, action });
  };

  const handleConfirmGovernance = async () => {
    if (!governanceTarget) return;
    const { quotation, action } = governanceTarget;
    setIsGoverning(true);
    try {
      const authToken = await getToken();
      if (action === "submit") {
        await submitQuotationForApproval(authToken, quotation.id);
        notify.success(`Quotation ${quotation.quotation_number} diajukan untuk persetujuan`);
      } else if (action === "revise") {
        const revision = await reviseQuotation(authToken, quotation.id, governanceNote);
        notify.success(`Revisi ${revision.quotation_number} dibuat sebagai draft`);
        // The new draft is the document to work on now; the parent is
        // superseded and no longer carries a customer link.
        router.push(`/sales/quotation/${revision.id}`);
        return;
      } else {
        await decideQuotationApproval(
          authToken,
          quotation.id,
          action === "approve",
          governanceNote
        );
        notify.success(
          action === "approve"
            ? `Quotation ${quotation.quotation_number} disetujui`
            : `Quotation ${quotation.quotation_number} ditolak`
        );
      }
      setGovernanceTarget(null);
      setGovernanceNote("");
      refetchCurrentPage();
    } catch (err: any) {
      notify.error("Error", { description: mapQuotationException(err).message });
    } finally {
      setIsGoverning(false);
    }
  };

  const governanceCopy: Record<GovernanceAction, { title: string; confirm: string; note: string }> = {
    submit: {
      title: "Ajukan persetujuan",
      confirm: "Ajukan",
      note: "Catatan tidak dikirim pada pengajuan.",
    },
    approve: { title: "Setujui quotation", confirm: "Setujui", note: "Catatan (opsional)" },
    reject: { title: "Tolak quotation", confirm: "Tolak", note: "Catatan (opsional)" },
    revise: { title: "Buat revisi", confirm: "Buat revisi", note: "Alasan revisi (opsional)" },
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <QuotationHeader />

      <QuotationTable
         quotations={listQuotations || []}
         isLoading={loading}
         isError={!!error}
         errorMessage={error || undefined}
         onRetry={refetchCurrentPage}
         onAdd={handleOpenAddForm}
         rowCount={pagination.total}
         onStateChange={handleTableStateChange}
         onExportRequest={handleExportRequest}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         onAccept={(q) => setDecisionTarget({ quotation: q, status: "accepted" })}
         onReject={(q) => setDecisionTarget({ quotation: q, status: "rejected" })}
         onSubmitApproval={(q) => openGovernance(q, "submit")}
         onApprove={(q) => openGovernance(q, "approve")}
         onRejectApproval={(q) => openGovernance(q, "reject")}
         onRevise={(q) => openGovernance(q, "revise")}
         onSendComplete={refetchCurrentPage}
         canApprove={canApprove}
         currentUserId={userProfile?.id ?? null}
         renderTopLeftToolbar={() => (
           <>
             {/* Desktop */}
             <div className="hidden md:flex gap-2">
               <AppButton onClick={handleOpenAddForm}
                 startIcon={<Plus size={16} />}>
                 Create Quotation
               </AppButton>
             </div>

             {/* Mobile — icon only w-9 h-9 */}
             <div className="flex md:hidden gap-2">
               <button onClick={handleOpenAddForm}
                 className="flex items-center justify-center w-9 h-9
                            rounded-md bg-[#5479EE] text-white
                            hover:bg-[#3F66E0] transition-colors">
                 <Plus size={16} />
               </button>
             </div>
           </>
         )}
      />

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Quotation"
        description={`Are you sure you want to delete quotation ${deleteTarget?.quotation_number ?? ""}? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmationPopup
        isOpen={!!decisionTarget}
        onClose={() => setDecisionTarget(null)}
        onConfirm={handleConfirmDecision}
        title={decisionTarget?.status === "accepted" ? "Tandai diterima" : "Tandai ditolak"}
        description={
          decisionTarget?.status === "accepted"
            ? `Tandai quotation ${decisionTarget?.quotation.quotation_number ?? ""} sebagai diterima pelanggan? Status tidak bisa diubah kembali.`
            : `Tandai quotation ${decisionTarget?.quotation.quotation_number ?? ""} sebagai ditolak pelanggan? Status tidak bisa diubah kembali.`
        }
        confirmText={decisionTarget?.status === "accepted" ? "Tandai diterima" : "Tandai ditolak"}
        cancelText="Batal"
        variant={decisionTarget?.status === "accepted" ? "info" : "warning"}
        isLoading={isDeciding}
      />

      {/* One popup for all four governance actions. Approve, reject and
          revise carry a note; submit does not, because the server records no
          comment on a request - only on a decision. */}
      <ConfirmationPopup
        isOpen={!!governanceTarget}
        onClose={() => setGovernanceTarget(null)}
        onConfirm={handleConfirmGovernance}
        title={governanceTarget ? governanceCopy[governanceTarget.action].title : ""}
        description={
          governanceTarget?.action === "submit"
            ? `Ajukan quotation ${governanceTarget.quotation.quotation_number} untuk disetujui? Quotation belum dikirim ke pelanggan sampai disetujui.`
            : governanceTarget?.action === "approve"
              ? `Setujui quotation ${governanceTarget.quotation.quotation_number}? Statusnya menjadi Terkirim dan siap dikirim ke pelanggan.`
              : governanceTarget?.action === "reject"
                ? `Tolak quotation ${governanceTarget.quotation.quotation_number}? Quotation kembali ke Draft agar pengaju bisa memperbaikinya.`
                : `Buat draft baru dari quotation ${governanceTarget?.quotation.quotation_number ?? ""}. Quotation ini berhenti berlaku dan tautan persetujuan pelanggannya dinonaktifkan.`
        }
        confirmText={governanceTarget ? governanceCopy[governanceTarget.action].confirm : undefined}
        cancelText="Batal"
        variant={governanceTarget?.action === "reject" ? "warning" : "info"}
        isLoading={isGoverning}
      >
        {governanceTarget && governanceTarget.action !== "submit" && (
          <AppTextarea
            isBgWhite
            label={governanceCopy[governanceTarget.action].note}
            rows={3}
            value={governanceNote}
            onChange={(e) => setGovernanceNote(e.target.value.slice(0, 1000))}
            inputProps={{ maxLength: 1000 }}
          />
        )}
      </ConfirmationPopup>
    </div>
  );
}
