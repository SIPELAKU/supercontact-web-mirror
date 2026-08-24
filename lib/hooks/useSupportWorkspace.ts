import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchUnifiedFeed, UnifiedFeedParams } from "@/lib/api/support-workspace";

// Read-only unified support feed (tickets + omnichannel conversations).
// keepPreviousData keeps the current page visible while paging/filtering so the
// list doesn't collapse to a spinner on every keystroke.
export function useUnifiedFeed(params: UnifiedFeedParams) {
    const { getToken } = useAuth();

    return useQuery({
        queryKey: [
            "support-workspace-feed",
            params.kind ?? "",
            params.status ?? "",
            params.assignedToMe ?? false,
            params.q ?? "",
            params.limit ?? null,
            params.offset ?? null,
        ],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchUnifiedFeed(token, params);
        },
        placeholderData: keepPreviousData,
    });
}
