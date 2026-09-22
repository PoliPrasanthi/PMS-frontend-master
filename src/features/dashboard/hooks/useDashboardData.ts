import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { projectsService } from '@/features/projects/api/projects.api';
import { tasksService } from '@/features/tasks/api/tasks.api';
import { issuesService } from '@/features/issues/api/issues.api';
import { reportsService } from '@/features/reports/api/reports.api';
import { queryKeys, cacheConfig } from '@/api/queryKeys';
import { FolderKanban, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/auth/AuthProvider';

const getArrayData = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

export function useDashboardData() {
  const { user } = useAuth();

  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: queryKeys.reports.summary(),
    queryFn: () => reportsService.getSummary(),
    ...cacheConfig.FREQUENT,
    retry: 0,
    enabled: !!user,
  });

  const { data: tasksRes, isLoading: loadingTasks } = useQuery({
    queryKey: queryKeys.tasks.list({ skip: 0, limit: 20, assignee_email: user?.email ? [user.email] : undefined }),
    queryFn: () => tasksService.getTasks({ skip: 0, limit: 20, assignee_email: user?.email ? [user.email] : undefined }),
    ...cacheConfig.FREQUENT,
    retry: 0,
    enabled: !!user,
  });

  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: queryKeys.projects.list({ skip: 0, limit: 20, member_email: user?.email }),
    queryFn: () => projectsService.getProjects({ skip: 0, limit: 20, member_email: user?.email }),
    ...cacheConfig.FREQUENT,
    retry: 0,
    enabled: !!user,
  });

  const { data: issuesRes, isLoading: loadingIssues } = useQuery({
    queryKey: queryKeys.issues.list({ skip: 0, limit: 20, assignee_email: user?.email ? [user.email] : undefined }),
    queryFn: () => issuesService.getIssues({ skip: 0, limit: 20, assignee_email: user?.email ? [user.email] : undefined }),
    ...cacheConfig.FREQUENT,
    retry: 0,
    enabled: !!user,
  });

  const loading = loadingSummary || loadingTasks || loadingProjects || loadingIssues;

  const dashboardState = useMemo(() => {
    const tasksList = getArrayData(tasksRes || []);
    const projectsList = getArrayData(projectsRes || []);
    const issuesList = getArrayData(issuesRes || []);

    let summaryObj = summaryData ? summaryData : {
      total_projects: projectsList.length,
      active_projects: projectsList.filter((p: any) => !['Completed', 'Closed'].includes(p.status_master?.name || p.status || '')).length,
      total_tasks: tasksList.length,
      completed_tasks: tasksList.filter((t: any) => ['Completed', 'Closed', 'Done', 'Fixed', 'Resolved'].includes(t.status_master?.name || t.status?.name || '')).length,
      total_issues: issuesList.length,
      open_issues: issuesList.filter((i: any) => !['Completed', 'Closed', 'Resolved'].includes(i.status_master?.name || i.status || '')).length,
      total_hours_logged: 0
    };

    const recProjects = projectsList.slice(0, 3);

    const taskStatus = summaryData?.task_status_data || [];
    const phaseStatus = summaryData?.phase_status_data || [];
    const issueSeverity = summaryData?.issue_severity_data || [];
    const activeProjectsWithTasks = summaryData?.project_task_progress_data || [];

    const completionRate = summaryObj.total_tasks > 0
      ? Math.round((summaryObj.completed_tasks / summaryObj.total_tasks) * 100) : 0;

    const kpiDefs = [
      { title: 'Active Projects', value: String(summaryObj.active_projects || 0), change: `${summaryObj.total_projects || 0} total projects`, trend: 'up' as const, icon: React.createElement(FolderKanban, { className: "w-5 h-5" }), gradient: '#14b8a6' },
      { title: 'Total Tasks', value: String(summaryObj.total_tasks || 0), change: `${summaryObj.completed_tasks || 0} completed`, trend: 'up' as const, icon: React.createElement(CheckCircle, { className: "w-5 h-5" }), gradient: '#8B5CF6' },
      { title: 'Open Issues', value: String(summaryObj.open_issues || 0), change: 'Requires attention', trend: 'down' as const, icon: React.createElement(AlertCircle, { className: "w-5 h-5" }), gradient: '#EF4444' },
      { title: 'Hours Logged', value: (summaryObj.total_hours_logged || 0).toFixed(1), change: 'This period', trend: 'up' as const, icon: React.createElement(Clock, { className: "w-5 h-5" }), gradient: '#3B82F6' },
      { title: 'Completion Rate', value: `${completionRate}%`, change: `${summaryObj.completed_tasks || 0}/${summaryObj.total_tasks || 0} tasks done`, trend: completionRate >= 50 ? 'up' as const : 'down' as const, icon: React.createElement(TrendingUp, { className: "w-5 h-5" }), gradient: '#10B981' },
    ];

    return {
      tasks: tasksList,
      projects: projectsList,
      issues: issuesList,
      summary: summaryObj,
      recentProjects: recProjects,
      taskStatusData: taskStatus,
      phaseStatusData: phaseStatus,
      issueSeverityData: issueSeverity,
      projectTaskProgressData: activeProjectsWithTasks,
      kpiCards: kpiDefs
    };
  }, [summaryData, tasksRes, projectsRes, issuesRes]);

  return { loading, ...dashboardState };
}
