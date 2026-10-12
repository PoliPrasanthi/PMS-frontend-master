import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useAuth } from '@/auth/AuthProvider';

import { FieldLabel } from '@/components/forms/FieldLabel';
import { FieldError } from '@/components/forms/FieldError';
import { inputCls } from '@/components/forms/FormStyles';

import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';

import { Button } from '@/components/forms/Button';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { AIUserMultiSelect } from '@/components/core/AIUserMultiSelect';

import { projectsService } from '@/features/projects/api/projects.api';
import { formatLocalDate } from '@/utils/dateHelpers';

import {
    ClipboardList,
    Briefcase,
    User2,
    Search,
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
    [key: string]: any;
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
        .max(
            250,
            'Task name cannot exceed 250 characters',
        ),

    project_id: z.any().refine(
        (value) => !!value,
        {
            message: 'Project is required',
        },
    ),

    selected_users: z
        .array(z.any())
        .min(
            1,
            'Select at least one member',
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
            message:
                'Estimated hours must be greater than 0',
        },
    ),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskCreateChatForm({
    onSubmit,
    onCancel,
    loading = false,
}: TaskCreateChatFormProps) {
    const auth = useAuth() as any;
    const authenticatedUser =
        auth?.user ??
        auth?.currentUser ??
        auth?.current_user ??
        null;

    // Read the signed-in role from the JWT first, then fall back to auth user data.
    const accessToken =
        auth?.accessToken ??
        auth?.access_token ??
        auth?.token ??
        (typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') ??
              localStorage.getItem('access_token') ??
              localStorage.getItem('token')
            : null);

    const jwtPayload = useMemo<any>(() => {
        if (!accessToken) {
            return null;
        }

        try {
            const parts = String(accessToken).split('.');
            if (parts.length !== 3) {
                return null;
            }

            const base64 = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            const padded = base64.padEnd(
                base64.length + ((4 - (base64.length % 4)) % 4),
                '=',
            );

            return JSON.parse(
                decodeURIComponent(
                    atob(padded)
                        .split('')
                        .map((character) =>
                            `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`,
                        )
                        .join(''),
                ),
            );
        } catch (error) {
            console.error('Unable to read the current user from the token:', error);
            return null;
        }
    }, [accessToken]);

    const jwtRoleValue =
        jwtPayload?.role ??
        jwtPayload?.roles ??
        jwtPayload?.[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ];
    const jwtRole = Array.isArray(jwtRoleValue)
        ? jwtRoleValue[0]
        : jwtRoleValue;
    const effectiveRole =
        jwtRole ??
        authenticatedUser?.role ??
        authenticatedUser?.role_name ??
        authenticatedUser?.roleName ??
        '';
    const normalizedRole = String(
        typeof effectiveRole === 'object'
            ? effectiveRole?.name ?? effectiveRole?.value ?? ''
            : effectiveRole,
    )
        .trim()
        .toLowerCase()
        .replace(/[-_]/g, ' ');
    const isEmployee =
        normalizedRole === 'employee' ||
        normalizedRole === 'employees';

    const currentUser = useMemo<UserOption | null>(() => {
        if (!authenticatedUser && !jwtPayload) {
            return null;
        }

        const firstName =
            authenticatedUser?.first_name ??
            jwtPayload?.given_name ??
            '';
        const lastName =
            authenticatedUser?.last_name ??
            jwtPayload?.family_name ??
            '';
        const email = String(
            authenticatedUser?.email ??
            authenticatedUser?.mail ??
            jwtPayload?.email ??
            jwtPayload?.unique_name ??
            '',
        ).trim();
        const id =
            authenticatedUser?.id ??
            jwtPayload?.user_id ??
            jwtPayload?.id ??
            jwtPayload?.sub;
        const fullName = `${firstName} ${lastName}`.trim();
        const displayName =
            authenticatedUser?.displayName ??
            authenticatedUser?.display_name ??
            jwtPayload?.name ??
            (fullName || email);

        if ((id === undefined || id === null || id === '') && !email) {
            return null;
        }

        return {
            ...(authenticatedUser ?? {}),
            id: id ?? email,
            displayName: displayName || email || 'Logged-in user',
            first_name: firstName,
            last_name: lastName,
            email,
            mail: authenticatedUser?.mail ?? email,
        };
    }, [authenticatedUser, jwtPayload]);

    const [form, setForm] = useState<TaskFormData>({
        task_name: '',
        project_id: null,
        // Show the logged-in employee as the default owner immediately.
        selected_users: isEmployee && currentUser ? [currentUser] : [],
        due_date: null,
        estimated_hours: null,
    });

    const [errors, setErrors] = useState<
        Record<string, string>
    >({});

    // Only members returned for the selected project are valid selections.
    const [projectMembers, setProjectMembers] = useState<UserOption[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [employeeProjectMemberFound, setEmployeeProjectMemberFound] =
        useState<boolean | null>(null);

    const updateField = (
        field: keyof TaskFormData,
        value: any,
    ) => {
        // Employee selections are populated from project membership and cannot be changed manually.
        if (field === 'selected_users' && isEmployee) {
            return;
        }

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

    const projectId = extractId(form.project_id);

    /*
     * Keep the logged-in employee selected by default, even before a
     * project is chosen. The input itself is disabled for Employees.
     * Project membership is still verified before task submission.
     */
    useEffect(() => {
        if (!isEmployee || !currentUser) {
            return;
        }

        setForm((previous) => {
            const selectedAlreadyIsCurrentUser =
                previous.selected_users.some((selectedUser: UserOption) => {
                    const selectedId = String(selectedUser.id ?? '').trim();
                    const currentId = String(currentUser.id ?? '').trim();
                    const selectedEmail = String(
                        selectedUser.email ?? selectedUser.mail ?? '',
                    ).trim().toLowerCase();
                    const currentEmail = String(
                        currentUser.email ?? currentUser.mail ?? '',
                    ).trim().toLowerCase();

                    return (
                        (currentId !== '' && selectedId === currentId) ||
                        (currentEmail !== '' && selectedEmail === currentEmail)
                    );
                });

            if (selectedAlreadyIsCurrentUser) {
                return previous;
            }

            return {
                ...previous,
                selected_users: [currentUser],
            };
        });
    }, [
        isEmployee,
        currentUser?.id,
        currentUser?.email,
        currentUser?.mail,
    ]);

    /*
     * Load the selected project's members whenever the project changes.
     * For Employees, auto-select the logged-in user only if that user is
     * present in this project's member list. The input is disabled for them.
     */
    useEffect(() => {
        let cancelled = false;

        const clearSelectedUsers = () => {
            setForm((previous) => ({
                ...previous,
                // Employee stays visibly assigned to themselves by default.
                selected_users:
                    isEmployee && currentUser ? [currentUser] : [],
            }));
        };

        const loadProjectMembers = async () => {
            if (!projectId) {
                setProjectMembers([]);
                setLoadingMembers(false);
                setEmployeeProjectMemberFound(null);
                clearSelectedUsers();
                setErrors((previous) => ({
                    ...previous,
                    selected_users: '',
                }));
                return;
            }

            setLoadingMembers(true);
            setProjectMembers([]);
            setEmployeeProjectMemberFound(null);
            clearSelectedUsers();
            setErrors((previous) => ({
                ...previous,
                selected_users: '',
            }));

            try {
                const response = await projectsService.getProjectMembers(
                    Number(projectId),
                );

                if (cancelled) {
                    return;
                }

                const members = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.items)
                      ? response.items
                      : Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response?.data?.items)
                          ? response.data.items
                          : [];

                const normalizedMembers: UserOption[] = members
                    .map((member: any) => {
                        const memberUser = member?.user ?? member;
                        const id =
                            member?.user_id ??
                            memberUser?.id ??
                            member?.id;
                        const firstName =
                            memberUser?.first_name ??
                            member?.first_name ??
                            '';
                        const lastName =
                            memberUser?.last_name ??
                            member?.last_name ??
                            '';
                        const email = String(
                            memberUser?.email ??
                            member?.email ??
                            memberUser?.mail ??
                            member?.mail ??
                            '',
                        ).trim();
                        const displayName =
                            memberUser?.display_name ??
                            memberUser?.displayName ??
                            member?.display_name ??
                            member?.displayName ??
                            `${firstName} ${lastName}`.trim();

                        return {
                            ...memberUser,
                            id,
                            displayName: displayName || email || 'Unknown User',
                            first_name: firstName,
                            last_name: lastName,
                            email,
                            mail: memberUser?.mail ?? member?.mail ?? email,
                        } as UserOption;
                    })
                    .filter(
                        (member: UserOption) =>
                            member.id !== undefined && member.id !== null,
                    );

                setProjectMembers(normalizedMembers);

                if (isEmployee) {
                    const currentId = String(currentUser?.id ?? '').trim();
                    const currentEmail = String(
                        currentUser?.email ?? currentUser?.mail ?? '',
                    )
                        .trim()
                        .toLowerCase();

                    const matchedMember = normalizedMembers.find((member) => {
                        const memberId = String(member.id ?? '').trim();
                        const memberEmail = String(
                            member.email ?? member.mail ?? '',
                        )
                            .trim()
                            .toLowerCase();

                        return (
                            (currentId !== '' && memberId === currentId) ||
                            (currentEmail !== '' && memberEmail === currentEmail)
                        );
                    });

                    if (matchedMember) {
                        setForm((previous) => ({
                            ...previous,
                            selected_users: [matchedMember],
                        }));
                        setEmployeeProjectMemberFound(true);
                        setErrors((previous) => ({
                            ...previous,
                            selected_users: '',
                        }));
                    } else {
                        // Keep the employee visible as the default owner,
                        // but validation prevents submission for this project.
                        setForm((previous) => ({
                            ...previous,
                            selected_users: currentUser ? [currentUser] : [],
                        }));
                        setEmployeeProjectMemberFound(false);
                        setErrors((previous) => ({
                            ...previous,
                            selected_users: currentUser
                                ? 'You are not a member of the selected project, so you cannot be assigned as owner/assignee.'
                                : 'Unable to identify the logged-in user.',
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to load project members:', error);

                if (!cancelled) {
                    setProjectMembers([]);
                    setEmployeeProjectMemberFound(isEmployee ? false : null);
                    setForm((previous) => ({
                        ...previous,
                        selected_users:
                            isEmployee && currentUser ? [currentUser] : [],
                    }));
                    setErrors((previous) => ({
                        ...previous,
                        selected_users:
                            'Unable to load project members. Please try selecting the project again.',
                    }));
                }
            } finally {
                if (!cancelled) {
                    setLoadingMembers(false);
                }
            }
        };

        void loadProjectMembers();

        return () => {
            cancelled = true;
        };
    }, [
        projectId,
        isEmployee,
        currentUser?.id,
        currentUser?.email,
        currentUser?.mail,
    ]);

    const validate = () => {
        if (isEmployee && projectId && loadingMembers) {
            setErrors((previous) => ({
                ...previous,
                selected_users: 'Please wait while your project membership is verified.',
            }));
            return false;
        }

        if (
            isEmployee &&
            projectId &&
            employeeProjectMemberFound === false
        ) {
            setErrors((previous) => ({
                ...previous,
                selected_users:
                    previous.selected_users ||
                    'You are not a member of the selected project.',
            }));
            return false;
        }

        const result =
            taskSchema.safeParse(form);

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
            },
        );

        setErrors(nextErrors);

        return false;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        const selectedUsers =
            form.selected_users as UserOption[];

        if (selectedUsers.length === 0) {
            return;
        }

        // Final safety check: never submit a user outside this project's team.
        const allowedMemberIds = new Set(
            projectMembers.map((member) => String(member.id)),
        );

        const hasNonProjectMember = selectedUsers.some(
            (user) => !allowedMemberIds.has(String(user.id)),
        );

        if (loadingMembers || !projectId || hasNonProjectMember) {
            setErrors((previous) => ({
                ...previous,
                selected_users: loadingMembers
                    ? 'Project members are still loading.'
                    : 'User not found in this project. Select a project member.',
            }));
            return;
        }

        /*
         * All selected users are both:
         * - owners
         * - assignees
         *
         * Therefore the same email array is
         * sent to both backend fields.
         */
        const selectedUserEmails =
            selectedUsers
                .map(
                    (user) =>
                        user.mail ||
                        user.email ||
                        '',
                )
                .map((email) =>
                    String(email).trim(),
                )
                .filter(Boolean);

        /*
         * Make sure every selected user has
         * an email address.
         */
        if (
            selectedUserEmails.length !==
            selectedUsers.length
        ) {
            setErrors(
                (previous) => ({
                    ...previous,
                    selected_users:
                        'One or more selected users do not have an email address.',
                }),
            );

            return;
        }

        /*
         * Backend needs ONLY these six fields:
         *
         * task_name
         * project_id
         * due_date
         * estimated_hours
         * assignee_emails
         * owner_emails
         */
        const payload = {
            task_name:
                form.task_name.trim(),

            project_id: Number(
                extractId(
                    form.project_id,
                ),
            ),

            due_date:
                formatLocalDate(
                    form.due_date,
                ),

            estimated_hours:
                Number(
                    form.estimated_hours,
                ),

            /*
             * Same selected users.
             */
            assignee_emails:
                selectedUserEmails,

            /*
             * Same selected users.
             */
            owner_emails:
                selectedUserEmails,
        };

        console.log(
            'Task create payload:',
            payload,
        );

        onSubmit(payload);
    };

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

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

            {/* ================================================= */}
            {/* FORM FIELDS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 gap-3">

                {/* ================================================= */}
                {/* TASK NAME */}
                {/* ================================================= */}

                <div>

                    <FieldLabel
                        label="Task Name"
                        required
                        icon={
                            <ClipboardList
                                size={11}
                            />
                        }
                    />

                    <InputText
                        value={
                            form.task_name
                        }
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
                        disabled={
                            loading
                        }
                    />

                    <FieldError
                        message={
                            errors.task_name
                        }
                    />

                </div>

                {/* ================================================= */}
                {/* PROJECT */}
                {/* ================================================= */}

                <div>

                    <FieldLabel
                        label="Project"
                        required
                        icon={
                            <Briefcase
                                size={11}
                            />
                        }
                    />

                    <ServerSearchDropdown
                        entityType="projects"
                        value={
                            form.project_id
                        }
                        onChange={(value) => {

                            updateField(
                                'project_id',
                                value,
                            );

                            /*
                             * Clear selected users
                             * when project changes.
                             */
                            // Clear the previous project selection immediately.
                            setForm((previous) => ({
                                ...previous,
                                selected_users:
                                    isEmployee && currentUser ? [currentUser] : [],
                            }));

                            // Clear previous project's members immediately.
                            setProjectMembers([]);
                            setEmployeeProjectMemberFound(null);
                            setErrors((previous) => ({
                                ...previous,
                                selected_users: '',
                            }));
                        }}
                        placeholder="Select Project"
                        disabled={
                            loading
                        }
                    />

                    <FieldError
                        message={
                            errors.project_id
                        }
                    />

                </div>

                {/* ================================================= */}
                {/* OWNERS / ASSIGNEES */}
                {/* ================================================= */}

                <div>

                    <FieldLabel
                        label={isEmployee ? 'Owner / Assignee' : 'Owners / Assignees'}
                        required
                        icon={
                            <User2
                                size={11}
                            />
                        }
                    />

                    {isEmployee ? (
                        <div className="space-y-2" aria-disabled="true">
                            {/* Employees see a read-only field, not the editable multiselect. */}
                            <div
                                className="flex min-h-[42px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 opacity-80 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                                role="textbox"
                                aria-readonly="true"
                                aria-label="Owner / Assignee, disabled for employees"
                            >
                                <Search size={15} className="shrink-0 text-slate-400" />
                                <span>
                                    {loadingMembers
                                        ? 'Verifying your project membership...'
                                        : 'Assigned to you'}
                                </span>
                            </div>

                            {/* Display the logged-in employee without a remove button. */}
                            {form.selected_users.length > 0 && (
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 opacity-80 cursor-not-allowed select-none dark:border-slate-700 dark:bg-slate-800/50">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                        {(form.selected_users[0].displayName ||
                                            `${form.selected_users[0].first_name ?? ''} ${form.selected_users[0].last_name ?? ''}`.trim() ||
                                            form.selected_users[0].email ||
                                            'U')
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {form.selected_users[0].displayName ||
                                                `${form.selected_users[0].first_name ?? ''} ${form.selected_users[0].last_name ?? ''}`.trim() ||
                                                form.selected_users[0].email ||
                                                'Logged-in employee'}
                                        </span>
                                        {(form.selected_users[0].email || form.selected_users[0].mail) && (
                                            <span className="truncate text-xs text-slate-500">
                                                {form.selected_users[0].email || form.selected_users[0].mail}
                                            </span>
                                        )}
                                    </div>
                                    <span className="ml-auto shrink-0 text-xs font-medium text-slate-400">
                                        Assigned
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <AIUserMultiSelect
                            value={form.selected_users}
                            onChange={(users) => {
                                const selectedUsers = Array.isArray(users)
                                    ? (users as UserOption[])
                                    : [];

                                const allowedMemberIds = new Set(
                                    projectMembers.map((member) =>
                                        String(member.id),
                                    ),
                                );

                                // Reject any selected user outside this project's member list.
                                const validUsers = selectedUsers.filter((selectedUser) =>
                                    allowedMemberIds.has(String(selectedUser.id)),
                                );

                                updateField('selected_users', validUsers);

                                if (validUsers.length !== selectedUsers.length) {
                                    setErrors((previous) => ({
                                        ...previous,
                                        selected_users:
                                            'User not found in this project. Only project members can be selected.',
                                    }));
                                }
                            }}
                            placeholder={
                                loadingMembers
                                    ? 'Loading project members...'
                                    : projectId
                                      ? 'Add project members...'
                                      : 'Select Project first'
                            }
                            disabled={
                                loading ||
                                loadingMembers ||
                                !projectId
                            }
                        />
                    )}

                    <FieldError
                        message={
                            errors.selected_users
                        }
                    />

                    <p className="text-xs text-slate-500 mt-1">
                        {isEmployee
                            ? 'You are automatically selected as the owner and assignee. Employees cannot add or change assignees.'
                            : 'Only members of the selected project can be selected. Selected members will be both owners and assignees.'}
                    </p>

                </div>

                {/* ================================================= */}
                {/* DUE DATE */}
                {/* ================================================= */}

                <div>

                    <FieldLabel
                        label="Due Date"
                        required
                        icon={
                            <CalIcon
                                size={11}
                            />
                        }
                    />

                    <Calendar
                        value={
                            form.due_date
                        }
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
                        disabled={
                            loading
                        }
                    />

                    <FieldError
                        message={
                            errors.due_date
                        }
                    />

                </div>

                {/* ================================================= */}
                {/* ESTIMATED HOURS */}
                {/* ================================================= */}

                <div>

                    <FieldLabel
                        label="Estimated Hours"
                        required
                        icon={
                            <Timer
                                size={11}
                            />
                        }
                    />

                    <InputText
                        type="number"
                        step="0.5"
                        min="0"
                        value={
                            form.estimated_hours ??
                            ''
                        }
                        onChange={(e) =>
                            updateField(
                                'estimated_hours',
                                e.target.value ===
                                    ''
                                    ? null
                                    : Number(
                                          e.target.value,
                                      ),
                            )
                        }
                        placeholder="e.g. 40"
                        className={inputCls(
                            !!errors.estimated_hours,
                        )}
                        disabled={
                            loading
                        }
                    />

                    <FieldError
                        message={
                            errors.estimated_hours
                        }
                    />

                </div>

            </div>

            {/* ================================================= */}
            {/* BUTTONS */}
            {/* ================================================= */}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">

                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={
                        loading
                    }
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    variant="gradient"
                    onClick={
                        handleSubmit
                    }
                    loading={
                        loading
                    }
                >
                    Submit
                </Button>

            </div>

        </div>
    );
}