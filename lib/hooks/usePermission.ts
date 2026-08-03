"use client";

import { useAuth } from "@/lib/context/AuthContext";

export function usePermission() {
    const { hasPermission } = useAuth();

    const can = (perm: string | string[]): boolean => {
        if (Array.isArray(perm)) {
            return perm.some((p) => hasPermission(p));
        }
        return hasPermission(perm);
    };

    return { can };
}
