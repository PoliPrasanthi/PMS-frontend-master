import {
    useEffect,
    useState,
} from 'react';

import { useAuth } from '@/auth/AuthProvider';

import { chatbotService } from '../api/chatbot.api';

import type {
    ChatMessage,
    ChatRequest,
    ChatResponse,
} from '../types/chatbot.types';


interface SendOptions {
    replaceMessageId?: string;
    displayContent?: string;
}


export function useChatbot() {

    const { user } = useAuth();

    // =========================================================
    // CHAT STATE
    // =========================================================

    const [
        messages,
        setMessages,
    ] = useState<ChatMessage[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        sessionId,
        setSessionId,
    ] = useState<number | null>(null);

    const [
        clearChat,
        setClearChat,
    ] = useState(true);

    const [
        hydrated,
        setHydrated,
    ] = useState(false);


    // =========================================================
    // LOCAL STORAGE KEYS
    // =========================================================

    const userKey =
        user?.id
            ? String(user.id)
            : 'anonymous';

    const messagesStorageKey =
        `pms_chat_messages_${userKey}`;

    const sessionStorageKey =
        `pms_chat_session_${userKey}`;


    // =========================================================
    // LOAD CHAT FROM LOCAL STORAGE
    // =========================================================

    useEffect(() => {

        if (!user?.id) {

            setMessages([]);
            setSessionId(null);
            setClearChat(true);
            setHydrated(true);

            return;
        }

        setHydrated(false);

        try {

            // -------------------------------------------------
            // LOAD MESSAGES
            // -------------------------------------------------

            const storedMessages =
                localStorage.getItem(
                    messagesStorageKey,
                );

            if (storedMessages) {

                const parsedMessages =
                    JSON.parse(
                        storedMessages,
                    );

                if (
                    Array.isArray(
                        parsedMessages,
                    )
                ) {

                    setMessages(
                        parsedMessages,
                    );

                    setClearChat(
                        parsedMessages.length === 0,
                    );

                } else {

                    setMessages([]);
                    setClearChat(true);
                }

            } else {

                setMessages([]);
                setClearChat(true);
            }


            // -------------------------------------------------
            // LOAD SESSION ID
            // -------------------------------------------------

            const storedSessionId =
                localStorage.getItem(
                    sessionStorageKey,
                );

            if (storedSessionId) {

                const parsedSessionId =
                    Number(
                        storedSessionId,
                    );

                if (
                    !Number.isNaN(
                        parsedSessionId,
                    )
                ) {

                    setSessionId(
                        parsedSessionId,
                    );

                } else {

                    setSessionId(null);
                }

            } else {

                setSessionId(null);
            }

        } catch (error) {

            console.error(
                'Failed to load local chat history:',
                error,
            );

            setMessages([]);
            setSessionId(null);
            setClearChat(true);

        } finally {

            setHydrated(true);
        }

    }, [
        user?.id,
        messagesStorageKey,
        sessionStorageKey,
    ]);


    // =========================================================
    // SAVE MESSAGES TO LOCAL STORAGE
    // =========================================================

    useEffect(() => {

        if (
            !hydrated ||
            !user?.id
        ) {
            return;
        }

        try {

            localStorage.setItem(
                messagesStorageKey,
                JSON.stringify(messages),
            );

        } catch (error) {

            console.error(
                'Failed to save local chat history:',
                error,
            );
        }

    }, [
        messages,
        hydrated,
        user?.id,
        messagesStorageKey,
    ]);


    // =========================================================
    // SAVE SESSION ID TO LOCAL STORAGE
    // =========================================================

    useEffect(() => {

        if (
            !hydrated ||
            !user?.id
        ) {
            return;
        }

        try {

            if (
                sessionId !== null
            ) {

                localStorage.setItem(
                    sessionStorageKey,
                    String(sessionId),
                );

            } else {

                localStorage.removeItem(
                    sessionStorageKey,
                );
            }

        } catch (error) {

            console.error(
                'Failed to save chat session:',
                error,
            );
        }

    }, [
        sessionId,
        hydrated,
        user?.id,
        sessionStorageKey,
    ]);


    // =========================================================
    // SEND MESSAGE
    // =========================================================

    const sendMessage = async (
        payload: ChatRequest,
        options?: SendOptions,
    ): Promise<ChatResponse | undefined> => {

        if (loading) {
            return undefined;
        }

        setLoading(true);
        setClearChat(false);

        const userContent =
            payload.message?.trim() || '';


        // =====================================================
        // ADD USER MESSAGE
        // =====================================================

        if (userContent) {

            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: userContent,
            };

            setMessages(
                previous => [
                    ...previous,
                    userMessage,
                ],
            );
        }


        try {

            // =================================================
            // CALL ONLY CHATBOT API
            // =================================================

            console.log(
                'CHATBOT MESSAGE:',
                payload,
            );

            const response: ChatResponse =
                await chatbotService.sendMessage(
                    payload,
                );

            console.log(
                'CHATBOT RESPONSE:',
                response,
            );


            // =================================================
            // UPDATE SESSION
            // =================================================

            const responseSessionId =
                response.session_id;

            const sessionChanged =
                sessionId !== null &&
                responseSessionId !== sessionId;

            setSessionId(
                responseSessionId,
            );


            // =================================================
            // CREATE ASSISTANT MESSAGE
            // =================================================

            const assistantMessage: ChatMessage = {

                id:
                    options?.replaceMessageId ??
                    crypto.randomUUID(),

                role:
                    'assistant',

                content:
                    options?.displayContent ??
                    response.response ??
                    '',

                responseType:
                    response.response_type,

                data:
                    response.data ??
                    [],
            };


            // =================================================
            // NEW BACKEND SESSION
            // =================================================

            if (sessionChanged) {

                const newSessionMessages:
                    ChatMessage[] = [];

                if (userContent) {

                    newSessionMessages.push({
                        id:
                            crypto.randomUUID(),

                        role:
                            'user',

                        content:
                            userContent,
                    });
                }

                newSessionMessages.push(
                    assistantMessage,
                );

                setMessages(
                    newSessionMessages,
                );

                setClearChat(false);

                return response;
            }


            // =================================================
            // REPLACE EXISTING MESSAGE
            // =================================================

            if (
                options?.replaceMessageId
            ) {

                const replaceId =
                    String(
                        options.replaceMessageId,
                    );

                setMessages(
                    previous => {

                        let found = false;

                        const updated =
                            previous.map(
                                message => {

                                    if (
                                        String(
                                            message.id,
                                        ) !==
                                        replaceId
                                    ) {
                                        return message;
                                    }

                                    found = true;

                                    return {
                                        ...message,
                                        ...assistantMessage,
                                        id: message.id,
                                    };
                                },
                            );


                        // -------------------------------------------------
                        // FALLBACK
                        // -------------------------------------------------

                        if (!found) {

                            let fallbackIndex =
                                -1;

                            for (
                                let index =
                                    updated.length - 1;

                                index >= 0;

                                index--
                            ) {

                                const message =
                                    updated[index];

                                if (
                                    message.role ===
                                    'assistant' &&
                                    (
                                        message.responseType ===
                                        'form' ||
                                        message.responseType ===
                                        'confirmation'
                                    )
                                ) {

                                    fallbackIndex =
                                        index;

                                    break;
                                }
                            }


                            if (
                                fallbackIndex !==
                                -1
                            ) {

                                updated[
                                    fallbackIndex
                                ] = {
                                    ...updated[
                                        fallbackIndex
                                    ],

                                    ...assistantMessage,

                                    id:
                                        updated[
                                            fallbackIndex
                                        ].id,
                                };
                            }
                        }

                        return updated;
                    },
                );

                return response;
            }


            // =================================================
            // NORMAL ASSISTANT MESSAGE
            // =================================================

            setMessages(
                previous => [
                    ...previous,
                    assistantMessage,
                ],
            );

            return response;

        } catch (error) {

            console.error(
                'Chatbot request failed:',
                error,
            );

            if (
                error instanceof Error
            ) {

                console.error(
                    'Error message:',
                    error.message,
                );
            }


            // =================================================
            // ERROR MESSAGE
            // =================================================

            const errorMessage: ChatMessage = {

                id:
                    options?.replaceMessageId ??
                    crypto.randomUUID(),

                role:
                    'assistant',

                content:
                    'Sorry, something went wrong. Please try again.',

                responseType:
                    'chat',

                data: [],
            };


            if (
                options?.replaceMessageId
            ) {

                const replaceId =
                    String(
                        options.replaceMessageId,
                    );

                setMessages(
                    previous => {

                        const found =
                            previous.some(
                                message =>
                                    String(
                                        message.id,
                                    ) ===
                                    replaceId,
                            );

                        if (found) {

                            return previous.map(
                                message => {

                                    if (
                                        String(
                                            message.id,
                                        ) !==
                                        replaceId
                                    ) {
                                        return message;
                                    }

                                    return {
                                        ...message,
                                        ...errorMessage,
                                        id:
                                            message.id,
                                    };
                                },
                            );
                        }

                        return [
                            ...previous,
                            errorMessage,
                        ];
                    },
                );

            } else {

                setMessages(
                    previous => [
                        ...previous,
                        errorMessage,
                    ],
                );
            }

            return undefined;

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // CLEAR CHAT
    // =========================================================

    const clearMessages = () => {

        // Clear UI
        setMessages([]);

        // Enable Clear Chat state
        setClearChat(true);

        // Remove frontend history
        // Backend/MongoDB remains untouched.

        try {

            localStorage.removeItem(
                messagesStorageKey,
            );

        } catch (error) {

            console.error(
                'Failed to clear local chat history:',
                error,
            );
        }
    };


    // =========================================================
    // RETURN
    // =========================================================

    return {
        messages,
        loading,
        sessionId,
        clearChat,
        sendMessage,
        clearMessages,
    };
}