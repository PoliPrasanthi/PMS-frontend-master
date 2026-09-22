import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { StatCardProps } from '@/components/data-display/StatCard';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { Plus, Milestone as MilestoneIcon, CheckCircle, Clock, AlertCircle, Columns, List as ListIcon } from 'lucide-react';
import { milestonesService, Milestone } from '@/features/milestones/api/milestones.api';
import { MilestonesKanbanView } from '@/features/milestones/components/ui/MilestonesKanbanView';
import { useMilestoneActions } from '../hooks/useMilestoneActions';
import { format, parseISO, isPast, isValid } from 'date-fns';
import { statusStr, statusName } from '@/utils/statusHelpers';
import { calculateDaysLeft } from '@/utils/dateHelpers';
import { useToast } from '@/providers/ToastContext';
import { ConfirmationModal } from '@/components/core/ConfirmationModal';
import { LazyParams } from '@/components/data-display/DataTable';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';

const TEAL = 'hsl(160 60% 45%)';

const STATUS_MAP: Record<string, { bg: string; color: string; dot: string }> = {
    'active': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    'completed': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    'overdue': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'on hold': { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
};

const PRIORITY_MAP: Record<string, { bg: string; color: string }> = {
    'critical': { bg: '#fee2e2', color: '#ef4444' },
    'high': { bg: '#ffedd5', color: '#f97316' },
    'medium': { bg: '#fef9c3', color: '#854d0e' },
    'low': { bg: '#f0fdf4', color: '#166534' },
};

function PriorityBadge({ priority }: { priority: any }) {
    let label = 'Medium';
    if (typeof priority === 'string' && priority) {
        label = priority;
    } else if (priority && typeof priority === 'object') {
        label = priority.label || priority.name || 'Medium';
    } else if (typeof priority === 'number') {
        if (priority === 1) label = 'Low';
        else if (priority === 2) label = 'Medium';
        else if (priority === 3) label = 'High';
        else if (priority === 4) label = 'Critical';
    }

    const pStr = String(label).toLowerCase();
    const cfg = PRIORITY_MAP[pStr] || { bg: '#f3f4f6', color: '#374151' };

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
            {label}
        </span>
    );
}


function StatusBadge({ status }: { status?: any }) {
    const displayName = statusName(status) || (typeof status === 'string' && status ? status : (status?.label || status?.name || status?.value || 'Active'));
    const key = String(displayName).toLowerCase();
    const cfg = STATUS_MAP[key];
    const customColor = typeof status === 'object' && status?.color && status.color.startsWith('#') ? status.color : null;
    const dotColor = customColor || cfg?.dot || '#0CD1C3';
    const textColor = customColor || cfg?.color || '#0f766e';
    const bgColor = customColor ? `${customColor}18` : (cfg?.bg || '#f0fdfa');
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: bgColor, color: textColor }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
            {displayName}
        </span>
    );
}

function OwnerCell({ owner }: { owner?: any }) {
    if (!owner || (typeof owner === 'object' && !owner.first_name && !owner.last_name && !owner.name && !owner.display_name && !owner.username && !owner.email)) {
        return (
            <div className="flex items-center gap-1.5">
                <Avatar label="?" size="normal" shape="circle"
                    style={{
                        width: 24, height: 24, fontSize: 9, fontWeight: 700,
                        background: 'var(--bg-secondary)', color: 'var(--text-muted)'
                    }} />
                <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
            </div>
        );
    }
    const name = typeof owner === 'string' ? owner : (`${owner.first_name ?? ''} ${owner.last_name ?? ''}`.trim() || owner.name || owner.display_name || owner.username || owner.email || 'Assigned');
    const initials = name !== 'Assigned' ? `${name[0] ?? ''}${name.split(' ')[1]?.[0] ?? ''}`.toUpperCase() : 'U';
    return (
        <div className="flex items-center gap-1.5">
            <Avatar label={initials || '?'} size="normal" shape="circle"
                style={{
                    width: 24, height: 24, fontSize: 9, fontWeight: 700,
                    background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff'
                }} />
            <span className="text-[12px] font-medium truncate max-w-[140px]"
                style={{ color: 'var(--text-primary)' }} title={name}>{name}</span>
        </div>
    );
}

