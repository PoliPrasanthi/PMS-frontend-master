
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { tasksService, Task } from '@/api/services/tasks.service';
import { queryKeys, cacheConfig } from '@/api/queryKeys';

export function useTasks(params: any = { skip: 0, limit: 20 }) {
    return useQuery({
        queryKey: queryKeys.tasks.list(params),
        queryFn: () => tasksService.getTasks(params),
        placeholderData: keepPreviousData,
        ...cacheConfig.DYNAMIC
    });
}

export function useActiveTaskAssignees() {
    return useQuery({
        queryKey: ['activeTaskAssignees'],
        queryFn: () => tasksService.getActiveTaskAssignees(),
        ...cacheConfig.DYNAMIC
    });
}

export function useTask(id: number) {
    return useQuery({
        queryKey: queryKeys.tasks.detail(id),
        queryFn: () => tasksService.getTask(id),
        enabled: !!id && id > 0,
        ...cacheConfig.FREQUENT
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            tasksService.updateTask(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => tasksService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
        },
    });
}
