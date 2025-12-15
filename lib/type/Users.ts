export interface UsersType {
    id: number;
    fullName: string;
    // password: string;
    email: string;
    role: string
    status: 'active' | 'inactive' | 'pending' | '';
    avatar_initial: string;
    id_employee: string;
    // created_At: string;
    // updated_At: string;
}