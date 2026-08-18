import { DepartmentsType, ResponseDepartmentsType, DepartmentDetailResponse, DepartmentMembersResponse } from "../types/Departments";
import { fetchWithTimeout } from "./api-client";

export interface CreateDepartmentData {
  department: string;
  branch: string;
  // manager_id: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> { }

export async function fetchDepartments(
  token: string,
  page: number,
  limit: number,
  search?: string,
  department?: string,
  branch?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<{ success: boolean; data: ResponseDepartmentsType; error: string | null }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (department) params.append("department", department);
  if (branch) params.append("branch", branch);
  if (sortBy) {
    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder ?? "asc");
  }

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) throw new Error("Failed to load departments");

  return res.json();
}

export async function fetchBranches(
  token: string
): Promise<{ success: boolean; data: string[]; error: string | null }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments/branches`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) throw new Error("Failed to load branches");

  return res.json();
}

export async function fetchDepartmentById(
  token: string,
  departmentId: string
): Promise<DepartmentDetailResponse> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) throw new Error("Failed to load department detail");

  return res.json();
}

export async function fetchDepartmentMembers(
  token: string,
  departmentId: string,
  page: number,
  limit: number,
  search?: string,
  position?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<DepartmentMembersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (position) params.append("position", position);
  if (status) params.append("status", status);
  if (sortBy) {
    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder ?? "asc");
  }

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}/members?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) throw new Error("Failed to load department members");

  return res.json();
}

export async function createDepartment(
  token: string,
  data: CreateDepartmentData
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.error?.message || errorData?.message || "Failed to create department";
    const error = new Error(errorMessage);
    (error as any).response = { data: errorData, status: res.status };
    throw error;
  }
  return res.json();
}

export async function updateDepartment(
  token: string,
  id: string,
  data: UpdateDepartmentData
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.error?.message || errorData?.message || "Failed to update department";
    const error = new Error(errorMessage);
    (error as any).response = { data: errorData, status: res.status };
    throw error;
  }
  return res.json();
}

export async function deleteDepartment(
  token: string,
  id: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.error?.message || errorData?.message || "Failed to delete department";
    const error = new Error(errorMessage);
    (error as any).response = { data: errorData, status: res.status };
    throw error;
  }
  return res.json();
}

export async function deleteMember(
  token: string,
  departmentId: string,
  memberId: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}/members/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.error?.message || errorData?.message || "Failed to delete member";
    const error = new Error(errorMessage);
    (error as any).response = { data: errorData, status: res.status };
    throw error;
  }
  return res.json();
}
