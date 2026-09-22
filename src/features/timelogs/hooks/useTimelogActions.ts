import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { timelogsService, TimeLog } from '../api/timelogs.api';
import { queryKeys } from '@/api/queryKeys';

export function useTimelogActions() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const invalidateRelated = async (vars: any) => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.timelogs.all });
        
        if (vars?.project_id) {
            await queryClient.invalidateQueries({ queryKey: ['projects', 'detail', Number(vars.project_id)] });
        } else {
            await queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
        }
        
        if (vars?.task_id) {
            await queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', Number(vars.task_id)] });
        }
        if (vars?.issue_id) {
            await queryClient.invalidateQueries({ queryKey: ['issues', 'detail', Number(vars.issue_id)] });
        }

        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['issues'] });
        await queryClient.invalidateQueries({ queryKey: ['timelogs-task'] });
        await queryClient.invalidateQueries({ queryKey: ['timelogs-issue'] });
        await queryClient.invalidateQueries({ queryKey: ['timelogs', 'task'] });
        await queryClient.invalidateQueries({ queryKey: ['timelogs', 'issue'] });
    };

    const createTimelog = useMutation({
        mutationFn: (data: Partial<TimeLog>) => timelogsService.createTimelog(data),
        onSuccess: async (_, vars) => {
            await invalidateRelated(vars);
            showToast('success', 'Time Logged', 'Entry recorded successfully.');
        },
    });

    const updateTimelog = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TimeLog> }) =>
            timelogsService.updateTimelog(id, data),
        onSuccess: async (_, vars) => {
            await invalidateRelated(vars.data);
            showToast('success', 'Time Log Updated', 'Entry updated successfully.');
        },
    });

    const deleteTimelog = useMutation({
        mutationFn: (id: number) => timelogsService.deleteTimelog(id),
        onSuccess: async () => {
            await invalidateRelated({});
            showToast('success', 'Log Deleted', 'Time entry has been removed.');
        },
    });

    const bulkCreateTimelogs = useMutation({
        mutationFn: (data: { logs: Partial<TimeLog>[] }) => timelogsService.bulkCreateTimelogs(data),
        onSuccess: async (_, vars) => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.timelogs.all });
            const pIds = new Set(vars.logs.map(l => l.project_id).filter(Boolean));
            if (pIds.size > 0) {
                pIds.forEach(id => queryClient.invalidateQueries({ queryKey: ['projects', 'detail', Number(id)] }));
            } else {
                queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
            }
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['timelogs-task'] });
            queryClient.invalidateQueries({ queryKey: ['timelogs-issue'] });
            showToast('success', 'Time Logs Created', `Successfully logged ${vars.logs.length} entries.`);
        },
    });

    return { createTimelog, updateTimelog, deleteTimelog, bulkCreateTimelogs };
}
