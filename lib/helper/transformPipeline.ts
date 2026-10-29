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
  /** Worked out by the API from what the stage MEANS, not its name. */
  status?: "active" | "expired" | "won" | "lost";
  days_until_deletion?: number | null;
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
 * One deal from the API as a kanban card. Whether it is expired and how many
 * days it has left both come from the API, which deletes it 30 days after the
 * day it expired - not 30 days after its close date.
 */
export function mapPipelineDeal(item: PipelineAPIItem): Deal {
  const stageName = item.deal_stage.trim();

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
    is_expired: item.status === "expired",
    days_until_deletion: item.days_until_deletion ?? undefined,

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
export function mapBoardStages(stages: PipelineBoardStage[]): StageUI[] {
  return (stages ?? []).map((stage) => ({
    id: stage.name,
    name: stage.name,
    value: Number(stage.total_amount) || 0,
    count: stage.count ?? 0,
    nextCursor: stage.next_cursor ?? null,
    deals: (stage.deals ?? []).map((item) => mapPipelineDeal(item)),
  }));
}
