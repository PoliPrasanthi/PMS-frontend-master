import { api } from '@/api/client';

export interface TaskList {
    id: number;
    project_id: number;
    milestone_id?: number;
    name: string;
    description?: string;
    project?: any;
}

export const tasklistsService = {
    getTaskLists: async (projectId?: number, skip = 0, limit = 20): Promise<{total: number, items: TaskList[]}> => {
        const { data } = await api.get('/tasklists/', { params: { project_id: projectId, skip, limit } });
        return data;
    },

    getTaskList: async (id: number): Promise<TaskList> => {
        const { data } = await api.get(`/tasklists/${id}`);
        return data;
    },

    createTaskList: async (payload: Partial<TaskList>): Promise<TaskList> => {
        const { data } = await api.post('/tasklists/', payload);
        return data;
    },

    updateTaskList: async (id: number, payload: Partial<TaskList>): Promise<TaskList> => {
        const { data } = await api.put(`/tasklists/${id}`, payload);
        return data;
    },

    deleteTaskList: async (id: number): Promise<void> => {
        await api.delete(`/tasklists/${id}`);
    },
};