function DateCell({ date, warnIfPast, isStartDate }: { date?: string | null; warnIfPast?: boolean; isStartDate?: boolean }) {
    if (!date) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
    try {
        const d = parseISO(date);
        if (!isValid(d)) return <span style={{ fontSize: 12 }}>{date}</span>;

        const diffDays = calculateDaysLeft(date) ?? 0;
        const overdue = warnIfPast && diffDays < 0;

        return (
            <div>
                <span className="text-[12px] font-semibold tabular-nums"
                    style={{ color: overdue ? '#ef4444' : 'var(--text-primary)' }}>
                    {format(d, 'MM-dd-yyyy')}
                </span>
                {overdue && (
                    <span className="block text-[10px]" style={{ color: '#ef4444' }}>
                        ({Math.abs(diffDays)} days overdue)
                    </span>
                )}
                {!overdue && diffDays > 0 && (
                    <span className="block text-[10px]" style={{ color: isStartDate ? '#0ea5e9' : '#f59e0b' }}>
                        ({isStartDate ? `starts in ${diffDays} days` : `${diffDays} days left`})
                    </span>
                )}
                {!overdue && diffDays === 0 && (
                    <span className="block text-[10px]" style={{ color: '#14b8a6' }}>
                        ({isStartDate ? 'starts today' : 'due today'})
                    </span>
                )}
            </div>
        );
    } catch { return <span style={{ fontSize: 12 }}>{date}</span>; }
}

function CountBadge({ count, total, color, label = 'tasks' }: { count: number; total?: number; color: string; label?: string }) {
    if (count === 0) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>0</span>;
    return (
        <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold tabular-nums" style={{ color }}>{count}</span>
            {total != null && total > 0 && (
                <div className="flex-1 min-w-[40px] h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full"
                        style={{ width: `${Math.round((count / total) * 100)}%`, background: color }} />
                </div>
            )}
        </div>
    );
}

