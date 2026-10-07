import { useState, useRef, useEffect } from 'react';

import {
    Bot,
    MoreHorizontal,
    X,
    Send,
    Sun,
    Moon,
    Trash2,
} from 'lucide-react';

import { useAuth } from '@/auth/AuthProvider';

import { useChatbot } from '../hooks/useChatbot';
import { ChatMessage } from './ChatMessage';

export function ChatbotPanel() {

    const { user } = useAuth();

    const [open, setOpen] =
        useState(false);

    const [input, setInput] =
        useState('');

    const [menuOpen, setMenuOpen] =
        useState(false);

    const inputRef =
        useRef<HTMLTextAreaElement | null>(null);

    const menuRef =
        useRef<HTMLDivElement>(null);

    // ADDED: reference to the bottom of the messages
    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);

    const [
        theme,
        setTheme,
    ] = useState<'light' | 'dark'>(
        'light'
    );

    const {
        messages,
        loading,
        sendMessage,
        clearMessages,
        clearChat,
    } = useChatbot();

    /*
     * Stores the confirmation currently
     * waiting for user action.
     */
    const [
        confirmation,
        setConfirmation,
    ] = useState<{
        messageId: string;
        data: any;
    } | null>(null);

    const getConfirmationEntity = () => {
        if (!confirmation?.data) {
            return null;
        }

        const entityKeys = [
            'task',
            'project',
            'issue',
            'tasklist',
            'milestone',
        ];

        const key = entityKeys.find(
            (entity) =>
                confirmation.data?.[entity] !== undefined,
        );

        if (!key) {
            return null;
        }

        return {
            key,
            value: confirmation.data[key] ?? {},
        };
    };

    const formatConfirmationLabel = (key: string) =>
        key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

    const formatConfirmationValue = (value: any) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    };

    /*
     * Close menu when clicking outside.
     */
    useEffect(() => {

        const handleClickOutside = (
            event: MouseEvent
        ) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };

    }, []);

    /*
     * Clear any pending confirmation whenever
     * the chatbot is closed.
     */
    useEffect(() => {
        if (!open) {
            setConfirmation(null);
        }
    }, [open]);

    /*
     * ADDED:
     * Automatically scroll to the latest message
     * whenever the messages array changes.
     */
    useEffect(() => {
        if (!open) {
            return;
        }

        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'auto',
                block: 'end',
            });
        });
    }, [open, messages]);

    const firstName =
        user?.first_name ||
        user?.display_name ||
        'there';

    /*
     * Clear chat.
     */
    const handleClearChat = () => {

        clearMessages();

        setConfirmation(null);

        setInput('');

        setMenuOpen(false);
    };

    /*
     * Send normal chatbot message.
     */
    const handleSend = async () => {

        const value =
            input.trim();

        if (
            !value ||
            loading
        ) {
            return;
        }

        /*
         * Allow text confirmation:
         *
         * confirm
         * yes
         * approve
         */
        if (
            confirmation &&
            [
                'confirm',
                'yes',
                'approve',
            ].includes(
                value.toLowerCase()
            )
        ) {

            setInput('');

            await handleConfirm();

            return;
        }

        setInput('');

        await sendMessage({
            message: value,
        });
    };

    /*
     * Submit creation form.
     *
     * Used by:
     * ProjectCreateChatForm
     * TaskCreateChatForm
     * and future forms.
     */
    const handleFormSubmit = async (
        messageId: string,
        formData: Record<string, any>,
    ) => {

        const response =
            await sendMessage(
                {
                    message: '',
                    action: 'submit_form',
                    form_data: formData,
                },
                {
                    replaceMessageId:
                        messageId,
                },
            );

        if (!response) {
            return;
        }

        /*
         * Backend returned confirmation.
         */
        if (
            response.response_type ===
            'confirmation'
        ) {

            setConfirmation({
                messageId,
                data: response.data,
            });

            return;
        }

        setConfirmation(null);
    };

    /*
     * Cancel creation form.
     */
    const handleFormCancel = async (
        messageId: string,
    ) => {

        if (loading) {
            return;
        }

        setConfirmation(null);

        try {

            await sendMessage(
                {
                    message: '',
                    action: 'cancel',
                },
                {
                    replaceMessageId:
                        messageId,

                    displayContent:
                        '<p>Creation cancelled.</p>',
                },
            );

        } catch (error) {

            console.error(
                'Failed to cancel creation:',
                error
            );
        }
    };

    /*
     * Confirm creation.
     */
    const handleConfirm = async () => {

        if (
            !confirmation ||
            loading
        ) {
            return;
        }

        const messageId =
            confirmation.messageId;

        try {

            const response =
                await sendMessage(
                    {
                        message: '',
                        action: 'confirm',
                    },
                    {
                        replaceMessageId:
                            messageId,
                    },
                );

            if (!response) {
                return;
            }

            /*
             * If backend returns another
             * confirmation, keep it active.
             */
            if (
                response.response_type ===
                'confirmation'
            ) {

                setConfirmation({
                    messageId,
                    data: response.data,
                });

                return;
            }

            /*
             * Creation completed.
             */
            setConfirmation(null);

        } catch (error) {

            console.error(
                'Creation confirmation failed:',
                error
            );
        }
    };

    /*
     * Cancel confirmation.
     */
    const handleConfirmationCancel =
        async () => {

            if (
                !confirmation ||
                loading
            ) {
                return;
            }

            const messageId =
                confirmation.messageId;

            setConfirmation(null);

            try {

                await sendMessage(
                    {
                        message: '',
                        action: 'cancel',
                    },
                    {
                        replaceMessageId:
                            messageId,

                        displayContent:
                            '<p>Creation cancelled.</p>',
                    },
                );

            } catch (error) {

                console.error(
                    'Failed to cancel confirmation:',
                    error
                );
            }
        };

    /*
     * Closed chatbot.
     */
    if (!open) {

        return (
            <button
                type="button"
                onClick={() =>
                    setOpen(true)
                }
                className="
                    fixed
                    right-5
                    bottom-5
                    z-50
                    w-14
                    h-14
                    rounded-full
                    bg-emerald-500
                    text-white
                    shadow-xl
                    flex
                    items-center
                    justify-center
                    hover:bg-emerald-600
                    transition
                "
            >
                <Bot size={22} />
            </button>
        );
    }

    return (
        <aside
            className={`
                fixed
                top-20
                right-4
                bottom-4
                z-50
                w-[390px]
                max-w-[calc(100vw-2rem)]
                rounded-2xl
                border
                shadow-2xl
                flex
                flex-col
                overflow-hidden
                ${
                    theme === 'dark'
                        ? 'dark bg-slate-900 border-slate-800 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                }
            `}
        >

            {/* HEADER */}

            <div
                className="
                    h-16
                    px-4
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-200
                    dark:border-slate-800
                "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                            w-9
                            h-9
                            rounded-xl
                            bg-emerald-500
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <Bot
                            size={18}
                            className="text-white"
                        />
                    </div>

                    <div>

                        <div
                            className="
                                font-bold
                                text-sm
                                text-slate-900
                                dark:text-white
                            "
                        >
                            PMS Assistant
                        </div>

                        <div
                            className="
                                text-[11px]
                                text-slate-400
                            "
                        >
                            Project Management Assistant
                        </div>

                    </div>

                </div>

                <div
                    ref={menuRef}
                    className="
                        flex
                        items-center
                        gap-1
                        relative
                    "
                >

                    {/* MORE MENU */}

                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                previous =>
                                    !previous
                            )
                        }
                        className="
                            w-8
                            h-8
                            rounded-lg
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                            flex
                            items-center
                            justify-center
                            text-slate-600
                            dark:text-slate-300
                        "
                    >
                        <MoreHorizontal
                            size={17}
                        />
                    </button>

                    {/* CLOSE */}

                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            setMenuOpen(false);
                            setConfirmation(null);
                        }}
                        className="
                            w-8
                            h-8
                            rounded-lg
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                            flex
                            items-center
                            justify-center
                            text-slate-600
                            dark:text-slate-300
                        "
                    >
                        <X size={17} />
                    </button>

                    {/* MENU */}

                    {menuOpen && (

                        <div
                            className="
                                absolute
                                right-0
                                top-10
                                w-48
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-900
                                shadow-xl
                                p-1
                                z-50
                            "
                        >

                            <div
                                className="
                                    px-3
                                    py-2
                                    text-[11px]
                                    font-semibold
                                    text-slate-400
                                    uppercase
                                "
                            >
                                Theme
                            </div>

                            <button
                                type="button"
                                onClick={() => {

                                    setTheme(
                                        previous =>
                                            previous ===
                                            'light'
                                                ? 'dark'
                                                : 'light'
                                    );

                                }}
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-2
                                    rounded-lg
                                    text-sm
                                    text-left
                                    hover:bg-slate-100
                                    dark:hover:bg-slate-800
                                    text-slate-700
                                    dark:text-slate-200
                                "
                            >

                                {theme ===
                                'light' ? (
                                    <Moon
                                        size={15}
                                    />
                                ) : (
                                    <Sun
                                        size={15}
                                    />
                                )}

                                {theme ===
                                'light'
                                    ? 'Dark'
                                    : 'Light'}

                            </button>

                            <div
                                className="
                                    my-1
                                    border-t
                                    border-slate-200
                                    dark:border-slate-700
                                "
                            />

                            {/* CLEAR CHAT */}

                            <button
                                type="button"
                                onClick={
                                    handleClearChat
                                }
                                disabled={
                                    clearChat ||
                                    loading
                                }
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-2
                                    rounded-lg
                                    text-sm
                                    text-left
                                    hover:bg-slate-100
                                    dark:hover:bg-slate-800
                                    text-red-600
                                    dark:text-red-400
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                            >
                                <Trash2
                                    size={15}
                                />

                                Clear Chat
                            </button>

                        </div>
                    )}

                </div>

            </div>

            {/* CHAT AREA */}

            <div
                className="
                    flex-1
                    overflow-y-auto
                    custom-scrollbar
                    p-4
                "
            >

                {/* EMPTY STATE */}

                {messages.length === 0 && (

                    <div
                        className="
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            px-6
                        "
                    >

                        <div
                            className="
                                w-14
                                h-14
                                rounded-2xl
                                bg-emerald-50
                                dark:bg-emerald-900/20
                                flex
                                items-center
                                justify-center
                                mb-4
                            "
                        >
                            <Bot
                                size={24}
                                className="text-emerald-500"
                            />
                        </div>

                        <h3
                            className="
                                font-bold
                                text-base
                                mb-1
                                text-slate-900
                                dark:text-white
                            "
                        >
                            Hello {firstName}!
                        </h3>

                        <p
                            className="
                                text-sm
                                text-slate-600
                                dark:text-slate-300
                                mb-2
                            "
                        >
                            How can I help you
                            today?
                        </p>

                        <p
                            className="
                                text-xs
                                text-slate-500
                                dark:text-slate-400
                            "
                        >
                            Ask about projects,
                            tasks, issues,
                            milestones, or create
                            something.
                        </p>

                    </div>
                )}

                {/* CHAT MESSAGES */}

                {messages.map(
                    (message) => (

                        <ChatMessage
                            key={
                                message.id
                            }

                            message={
                                message
                            }

                            onFormSubmit={
                                handleFormSubmit
                            }

                            onFormCancel={
                                handleFormCancel
                            }

                            loading={
                                loading
                            }
                        />

                    )
                )}

                {/* ADDED: bottom reference for auto-scroll */}

                <div ref={messagesEndRef} />

                {/* LOADING */}

                {loading && (

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-400
                            py-2
                        "
                    >
                        <span
                            className="
                                w-2
                                h-2
                                rounded-full
                                bg-emerald-400
                                animate-pulse
                            "
                        />

                        Thinking...
                    </div>
                )}

            </div>

            {/* CONFIRMATION POPUP */}

            {confirmation?.data && (() => {

                const entity =
                    getConfirmationEntity();

                if (!entity) {
                    return null;
                }

                const { key, value } = entity;

                const title =
                    formatConfirmationLabel(key);

                const entries =
                    Object.entries(
                        value ?? {}
                    ).filter(
                        ([field]) =>
                            ![
                                'requires_confirmation',
                                'response_type',
                                'type',
                                'action',
                            ].includes(field),
                    );

                return (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">

                        <div
                            className="w-full max-w-[350px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="creation-confirmation-title"
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div>

                                    <h3
                                        id="creation-confirmation-title"
                                        className="text-base font-bold text-slate-900 dark:text-white"
                                    >
                                        Confirm {title} Creation
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Please review the details before creating the record.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleConfirmationCancel
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                                    aria-label="Close confirmation"
                                >
                                    <X size={16} />
                                </button>

                            </div>

                            <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">

                                <div className="space-y-2">

                                    {entries.length === 0 ? (

                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No additional details available.
                                        </p>

                                    ) : (

                                        entries.map(
                                            ([field, fieldValue]) => (

                                                <div
                                                    key={field}
                                                    className="flex items-start justify-between gap-4 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0 dark:border-slate-700"
                                                >

                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        {formatConfirmationLabel(field)}
                                                    </span>

                                                    <span className="max-w-[190px] break-words text-right text-xs font-semibold text-slate-800 dark:text-slate-100">
                                                        {formatConfirmationValue(fieldValue)}
                                                    </span>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>

                            <div className="mt-5 flex gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        handleConfirmationCancel
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleConfirm
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {loading
                                        ? 'Creating...'
                                        : `Confirm ${title}`}
                                </button>

                            </div>

                        </div>

                    </div>
                );

            })()}

            {/* INPUT AREA */}

            <div
                className="
                    p-3
                    border-t
                    border-slate-200
                    dark:border-slate-800
                "
            >

                <div
                    className="
                        flex
                        items-end
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        dark:border-slate-700
                        bg-slate-50
                        dark:bg-slate-800/50
                        px-3
                        py-2
                    "
                >

                    <textarea
                        ref={inputRef}
                        value={input}
                        rows={1}
                        placeholder="Type your message..."
                        onChange={(e) => {

                            setInput(
                                e.target.value
                            );

                            const textarea =
                                e.currentTarget;

                            const maxHeight =
                                120;

                            textarea.style.height =
                                '24px';

                            const newHeight =
                                Math.min(
                                    textarea.scrollHeight,
                                    maxHeight
                                );

                            textarea.style.height =
                                `${newHeight}px`;

                            textarea.style.overflowY =
                                textarea.scrollHeight >
                                maxHeight
                                    ? 'auto'
                                    : 'hidden';
                        }}
                        onKeyDown={(e) => {

                            if (
                                e.key ===
                                    'Enter' &&
                                !e.shiftKey
                            ) {

                                e.preventDefault();

                                handleSend();
                            }
                        }}
                        className="
                            flex-1
                            min-w-0
                            !border-0
                            !outline-none
                            !shadow-none
                            !bg-transparent
                            resize-none
                            text-sm
                            leading-6
                            p-0
                            m-0
                        "
                        style={{
                            height: '24px',
                            minHeight: '24px',
                            maxHeight: '120px',
                            overflowY: 'hidden',
                        }}
                    />

                    <button
                        type="button"
                        disabled={
                            loading ||
                            !input.trim()
                        }
                        onClick={
                            handleSend
                        }
                        className="
                            w-9
                            h-9
                            rounded-lg
                            bg-slate-900
                            text-white
                            flex
                            items-center
                            justify-center
                            disabled:opacity-40
                        "
                    >
                        <Send size={15} />
                    </button>

                </div>

            </div>

        </aside>
    );
}