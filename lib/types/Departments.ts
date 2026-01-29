export interface DepartmentsType {
    id: string;
    department: string;
    branch: string;
    manager_name: string
    manager_id: string;
    member_count: number;
    created_at: string;
    manager_code: string;
}

export interface ResponseDepartmentsType {
    departments: DepartmentsType[];
    total: number;
    total_pages: number;
    page: number;
    limit: number;
}

export interface DepartmentDetailResponse {
    success: boolean;
    data: DepartmentsType;
    error: string | null;
}

export interface DepartmentMember {
    id: string;
    fullname: string;
    email: string;
    position: string;
    employee_code: string;
    status: string;
}

export interface DepartmentMembersResponse {
    success: boolean;
    data: {
        members: DepartmentMember[];
        total: number;
        page: number;
        limit: number;
    };
    error: string | null;
}