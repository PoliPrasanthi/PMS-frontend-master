import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/Button';

import {
    UserAutocomplete,
    type UserOption,
} from '@/components/core/UserAutocomplete';

import {
    AIUserMultiSelect,
} from '@/components/core/AIUserMultiSelect';

import { FolderKanban } from 'lucide-react';

import { formatLocalDate } from '@/utils/dateHelpers';

interface ProjectCreateChatFormProps {
    onSubmit: (
        data: Record<string, any>,
    ) => void;

    onCancel: () => void;

    loading?: boolean;
}

interface FormState {
    account_name: string;
    project_name: string;
    customer_name: string;
    // project_id_sync: string;

    expected_end_date: Date | null;

    project_manager: UserOption | null;
    delivery_head: UserOption | null;

    user_emails: UserOption[];
}

export function ProjectCreateChatForm({
    onSubmit,
    onCancel,
    loading = false,
}: ProjectCreateChatFormProps) {

    const [form, setForm] =
        useState<FormState>({
            account_name: '',
            project_name: '',
            customer_name: '',
            expected_end_date: null,
            // project_id_sync: '',
            project_manager: null,
            delivery_head: null,

            user_emails: [],
        });

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    const updateField = (
        field: keyof FormState,
        value: any,
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: '',
        }));
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.account_name.trim()) {
            nextErrors.account_name =
                'Account name is required.';
        }

        if (!form.project_name.trim()) {
            nextErrors.project_name =
                'Project name is required.';
        }

        if (!form.customer_name.trim()) {
            nextErrors.customer_name =
                'Customer name is required.';
        }

        // if (!form.project_id_sync.trim()) {
        //     nextErrors.project_id_sync =
        //         'Project sync ID is required.';
        // }

        if (!form.expected_end_date) {
            nextErrors.expected_end_date =
                'Expected end date is required.';
        }

        if (!form.project_manager) {
            nextErrors.project_manager =
                'Project manager is required.';
        }

        if (!form.delivery_head) {
            nextErrors.delivery_head =
                'Delivery head is required.';
        }

        if (!form.user_emails.length) {
            nextErrors.user_emails =
                'Please add at least one team member.';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = () => {

        if (!validate()) {
            return;
        }

        const formData: Record<string, any> = {
            account_name:
                form.account_name.trim(),

            project_name:
                form.project_name.trim(),

            customer_name:
                form.customer_name.trim(),

            // project_id_sync:
            //     form.project_id_sync.trim(),

            expected_end_date:
                formatLocalDate(
                    form.expected_end_date,
                ),

            project_manager_id:
                form.project_manager?.id
                    ? Number(
                        form.project_manager.id,
                    )
                    : null,

            delivery_head_id:
                form.delivery_head?.id
                    ? Number(
                        form.delivery_head.id,
                    )
                    : null,

            user_emails:
                form.user_emails
                    .map(
                        (user) =>
                            user?.mail ?? '',
                    )
                    .filter(
                        (email) =>
                            Boolean(
                                email &&
                                email.trim(),
                            ),
                    ),
        };

        console.log(
            'PROJECT FORM DATA:',
            formData,
        );

        onSubmit(formData);
    };

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">

                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">

                    <FolderKanban
                        size={16}
                        className="text-emerald-500"
                    />

                </div>

                <div>

                    <h3 className="text-sm font-bold">
                        Create Project
                    </h3>

                    <p className="text-xs text-slate-500">
                        Enter the required project details
                    </p>

                </div>

            </div>

            <div className="grid grid-cols-1 gap-3">

                <div>

                    <label className="text-xs font-semibold">
                        Account Name *
                    </label>

                    <InputText
                        value={
                            form.account_name
                        }
                        onChange={(e) =>
                            updateField(
                                'account_name',
                                e.target.value,
                            )
                        }
                        className="w-full mt-1"
                        placeholder="Account name"
                    />

                    {errors.account_name && (
                        <small className="text-red-500">
                            {errors.account_name}
                        </small>
                    )}

                </div>

                <div>

                    <label className="text-xs font-semibold">
                        Project Name *
                    </label>

                    <InputText
                        value={
                            form.project_name
                        }
                        onChange={(e) =>
                            updateField(
                                'project_name',
                                e.target.value,
                            )
                        }
                        className="w-full mt-1"
                        placeholder="Project name"
                    />

                    {errors.project_name && (
                        <small className="text-red-500">
                            {errors.project_name}
                        </small>
                    )}

                </div>

                <div>

                    <label className="text-xs font-semibold">
                        Customer Name *
                    </label>

                    <InputText
                        value={
                            form.customer_name
                        }
                        onChange={(e) =>
                            updateField(
                                'customer_name',
                                e.target.value,
                            )
                        }
                        className="w-full mt-1"
                        placeholder="Customer name"
                    />

                    {errors.customer_name && (
                        <small className="text-red-500">
                            {errors.customer_name}
                        </small>
                    )}

                </div>

                {/* <div>

                    <label className="text-xs font-semibold">
                        Project Sync ID *
                    </label>

                    <InputText
                        value={
                            form.project_id_sync
                        }
                        onChange={(e) =>
                            updateField(
                                'project_id_sync',
                                e.target.value,
                            )
                        }
                        className="w-full mt-1"
                        placeholder="External project ID"
                    />

                    {errors.project_id_sync && (
                        <small className="text-red-500">
                            {errors.project_id_sync}
                        </small>
                    )}

                </div> */}

                <div>

                    <label className="text-xs font-semibold">
                        Expected End Date *
                    </label>

                    <Calendar
                        value={
                            form.expected_end_date
                        }
                        onChange={(e) =>
                            updateField(
                                'expected_end_date',
                                e.value,
                            )
                        }
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="DD/MM/YYYY"
                        className="w-full mt-1"
                    />

                    {errors.expected_end_date && (
                        <small className="text-red-500">
                            {errors.expected_end_date}
                        </small>
                    )}

                </div>

                <div>

                    <label className="text-xs font-semibold">
                        Project Manager *
                    </label>

                    <div className="mt-1">

                        <UserAutocomplete
                            value={
                                form.project_manager
                            }
                            onChange={(value) =>
                                updateField(
                                    'project_manager',
                                    value,
                                )
                            }
                            placeholder="Search project manager"
                        />

                    </div>

                    {errors.project_manager && (
                        <small className="text-red-500">
                            {errors.project_manager}
                        </small>
                    )}

                </div>

                <div>

                    <label className="text-xs font-semibold">
                        Delivery Head *
                    </label>

                    <div className="mt-1">

                        <UserAutocomplete
                            value={
                                form.delivery_head
                            }
                            onChange={(value) =>
                                updateField(
                                    'delivery_head',
                                    value,
                                )
                            }
                            placeholder="Search delivery head"
                        />

                    </div>

                    {errors.delivery_head && (
                        <small className="text-red-500">
                            {errors.delivery_head}
                        </small>
                    )}

                </div>
                <div>
                    <label className="text-xs font-semibold">
                        Team Members *
                    </label>

                    <div className="mt-1">
                        <AIUserMultiSelect
                            value={form.user_emails}
                            onChange={(users) =>
                                updateField(
                                    'user_emails',
                                    users,
                                )
                            }
                            placeholder="Add more..."
                            disabled={loading}
                        />
                    </div>

                    {errors.user_emails && (
                        <small className="text-red-500">
                            {errors.user_emails}
                        </small>
                    )}
                </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">

                <Button
                    type="button"
                    severity="secondary"
                    outlined
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    loading={loading}
                >
                    Submit
                </Button    >

            </div>

        </div>
    );
}