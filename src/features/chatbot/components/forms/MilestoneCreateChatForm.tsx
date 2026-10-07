import React, { useState } from 'react';
import { z } from 'zod';

import { FieldLabel } from '@/components/forms/FieldLabel';
import { FieldError } from '@/components/forms/FieldError';
import { inputCls } from '@/components/forms/FormStyles';
import { Button } from '@/components/forms/Button';
import { InputText } from 'primereact/inputtext';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

import {
    Milestone as MilestoneIcon,
    Briefcase,
} from 'lucide-react';

interface MilestoneCreateChatFormProps {
    onSubmit: (data: Record<string, any>) => void;
    onCancel: () => void;
    loading?: boolean;
}

const milestoneSchema = z.object({
    milestone_name: z
        .string()
        .trim()
        .min(1, 'Milestone name is required')
        .max(
            250,
            'Milestone name cannot exceed 250 characters'
        ),

    project_id: z.any().refine(
        (value) => !!value,
        {
            message: 'Project is required',
        }
    ),
});

type MilestoneFormData = z.infer<
    typeof milestoneSchema
>;

export function MilestoneCreateChatForm({
    onSubmit,
    onCancel,
    loading = false,
}: MilestoneCreateChatFormProps) {
    const [form, setForm] =
        useState<MilestoneFormData>({
            milestone_name: '',
            project_id: null,
        });

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    const updateField = (
        field: keyof MilestoneFormData,
        value: any
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

    const extractId = (value: any) => {
        return value &&
            typeof value === 'object'
            ? value.id
            : value;
    };

    const validate = () => {
        const result =
            milestoneSchema.safeParse(form);

        if (result.success) {
            setErrors({});
            return true;
        }

        const nextErrors: Record<
            string,
            string
        > = {};

        result.error.issues.forEach(
            (issue) => {
                const field =
                    String(issue.path[0]);

                nextErrors[field] =
                    issue.message;
            }
        );

        setErrors(nextErrors);

        return false;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        const payload = {
            milestone_name:
                form.milestone_name.trim(),

            project_id: Number(
                extractId(form.project_id)
            ),
        };

        onSubmit(payload);
    };

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">

            <div className="flex items-center gap-2 mb-4">

                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <MilestoneIcon
                        size={16}
                        className="text-violet-500"
                    />
                </div>

                <div>
                    <h3 className="text-sm font-bold">
                        Create Milestone
                    </h3>

                    <p className="text-xs text-slate-500">
                        Fill in the required milestone details
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 gap-3">

                <div>
                    <FieldLabel
                        label="Milestone Name"
                        required
                        icon={
                            <MilestoneIcon size={11} />
                        }
                    />

                    <InputText
                        value={form.milestone_name}
                        onChange={(e) =>
                            updateField(
                                'milestone_name',
                                e.target.value
                            )
                        }
                        placeholder="e.g. Sprint 1"
                        className={inputCls(
                            !!errors.milestone_name
                        )}
                        disabled={loading}
                    />

                    <FieldError
                        message={
                            errors.milestone_name
                        }
                    />
                </div>

                <div>
                    <FieldLabel
                        label="Project"
                        required
                        icon={
                            <Briefcase size={11} />
                        }
                    />

                    <ServerSearchDropdown
                        entityType="projects"
                        value={form.project_id}
                        onChange={(value) =>
                            updateField(
                                'project_id',
                                value
                            )
                        }
                        placeholder="Select Project"
                        disabled={loading}
                    />

                    <FieldError
                        message={
                            errors.project_id
                        }
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