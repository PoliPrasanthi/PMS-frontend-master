
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../api/projects.api';
import { tasksService } from '@/features/tasks/api/tasks.api';
import { issuesService } from '@/features/issues/api/issues.api';
import { milestonesService } from '@/features/milestones/api/milestones.api';
import { timelogsService } from '@/features/timelogs/api/timelogs.api';
import { queryKeys } from '@/api/queryKeys';

import { tasklistsService } from '@/api/services/tasklists.service';

const PROJECT_STALE   = 30_000;
const TASK_STALE      = 30_000;
const TASKLIST_STALE  = Infinity;
const ISSUE_STALE     = 30_000;
const MILESTONE_STALE = Infinity;
const TIMELOG_STALE   = 60_000;

export function useProjectDetail(
    projectId: number | undefined,
    paginationParams: {
        tasks?: { skip: number; limit: number };
        taskLists?: { skip: number; limit: number };
        issues?: { skip: number; limit: number };
        timelogs?: { skip: number; limit: number };
    } = {}
) {
    const enabled = !!projectId;

    const project = useQuery({
        queryKey: queryKeys.projects.detail(projectId!),
        queryFn: () => projectsService.getProject(projectId!),
        enabled,
        staleTime: PROJECT_STALE,
    });

    const tasksParams = paginationParams.tasks || { skip: 0, limit: 50 };
    const tasks = useQuery({
        queryKey: [...queryKeys.projects.detail(projectId!), 'tasks', tasksParams.skip, tasksParams.limit],
        queryFn: () => tasksService.getTasks({ project_id: projectId, ...tasksParams }),
        enabled,
        staleTime: TASK_STALE,
    });

    const taskListsParams = paginationParams.taskLists || { skip: 0, limit: 50 };
    const taskLists = useQuery({
        queryKey: [...queryKeys.projects.detail(projectId!), 'tasklists', taskListsParams.skip, taskListsParams.limit],
        queryFn: () => tasklistsService.getTaskLists(projectId!, taskListsParams.skip, taskListsParams.limit),
        enabled,
        staleTime: TASKLIST_STALE,
    });

    const issuesParams = paginationParams.issues || { skip: 0, limit: 50 };
    const issues = useQuery({
        queryKey: [...queryKeys.projects.detail(projectId!), 'issues', issuesParams.skip, issuesParams.limit],
        queryFn: () => issuesService.getIssues({ project_id: projectId, ...issuesParams }),
        enabled,
        staleTime: ISSUE_STALE,
    });

    const milestones = useQuery({
        queryKey: [...queryKeys.projects.detail(projectId!), 'milestones'],
        queryFn: () => milestonesService.getMilestones(projectId!),
        enabled,
        staleTime: MILESTONE_STALE,
    });

    const timelogsParams = paginationParams.timelogs || { skip: 0, limit: 50 };
    const timelogs = useQuery({
        queryKey: [...queryKeys.projects.detail(projectId!), 'timelogs', timelogsParams.skip, timelogsParams.limit],
        queryFn: () => timelogsService.getTimelogs(timelogsParams.skip, timelogsParams.limit, projectId!),
        enabled,
        staleTime: TIMELOG_STALE,
    });

    const isLoading =
        project.isLoading ||
        tasks.isLoading ||
        taskLists.isLoading ||
        issues.isLoading ||
        milestones.isLoading ||
        timelogs.isLoading;

    const isError =
        project.isError ||
        tasks.isError ||
        taskLists.isError ||
        issues.isError ||
        milestones.isError ||
        timelogs.isError;

    return {
        project: project.data,
        tasks: tasks.data?.items ?? [],
        taskTotal: tasks.data?.total ?? 0,
        taskCompleted: tasks.data?.status_counts?.completed ?? 0,
        taskActive: tasks.data?.status_counts?.active ?? 0,
        taskLists: (taskLists.data as any)?.items ?? (Array.isArray(taskLists.data) ? taskLists.data : []),
        issues: issues.data?.items ?? [],
        issueTotal: issues.data?.total ?? 0,
        issueOpen: issues.data?.stats?.open ?? 0,
        issueClosed: issues.data?.stats?.closed ?? 0,
        milestones: (milestones.data as any)?.items ?? (Array.isArray(milestones.data) ? milestones.data : []),
        milestoneTotal: (milestones.data as any)?.total ?? (milestones.data as any)?.items?.length ?? 0,
        timelogs: (timelogs.data as any)?.items ?? (Array.isArray(timelogs.data) ? timelogs.data : []),
        timelogTotal: (timelogs.data as any)?.total ?? 0,
        isLoading,
        isError,
        refetchAll: () => {
            project.refetch();
            tasks.refetch();
            taskLists.refetch();
            issues.refetch();
            milestones.refetch();
            timelogs.refetch();
        },
    };
}
