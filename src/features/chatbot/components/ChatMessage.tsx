import { ProjectCreateChatForm } from './forms/ProjectCreateChatForm';
import { TaskCreateChatForm } from './forms/TaskCreateChatForm';
import { TaskListCreateChatForm } from './forms/TaskListCreateChatForm';
import { IssueCreateChatForm } from './forms/IssueCreateChatForm';

interface ChatMessageProps {
    message: any;

    onFormSubmit: (
        messageId: string,
        data: Record<string, any>,
    ) => void;

    onFormCancel: (
        messageId: string,
    ) => void;

    loading?: boolean;
}

export function ChatMessage({
    message,
    onFormSubmit,
    onFormCancel,
    loading,
}: ChatMessageProps) {

    const isUser =
        message.role === 'user';

    return (
        <div
            className={
                isUser
                    ? 'flex justify-end mb-3'
                    : 'flex justify-start mb-3'
            }
        >
            <div
                className={
                    isUser
                        ? 'max-w-[88%]'
                        : 'max-w-[95%] w-full'
                }
            >

                {isUser ? (

                    <div className="rounded-2xl rounded-tr-md bg-slate-900 text-white px-4 py-2.5 text-sm">
                        {message.content}
                    </div>

                ) : (

                    <div className="flex gap-2">

                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">
                                🤖
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">

                            {/* ASSISTANT MESSAGE */}

                            {message.content && (
                                <div
                                    className="text-sm text-slate-700 dark:text-slate-200 mb-2"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            message.content,
                                    }}
                                />
                            )}

                            {/* PROJECT CREATE FORM */}

                            {message.responseType ===
                                'form' &&
                                message.data?.form_type ===
                                    'create_project' && (

                                    <ProjectCreateChatForm
                                        onSubmit={(
                                            formData,
                                        ) =>
                                            onFormSubmit(
                                                message.id,
                                                formData,
                                            )
                                        }
                                        onCancel={() =>
                                            onFormCancel(
                                                message.id,
                                            )
                                        }
                                        loading={
                                            loading
                                        }
                                    />
                                )}

                                {/* Task list create form */}
                                {message.responseType === 'form' &&
                                message.data?.form_type === 'create_tasklist' && (
                                    <TaskListCreateChatForm
                                        onSubmit={(data) =>
                                            onFormSubmit(message.id, data)
                                        }
                                        onCancel={() =>
                                            onFormCancel(message.id)
                                        }
                                        loading={loading}
                                    />
                                )}
                                {/* Issue create form */}
                                {message.responseType === 'form' &&
                                message.data?.form_type === 'create_issue' && (
                                    <IssueCreateChatForm
                                        onSubmit={(data) =>
                                            onFormSubmit(message.id, data)
                                        }
                                        onCancel={() =>
                                            onFormCancel(message.id)
                                        }
                                        loading={loading}
                                    />
                                )}  

                            {/* TASK CREATE FORM */}

                            {message.responseType ===
                                'form' &&
                                message.data?.form_type ===
                                    'create_task' && (

                                    <TaskCreateChatForm
                                        onSubmit={(
                                            formData,
                                        ) =>
                                            onFormSubmit(
                                                message.id,
                                                formData,
                                            )
                                        }
                                        onCancel={() =>
                                            onFormCancel(
                                                message.id,
                                            )
                                        }
                                        loading={
                                            loading
                                        }
                                    />
                                )}

                            {/*
                             * IMPORTANT:
                             *
                             * Confirmation UI is intentionally NOT
                             * rendered here.
                             *
                             * ChatbotPanel.tsx owns the single
                             * confirmation popup.
                             */}

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}