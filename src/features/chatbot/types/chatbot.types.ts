export type ChatResponseType =
    | 'chat'
    | 'form'
    | 'confirmation';

export interface ChatRequest {
    message?: string;
    action?: 'submit_form' | 'confirm' | 'cancel' | 'approve' | 'yes';
    form_data?: Record<string, any>;
}

export interface ChatResponse {
    session_id: number;
    response_type: ChatResponseType;
    response: string;
    data: any;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    responseType?: ChatResponseType;
    data?: any;
}