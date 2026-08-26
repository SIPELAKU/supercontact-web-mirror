// lib/api/email-marketing/overview.ts
// Aggregate counters for the Email Marketing landing page.

import { logger } from "../../utils/logger";
import { fetchWithTimeout } from "../api-client";

export interface EmailMarketingOverview {
  total_subscribers: number;
  total_mailing_lists: number;
  total_campaigns: number;
  campaigns_sent_last_30_days: number;
  delivered_last_30_days: number;
  opened_last_30_days: number;
  /** Percentage 0-100, or null when nothing was delivered in the window. */
  open_rate_last_30_days: number | null;
  delivered_all_time: number;
  opened_all_time: number;
  open_rate_all_time: number | null;
}

export interface EmailMarketingOverviewResponse {
  success: boolean;
  data: EmailMarketingOverview;
  error?: { code: string; message: string; details?: any };
}

export async function fetchEmailMarketingOverview(
  token: string
): Promise<EmailMarketingOverviewResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/email-marketing/overview`;

  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  let json;
  try {
    json = await res.json();
  } catch (parseError: any) {
    logger.error("Failed to parse email marketing overview response", {
      status: res.status,
      parseError: parseError.message,
    });
    throw new Error(`Server returned invalid response (${res.status})`);
  }

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    throw new Error(json?.error?.message || "Failed to load the overview");
  }

  return json;
}
