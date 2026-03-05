"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
    fetchMailSenders,
    createMailSender,
    validateMailSender,
    type MailSendersResponse,
    type CreateMailSenderData,
    type CreateMailSenderResponse,
    type ValidateMailSenderResponse,
} from "@/lib/api/email-marketing/mail-senders";

export function useMailSenders() {
    return useQuery<MailSendersResponse, Error>({
        queryKey: ["mail-senders"],
        queryFn: () => {
            const token = Cookies.get("access_token");
            if (!token) throw new Error("No authentication token");
            return fetchMailSenders(token);
        },
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useCreateMailSender() {
    const queryClient = useQueryClient();

    return useMutation<CreateMailSenderResponse, Error, CreateMailSenderData>({
        mutationFn: (data: CreateMailSenderData) => {
            const token = Cookies.get("access_token");
            if (!token) throw new Error("No authentication token");
            return createMailSender(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-senders"] });
        },
    });
}

export function useValidateMailSender() {
    const queryClient = useQueryClient();

    return useMutation<ValidateMailSenderResponse, Error, { mailSenderId: string; otp: number }>({
        mutationFn: ({ mailSenderId, otp }) => {
            const token = Cookies.get("access_token");
            if (!token) throw new Error("No authentication token");
            return validateMailSender(token, mailSenderId, otp);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mail-senders"] });
        },
    });
}
