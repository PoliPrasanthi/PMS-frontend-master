import React, { useState } from 'react';
import { z } from 'zod';
import { Layers, FolderKanban } from 'lucide-react';

import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FieldLabel } from '@/components/forms/FieldLabel';
import { FieldError } from '@/components/forms/FieldError';
import { inputCls } from '@/components/forms/FormStyles';
import { Button } from '@/components/forms/Button';
import { InputText } from 'primereact/inputtext';

interface ProjectOption {
    id: number | string;
    [key: string]: any;
}

interface TaskListCreateChatFormProps {
    onSubmit: (data: Record<string, any>) => void;
    onCancel: () => void;
    loading?: boolean;
}

interface FormState {
    name: string;
    project_id: ProjectOption | null;
}

const taskListSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Task list name is required')
        .max(250, 'Task list name cannot exceed 250 characters'),

    project_id: z
        .any()
        .refine(
            (value) => !!value?.id,
            {
                message: 'Project is required',
            },
        ),
});

export function TaskListCreateChatForm({
    onSubmit,
    onCancel,
    loading = false,
}: TaskListCreateChatFormProps) {
    const [form, setForm] = useState<FormState>({
        name: '',
        project_id: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (
        field: keyof FormState,
        value: any,
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: '',
        }));
    };

    const validate = () => {
        const result = taskListSchema.safeParse(form);

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

        // The dropdown displays the project name to the user.
        // Only the selected project's numeric ID is sent to the backend.
        const payload = {
            name: form.name.trim(),
            project_id: Number(form.project_id!.id),
        };

        console.log('TASK LIST FORM DATA:', payload);

        onSubmit(payload);
    };

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                    <Layers size={16} className="text-teal-500" />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Create Task List
                    </h3>

                    <p className="text-xs text-slate-500">
                        Enter the required task list details
                    </p>
                </div>
            </div>

            {/* Required fields only */}
            <div className="grid grid-cols-1 gap-3">
                {/* Task List Name */}
                <div>
                    <FieldLabel
                        label="Task List Name"
                        required
                        icon={<Layers size={11} />}
                    />

                    <InputText
                        value={form.name}
                        onChange={(e) =>
                            updateField('name', e.target.value)
                        }
                        placeholder="e.g. Sprint 1"
                        className={`w-full mt-1 ${inputCls(!!errors.name)}`}
                        disabled={loading}
                    />

                    <FieldError message={errors.name} />
                </div>

                {/* Project */}
                <div>
                    <FieldLabel
                        label="Project"
                        required
                        icon={<FolderKanban size={11} />}
                    />

                    <div className="mt-1">
                        <ServerSearchDropdown
                            entityType="projects"
                            value={form.project_id}
                            onChange={(value) =>
                                updateField('project_id', value)
                            }
                            placeholder="Select Project"
                            disabled={loading}
                        />
                    </div>

                    <FieldError message={errors.project_id} />
                </div>
            </div>

            {/* Buttons */}
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
