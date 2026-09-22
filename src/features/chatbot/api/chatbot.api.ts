import { api } from '@/api/client';

import type {
    ChatRequest,
    ChatResponse,
} from '../types/chatbot.types';

export const chatbotService = {
    async sendMessage(
        payload: ChatRequest,
    ): Promise<ChatResponse> {

        console.log(
            'CHATBOT REQUEST START:',
            new Date().toISOString(),
            payload
        );

        try {

            const response = await api.post(
                '/chatbot/chat',
                payload,
                {
                    timeout: 1800000,
                },
            );

            console.log(
                'CHATBOT RESPONSE RECEIVED:',
                new Date().toISOString(),
                response.data
            );

            return response.data;

        } catch (error) {

            console.error(
                'CHATBOT API ERROR:',
                error
            );

            throw error;
        }
    },
};