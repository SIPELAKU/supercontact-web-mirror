import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { deleteCompanyLogo, fetchMyCompany, uploadCompanyLogo } from "@/lib/api/company-profile";
import type { CompanyGeneral } from "@/lib/types/company-profile";

export const myCompanyKey = ["company", "me"] as const;

/**
 * The caller's own company row (`GET /companies`): contact details, logo and
 * quotation defaults. One request shared by every card on the Company Profile
 * page. Admin only (permission `companies`), so pass `enabled = false` for
 * anyone else. After a PATCH, put its response in the cache under
 * `myCompanyKey` (it returns the same shape).
 */
export function useMyCompany(enabled = true) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: myCompanyKey,
    queryFn: async () => fetchMyCompany(await getToken()),
    enabled,
  });
}

/** Uploads a new logo; the page shows it from the response, no refetch. */
export function useUploadCompanyLogo() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => uploadCompanyLogo(await getToken(), file),
    onSuccess: (company) => queryClient.setQueryData<CompanyGeneral>(myCompanyKey, company),
  });
}

/** Removes the logo; the page falls back to the initials. */
export function useDeleteCompanyLogo() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => deleteCompanyLogo(await getToken()),
    onSuccess: (company) => queryClient.setQueryData<CompanyGeneral>(myCompanyKey, company),
  });
}
