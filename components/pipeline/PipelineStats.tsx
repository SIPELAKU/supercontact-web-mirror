import { Card, CardContent } from "@/components/ui-mui/card"
import { formatRupiah } from "@/lib/helper/currency";
import { useGetPipelineStore } from "@/lib/store/pipeline";

export default function MetricsCards() {
    const { stats } = useGetPipelineStore();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {stats.map((metric) => (
        <Card
          key={metric.label}
          className="bg-white border border-gray-200 rounded-2xl! shadow-sm"
        >
          <CardContent className="p-6">

            <p className="text-base font-medium text-gray-600 mb-3">
              {metric.label}
            </p>

            <h3 className="text-4xl font-semibold text-gray-900 mb-2">
              {formatRupiah(metric.value)}
            </h3>

            <span
              className={`text-sm font-medium ${!!metric.isPositive ? 'text-green-500' : 'text-red-500' }`}
            >
              {metric.change}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
