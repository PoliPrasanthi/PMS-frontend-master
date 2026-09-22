// Centralized Query Key Factory

export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    users: {
        all: ['users'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.users.lists(), { filters }] as const,
        details: () => [...queryKeys.users.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.users.details(), id] as const,
        dropdown: () => [...queryKeys.users.all, 'dropdown'] as const,
    },
    projects: {
        all: ['projects'] as const,
        lists: () => [...queryKeys.projects.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.projects.lists(), { filters }] as const,
        details: () => [...queryKeys.projects.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.projects.details(), id] as const,
        groups: () => [...queryKeys.projects.all, 'groups'] as const,
    },
    tasks: {
        all: ['tasks'] as const,
        lists: () => [...queryKeys.tasks.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.tasks.lists(), { filters }] as const,
        details: () => [...queryKeys.tasks.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.tasks.details(), id] as const,
    },
    issues: {
        all: ['issues'] as const,
        lists: () => [...queryKeys.issues.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.issues.lists(), { filters }] as const,
        details: () => [...queryKeys.issues.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.issues.details(), id] as const,
    },
    timelogs: {
        all: ['timelogs'] as const,
        lists: () => [...queryKeys.timelogs.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.timelogs.lists(), { filters }] as const,
    },
    milestones: {
        all: ['milestones'] as const,
        lists: () => [...queryKeys.milestones.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.milestones.lists(), { filters }] as const,
        detail: (id: number) => [...queryKeys.milestones.all, 'detail', id] as const,
    },
    tasklists: {
        all: ['tasklists'] as const,
        lists: () => [...queryKeys.tasklists.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.tasklists.lists(), { filters }] as const,
    },
    templates: {
        all: ['templates'] as const,
        lists: () => [...queryKeys.templates.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.templates.lists(), { filters }] as const,
    },
    teams: {
        all: ['teams'] as const,
        lists: () => [...queryKeys.teams.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.teams.lists(), { filters }] as const,
        dropdown: () => [...queryKeys.teams.all, 'dropdown'] as const,
    },
    masters: {
        all: ['masters'] as const,
        statuses: () => [...queryKeys.masters.all, 'statuses'] as const,
        priorities: () => [...queryKeys.masters.all, 'priorities'] as const,
        roles: () => [...queryKeys.masters.all, 'roles'] as const,
        skills: () => [...queryKeys.masters.all, 'skills'] as const,
        userStatuses: () => [...queryKeys.masters.all, 'userStatuses'] as const,
        lookups: (category: string) => [...queryKeys.masters.all, 'lookups', category] as const,
    },
    reports: {
        all: ['reports'] as const,
        summary: () => [...queryKeys.reports.all, 'summary'] as const,
        project: (id: number) => [...queryKeys.reports.all, 'project', id] as const,
    }
};

// Caching configuration defaults
export const cacheConfig = {
    // Static data: roles, skills, master lookups — cached for 5 minutes instead of 24 hours to reflect admin changes.
    STATIC: {
        staleTime: 5 * 60 * 1000,  // 5 minutes
        gcTime: 10 * 60 * 1000,    // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    },
    // Infrequently changing data: project lists, user lists
    FREQUENT: {
        staleTime: 30_000,               // 30s prevents thundering herd
        gcTime: 30 * 60 * 1000,          // 30 minutes GC
        refetchOnWindowFocus: true,      // enabled to sync between multiple browser tabs
        retry: 1,
    },
    // Real-time operational data: dashboard KPIs, task details
    DYNAMIC: {
        staleTime: 30_000,               // 30s prevents thundering herd
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,      // enabled to sync between multiple browser tabs
        retry: 0,                        // fail fast on dynamic endpoints, no retry floods
    },
};
