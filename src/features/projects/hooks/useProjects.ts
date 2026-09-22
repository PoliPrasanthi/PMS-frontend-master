import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { projectsService } from '../api/projects.api';
import { ProjectFormData } from '../types/project.types';
import { projectGroupsService } from '../api/project_groups.api';
import { queryKeys, cacheConfig } from '@/api/queryKeys';

export function useProjects(params: any = {}) {
    const normalizedParams = {
        skip: 0,
        limit: 20,
        include_all: true,
        ...params
    };
    return useQuery({
        queryKey: [...queryKeys.projects.lists(), normalizedParams],
        queryFn: () => projectsService.getProjects(normalizedParams),
        placeholderData: keepPreviousData,
        ...cacheConfig.DYNAMIC
    });
}

export function useProject(id: number) {
    return useQuery({
        queryKey: queryKeys.projects.detail(id),
        queryFn: () => projectsService.getProject(id),
        enabled: !!id,
        ...cacheConfig.FREQUENT
    });
}

export function useProjectMembers(id: number | null | undefined) {
    return useQuery({
        queryKey: ['projects', id, 'members'],
        queryFn: () => projectsService.getProjectMembers(id!),
        enabled: !!id,
        ...cacheConfig.FREQUENT
    });
}

export function useProjectGroups(skip: number = 0, limit: number = 100) {
    return useQuery({
        queryKey: [...queryKeys.projects.groups(), skip, limit],
        queryFn: () => projectGroupsService.getProjectGroups(skip, limit),
        ...cacheConfig.STATIC
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ProjectFormData) => projectsService.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProjectFormData }) =>
            projectsService.updateProject(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.id) });
        },
    });
}
