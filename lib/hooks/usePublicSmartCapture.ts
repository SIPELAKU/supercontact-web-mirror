// lib/hooks/usePublicSmartCapture.ts
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPublicSmartCaptureForm, submitPublicSmartCaptureForm } from "../api";
import { SmartCaptureDetailResponse, SmartCapturePublicSubmitReq, SmartCapturePublicSubmitResponse } from "../models/types";

export function usePublicSmartCapture(code: string) {
  // 1. Query to fetch the form configuration
  const query = useQuery<SmartCaptureDetailResponse, Error>({
    queryKey: ["public-smart-capture", code],
    queryFn: () => fetchPublicSmartCaptureForm(code),
    enabled: !!code,
    staleTime: Infinity, // Form config doesn't change often
  });

  // 2. Mutation to submit the form data
  const mutation = useMutation<SmartCapturePublicSubmitResponse, Error, SmartCapturePublicSubmitReq>({
    mutationFn: (data: SmartCapturePublicSubmitReq) => submitPublicSmartCaptureForm(code, data),
  });

  return {
    ...query,
    submit: mutation,
  };
}
