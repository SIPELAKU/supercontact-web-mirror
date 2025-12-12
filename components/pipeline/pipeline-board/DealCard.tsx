import { Card, CardContent } from "@/components/ui-mui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui-mui/avatar"
import { Calendar } from "lucide-react"
import { DealCardProps } from "@/lib/type/Pipeline"
import { formatRupiah } from "@/lib/helper/currency"

export function DealCard({ deal_name, company, amount, expected_close_date, wonDate, avatar, lostDate }: DealCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
      <CardContent className="p-4 space-y-4">

        <div className="space-y-1.5">
          <h4 className="font-semibold text-gray-900 text-[15px] leading-tight">
            {deal_name}
          </h4>
          <p className="text-sm text-gray-500">{company.name}</p>
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
            <AvatarImage src={avatar || "/placeholder.svg"} alt={company.id} />
            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
              {company.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

      </CardContent>
    </Card>
  )
}
