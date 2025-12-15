"use client";

import { useDroppable } from "@dnd-kit/core";

export function ColumnDropZone({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-full rounded-lg transition-all
        h-full
      `}
    >
      {children}
    </div>
  );
}
