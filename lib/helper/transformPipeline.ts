import { Deal } from "@/lib/type/Pipeline";
import { formatMDY } from "@/lib/helper/date";
import { formatRupiah } from "@/lib/helper/currency";

export type StageUI = {
  name: string;
  value: number;
  deals: Deal[];
};

export function transformPipelineResponse(api: any): StageUI[] {
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
      name: stage,
      value: 0,
      deals: [],
    };
  });

  api.pipelines.forEach((item: any, index: number) => {
    const stageName = item.deal_stage.trim();

    const mappedDeal: Deal = {
      id: item.id,
      deal_name: item.deal_name,
      company: {
        id: item.contact.id,
        name: item.contact.name,
        company: item.contact.company,
      },
      amount: item.amount,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
      notes: item.notes,
      client_account: item.client_account,
      expected_close_date: formatMDY(item.expected_close_date),
      probability_of_close: item.probability_of_close,
      is_delete: item.is_deleted,

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
  });

  return STAGE_ORDER.map((name) => stageMap[name]);
}
