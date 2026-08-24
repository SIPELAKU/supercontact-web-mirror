import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    createPipelineStage,
    deletePipelineStage,
    fetchPipelineStages,
    reorderPipelineStages,
    updatePipelineStage,
} from "@/lib/api/pipeline-stages";
import type {
    PipelineStageCreate,
    PipelineStageUpdate,
} from "@/lib/types/PipelineStage";

const KEY = "pipeline-stages";

export function usePipelineStages(includeInactive = false) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: [KEY, includeInactive],
        queryFn: async () => fetchPipelineStages(await getToken(), includeInactive),
    });
}

/** Renaming a stage moves its deals and changing its outcome re-stamps them,
 *  so anything showing deals is stale after a write, not just this list. */
function invalidateStagesAndDeals(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: [KEY] });
    queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    queryClient.invalidateQueries({ queryKey: ["sales-dashboard"] });
}

export function useCreatePipelineStage() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: PipelineStageCreate) =>
            createPipelineStage(await getToken(), data),
        onSuccess: () => invalidateStagesAndDeals(queryClient),
    });
}

export function useUpdatePipelineStage() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: PipelineStageUpdate }) =>
            updatePipelineStage(await getToken(), id, data),
        onSuccess: () => invalidateStagesAndDeals(queryClient),
    });
}

export function useReorderPipelineStages() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (stageIds: string[]) =>
            reorderPipelineStages(await getToken(), stageIds),
        onSuccess: () => invalidateStagesAndDeals(queryClient),
    });
}

export function useDeletePipelineStage() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => deletePipelineStage(await getToken(), id),
        onSuccess: () => invalidateStagesAndDeals(queryClient),
    });
}
