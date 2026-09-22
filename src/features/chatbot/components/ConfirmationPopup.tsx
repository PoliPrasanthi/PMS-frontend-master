import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationPopupProps {
    open: boolean;
    loading?: boolean;
    data?: Record<string, any> | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const ENTITY_LABELS: Record<string, string> = {
    task_confirmation: 'Task',
    project_confirmation: 'Project',
    issue_confirmation: 'Issue',
    tasklist_confirmation: 'Task List',
    milestone_confirmation: 'Milestone',
};

const FIELD_LABELS: Record<string, string> = {
    task_name: 'Task Name',
    project_id: 'Project',
    due_date: 'Due Date',
    estimated_hours: 'Estimated Hours',
    owner_id: 'Owner',

    project_name: 'Project Name',
    description: 'Description',
    start_date: 'Start Date',
    end_date: 'End Date',

    issue_name: 'Issue Name',
    issue_title: 'Issue Title',

    tasklist_name: 'Task List Name',

    milestone_name: 'Milestone Name',
};

const ENTITY_KEYS = [
    'task',
    'project',
    'issue',
    'tasklist',
    'milestone',
];

function getEntityData(
    data: Record<string, any> | null,
) {
    if (!data) {
        return null;
    }

    for (const key of ENTITY_KEYS) {
        if (
            data[key] &&
            typeof data[key] === 'object'
        ) {
            return {
                entityType: key,
                values: data[key],
            };
        }
    }

    return null;
}

function formatValue(value: any) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '-';
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (
        typeof value === 'object'
    ) {
        return JSON.stringify(value);
    }

    return String(value);
}

export function ConfirmationPopup({
    open,
    loading = false,
    data,
    onConfirm,
    onCancel,
}: ConfirmationPopupProps) {

    if (!open) {
        return null;
    }

    const entity =
        getEntityData(data ?? null);

    const title =
        ENTITY_LABELS[
            data?.type
        ] ??
        entity?.entityType ??
        'Record';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b px-5 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Confirm {title} Creation
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review the details before creating.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* Details */}

                <div className="px-5 py-5">

                    {entity ? (
                        <div className="space-y-3">

                            {Object.entries(
                                entity.values,
                            ).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3"
                                    >

                                        <span className="text-sm font-medium text-slate-500">
                                            {FIELD_LABELS[key] ??
                                                key
                                                    .replace(
                                                        /_/g,
                                                        ' ',
                                                    )
                                                    .replace(
                                                        /\b\w/g,
                                                        (char) =>
                                                            char.toUpperCase(),
                                                    )}
                                        </span>

                                        <span className="max-w-[60%] break-words text-right text-sm font-medium text-slate-900">
                                            {formatValue(value)}
                                        </span>

                                    </div>
                                ),
                            )}

                        </div>
                    ) : (
                        <p className="text-sm text-slate-600">
                            Are you sure you want to create this {title.toLowerCase()}?
                        </p>
                    )}

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t px-5 py-4">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading
                            ? 'Creating...'
                            : `Confirm ${title}`}
                    </button>

                </div>

            </div>
        </div>
    );
}