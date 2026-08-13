// lib/api/email-marketing/mail-senders.ts
// Mail Senders API functions

import { logger } from "../../utils/logger";
import { fetchWithTimeout } from "../api-client";

// ============================================
// Types
// ============================================

export interface MailSender {
    id: string;
    name: string;
    email: string;
    domain: string;
    active: boolean;
    ips: string[];
    brevo_sender_id: number;
    is_enabled: boolean;
    is_default: boolean;
    is_system_mail_sender: boolean;
    user_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface MailSendersResponse {
    success: boolean;
    data: {
        total: number;
        page: number;
        limit: number;
        mail_senders: MailSender[];
    };
    error: any;
}

export interface CreateMailSenderData {
    name: string;
    email: string;
    is_personal?: boolean;
}

export interface CreateMailSenderResponse {
    success: boolean;
    data: MailSender;
    error: any;
}

export interface ValidateMailSenderResponse {
    success: boolean;
    data: any;
    error: any;
}

export interface UpdateMailSenderData {
    name: string;
}

export interface UpdateMailSenderResponse {
    success: boolean;
    data: MailSender;
    error: any;
}

export interface DeleteMailSenderResponse {
    success: boolean;
    data: any;
    error: any;
}

// ============================================
// Functions
// ============================================

export async function fetchMailSenders(token: string): Promise<MailSendersResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mail-senders`;

    logger.info("Making GET request to fetch mail senders", { url });

    try {
        const res = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        let json;
        try {
            json = await res.json();
        } catch (parseError: any) {
            logger.error("Failed to parse mail senders response JSON", {
                status: res.status,
                statusText: res.statusText,
                parseError: parseError.message
            });
            throw new Error(`Server returned invalid response (${res.status})`);
        }

        logger.apiResponse("/mail-senders (GET)", { status: res.status, response: json });

        if (res.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        if (!res.ok) {
            logger.error(`Fetch mail senders failed: ${res.status}`, {
                status: res.status,
                statusText: res.statusText,
                response: json,
                url
            });
            throw new Error(json.error?.message || `Failed to fetch mail senders (${res.status}: ${res.statusText})`);
        }

        return json;
    } catch (error: any) {
        logger.error("Fetch mail senders request failed", { error: error.message, url });
        throw error;
    }
}

export async function createMailSender(token: string, data: CreateMailSenderData): Promise<CreateMailSenderResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mail-senders`;

    logger.info("Making POST request to create mail sender", { url, data });

    try {
        const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        let json;
        try {
            json = await res.json();
        } catch (parseError: any) {
            logger.error("Failed to parse create mail sender response JSON", {
                status: res.status,
                statusText: res.statusText,
                parseError: parseError.message
            });
            throw new Error(`Server returned invalid response (${res.status})`);
        }

        logger.apiResponse("/mail-senders (POST)", { status: res.status, response: json });

        if (res.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        if (!res.ok) {
            logger.error(`Create mail sender failed: ${res.status}`, {
                status: res.status,
                statusText: res.statusText,
                response: json,
                url
            });
            throw new Error(json.error?.message || `Failed to create mail sender (${res.status}: ${res.statusText})`);
        }

        return json;
    } catch (error: any) {
        logger.error("Create mail sender request failed", { error: error.message, url });
        throw error;
    }
}

export async function validateMailSender(token: string, mailSenderId: string, otp: number): Promise<ValidateMailSenderResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mail-senders/${mailSenderId}/validate`;

    logger.info("Making POST request to validate mail sender", { url, mailSenderId });

    try {
        const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ otp }),
        });

        let json;
        try {
            json = await res.json();
        } catch (parseError: any) {
            logger.error("Failed to parse validate mail sender response JSON", {
                status: res.status,
                statusText: res.statusText,
                parseError: parseError.message
            });
            throw new Error(`Server returned invalid response (${res.status})`);
        }

        logger.apiResponse(`/mail-senders/${mailSenderId}/validate (POST)`, { status: res.status, response: json });

        if (res.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        if (!res.ok) {
            logger.error(`Validate mail sender failed: ${res.status}`, {
                status: res.status,
                statusText: res.statusText,
                response: json,
                url
            });
            throw new Error(json.error?.message || `Failed to validate mail sender (${res.status}: ${res.statusText})`);
        }

        return json;
    } catch (error: any) {
        logger.error("Validate mail sender request failed", { error: error.message, url });
        throw error;
    }
}

export async function updateMailSender(token: string, mailSenderId: string, data: UpdateMailSenderData): Promise<UpdateMailSenderResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mail-senders/${mailSenderId}`;

    logger.info("Making PUT request to update mail sender", { url, mailSenderId, data });

    try {
        const res = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        let json;
        try {
            json = await res.json();
        } catch (parseError: any) {
            logger.error("Failed to parse update mail sender response JSON", {
                status: res.status,
                statusText: res.statusText,
                parseError: parseError.message
            });
            throw new Error(`Server returned invalid response (${res.status})`);
        }

        logger.apiResponse(`/mail-senders/${mailSenderId} (PUT)`, { status: res.status, response: json });

        if (res.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        if (!res.ok) {
            logger.error(`Update mail sender failed: ${res.status}`, {
                status: res.status,
                statusText: res.statusText,
                response: json,
                url
            });
            throw new Error(json.error?.message || `Failed to update mail sender (${res.status}: ${res.statusText})`);
        }

        return json;
    } catch (error: any) {
        logger.error("Update mail sender request failed", { error: error.message, url });
        throw error;
    }
}

export async function deleteMailSender(token: string, mailSenderId: string): Promise<DeleteMailSenderResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mail-senders/${mailSenderId}`;

    logger.info("Making DELETE request to delete mail sender", { url, mailSenderId });

    try {
        const res = await fetchWithTimeout(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        let json;
        try {
            json = await res.json();
        } catch (parseError: any) {
            logger.error("Failed to parse delete mail sender response JSON", {
                status: res.status,
                statusText: res.statusText,
                parseError: parseError.message
            });
            throw new Error(`Server returned invalid response (${res.status})`);
        }

        logger.apiResponse(`/mail-senders/${mailSenderId} (DELETE)`, { status: res.status, response: json });

        if (res.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        if (!res.ok) {
            logger.error(`Delete mail sender failed: ${res.status}`, {
                status: res.status,
                statusText: res.statusText,
                response: json,
                url
            });
            throw new Error(json.error?.message || `Failed to delete mail sender (${res.status}: ${res.statusText})`);
        }

        return json;
    } catch (error: any) {
        logger.error("Delete mail sender request failed", { error: error.message, url });
        throw error;
    }
}
