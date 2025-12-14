import type React from "react"
import { useDroppable } from "@dnd-kit/core"

interface DroppableColumnProps {
  id: string
  children: React.ReactNode
}

export default function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return <div ref={setNodeRef}>{children}</div>
}
