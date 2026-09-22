import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Search, AlertCircle, AlertTriangle, CheckCircle, Clock, Download, Plus, Upload, Columns, List as ListIcon, X } from 'lucide-react';
import { useIssues, useUpdateIssue, useDeleteIssue, useActiveIssueAssignees } from '../../hooks/useIssues';
import { useMasterLookups } from '@/features/masters/hooks/useMasters';
import { useProjects, useProjectMembers } from '@/features/projects/hooks/useProjects';
import { useFilters } from '@/hooks/useFilters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { exportToCSV } from '@/utils/export';
import { statusStr } from '@/utils/statusHelpers';
import { LazyParams } from '@/components/data-display/DataTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { IssueListTable } from '../ui/IssueListTable';
import { IssuesKanbanBoard } from '../ui/IssuesKanbanBoard';
import { issuesService } from '../../api/issues.api';
import { InputText } from 'primereact/inputtext';
import { useDebounce } from '@/hooks/useDebounce';

export function IssuesListView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState<'list' | 'kanban'>('list');
  const initialFirst = Number(searchParams.get('first')) || 0;
  const initialRows = Number(searchParams.get('rows')) || 20;
  const [lazyParams, setLazyParams] = useState<LazyParams>({ first: initialFirst, rows: initialRows, page: Math.floor(initialFirst / initialRows) });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<number | undefined>(undefined);

  const {
    selectedFilters, handleFilterChange, clearFilters, hasActiveFilters,
  } = useFilters();

  const queryParams = useMemo(() => {
    let sort_by = undefined;
    if (sortField) {
        const field = sortField.replace('_master.label', '_id');
        sort_by = `${field}:${sortOrder === 1 ? 'asc' : 'desc'}`;
    }
    let assigneeFilter = selectedFilters.assignee;
    if (user?.role?.name === 'Employee') {
        assigneeFilter = selectedFilters.assignee?.length ? selectedFilters.assignee : [user.email];
    }

    return {
        skip: lazyParams.first,
        limit: lazyParams.rows,
        status_id: selectedFilters.status?.map(Number),
        severity_id: selectedFilters.priority?.map(Number),
        project_id: selectedFilters.project?.length ? Number(selectedFilters.project[0]) : undefined,
        assignee_email: assigneeFilter,
        search: debouncedSearch || undefined,
        sort_by: sort_by,
    };
  }, [lazyParams, selectedFilters, debouncedSearch, sortField, sortOrder]);

  const { data, isLoading, refetch } = useIssues(queryParams);
  const issues = data?.items ?? [];
  const totalRecords = data?.total ?? 0;

  const { data: statuses = [] } = useMasterLookups('IssueStatus');
  const { data: priorities = [] } = useMasterLookups('IssueSeverity');
  const { data: activeAssignees = [] } = useActiveIssueAssignees();

  const { data: projectsData } = useProjects({ limit: 20 });
  const allProjects = Array.isArray(projectsData) ? projectsData : (projectsData as any)?.items || [];

  const selectedProjectId = selectedFilters.project?.length ? Number(selectedFilters.project[0]) : null;
  const { data: projectMembersData } = useProjectMembers(selectedProjectId);

  let assigneeOptions = activeAssignees;
  if (selectedProjectId && Array.isArray(projectMembersData)) {
      assigneeOptions = projectMembersData.map((m: any) => m.user).filter(Boolean);
  }

  const filterGroups = [
    {
      id: 'project',
      label: 'Project',
      options: allProjects.map((p: any) => ({ label: p.project_name, value: p.id.toString() }))
    },
    {
      id: 'status',
      label: 'Status',
      options: statuses.map((s: any) => ({ label: s.label || s.name, value: s.id.toString() })),
    },
    {
      id: 'priority',
      label: 'Severity / Priority',
      options: priorities.map((p: any) => ({ label: p.label || p.name, value: p.id.toString() })),
    },
    {
      id: 'assignee',
      label: 'Assignee',
      options: assigneeOptions.map((u: any) => ({
        label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        value: u.email,
      })),
    },
  ];

  const handleKanbanDrop = async (issueId: number, newStatus: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (issue && issue.status !== newStatus) {
      try {
        await issuesService.updateIssue(issueId, { status: newStatus });
        refetch();
      } catch (err) {
        console.error('Failed to update issue status via DnD', err);
      }
    }
  };

  const handleExport = async () => {
    try {
      await issuesService.exportIssuesCSV(queryParams);
    } catch (err) {
      console.error('Failed to export issues', err);
    }
  };

  const statsProps: StatCardProps[] = useMemo(() => {
    const sc = (data as any)?.status_counts || { active: 0, completed: 0 };
    
    const total = data?.total ?? 0;
    // We map 'active' to 'open' / 'in progress' visually, 
    // but we can just show Active and Completed to match other screens if needed.
    // The previous design had Open, In Progress, Closed. 
    // We will show Active and Completed since that perfectly matches the filtered data.
    const active = sc.active ?? 0;
    const completed = sc.completed ?? 0;

    return [
      { label: 'Total Defects', value: total, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
      { label: 'Active', value: active, icon: <AlertCircle size={18} strokeWidth={2} />, accentVariant: 'rose' },
      { label: 'Completed', value: completed, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
    ];
  }, [data]);

  return (
    <EntityPageTemplate
      title="Defects"
      stats={statsProps}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      loading={isLoading}
      utilityBarExtra={null}
      headerActions={
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as 'list' | 'kanban')}
            options={[
              { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
              { label: 'Kanban', value: 'kanban', icon: <Columns size={13} strokeWidth={2.5} /> },
            ]}
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="!w-9 !h-9 !p-0 !rounded-xl"
            tooltip="Export CSV"
          >
            <Download size={15} strokeWidth={2.5} />
          </Button>
          {can.createIssue(user?.role) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/issues/import')}
              className="!w-9 !h-9 !p-0 !rounded-xl"
              tooltip="Import CSV"
            >
              <Upload size={15} strokeWidth={2.5} />
            </Button>
          )}
          {can.createIssue(user?.role) && (
            <Button
              onClick={() => navigate('/issues/create')}
              size="sm"
              className="shadow-brand-teal-500/25 ml-2"
            >
              <Plus size={15} /> Report Defect
            </Button>
          )}
        </div>
      }
    >
      {view === 'list' ? (
        <div className="h-full flex flex-col min-h-0">
          {isLoading && !data ? (
            <div className="p-4"><TableSkeleton rows={6} columns={8} /></div>
          ) : issues.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle />}
              title="No defects found"
              description={hasActiveFilters || search ? "Try adjusting your filters or search to see more defects." : "All clear! No defects reported."}
              action={(!hasActiveFilters && !search) && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/issues/create')}
                  className="!h-10 !px-4"
                >
                  <Plus size={15} /> Report Defect
                </Button>
              )}
            />
          ) : (
            <IssueListTable
              issues={issues}
              totalRecords={totalRecords}
              lazy={true}
              paginator={true}
              onPage={(e: any) => {
                setLazyParams(e);
                const newParams = new URLSearchParams(searchParams);
                newParams.set('first', e.first.toString());
                newParams.set('rows', e.rows.toString());
                setSearchParams(newParams, { replace: true });
              }}
              first={lazyParams.first}
              rows={lazyParams.rows}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={(e: any) => {
                  setSortField(e.sortField);
                  setSortOrder(e.sortOrder);
              }}
              onRowClick={(issue) => navigate(`/issues/${issue.id}`, { state: { from: location.pathname + location.search } })}
              loading={isLoading}
            />
          )}
        </div>
      ) : (
        <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
          {issues.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle />}
              title="Empty Board"
              description={hasActiveFilters || search ? "No defects match your filters or search." : "Your board is currently clean — no defects!"}
            />
          ) : (
            <IssuesKanbanBoard
              issues={issues}
              statuses={statuses}
              onDrop={(issueId: number, newStatus: string) => handleKanbanDrop(issueId, newStatus)}
            />
          )}
        </div>
      )}
    </EntityPageTemplate>
  );
}
