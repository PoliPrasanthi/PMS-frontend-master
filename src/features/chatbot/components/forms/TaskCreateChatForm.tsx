import React, { useEffect, useState } from 'react';
import { z } from 'zod';

import { FieldLabel } from '@/components/forms/FieldLabel';
import { FieldError } from '@/components/forms/FieldError';
import { inputCls } from '@/components/forms/FormStyles';

import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

import { Button } from '@/components/forms/Button';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

import { projectsService } from '@/features/projects/api/projects.api';
import { formatLocalDate } from '@/utils/dateHelpers';

import {
    ClipboardList,
    Briefcase,
    User2,
    Calendar as CalIcon,
    Timer,
} from 'lucide-react';

interface UserOption {
    id: number | string;
    displayName?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    mail?: string;
}

interface TaskCreateChatFormProps {
    onSubmit: (data: Record<string, any>) => void;
    onCancel: () => void;
    loading?: boolean;
}

const taskSchema = z.object({
    task_name: z
        .string()
        .trim()
        .min(1, 'Task name is required')
        .max(250, 'Task name cannot exceed 250 characters'),

    project_id: z.any().refine(
        (value) => !!value,
        {
            message: 'Project is required',
        },
    ),

    owner_id: z.any().refine(
        (value) => !!value?.id,
        {
            message: 'Task Owner is required',
        },
    ),

    due_date: z.any().refine(
        (value) => !!value,
        {
            message: 'Due Date is required',
        },
    ),

    estimated_hours: z.any().refine(
        (value) =>
            value !== null &&
            value !== undefined &&
            value !== '' &&
            Number(value) > 0,
        {
            message: 'Estimated hours must be greater than 0',
        },
    ),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskCreateChatForm({
    onSubmit,
    onCancel,
    loading = false,
}: TaskCreateChatFormProps) {
    const [form, setForm] = useState<TaskFormData>({
        task_name: '',
        project_id: null,
        owner_id: null,
        due_date: null,
        estimated_hours: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [projectMembers, setProjectMembers] = useState<UserOption[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const updateField = (field: keyof TaskFormData, value: any) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: '',
        }));
    };

    const extractId = (value: any) => {
        return value && typeof value === 'object'
            ? value.id
            : value;
    };

    const watchProjectId = extractId(form.project_id);

    useEffect(() => {
        if (!watchProjectId) {
            setProjectMembers([]);
            updateField('owner_id', null);
            return;
        }

        loadProjectMembers(Number(watchProjectId));
    }, [watchProjectId]);

    const loadProjectMembers = async (projectId: number) => {
        setLoadingMembers(true);
        setProjectMembers([]);
        updateField('owner_id', null);

        try {
            const response = await projectsService.getProjectMembers(projectId);

            const members = Array.isArray(response)
                ? response
                : response?.items ?? [];

            const normalizedMembers: UserOption[] = members
                .map((member: any) => {
                    const user = member.user ?? member;

                    const id =
                        member.user_id ??
                        user.id;

                    const firstName =
                        user.first_name ??
                        member.first_name ??
                        '';

                    const lastName =
                        user.last_name ??
                        member.last_name ??
                        '';

                    const displayName =
                        user.display_name ??
                        member.display_name ??
                        `${firstName} ${lastName}`.trim();

                    const email =
                        user.email ??
                        member.email ??
                        user.mail ??
                        member.mail ??
                        '';

                    return {
                        id,
                        displayName: displayName || email,
                        first_name: firstName,
                        last_name: lastName,
                        email,
                        mail: email,
                    };
                })
                .filter(
                    (member: UserOption) =>
                        member.id !== undefined &&
                        member.id !== null,
                );

            setProjectMembers(normalizedMembers);
        } catch (error) {
            console.error(
                'Failed to load project members:',
                error,
            );

            setProjectMembers([]);

            setErrors((previous) => ({
                ...previous,
                owner_id: 'Failed to load project members.',
            }));
        } finally {
            setLoadingMembers(false);
        }
    };

    const validate = () => {
        const result = taskSchema.safeParse(form);

        if (result.success) {
            setErrors({});
            return true;
        }

        const nextErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
            const field = String(issue.path[0]);
            nextErrors[field] = issue.message;
        });

        setErrors(nextErrors);
        return false;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        const payload = {
            task_name: form.task_name.trim(),
            project_id: Number(extractId(form.project_id)),
            due_date: formatLocalDate(form.due_date),
            estimated_hours: Number(form.estimated_hours),
            owner_id: Number(form.owner_id.id),
        };

        onSubmit(payload);
    };

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                    <ClipboardList
                        size={16}
                        className="text-cyan-500"
                    />
                </div>

                <div>
                    <h3 className="text-sm font-bold">
                        Create Task
                    </h3>

                    <p className="text-xs text-slate-500">
                        Fill in the required task details
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {/* Task Name */}
                <div>
                    <FieldLabel
                        label="Task Name"
                        required
                        icon={<ClipboardList size={11} />}
                    />

                    <InputText
                        value={form.task_name}
                        onChange={(e) =>
                            updateField(
                                'task_name',
                                e.target.value,
                            )
                        }
                        placeholder="e.g. Implement login API"
                        className={inputCls(
                            !!errors.task_name,
                        )}
                        disabled={loading}
                    />

                    <FieldError
                        message={errors.task_name}
                    />
                </div>

                {/* Project */}
                <div>
                    <FieldLabel
                        label="Project"
                        required
                        icon={<Briefcase size={11} />}
                    />

                    <ServerSearchDropdown
                        entityType="projects"
                        value={form.project_id}
                        onChange={(value) => {
                            updateField(
                                'project_id',
                                value,
                            );

                            updateField(
                                'owner_id',
                                null,
                            );

                            setProjectMembers([]);
                        }}
                        placeholder="Select Project"
                        disabled={loading}
                    />

                    <FieldError
                        message={errors.project_id}
                    />
                </div>

                {/* Task Owner */}
                <div>
                    <FieldLabel
                        label="Task Owner"
                        required
                        icon={<User2 size={11} />}
                    />

                    <Dropdown
                        value={form.owner_id}
                        options={projectMembers}
                        onChange={(e) =>
                            updateField(
                                'owner_id',
                                e.value,
                            )
                        }
                        optionLabel="displayName"
                        placeholder={
                            loadingMembers
                                ? 'Loading members...'
                                : watchProjectId
                                    ? 'Select Task Owner'
                                    : 'Select Project first'
                        }
                        className="w-full"
                        disabled={
                            loading ||
                            loadingMembers ||
                            !watchProjectId
                        }
                        filter
                        showClear
                    />

                    <FieldError
                        message={errors.owner_id}
                    />
                </div>

                {/* Due Date */}
                <div>
                    <FieldLabel
                        label="Due Date"
                        required
                        icon={<CalIcon size={11} />}
                    />

                    <Calendar
                        value={form.due_date}
                        onChange={(e) =>
                            updateField(
                                'due_date',
                                e.value,
                            )
                        }
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                        className="form-calendar w-full"
                        placeholder="DD/MM/YYYY"
                        disabled={loading}
                    />

                    <FieldError
                        message={errors.due_date}
                    />
                </div>

                {/* Estimated Hours */}
                <div>
                    <FieldLabel
                        label="Estimated Hours"
                        required
                        icon={<Timer size={11} />}
                    />

                    <InputText
                        type="number"
                        step="0.5"
                        min="0"
                        value={
                            form.estimated_hours ?? ''
                        }
                        onChange={(e) =>
                            updateField(
                                'estimated_hours',
                                e.target.value === ''
                                    ? null
                                    : Number(e.target.value),
                            )
                        }
                        placeholder="e.g. 40"
                        className={inputCls(
                            !!errors.estimated_hours,
                        )}
                        disabled={loading}
                    />

                    <FieldError
                        message={errors.estimated_hours}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    variant="gradient"
                    onClick={handleSubmit}
                    loading={loading}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}
