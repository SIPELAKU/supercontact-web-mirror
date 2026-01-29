export interface UsersType {
    id: string | number;
    fullName: string;
    email: string;
    position: string
    status: 'active' | 'inactive' | 'pending' | '';
    avatar_initial: string;
    employee_code: string;
}
