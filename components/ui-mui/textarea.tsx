import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full min-h-16 rounded-md px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm",

        "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400",
        "focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200",

        "disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-500",
        "disabled:cursor-not-allowed disabled:placeholder:text-gray-400",
        "disabled:opacity-100",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }
