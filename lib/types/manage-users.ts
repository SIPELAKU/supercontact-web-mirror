export interface ManageUser {
  id: string;
  fullname: string;
  email: string;
  position: string;
  employee_code: string;
  department: {
    id: string,
    department_name: string,
    branch: string
  },
  role: {
    id: string,
    role_name: string
  },
  level: string,
  status: string,
}

export interface ManageUserResponse {
  success: boolean;
  data: {
    manage_users: ManageUser[];
    total: number;
    page: number;
    limit: number;
  };
  error: string | null;
}

export interface CreateManagedUserData {
  email: string;
  department_id: string;
  user_level: string;
  position: string;
  role_id: string;
  status: string;
}

export interface UpdateManagedUserData extends Partial<CreateManagedUserData> {}