import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoleResponse, RoleType } from "../types/Role";
import { useAuth } from "../context/AuthContext";
import { notify } from "../notifications";
import { useRouter } from "next/navigation";

const useRoles = (page: number = 1, limit: number = 10, search?: string) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: rolesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["roles", page, limit, search],
    queryFn: async () => {
      if (!token) {
        notify.error("Error fetching roles", {
          description: "Please login to continue"
        })
        router.push("/login");
        return;
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      const response = await fetch(`/api/proxy/role-permissions?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!page && !!limit && !!token,
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({
      roleName,
      permissions,
    }: {
      roleName: string;
      permissions: string[];
    }) => {
      if (!token) {
        notify.error("Error adding role", {
          description: "Please login to continue"
        })
        router.push("/login");
        return;
      }
      const response = await fetch("/api/proxy/role-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          role_name: roleName,
          permission_names: permissions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch roles query to update the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const editRoleMutation = useMutation({
    mutationFn: async ({
      roleName,
      permissions,
      roleId,
    }: {
      roleName: string;
      permissions: string[];
      roleId: string;
    }) => {
      if (!token) {
        notify.error("Error editing role", {
          description: "Please login to continue"
        })
        router.push("/login");
        return;
      }
      const response = await fetch(`/api/proxy/role-permissions/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          role_name: roleName,
          permission_names: permissions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch roles query to update the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async ({
      roleId,
    }: {
      roleId: string;
    }) => {
      if (!token) {
        notify.error("Error deleting role", {
          description: "Please login to continue"
        })
        router.push("/login");
        return;
      }
      const response = await fetch(`/api/proxy/role-permissions/${roleId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch roles query to update the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const roles: RoleResponse = rolesData || [];
  const addRole = (roleName: string, permissions: string[]) =>
    addRoleMutation.mutateAsync({ roleName, permissions });

  const editRole = (roleName: string, permissions: string[], roleId: string) =>
    editRoleMutation.mutateAsync({ roleName, permissions, roleId });

  const deleteRole = (roleId: string) =>
    deleteRoleMutation.mutateAsync({ roleId });

  return {
    roles,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    addRole,
    editRole,
    deleteRole,
    isAdding: addRoleMutation.isPending,
    isEditing: editRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
};

export default useRoles;
