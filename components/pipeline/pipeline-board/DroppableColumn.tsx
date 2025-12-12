"use client"

import { useDroppable } from "@dnd-kit/core"

export function DroppableColumn({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className="min-h-32">
      {children}
    </div>
  )
}
