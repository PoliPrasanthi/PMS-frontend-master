import React from 'react';
import {
    UserAutocomplete,
    type UserOption,
} from './UserAutocomplete';

interface AIUserMultiSelectProps {
    value: UserOption[];
    onChange: (users: UserOption[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function AIUserMultiSelect({
    value,
    onChange,
    placeholder = 'Add more...',
    disabled = false,
}: AIUserMultiSelectProps) {

    const handleUserSelect = (
        user: UserOption | null,
    ) => {
        if (!user) {
            return;
        }

        const userId = String(
            (user as any).id ??
            (user as any).mail ??
            (user as any).email ??
            '',
        );

        const alreadyAdded = value.some(
            (existingUser) =>
                String(
                    (existingUser as any).id ??
                    (existingUser as any).mail ??
                    (existingUser as any).email ??
                    '',
                ) === userId,
        );

        if (alreadyAdded) {
            return;
        }

        onChange([
            ...value,
            user,
        ]);
    };

    const handleRemove = (
        index: number,
    ) => {
        onChange(
            value.filter(
                (_, userIndex) =>
                    userIndex !== index,
            ),
        );
    };

    const getUserName = (
        user: UserOption,
    ) => {
        const data = user as any;

        return (
            data.display_name ??
            data.name ??
            `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() ??
            data.mail ??
            data.email ??
            'User'
        );
    };

    const getUserEmail = (
        user: UserOption,
    ) => {
        const data = user as any;

        return (
            data.mail ??
            data.email ??
            ''
        );
    };

    return (
        <div className="w-full">

            {/* ADD MORE / SEARCH */}
            <div className="w-full">
                <UserAutocomplete
                    value={null}
                    onChange={handleUserSelect}
                    placeholder={placeholder}
                />
            </div>

            {/* SELECTED USERS */}
            {value.length > 0 && (
                <div className="mt-3">

                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        Added Team Members
                    </div>

                    <div className="space-y-2">

                        {value.map(
                            (
                                user,
                                index,
                            ) => (
                                <div
                                    key={
                                        String(
                                            (user as any).id ??
                                            (user as any).mail ??
                                            (user as any).email ??
                                            index,
                                        )
                                    }
                                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                                >

                                    <div className="flex items-center gap-2 min-w-0">

                                        {/* Avatar */}
                                        <div className="w-7 h-7 flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">

                                            {getUserName(user)
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>

                                        {/* User details */}
                                        <div className="min-w-0">

                                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                {getUserName(user)}
                                            </div>

                                            {getUserEmail(user) && (
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {getUserEmail(user)}
                                                </div>
                                            )}

                                        </div>

                                    </div>

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() =>
                                            handleRemove(
                                                index,
                                            )
                                        }
                                        className="w-6 h-6 flex-shrink-0 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        title="Remove"
                                    >
                                        ×
                                    </button>

                                </div>
                            ),
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}