import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchActivationChecklist,
    fetchBlueprint,
    fetchBlueprints,
    fetchInstalledBlueprints,
    installBlueprint,
} from "@/lib/api/industry-blueprints";

export function useBlueprints() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["industry-blueprints"],
        queryFn: async () => fetchBlueprints(await getToken()),
    });
}

export function useBlueprint(blueprintId: string | null) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["industry-blueprint", blueprintId],
        queryFn: async () => fetchBlueprint(await getToken(), blueprintId as string),
        enabled: Boolean(blueprintId),
    });
}

export function useInstalledBlueprints() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["industry-blueprints-installed"],
        queryFn: async () => fetchInstalledBlueprints(await getToken()),
    });
}

export function useActivationChecklist() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["activation-checklist"],
        queryFn: async () => fetchActivationChecklist(await getToken()),
    });
}

/**
 * One mutation for preview and install; `dry_run` decides which.
 *
 * A dry run writes nothing, so it deliberately invalidates NOTHING - refetching
 * the world after a preview would suggest something changed when it did not.
 * A real install touches almost every settings surface, so it clears broadly.
 */
export function useInstallBlueprint() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            blueprintId,
            modules,
            variables,
            dryRun,
        }: {
            blueprintId: string;
            modules?: string[] | null;
            variables?: Record<string, string>;
            dryRun: boolean;
        }) =>
            installBlueprint(await getToken(), blueprintId, {
                modules: modules ?? null,
                variables: variables ?? {},
                dry_run: dryRun,
            }),
        onSuccess: (_data, variables) => {
            if (variables.dryRun) return;
            [
                "industry-blueprints-installed",
                "activation-checklist",
                "pipeline-stages",
                "ticket-categories",
                "ticket-tags",
                "ticket-macros",
                "canned-replies",
                "conversation-queues",
                "agent-skills",
                "ticket-sla-policies",
                "business-hours",
                "flows",
                "products",
            ].forEach((key) =>
                queryClient.invalidateQueries({ queryKey: [key] })
            );
        },
    });
}
