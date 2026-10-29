"use client"

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

type SortableDealProps = {
  id: UniqueIdentifier;
  children: React.ReactNode;
  /** A closed (Won/Lost) deal can't be dragged anywhere. */
  disabled?: boolean;
};

function SortableDealComponent({ id, children, disabled = false }: SortableDealProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export default React.memo(SortableDealComponent)
