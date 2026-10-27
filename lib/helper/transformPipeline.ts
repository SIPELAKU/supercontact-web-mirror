import { formatMDY } from "@/lib/helper/date";
import { Deal } from "@/lib/types/Pipeline";
import type { PipelineBoardStage } from "@/lib/api/pipelines";

export type StageUI = {
  id: string;
  name: string;
  /** Total amount of every deal in the column that matches the filters. */
  value: number;
  /** Number of those deals; `deals` holds only the ones loaded so far. */
  count: number;
  /** Cursor for the column's next deals; null = all loaded. */
  nextCursor: string | null;
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
  /** A Decimal as a string from the API, e.g. "1500.00". */
  amount: number | string;
  notes?: string;
  avatar: string;
  client_account?: string;
  expected_close_date?: string;
  probability_of_close?: number;
  is_deleted?: boolean;
  deal_stage: string;
}

/**
 * Won and Lost are final. A closed deal can be viewed but not edited, and it
 * cannot be moved to another stage.
 */
export const CLOSED_STAGES = ["Closed - Won", "Closed - Lost"];

export function isClosedStage(stage: string | null | undefined): boolean {
  if (!stage) return false;
  // "Closed-Won", "Closed - Won" and "closed - won" are the same stage.
  const normalized = stage.replace(/\s*-\s*/g, " - ").trim().toLowerCase();
  return CLOSED_STAGES.some((closed) => closed.toLowerCase() === normalized);
}

/**
 * A deal is expired once its expected close date has passed while it is
 * still in an open stage. Worked out from the date for now, not from the
 * BE's `status`. A deal closing today is not expired yet, and a closed deal
 * (won or lost) never is.
 */
export function isDealExpired(expectedCloseDate: string | undefined, stage: string, now: Date = new Date()): boolean {
  if (!expectedCloseDate || isClosedStage(stage)) return false;
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

/** One deal from the API as a kanban card. */
export function mapPipelineDeal(item: PipelineAPIItem, now: Date = new Date()): Deal {
  const stageName = item.deal_stage.trim();
  const expired = isDealExpired(item.expected_close_date, stageName, now);

  return {
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
      ? daysUntilDeletion(item.expected_close_date, now)
      : undefined,

    wonDate: stageName === "Closed - Won" ? formatMDY(item.expected_close_date) : undefined,
    lostDate: stageName === "Closed - Lost" ? formatMDY(item.expected_close_date) : undefined,
  };
}

/**
 * The kanban columns from `GET /pipelines/board`, as the API orders them
 * (the company's stages, plus any other stage that still has deals). Each
 * column's deals keep the API's sort - highest probability of close won
 * first, then the most recently updated - and its count and total cover
 * every matching deal, not only the loaded ones.
 */
export function mapBoardStages(stages: PipelineBoardStage[], now: Date = new Date()): StageUI[] {
  return (stages ?? []).map((stage) => ({
    id: stage.name,
    name: stage.name,
    value: Number(stage.total_amount) || 0,
    count: stage.count ?? 0,
    nextCursor: stage.next_cursor ?? null,
    deals: (stage.deals ?? []).map((item) => mapPipelineDeal(item, now)),
  }));
}
