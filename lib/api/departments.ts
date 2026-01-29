import { DepartmentsType, ResponseDepartmentsType, DepartmentDetailResponse, DepartmentMembersResponse } from "../types/Departments";

export interface CreateDepartmentData {
  department: string;
  branch: string;
  manager_id: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {}

export async function fetchDepartments(
  token: string,
  page: number,
  limit: number,
  search?: string,
  department?: string,
  branch?: string
): Promise<{ success: boolean; data: ResponseDepartmentsType; error: string | null }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (department) params.append("department", department);
  if (branch) params.append("branch", branch);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) throw new Error("Failed to load departments");

  return res.json();
}

export async function fetchDepartmentById(
  token: string,
  departmentId: string
): Promise<DepartmentDetailResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}`, {
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
  status?: string
): Promise<DepartmentMembersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (position) params.append("position", position);
  if (status) params.append("status", status);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}/members?${params.toString()}`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create department");
  return res.json();
}

export async function updateDepartment(
  token: string,
  id: string,
  data: UpdateDepartmentData
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update department");
  return res.json();
}

export async function deleteDepartment(
  token: string,
  id: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete department");
  return res.json();
}

export async function deleteMember(
  token: string,
  departmentId: string,
  memberId: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}/members/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete member");
  return res.json();
}
