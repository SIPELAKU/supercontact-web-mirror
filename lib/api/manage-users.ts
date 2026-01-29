import { ManageUserResponse, CreateManagedUserData, UpdateManagedUserData } from "../types/manage-users";
import { fetchWithTimeout } from "./api-client";

export async function fetchManagedUsers(
  token: string, 
  page: number, 
  limit: number,
  search?: string,
  position?: string,
  status?: string
): Promise<ManageUserResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (position) params.append("position", position);
  if (status) params.append("status", status);

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/manage-users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Managed Users API response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) throw new Error("Failed to load managed users");
  
  // API already returns the correct structure, just return it
  return json;  
}

export async function createManagedUser(
  token: string,
  data: CreateManagedUserData
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/manage-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error.message || "Failed to create managed user");
  }

  return res.json();
}

export async function updateManagedUser(
  token: string,
  id: string,
  data: UpdateManagedUserData
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/manage-users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.log("errorData", errorData);
    throw new Error(errorData.error.message || "Failed to update managed user");
  }

  return res.json();
}

export async function deleteManagedUser(
  token: string,
  id: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/manage-users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.log("errorData", errorData);
    throw new Error(errorData.error.message || "Failed to delete managed user");
  }

  return res.json();
}
