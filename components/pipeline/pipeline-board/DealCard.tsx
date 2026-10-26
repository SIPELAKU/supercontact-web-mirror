import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah } from "@/lib/helper/currency"
import { EXPIRED_DEAL_RETENTION_DAYS } from "@/lib/helper/transformPipeline"
import { useGetPipelineStore } from "@/lib/store/pipeline"
import { DealCardProps } from "@/lib/types/Pipeline"
import { Calendar, Clock } from "lucide-react"
import React from "react"

export const dealStages = [
  { label: "Prospect", bgColor: "bg-[#26C6F9]/16", textColor: "text-[#26C6F9]" },
  { label: "Qualified", bgColor: "bg-[#FDB528]/16", textColor: "text-[#FDB528]" },
  { label: "Negotiation", bgColor: "bg-[#72E128]/16", textColor: "text-[#72E128]" },
  { label: "Proposal", bgColor: "bg-[#6D788D]/16", textColor: "text-[#6D788D]" },
  { label: "Closed - Won", bgColor: "bg-[#666CFF]/16", textColor: "text-[#666CFF]" },
  { label: "Closed - Lost", bgColor: "bg-[#EF4444]/16", textColor: "text-[#EF4444]" },
] as const

// Colour of the probability badge, so the likely wins stand out at a glance.
const probabilityColor = (probability: number) =>
  probability >= 80
    ? "bg-green-100 text-green-700"
    : probability >= 40
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-600"

// Countdown on an expired deal's tag.
const deletionLabel = (days: number) =>
  days > 1
    ? `Deleted in ${days} days`
    : days === 1
      ? "Deleted tomorrow"
      : days === 0
        ? "Deleted today"
        : "Scheduled for deletion"

// A week or less left reads as urgent.
const deletionTagColor = (days: number) =>
  days <= 7
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-amber-50 text-amber-700 border-amber-200"

function DealCardComponent({ id, deal_name, company, amount, expected_close_date, wonDate, avatar, avatar_initial, lostDate, stageName, product, probability_of_close, is_expired, days_until_deletion }: DealCardProps) {
  // Still in an open stage but past its expected close date.
  const isExpired = Boolean(is_expired)
  const daysLeft = days_until_deletion ?? 0
  const { setEditId, setIsModalOpen, setStage } = useGetPipelineStore();
  const getStageColor = (stageName?: string) => {
    if (!stageName) {
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
      }
    }

    const stage = dealStages.find(s => s.label.toLowerCase() === stageName.toLowerCase())

    return stage
      ? { bg: stage.bgColor, text: stage.textColor }
      : { bg: "bg-gray-100", text: "text-gray-700" }
  }
  const stageColor = getStageColor(stageName)
  return (
    <Card
      // overflow-hidden rounds the strip's top corners with the card's; pt-0
      // drops the card's top padding so the strip sits flush on its top edge.
      className={`group overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer ${isExpired ? "pt-0" : ""}`}
      onClick={() => {
        setEditId(id)
        setStage(stageName)
        setIsModalOpen(true)
      }}>
      {/* Full-width strip on the card's top edge: rounded on top (the card's
          corners), square below. It stays fully opaque; only the details fade. */}
      {isExpired && (
        <div
          title={`Expired deals are deleted ${EXPIRED_DEAL_RETENTION_DAYS} days after the expected close date`}
          className={`flex items-center gap-1.5 border-b px-4 py-1.5 text-[11px] font-medium ${deletionTagColor(daysLeft)}`}
        >
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold">Expired</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{deletionLabel(daysLeft)}</span>
        </div>
      )}

      <CardContent className="p-4 space-y-4">
        <div className={`space-y-4 transition-opacity ${isExpired ? "opacity-60 group-hover:opacity-100" : ""}`}>
          <div className="space-y-1.5">
            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${stageColor.bg} ${stageColor.text}`}>
              {deal_name || 'No Name'}
            </div>
            <div>
              <p className="text-xs text-gray-500 line-clamp-1">{company.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xl font-bold text-gray-900">{formatRupiah(amount)}</p>
            <span
              title="Probability of Close Won"
              className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${probabilityColor(probability_of_close ?? 0)}`}
            >
              {probability_of_close ?? 0}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            {(expected_close_date || wonDate || lostDate) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  {wonDate
                    ? `Won: ${wonDate}`
                    : lostDate
                      ? `Lost: ${lostDate}`
                      : `Close: ${expected_close_date}`}
                </span>
              </div>
            )}

            <Avatar className="h-7 w-7 border">
              {avatar && <AvatarImage src={avatar} alt={deal_name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {avatar_initial || company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

export const DealCard = React.memo(DealCardComponent)
