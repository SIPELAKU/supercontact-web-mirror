"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { PERMISSIONS } from "@/lib/constants/permissions";

// GET /permissions -> { data: { permission_names: string[] } } (also tolerate a
// bare { permission_names } shape). Routed through the same /api/proxy the rest
// of the roles module uses (see lib/hooks/useRoles.ts), so auth is consistent.
interface PermissionCatalogResponse {
  data?: { permission_names?: string[] };
  permission_names?: string[];
}

/**
 * Fetches the authoritative permission catalog from the server. The bundled
 * PERMISSIONS constant is used only as an offline fallback (fixing the drift
 * bug where the editor rendered a stale hardcoded list that omitted the
 * omnichannel/agent and granular ticket grants).
 */
export function usePermissionCatalog() {
  const { token } = useAuth();

  const query = useQuery<string[], Error>({
    queryKey: ["permissions", "catalog"],
    queryFn: async () => {
      const res = await fetch("/api/proxy/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load permission catalog");
      }
      const json: PermissionCatalogResponse = await res.json();
      const names = json?.data?.permission_names ?? json?.permission_names;
      if (!Array.isArray(names)) {
        throw new Error("Malformed permission catalog response");
      }
      return names;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
    retry: 1,
  });

  const hasServerData = !!query.data && query.data.length > 0;

  return {
    // Authoritative server list when available, else the typed offline fallback.
    permissions: hasServerData ? query.data! : [...PERMISSIONS],
    isLoading: query.isLoading,
    isError: query.isError,
    // True whenever the rendered list is the bundled constant rather than the
    // live catalog (loading or failed), so the UI can surface a subtle notice.
    isFallback: !hasServerData,
  };
}
