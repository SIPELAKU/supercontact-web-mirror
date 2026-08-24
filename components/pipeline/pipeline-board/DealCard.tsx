import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah } from "@/lib/helper/currency"
import { useGetPipelineStore } from "@/lib/store/pipeline"
import { DealCardProps } from "@/lib/types/Pipeline"
import { Calendar } from "lucide-react"
import React from "react"

export const dealStages = [
  { label: "Prospect", bgColor: "bg-[#26C6F9]/16", textColor: "text-[#26C6F9]" },
  { label: "Qualified", bgColor: "bg-[#FDB528]/16", textColor: "text-[#FDB528]" },
  { label: "Negotiation", bgColor: "bg-[#72E128]/16", textColor: "text-[#72E128]" },
  { label: "Proposal", bgColor: "bg-[#6D788D]/16", textColor: "text-[#6D788D]" },
  { label: "Closed - Won", bgColor: "bg-[#666CFF]/16", textColor: "text-[#666CFF]" },
  { label: "Closed - Lost", bgColor: "bg-[#EF4444]/16", textColor: "text-[#EF4444]" },
] as const

function DealCardComponent({ id, deal_name, company, amount, expected_close_date, wonDate, avatar, avatar_initial, lostDate, stageName, product }: DealCardProps) {
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
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
      onClick={() => {
        setEditId(id)
        setStage(stageName)
        setIsModalOpen(true)
      }}>
      <CardContent className="p-4 space-y-4">

        <div className="space-y-1.5">
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${stageColor.bg} ${stageColor.text}`}>
            {deal_name || 'No Name'}
          </div>
          <div>
            <p className="text-xs text-gray-500 line-clamp-1">{company.name}</p>
          </div>
        </div>

        <p className="text-xl font-bold text-gray-900">{formatRupiah(amount)}</p>

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

      </CardContent>
    </Card>
  )
}

export const DealCard = React.memo(DealCardComponent)