export function MilestonesList() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    
    const initialFirst = Number(searchParams.get('first')) || 0;
    const initialRows = Number(searchParams.get('rows')) || 20;
    const [lazyParams, setLazyParams] = useState<LazyParams>({ first: initialFirst, rows: initialRows, page: Math.floor(initialFirst / initialRows) });
    const [loading, setLoading] = useState(true);
    const { deleteMilestone } = useMilestoneActions();
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

    // task_count and issue_count are provided by the backend on each milestone object
    const allTasks: any[] = [];

    const milestonesWithPct = useMemo(() => {
        return milestones.map(m => ({
            ...m,
            // Use server-provided counts; fall back to 0
            completion_percentage: (m as any).completion_percentage ?? 0,
        }));
    }, [milestones]);

    const filterGroups = useMemo(() => {
        const statuses = Array.from(
            new Set(milestonesWithPct.map((m: any) => statusName(m.status_master ?? m.status)).filter(Boolean))
        ).map(s => ({ label: s as string, value: s as string }));

        const priorities = Array.from(
            new Set(milestonesWithPct.map((m: any) => {
                const p = m.priority_master ?? m.priority;
                return typeof p === 'string' ? p : p?.name ?? p?.label;
            }).filter(Boolean))
        ).map(p => ({ label: p as string, value: p as string }));

        const projects = Array.from(
            new Map(
                milestonesWithPct
                    .filter((m: any) => m.project)
                    .map((m: any) => [m.project.id, m.project?.project_name ?? m.project?.name ?? String(m.project.id)])
            ).entries()
        ).map(([value, label]) => ({ label: label as string, value: String(value) }));

        return [
            { id: 'status', label: 'Status', options: statuses },
            { id: 'priority', label: 'Priority', options: priorities },
            ...(projects.length > 0 ? [{ id: 'project', label: 'Project', options: projects }] : []),
        ];
    }, [milestonesWithPct]);

    const filteredMilestones = useMemo(() => {
        return milestonesWithPct.filter((m: any) => {
            const statusFilters = selectedFilters.status ?? [];
            if (statusFilters.length > 0) {
                const msStatus = statusName(m.status_master ?? m.status) ?? '';
                if (!statusFilters.includes(msStatus)) return false;
            }

            const priorityFilters = selectedFilters.priority ?? [];
            if (priorityFilters.length > 0) {
                const p = m.priority_master ?? m.priority;
                const pName = typeof p === 'string' ? p : p?.name ?? p?.label ?? '';
                if (!priorityFilters.includes(pName)) return false;
            }

            const projectFilters = selectedFilters.project ?? [];
            if (projectFilters.length > 0) {
                if (!m.project || !projectFilters.includes(String(m.project.id))) return false;
            }

            return true;
        });
    }, [milestonesWithPct, selectedFilters]);

    const hasActiveFilters = Object.values(selectedFilters).some(v => v.length > 0);
    const activeFilterCount = Object.values(selectedFilters).flat().length;

    const handleFilterChange = (groupId: string, values: string[]) => {
        setSelectedFilters(prev => ({ ...prev, [groupId]: values }));
    };

    const handleClearFilters = () => setSelectedFilters({});

    useEffect(() => { fetchMilestones(); }, [lazyParams]);

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDeleteNow = async () => {
        if (deleteId) {
            try {
                await deleteMilestone.mutateAsync(deleteId);
                fetchMilestones();
            } catch { } finally {
                setDeleteId(null);
            }
        }
    };

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            const data = await milestonesService.getMilestones(undefined, lazyParams.first, lazyParams.rows);
            setMilestones(data.items || []);
            setTotalRecords(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch milestones:', err);
        } finally {
            setLoading(false);
        }
    };

    const statsProps: StatCardProps[] = useMemo(() => {
        if (loading) return [];
        const completed = milestonesWithPct.filter((m: any) => statusStr(m.status) === 'completed').length;
        const active = milestonesWithPct.filter((m: any) => statusStr(m.status) === 'active').length;
        const overdue = milestonesWithPct.filter((m: any) => {
            if (!m.end_date) return false;
            return isPast(parseISO(m.end_date)) && statusStr(m.status) !== 'completed';
        }).length;
        return [
            { label: 'Total Server Records', value: totalRecords, icon: <MilestoneIcon size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Active', value: active, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
            { label: 'Completed', value: completed, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Overdue', value: overdue, icon: <AlertCircle size={18} strokeWidth={2} />, accentVariant: 'amber' },
        ];
    }, [milestonesWithPct, loading]);

    return (
        <EntityPageTemplate
            title="Milestones"
            stats={statsProps}
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
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
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1" />
                    {can.manageMilestones(user?.role) && (
                        <Button
                            variant="primary"
                            onClick={() => navigate('/milestones/create')}
                            className="!h-9 !px-4 ml-2"
                        >
                            <Plus size={15} /> Add Milestone
                        </Button>
                    )}
                </div>
            }
        >
            {loading ? (
                <div className="p-4"><TableSkeleton rows={6} columns={8} /></div>
            ) : view === 'kanban' ? (
                <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    <MilestonesKanbanView milestones={milestonesWithPct as any} onUpdate={fetchMilestones} />
                </div>
            ) : (
                <div className="w-full h-full overflow-auto">
                    <DataTable
                        value={filteredMilestones}
                        dataKey="id"
                        showGridlines
                        stripedRows
                        resizableColumns
                        columnResizeMode="fit"
                        lazy
                        paginator
                        first={lazyParams.first}
                        rows={lazyParams.rows}
                        totalRecords={totalRecords}
                        onPage={(e: any) => {
                            setLazyParams(e);
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('first', e.first.toString());
                            newParams.set('rows', e.rows.toString());
                            setSearchParams(newParams, { replace: true });
                        }}
                        scrollable
                        scrollHeight="flex"
                        size="small"
                        rowClassName={() => 'hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors cursor-pointer'}
                        onRowClick={(e) => navigate(`/milestones/${(e.data as any).id}`, { state: { from: location.pathname + location.search } })}
                        emptyMessage={
                            <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                                <span className="text-4xl">🏁</span>
                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No milestones yet</p>
                            </div>
                        }
                        style={{ fontSize: 13 }}
                    >
                        { }
                        <Column
                            field="title"
                            header="Milestone Name"
                            sortable
                            style={{ minWidth: '200px' }}
                            body={(r) => (
                                <span className="text-[13px] font-semibold block truncate max-w-[150px] sm:max-w-[250px]"
                                    style={{ color: 'var(--text-primary)' }}
                                    title={r.milestone_name}>
                                    {r.milestone_name}
                                </span>
                            )}
                        />

                        { }
                        <Column
                            field="project"
                            header="Project"
                            sortable
                            style={{ minWidth: '140px' }}
                            body={(r) => (
                                <span className="text-[12px] font-medium truncate block max-w-[160px]"
                                    style={{ color: TEAL }}>
                                    {r.project?.name ?? r.project?.project_name ?? '—'}
                                </span>
                            )}
                        />

                        { }
                        <Column
                            field="completion_percentage"
                            header="%"
                            sortable
                            style={{ width: '100px', minWidth: '90px' }}
                            body={(r) => {
                                const pct = r.completion_percentage ?? 0;
                                return (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold w-7 tabular-nums"
                                            style={{ color: TEAL }}>{pct}%</span>
                                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            <div className="h-full rounded-full"
                                                style={{ width: `${pct}%`, background: TEAL }} />
                                        </div>
                                    </div>
                                );
                            }}
                        />

                        { }
                        <Column
                            field="status"
                            header="Status"
                            sortable
                            style={{ width: '110px', minWidth: '100px' }}
                            body={(r) => <StatusBadge status={r.status_master || r.status} />}
                        />

                        <Column
                            field="priority"
                            header="Priority"
                            sortable
                            style={{ width: '100px', minWidth: '90px' }}
                            body={(r) => <PriorityBadge priority={r.priority_master ?? r.priority ?? r.priority_id} />}
                        />


                        { }
                        <Column
                            field="owner"
                            header="Milestone Owner"
                            style={{ minWidth: '140px' }}
                            body={(r) => <OwnerCell owner={r.owner || (r as any).milestone_owner || (r as any).owner_master} />}
                        />

                        { }
                        <Column
                            field="start_date"
                            header="Start Date"
                            sortable
                            style={{ width: '115px', minWidth: '105px' }}
                            body={(r) => <DateCell date={r.start_date} isStartDate />}
                        />

                        { }
                        <Column
                            field="end_date"
                            header="End Date"
                            sortable
                            style={{ width: '125px', minWidth: '115px' }}
                            body={(r) => <DateCell date={r.end_date} warnIfPast />}
                        />

                        { }
                        <Column
                            field="task_count"
                            header="Tasks"
                            sortable
                            style={{ width: '100px', minWidth: '90px' }}
                            body={(r) => {
                                const count = r.task_count ?? (r as any).tasks_count ?? (r as any).stats?.task_count ?? 0;
                                return <CountBadge count={count} color={TEAL} />;
                            }}
                        />

                        { }
                        <Column
                            field="issue_count"
                            header="Bugs"
                            sortable
                            style={{ width: '80px', minWidth: '70px' }}
                            body={(r) => {
                                const count = r.issue_count ?? (r as any).bugs_count ?? (r as any).issues_count ?? (r as any).stats?.issue_count ?? 0;
                                return <CountBadge count={count} color="#ef4444" />;
                            }}
                        />

                    </DataTable>
                </div>
            )}
            <ConfirmationModal
                visible={!!deleteId}
                onHide={() => setDeleteId(null)}
                onConfirm={confirmDeleteNow}
                title="Delete Milestone"
                message="Are you sure you want to delete this milestone? This action cannot be undone."
                confirmLabel="Delete Milestone"
                variant="danger"
                loading={deleteMilestone.isPending}
            />
        </EntityPageTemplate>
    );
}
