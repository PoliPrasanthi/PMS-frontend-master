import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, animate } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle,
  FolderKanban, Download, Activity, Users, ArrowUpRight, Zap
} from 'lucide-react';
import { Button } from '@/components/forms/Button';
import { exportToCSV } from '@/utils/export';
import { useAuth } from '@/auth/AuthProvider';
import { timelogsService } from '@/features/timelogs/api/timelogs.api';
import { ROLES, can } from '@/utils/permissions';
import { useDashboardData } from '../hooks/useDashboardData';
import { useToast } from '@/providers/ToastContext';

const getArrayData = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

function AnimatedCounter({ value }: { value: string }) {
  const target = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(currentValue) {
        if (!node) return;
        const hasDecimal = target % 1 !== 0;
        node.textContent = hasDecimal ? currentValue.toFixed(1) : Math.round(currentValue).toString();
      }
    });

    return () => controls.stop();
  }, [target]);

  return <><span ref={nodeRef}>0</span>{suffix}</>;
}

const KpiCard = React.memo(function KpiCard({ title, value, change, trend, icon, gradient }: {
  title: string; value: string; change: string; trend: 'up' | 'down';
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <Card glass={true} className="p-4 relative overflow-hidden group border-slate-200/60 dark:border-slate-800">
      <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: gradient }} />
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500" style={{ background: gradient }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2.5">
          <div className="p-2 rounded-lg" style={{ background: `${gradient}18` }}>
            <div style={{ color: gradient }}>{icon}</div>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend === 'up'
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
            : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
            }`}>
            {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          </div>
        </div>
        <p className="text-[24px] tracking-tight font-black text-slate-800 dark:text-white leading-none mb-0.5">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium truncate">{change}</p>
      </div>
    </Card>
  );
});


const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-xs">
      {label && <p className="text-slate-400 font-bold mb-1 uppercase tracking-wider">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color || p.fill || p.stroke }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};


export function Dashboard() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    loading, tasks, projects, issues, summary, recentProjects,
    taskStatusData, phaseStatusData, issueSeverityData, projectTaskProgressData, kpiCards
  } = useDashboardData();

  const handleDownloadReport = useCallback(async (id: number) => {
    try {
      if (id === 1) {
        const { projectsService } = await import('@/api/services/projects.service');
        await projectsService.exportProjectsCSV({});
        showToast('success', 'Exported', 'Project Status Report downloaded.');
      } else if (id === 2) {
        const { timelogsService } = await import('@/api/services/timelogs.service');
        await timelogsService.exportTimelogsCSV();
        showToast('success', 'Exported', 'Time Tracking Report downloaded.');
      } else if (id === 3) {
        const { issuesService } = await import('@/api/services/issues.service');
        await issuesService.exportIssuesCSV({});
        showToast('success', 'Exported', 'Issue Analysis Report downloaded.');
      }
    } catch { showToast('error', 'Export Failed', 'An error occurred.'); }
  }, [showToast]);

  return (
    <PageLayout
      title="Dashboard"
      isFullHeight
      showBackButton={false}
      actions={
        <div className="flex items-center gap-2 sm:gap-3">
          <Button onClick={() => handleDownloadReport(1)} size="sm" className="shadow-brand-teal-500/25">
            <Download size={15} /> <span className="hidden sm:inline">Projects</span>
          </Button>
          <Button onClick={() => handleDownloadReport(2)} size="sm" className="shadow-brand-teal-500/25">
            <Download size={15} /> <span className="hidden sm:inline">Time</span>
          </Button>
          <Button onClick={() => handleDownloadReport(3)} size="sm" className="shadow-brand-teal-500/25">
            <Download size={15} /> <span className="hidden sm:inline">Defects</span>
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-auto pr-1 pb-8 pt-2 space-y-6">

        { }
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {loading
            ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
            ))
            : kpiCards.map((kpi, i) => <KpiCard key={i} {...kpi} />)
          }
        </div>

        { }
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          { }
          <Card glass={true} className="xl:col-span-2 p-0 flex flex-col h-full border-slate-200/50 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Active Project Progress</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">Live Sync</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div> : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={projectTaskProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#33415510" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="total" name="Total Tasks" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          { }
          <Card glass={true} className="xl:col-span-1 p-0 flex flex-col border-slate-200/50 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Global Tasks Status</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div>
                : taskStatusData.reduce((a, c) => a + c.value, 0) === 0
                  ? <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No data yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={taskStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                          innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                          labelLine={false}
                          stroke="none"
                        >
                          {taskStatusData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
            </div>
          </Card>

          { }
          <Card glass={true} className="xl:col-span-1 p-0 flex flex-col border-slate-200/50 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Project Phases</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div>
                : phaseStatusData.reduce((a, c) => a + c.value, 0) === 0
                  ? <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No data yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={phaseStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                          innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                          labelLine={false}
                          stroke="none"
                        >
                          {phaseStatusData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
            </div>
          </Card>

          { }
          <Card glass={true} className="xl:col-span-2 p-0 flex flex-col border-slate-200/50 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Issue Severity Matrix</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div>
                : issueSeverityData.reduce((a, c) => a + c.count, 0) === 0
                  ? <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No data yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={issueSeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#33415510" vertical={false} />
                        <XAxis dataKey="severity" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                        <Bar dataKey="count" name="Open Issues" radius={[6, 6, 0, 0]} maxBarSize={50}>
                          {issueSeverityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
            </div>
          </Card>
        </div>

        { }
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800/60 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                <FolderKanban className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-[15px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Recent Active Projects</h3>
            </div>
            <Button onClick={() => navigate('/projects')} className="inline-flex items-center justify-center gap-2 font-bold px-4 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]" style={{ height: '36px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              View Directory <ArrowUpRight size={14} />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 text-sm">
              <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No projects yet. <Button variant="ghost" onClick={() => navigate('/projects/create')} className="text-teal-500 hover:underline">Create one →</Button></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((project: any) => {
                const statusColors: Record<string, string> = {
                  'In Progress': '#14b8a6', 'Planning': '#8B5CF6', 'Completed': '#10B981',
                  'On Hold': '#F59E0B', 'Cancelled': '#EF4444'
                };
                const accent = statusColors[project.status || ''] || '#8B5CF6';
                return (
                  <Card
                    key={project.id}
                    glass={true}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="p-4 hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden group border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] opacity-90" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}bb)` }} />
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500"
                      style={{ background: accent }} />

                    <div className="flex items-start justify-between mb-3 relative z-10">
                      <div className="p-2 rounded-lg" style={{ background: `${accent}15` }}>
                        <FolderKanban className="w-4 h-4" style={{ color: accent }} />
                      </div>
                      <Badge label={project.status || 'Active'} variant="neutral" />
                    </div>

                    <div className="relative z-10 mb-3">
                      <h4 className="text-[14px] font-extrabold text-slate-800 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{project.project_name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{project.account_name || 'Internal Project'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <div className="flex -space-x-1.5">
                        {project.team_members?.slice(0, 4).map((m: any) => {
                          const u = m.user ?? m;
                          return (
                            <div key={m.user_id ?? u.id} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white shadow-sm" title={u.first_name ? `${u.first_name} ${u.last_name}` : 'Member'}>
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                          );
                        })}
                        {(project.team_members?.length || 0) > 4 && (
                          <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-600 dark:text-slate-300">
                            +{project.team_members.length - 4}
                          </div>
                        )}
                        {(!project.team_members || project.team_members.length === 0) && (
                          <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                            <Users className="w-2.5 h-2.5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-teal-500 transition-colors">
                        View <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
