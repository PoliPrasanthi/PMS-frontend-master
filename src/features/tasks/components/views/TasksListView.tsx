import { DropdownSelect } from "@/components/forms/DropdownSelect";
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Search, Plus, Download, Upload, Layers, CheckCircle, Clock, AlertTriangle, Columns, List as ListIcon, X } from 'lucide-react';
import { TaskListTable } from '../ui/TaskListTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { TaskKanbanBoard } from '../ui/TaskKanbanBoard';
import { tasksService, Task } from '@/api/services/tasks.service';
import { timelogsService, TimeLog } from '@/api/services/timelogs.service';
import { exportToCSV } from '@/utils/export';
import { useTasks, useDeleteTask, useActiveTaskAssignees } from '@/features/tasks/hooks/useTasks';
import { useProjects, useProjectMembers } from '@/features/projects/hooks/useProjects';
import { useMasterLookups } from '@/features/masters/hooks/useMasters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { statusStr } from '@/utils/statusHelpers';
import { tasklistsService, TaskList } from '@/api/services/tasklists.service';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { InputText } from 'primereact/inputtext';
import { LazyParams } from '@/components/data-display/DataTable';

export function TasksListView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();

    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [groupBy, setGroupBy] = useState<'none' | 'tasklist' | 'project'>('tasklist');
    
    const initialFirst = Number(searchParams.get('first')) || 0;
    const initialRows = Number(searchParams.get('rows')) || 20;
    const [lazyParams, setLazyParams] = useState<LazyParams>({ first: initialFirst, rows: initialRows, page: Math.floor(initialFirst / initialRows) });
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const [sortMeta, setSortMeta] = useState<any[]>([]);

    const {
        selectedFilters, handleFilterChange, clearFilters, hasActiveFilters,
    } = useFilters();

    const queryParams = useMemo(() => {
        let sort_by = groupBy !== 'none' ? groupBy : undefined;
        let columnSort = '';
        if (sortMeta.length > 0) {
            const firstSort = sortMeta.find(m => m.field !== '_group_identity');
            if (firstSort) {
                const field = firstSort.field.replace('_master.label', '_id'); 
                columnSort = `${field}:${firstSort.order === 1 ? 'asc' : 'desc'}`;
            }
        }

        if (sort_by && columnSort) {
            sort_by = `${sort_by},${columnSort}`;
        } else if (!sort_by && columnSort) {
            sort_by = columnSort;
        }

        return {
            skip: lazyParams.first,
            limit: lazyParams.rows,
            sort_by: sort_by,
            status_id: selectedFilters.status?.map(Number),
            priority_id: selectedFilters.priority?.map(Number),
            assignee_email: selectedFilters.assignee,
            project_id: selectedFilters.project?.length ? Number(selectedFilters.project[0]) : undefined,
            search: debouncedSearch || undefined,
            overdue_only: selectedFilters.timeline?.includes('overdue') ? true : undefined,
        };
    }, [lazyParams, selectedFilters, debouncedSearch, groupBy, sortMeta]);

    const { data: tasksResponse, isLoading: loadingTasks, refetch } = useTasks(queryParams);

    let tasks: Task[] = tasksResponse?.items || [];
    let totalRecords: number = tasksResponse?.total || 0;

    if (selectedFilters.timeline?.includes('overdue')) {
        // Overdue filtering is now handled by the backend API via the overdue_only parameter
    }

    const { data: statusesData } = useMasterLookups('TaskStatus');
    const { data: prioritiesData } = useMasterLookups('TaskPriority');
    const { data: activeAssigneesData } = useActiveTaskAssignees();

    const statuses = Array.isArray(statusesData) ? statusesData : (statusesData as any)?.items || [];
    const priorities = Array.isArray(prioritiesData) ? prioritiesData : (prioritiesData as any)?.items || [];
    const activeAssignees = Array.isArray(activeAssigneesData) ? activeAssigneesData : (activeAssigneesData as any)?.items || [];

    const { data: projectsData } = useProjects({ limit: 20 });
    const allProjects = Array.isArray(projectsData) ? projectsData : (projectsData as any)?.items || [];

    const selectedProjectId = selectedFilters.project?.length ? Number(selectedFilters.project[0]) : null;
    const { data: projectMembersData } = useProjectMembers(selectedProjectId);
    
    let assigneeOptions = activeAssignees;
    if (selectedProjectId && Array.isArray(projectMembersData)) {
        // Collect users from members + we could also include owner if needed, but members usually includes them.
        assigneeOptions = projectMembersData.map((m: any) => m.user).filter(Boolean);
    }

    const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);

    useEffect(() => {
        timelogsService.getTimelogs(0, 20).then(res => setTimelogs(res.items || [])).catch(console.error);
        tasklistsService.getTaskLists(undefined, 0, 100).then(res => setTaskLists(res.items || [])).catch(console.error);
    }, []);

    const filterGroups = [
        { id: 'timeline', label: 'Timeline', options: [{ label: 'Overdue Only', value: 'overdue' }] },
        { id: 'project', label: 'Project', options: allProjects.map((p: any) => ({ label: p.project_name, value: p.id.toString() })) },
        { id: 'status', label: 'Status', options: statuses.map((s: any) => ({ label: s.label || s.name, value: s.id.toString() })) },
        { id: 'priority', label: 'Priority', options: priorities.map((p: any) => ({ label: p.label || p.name, value: p.id.toString() })) },
        { id: 'assignee', label: 'Task Owner', options: assigneeOptions.map((u: any) => ({ label: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email, value: u.email })) },
    ];

    const statsProps: StatCardProps[] = useMemo(() => {
        if (loadingTasks && !tasksResponse) return [];
        
        const sc = (tasksResponse as any)?.status_counts || { active: 0, completed: 0 };
        const counts = { 
            total: totalRecords, 
            active: sc.active || 0, 
            completed: sc.completed || 0,
            overdue: 0 
        };

        tasks.forEach((t: any) => {
            const s = statusStr(t.status_master ?? t.status);
            const isDone = ['completed', 'closed', 'done'].includes(s);
            if (!isDone && t.due_date) {
                const dueDate = new Date(t.due_date);
                dueDate.setHours(23, 59, 59, 999);
                if (dueDate < new Date()) counts.overdue++;
            }
        });

        return [
            { label: 'Total Tasks', value: counts.total, icon: <Layers size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Active', value: counts.active, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Completed', value: counts.completed, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
            {
                label: 'Overdue',
                value: counts.overdue,
                icon: <AlertTriangle size={18} strokeWidth={2} />,
                accentVariant: 'rose'
            },
        ];
    }, [tasks, tasksResponse, loadingTasks, totalRecords]);

    const handleExport = async () => {
        try {
            await tasksService.exportTasksCSV(queryParams);
        } catch (err) {
            console.error('Failed to export tasks', err);
        }
    };

    return (
        <EntityPageTemplate
            title="Tasks"
            stats={statsProps}
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={Object.values(selectedFilters).flat().length}
            loading={loadingTasks}
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
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[13px] font-medium whitespace-nowrap">Group by:</span>
                        <SegmentedControl
                            value={groupBy}
                            onChange={(v) => setGroupBy(v as 'none' | 'tasklist' | 'project')}
                            options={[
                                { label: 'None', value: 'none' },
                                { label: 'Task List', value: 'tasklist' },
                                { label: 'Project', value: 'project' },
                            ]}
                        />
                    </div>
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
                    {can.createTask(user?.role) && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/tasks/import')}
                            className="!w-9 !h-9 !p-0 !rounded-xl"
                            tooltip="Import CSV"
                        >
                            <Upload size={15} strokeWidth={2.5} />
                        </Button>
                    )}
                    {can.manageTaskLists(user?.role) && (
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/tasklists/create')}
                            className="!h-9 !px-4 !rounded-lg ml-1"
                        >
                            <Layers size={15} /> Add Task List
                        </Button>
                    )}
                    {can.createTask(user?.role) && (
                        <Button
                            variant="primary"
                            onClick={() => navigate('/tasks/create')}
                            className="!h-9 !px-4 !rounded-lg ml-1"
                        >
                            <Plus size={15} /> Add Task
                        </Button>
                    )}
                </div>
            }
            utilityBarExtra={null}
        >
            {view === 'list' ? (
                <div className="h-full flex flex-col min-h-0">
                    {loadingTasks && !tasksResponse ? (
                        <div className="p-4 h-full overflow-hidden">
                            <TableSkeleton rows={10} columns={8} />
                        </div>
                    ) : tasks.length === 0 ? (
                        <EmptyState
                            icon={<Layers />}
                            title="No tasks found"
                            description={hasActiveFilters || search ? "Try adjusting your filters or search to see more tasks." : "No tasks have been created yet. Start by creating a task."}
                            action={(!hasActiveFilters && !search) && <Button variant="primary" onClick={() => navigate('/tasks/create')} className="!h-10 !px-5 !rounded-lg"><Plus size={15} /> New Task</Button>}
                        />
                    ) : (
                        <TaskListTable
                            tasks={tasks}
                            timelogs={timelogs}
                            taskLists={taskLists}
                            canRename={can.manageTaskLists(user?.role)}
                            onRowClick={(task) => navigate(`/tasks/${task.id}`, { state: { from: location.pathname + location.search } })}
                            groupBy={groupBy}
                            onTaskListRenamed={() => refetch()}
                            loading={loadingTasks}
                            lazy={true}
                            paginator={true}
                            totalRecords={totalRecords}
                            onPage={(e: any) => {
                                setLazyParams(e);
                                const newParams = new URLSearchParams(searchParams);
                                newParams.set('first', e.first.toString());
                                newParams.set('rows', e.rows.toString());
                                setSearchParams(newParams, { replace: true });
                            }}
                            first={lazyParams.first}
                            rows={lazyParams.rows}
                            onSortChange={(meta) => setSortMeta(meta)}
                        />
                    )}
                </div>
            ) : (
                <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    {tasks.length === 0 ? (
                        <EmptyState
                            icon={<Layers />}
                            title="Board is empty"
                            description={hasActiveFilters || search ? "No tasks match your filters or search." : "Ready for action! There are no tasks on the board yet."}
                        />
                    ) : (
                        <TaskKanbanBoard tasks={tasks} />
                    )}
                </div>
            )}
        </EntityPageTemplate>
    );
}
