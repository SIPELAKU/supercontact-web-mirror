export type RoleType = {
  id: string;
  assignedTo: string[];
  created_at: string;
  is_system_role: boolean;
  permission_names: string[];
  role_name: string;
  updated_at: string;
};

export type RoleResponse = {
  roles: RoleType[];
  total: number;
  page: number;
  limit: number;
};
