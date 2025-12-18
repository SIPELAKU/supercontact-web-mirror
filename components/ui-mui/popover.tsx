"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";


export function PopoverTrigger({
  children,
}: {
  children: ReactElement;
}) {
  return children;
}


export function PopoverContent({
  className,
  children,
  style
}: {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "relative bg-white border rounded-md p-4 shadow-md w-full",
        className
      )}
    >
      <div
        data-arrow
        className="absolute -top-2 left-1/2 -translate-x-1/2
                   w-3 h-3 bg-white border-l border-t rotate-45"
      />
      {children}
    </div>
  );
}


export function PopoverRoot({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [positioned, setPositioned] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setUncontrolledOpen(value);
  };


  const childArray = React.Children.toArray(children);

  const triggerElement = childArray.find(
    (c): c is ReactElement<{ children: ReactElement }> =>
      isValidElement(c) && c.type === PopoverTrigger
  );

  const contentElement = childArray.find(
    (c): c is ReactElement =>
      isValidElement(c) && c.type === PopoverContent
  );

  if (!triggerElement || !contentElement) return <>{children}</>;

  const triggerChild = triggerElement.props.children;


  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setPositioned(false);
      setVisible(false);
      setTimeout(() => setMounted(false), 150);
    }
  }, [open]);


  const [pos, setPos] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  }>({ top: 0, left: 0, placement: "bottom" });

const updatePosition = () => {
  if (!triggerRef.current || !contentRef.current) return;

  const t = triggerRef.current.getBoundingClientRect();
  const c = contentRef.current.getBoundingClientRect();
  const margin = 8;

  let placement: "top" | "bottom" = "bottom";
  let top = t.bottom + margin;

  if (top + c.height > window.innerHeight) {
    placement = "top";
    top = t.top - c.height - margin;
  }

  let left = t.left + t.width / 2 - c.width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - c.width - 8));

  setPos({
    top: top + window.scrollY,
    left: left + window.scrollX,
    placement,
  });

  // ⬅️ posisi sudah valid
  setPositioned(true);
};


  useEffect(() => {
    if (mounted) updatePosition();
  }, [mounted]);


  useEffect(() => {
    if (!mounted) return;

    const onClick = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !contentRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [mounted]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onClick={() => setOpen(!open)}
      >
        {triggerChild}
      </span>

      {mounted &&
        createPortal(
          <div
            ref={contentRef}
            style={{ top: pos.top, left: pos.left }}
            className={cn(
              "absolute z-50 transition-all duration-150",
              visible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95",
              pos.placement === "top" ? "origin-bottom" : "origin-top"
            )}
          >
            {contentElement}
          </div>,
          document.body
        )}
    </>
  );
}

export const PopoverComponent = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
};
