import { useQuery } from '@tanstack/react-query';
import { issuesService } from '../api/issues.api';
import { queryKeys, cacheConfig } from '@/api/queryKeys';

export function useIssues(params: any = { skip: 0, limit: 20 }) {
    return useQuery({
        queryKey: queryKeys.issues.list(params),
        queryFn:  () => issuesService.getIssues(params),
        ...cacheConfig.DYNAMIC
    });
}

export function useActiveIssueAssignees() {
    return useQuery({
        queryKey: ['activeIssueAssignees'],
        queryFn: () => issuesService.getActiveIssueAssignees(),
        ...cacheConfig.DYNAMIC
    });
}

export function useIssue(id: number) {
    return useQuery({
        queryKey: queryKeys.issues.detail(id),
        queryFn:  () => issuesService.getIssue(id),
        enabled:  !!id,
        ...cacheConfig.FREQUENT
    });
}
