import React, { useState } from 'react';
import { z } from 'zod';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { AlertTriangle, Briefcase, User2, Calendar as CalIcon } from 'lucide-react';

import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { UserAutocomplete, type UserOption } from '@/components/core/UserAutocomplete';
import { FieldLabel } from '@/components/forms/FieldLabel';
import { FieldError } from '@/components/forms/FieldError';
import { inputCls } from '@/components/forms/FormStyles';
import { Button } from '@/components/forms/Button';
import { formatLocalDate } from '@/utils/dateHelpers';

interface IssueCreateChatFormProps {
    onSubmit: (data: Record<string, any>) => void;
    onCancel: () => void;
    loading?: boolean;
}

interface ProjectOption {
    id: number | string;
    [key: string]: any;
}

interface FormState {
    bug_name: string;
    project_id: ProjectOption | null;
    assignee_id: UserOption | null;
    due_date: Date | null;
}

const issueSchema = z.object({
    bug_name: z
        .string()
        .trim()
        .min(3, 'Minimum 3 characters required')
        .max(250, 'Defect name cannot exceed 250 characters'),

    project_id: z
        .any()
        .refine(
            (value) => !!value?.id,
            {
                message: 'Project is required',
            },
        ),

    assignee_id: z
        .any()
        .refine(
            (value) => !!value?.id,
            {
                message: 'Assignee is required',
            },
        ),

    due_date: z
        .any()
        .refine(
            (value) => !!value,
            {
                message: 'Due Date is required',
            },
        ),
});

export function IssueCreateChatForm({
    onSubmit,
    onCancel,
    loading = false,
}: IssueCreateChatFormProps) {
    const [form, setForm] = useState<FormState>({
        bug_name: '',
        project_id: null,
        assignee_id: null,
        due_date: null,
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
        const result = issueSchema.safeParse(form);

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

        // The UI shows project/user names.
        // The backend receives only their numeric IDs.
        const payload = {
            bug_name: form.bug_name.trim(),
            project_id: Number(form.project_id!.id),
            assignee_id: Number(form.assignee_id!.id),
            due_date: formatLocalDate(form.due_date),
        };

        console.log('ISSUE FORM DATA:', payload);

        onSubmit(payload);
    };

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle
                        size={16}
                        className="text-red-500"
                    />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Create Issue
                    </h3>

                    <p className="text-xs text-slate-500">
                        Enter the required issue details
                    </p>
                </div>
            </div>

            {/* Required fields only */}
            <div className="grid grid-cols-1 gap-3">
                {/* Bug Name */}
                <div>
                    <FieldLabel
                        label="Bug Name"
                        required
                        icon={<AlertTriangle size={11} />}
                    />

                    <InputText
                        value={form.bug_name}
                        onChange={(e) =>
                            updateField(
                                'bug_name',
                                e.target.value,
                            )
                        }
                        placeholder="e.g. Login API returns 500"
                        className={`w-full mt-1 ${inputCls(
                            !!errors.bug_name,
                        )}`}
                        disabled={loading}
                    />

                    <FieldError
                        message={errors.bug_name}
                    />
                </div>

                {/* Project */}
                <div>
                    <FieldLabel
                        label="Project"
                        required
                        icon={<Briefcase size={11} />}
                    />

                    <div className="mt-1">
                        <ServerSearchDropdown
                            entityType="projects"
                            value={form.project_id}
                            onChange={(value) =>
                                updateField(
                                    'project_id',
                                    value,
                                )
                            }
                            placeholder="Select Project"
                            disabled={loading}
                        />
                    </div>

                    <FieldError
                        message={errors.project_id}
                    />
                </div>

                {/* Assignee */}
                <div>
                    <FieldLabel
                        label="Assignee"
                        required
                        icon={<User2 size={11} />}
                    />

                    <div className="mt-1">
                        <UserAutocomplete
                            value={form.assignee_id}
                            onChange={(value) =>
                                updateField(
                                    'assignee_id',
                                    value,
                                )
                            }
                            placeholder="Search assignee"
                        />
                    </div>

                    <FieldError
                        message={errors.assignee_id}
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
                        className={`form-calendar w-full mt-1 ${
                            errors.due_date
                                ? 'p-invalid'
                                : ''
                        }`}
                        placeholder="DD/MM/YYYY"
                        disabled={loading}
                    />

                    <FieldError
                        message={errors.due_date}
                    />
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
