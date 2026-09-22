import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState as EmptyStateComp } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Search, Plus, FolderKanban, CheckCircle, Clock, Download, LayoutGrid, List as ListIcon, AlertTriangle, X } from 'lucide-react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { exportToCSV } from '@/utils/export';
import { projectsService, Project } from '@/features/projects/api/projects.api';
import { statusStr } from '@/utils/statusHelpers';
import { ProjectListTable } from '../ui/ProjectListTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { useMasterLookups, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useFilters } from '@/hooks/useFilters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { ProjectKanbanBoard } from '../ui/ProjectKanbanBoard';
import { useDebounce } from '@/hooks/useDebounce';
import { InputText } from 'primereact/inputtext';
import { LazyParams } from '@/components/data-display/DataTable';

export function ProjectsListView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Active Projects');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  
  const initialFirst = Number(searchParams.get('first')) || 0;
  const initialRows = Number(searchParams.get('rows')) || 20;
  const [lazyParams, setLazyParams] = useState<LazyParams>({ first: initialFirst, rows: initialRows, page: Math.floor(initialFirst / initialRows) });
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [multiSortMeta, setMultiSortMeta] = useState<any[]>([]);

  const {
    selectedFilters, handleFilterChange, clearFilters, hasActiveFilters,
  } = useFilters();

  const { data: allUsersData } = useUsersDropdown();
  const { data: statusesData } = useMasterLookups('ProjectStatus');
  const { data: prioritiesData } = useMasterLookups('TaskPriority');
  const { data: projectTypesData } = useMasterLookups('ProjectType');
  const { data: billingModelsData } = useMasterLookups('ProjectBillingModel');

  const allUsers = Array.isArray(allUsersData) ? allUsersData : (allUsersData as any)?.items || [];
  const statuses = Array.isArray(statusesData) ? statusesData : (statusesData as any)?.items || [];
  const priorities = Array.isArray(prioritiesData) ? prioritiesData : (prioritiesData as any)?.items || [];
  const projectTypes = Array.isArray(projectTypesData) ? projectTypesData : (projectTypesData as any)?.items || [];
  const billingModels = Array.isArray(billingModelsData) ? billingModelsData : (billingModelsData as any)?.items || [];

  const queryParams = useMemo(() => ({
    skip: lazyParams.first,
    limit: lazyParams.rows,
    status_id: selectedFilters.status?.map(Number),
    priority_id: selectedFilters.priority?.map(Number),
    manager_emails: selectedFilters.manager,
    search: debouncedSearch || undefined,
    is_template: activeTab === 'Project Templates' ? true : false,
    is_archived: false,
    sort_by: multiSortMeta.length > 0
        ? multiSortMeta.map((s: any) => `${s.order === -1 ? '-' : ''}${s.field}`).join(',')
        : undefined,
  }), [lazyParams, selectedFilters, debouncedSearch, activeTab, multiSortMeta]);

  const { data: projectsData, isLoading } = useProjects(queryParams);
  // Note: completion_percentage is now provided by the server in the project object
  const allTasks: any[] = [];

  const rawProjects: Project[] = Array.isArray(projectsData) ? projectsData : (projectsData as any)?.items || [];

  const projects = useMemo(() => {
    return rawProjects.filter(p => {
      if (selectedFilters.project_type && selectedFilters.project_type.length > 0) {
        if (!selectedFilters.project_type.includes(p.project_type as never)) return false;
      }
      if (selectedFilters.billing_model && selectedFilters.billing_model.length > 0) {
        if (!selectedFilters.billing_model.includes(p.billing_model as never)) return false;
      }
      return true;
    });
  }, [rawProjects, selectedFilters]);

  const totalRecords: number = (projectsData as any)?.total || projects.length;

  const tabs = ['Active Projects'];

  const uniqueProjectTypes = Array.from(new Set(rawProjects.map(p => p.project_type).filter(Boolean)));
  const uniqueBillingModels = Array.from(new Set(rawProjects.map(p => p.billing_model).filter(Boolean)));

  const managerOptions = useMemo(() => {
    const pmEmails = new Set(rawProjects.map(p => p.project_manager?.email).filter(Boolean));
    const pmIds = new Set(rawProjects.map(p => p.project_manager_id).filter(Boolean));
    return allUsers
      .filter(u => 
        u.role_id === 3 || 
        u.role?.name === 'Project Manager' || 
        (u.job_title && u.job_title.toLowerCase().includes('project manager')) ||
        pmEmails.has(u.email) ||
        pmIds.has(u.id)
      )
      .map(u => ({ label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email, value: u.email }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allUsers, rawProjects]);

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map(s => ({ label: s.label || s.name, value: s.id.toString() })),
    },
    { id: 'priority', label: 'Priority', options: priorities.map(p => ({ label: p.label || p.name, value: p.id.toString() })) },
    { id: 'manager', label: 'Project Manager', options: managerOptions },
    ...(projectTypes.length > 0 || uniqueProjectTypes.length > 0
      ? [{
          id: 'project_type',
          label: 'Project Type',
          options: projectTypes.length > 0
            ? projectTypes.map((t: any) => ({ label: t.label || t.name, value: t.label || t.name }))
            : uniqueProjectTypes.map(t => ({ label: t as string, value: t as string }))
        }]
      : []),
    ...(billingModels.length > 0 || uniqueBillingModels.length > 0
      ? [{
          id: 'billing_model',
          label: 'Billing Model',
          options: billingModels.length > 0
            ? billingModels.map((b: any) => ({ label: b.label || b.name, value: b.label || b.name }))
            : uniqueBillingModels.map(b => ({ label: b as string, value: b as string }))
        }]
      : []),
  ];

  const statsProps = useMemo(() => {
    if (isLoading && !projectsData) return [];

    const sc = (projectsData as any)?.status_counts || { active: 0, completed: 0, planning: 0 };
    const counts = {
      total: totalRecords,
      active: sc.active || 0,
      completed: sc.completed || 0,
      planning: sc.planning || 0
    };

    return [
      { label: 'Total Visible', value: counts.total, icon: <FolderKanban size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Active', value: counts.active, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Completed', value: counts.completed, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Planning', value: counts.planning, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
    ] as StatCardProps[];
  }, [projectsData, isLoading, totalRecords]);

  const handleExport = async () => {
    try {
      await projectsService.exportProjectsCSV(queryParams);
    } catch (err) {
      console.error('Failed to export projects', err);
    }
  };

  return (
    <EntityPageTemplate
      title="Projects"
      stats={statsProps}
      tabs={tabs.length > 1 ? tabs : undefined}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      getTabCount={(tab) => tab === activeTab ? totalRecords : '—'}
      loading={isLoading}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      utilityBarExtra={null}
      headerActions={
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as 'list' | 'kanban')}
            options={[
              { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
              { label: 'Kanban', value: 'kanban', icon: <LayoutGrid size={13} strokeWidth={2.5} /> },
            ]}
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="!w-9 !h-9 !p-0 !rounded-xl"
            title="Export CSV"
          >
            <Download size={15} strokeWidth={2.5} />
          </Button>
          {can.createProject(user?.role) && (
            <Button
              onClick={() => navigate('/projects/create')}
              size="sm"
              className="shadow-brand-teal-500/25 ml-2"
            >
              <Plus size={15} /> New Project
            </Button>
          )}
        </div>
      }
    >
      {view === 'kanban' ? (
        <ProjectKanbanBoard projects={projects} />
      ) : (
        <div className="h-full flex flex-col min-h-0">
          {isLoading && !projectsData ? (
            <div className="p-4 h-full"><TableSkeleton rows={6} columns={8} /></div>
          ) : projects.length === 0 ? (
            <EmptyStateComp
              icon={<FolderKanban />}
              title="No projects found"
              description={hasActiveFilters || search ? "Try adjusting your filters or search to see more projects." : "Get started by creating your first project."}
              action={(!hasActiveFilters && !search) && (
                <Button variant="primary" onClick={() => navigate('/projects/create')} className="!h-10 !px-5"><Plus size={15} /> New Project</Button>
              )}
            />
          ) : (
            <ProjectListTable
              projects={projects}
              loading={isLoading}
              lazy={true}
              paginator={true}
              totalRecords={totalRecords}
              onPage={(e) => {
                setLazyParams(e);
                const newParams = new URLSearchParams(searchParams);
                newParams.set('first', e.first.toString());
                newParams.set('rows', e.rows.toString());
                setSearchParams(newParams, { replace: true });
              }}
              first={lazyParams.first}
              rows={lazyParams.rows}
              multiSortMeta={multiSortMeta}
              onSortChange={setMultiSortMeta}
            />
          )}
        </div>
      )}
    </EntityPageTemplate>
  );
}
