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

  // A flex row, so the column inside stretches to the board's tallest column:
  // its whole height takes a drop, not only the part with cards.
  return (
    <div
      ref={setNodeRef}
      className="flex w-full rounded-lg transition-all"
    >
      {children}
    </div>
  );
}
