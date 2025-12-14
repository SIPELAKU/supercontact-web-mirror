"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomSelectStageProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  dealStages: { label: string; value: string }[]
  className?: string
}

export default function CustomSelectStage({
  placeholder,
  value,
  onChange,
  dealStages,
  className = "",
}: CustomSelectStageProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {dealStages.map((stage) => (
          <SelectItem key={stage.value} value={stage.value}>
            {stage.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
