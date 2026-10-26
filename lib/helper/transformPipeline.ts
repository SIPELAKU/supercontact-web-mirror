import { formatMDY } from "@/lib/helper/date";
import { Deal } from "@/lib/types/Pipeline";

export type StageUI = {
  id: string;
  name: string;
  value: number;
  deals: Deal[];
};

export interface PipelineContact {
  id: string;
  name: string;
  company: string;
}

export interface PipelineAPIItem {
  id: string;
  deal_name: string;
  contact: PipelineContact;
  user: {
    id: string;
    fullname: string;
    email: string;
    avatar_initial: string;
    avatar_url: string | null;
  };
  product?: {
    id: string;
    product_name: string;
    sku: string;
    price: string;
  };
  quantity?: number;
  amount: number;
  notes?: string;
  avatar: string;
  client_account?: string;
  expected_close_date?: string;
  probability_of_close?: number;
  is_deleted?: boolean;
  deal_stage: string;
}

export interface PipelineAPIResponse {
  pipelines: PipelineAPIItem[];
  stats?: unknown;
}

export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * A deal is expired once its expected close date has passed while it is
 * still in an open stage. Worked out from the date for now, not from the
 * BE's `status`. A deal closing today is not expired yet, and a closed deal
 * (won or lost) never is.
 */
export function isDealExpired(expectedCloseDate: string | undefined, stage: string, now: Date = new Date()): boolean {
  if (!expectedCloseDate || stage === "Closed - Won" || stage === "Closed - Lost") return false;
  // The BE sends the date as midnight UTC, so its first 10 characters are the day.
  const closeDay = expectedCloseDate.slice(0, 10);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return closeDay < today;
}

/** An expired deal is deleted this many days after its expected close date. */
export const EXPIRED_DEAL_RETENTION_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days left before a deal is deleted: its expected close date plus
 * EXPIRED_DEAL_RETENTION_DAYS, counted from today. 0 = deleted today; below 0
 * = its deletion day has passed but it is still there.
 */
export function daysUntilDeletion(expectedCloseDate: string, now: Date = new Date()): number {
  const [y, m, d] = expectedCloseDate.slice(0, 10).split("-").map(Number);
  const deletionDay = Date.UTC(y, m - 1, d) + EXPIRED_DEAL_RETENTION_DAYS * DAY_MS;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((deletionDay - today) / DAY_MS);
}

export function transformPipelineResponse(api: PipelineAPIResponse): StageUI[] {
  if (!api || !api.pipelines) return [];

  const STAGE_ORDER = [
    "Prospect",
    "Qualified",
    "Negotiation",
    "Proposal",
    "Closed - Won",
    "Closed - Lost",
  ];

  const stageMap: Record<string, StageUI> = {};

  STAGE_ORDER.forEach((stage) => {
    stageMap[stage] = {
      id: generateUUID(),
      name: stage,
      value: 0,
      deals: [],
    };
  });

  api.pipelines.forEach((item, index) => {
    const stageName = item.deal_stage.trim();
    const expired = isDealExpired(item.expected_close_date, stageName);

    const mappedDeal: Deal = {
      id: item.id,
      deal_name: item.deal_name || item.product?.product_name || "",
      company: {
        id: item.contact.id,
        name: item.contact.name,
        company: item.contact.company,
      },
      product: item.product,
      quantity: item.quantity,
      amount: Number(item.amount) || 0,
      avatar: item.user?.avatar_url || "",
      avatar_initial: item.user?.avatar_initial || "",
      notes: item.notes ?? "",
      client_account: item.client_account ?? "",
      expected_close_date: formatMDY(item.expected_close_date),
      probability_of_close: item.probability_of_close ?? 0,
      is_delete: item.is_deleted ?? false,
      is_expired: expired,
      days_until_deletion: expired && item.expected_close_date
        ? daysUntilDeletion(item.expected_close_date)
        : undefined,

      wonDate: stageName === "Closed - Won" ? formatMDY(item.expected_close_date) : undefined,
      lostDate: stageName === "Closed - Lost" ? formatMDY(item.expected_close_date) : undefined,
    };

    if (stageMap[stageName]) {
      stageMap[stageName].deals.push(mappedDeal);
    }
  });

  Object.values(stageMap).forEach((stage) => {
    const total = stage.deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    stage.value = total;
    // Each column shows the most likely to close-won first. `GET /pipelines`
    // has no sort param, so it is done here; the sort is stable, so deals with
    // the same probability keep the API's order.
    stage.deals.sort((a, b) => (b.probability_of_close ?? 0) - (a.probability_of_close ?? 0));
  });

  return STAGE_ORDER.map((name) => stageMap[name]);
}
