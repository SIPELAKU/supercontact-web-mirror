"use client";

import { useEffect, useState } from "react";
import useRoles from "@/lib/hooks/useRoles";
import { AddRoleButton, RolesTable } from "@/components/roles";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { handleError } from "@/lib/utils/errorHandler";
import { notify } from "@/lib/notifications";
import { SuperTableState } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";

export default function RolesClient() {
  const { token } = useAuth();

  // ===== TABLE STATE (Driven by SuperTable) ===== //
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 25,
    globalFilter: "",
  });

  // ===== FETCHING API ===== //
  const { roles, isLoading, isError, error, refetch } = useRoles(
    tableState.pageIndex + 1, // API index starts at 1
    tableState.pageSize,
    tableState.globalFilter
  );

  // Error handling
  useEffect(() => {
    if (isError && error) {
      const message = handleError(error, "Fetch Roles & Permissions");
      notify.error("Failed to load roles & permissions", { description: message });
    }
  }, [isError, error]);

  const handleTableStateChange = (state: SuperTableState) => {
    setTableState({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      globalFilter: state.globalFilter,
    });
  };

  const handleExportRequest = async (params: { format: "csv" | "excel", currentState: SuperTableState }) => {
    try {
      const search = params.currentState.globalFilter;
      const LIMIT_PER_PAGE = 1000;
      let allData: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      
      do {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(currentPage));
        urlParams.set("limit", String(LIMIT_PER_PAGE));
        if (search) urlParams.set("search", search);
        
        const response = await fetch(
          `/api/proxy/role-permissions?${urlParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        const data = await response.json();
        
        const items = data?.data?.roles || [];
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

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      {/* Header (Standalone Mobile-Friendly) */}
      <SettingsPageHeader
        title="Roles & Permissions"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Roles & Permissions" },
        ]}
      />

      {/* Table Data */}
      <RolesTable
        roles={roles?.roles || []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error || undefined}
        onRetry={() => refetch()}
        rowCount={roles?.total || 0}
        onStateChange={handleTableStateChange}
        onExportRequest={handleExportRequest}
        renderTopLeftToolbar={() => (
          <div className="flex gap-2">
            <AddRoleButton hideLabelOnMobile />
          </div>
        )}
      />
    </div>
  );
}
