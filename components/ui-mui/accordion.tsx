"use client";

import * as React from "react";
import MUIAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { cn } from "@/lib/utils";

export function Accordion({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { children?: React.ReactNode }) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

export function AccordionItem({
  children,
  className,
  ...props
}: React.ComponentProps<typeof MUIAccordion> & { children?: React.ReactNode }) {
  return (
    <MUIAccordion
      disableGutters
      square
      className={cn("border-b last:border-b-0 shadow-none", className)}
      {...props}
    >
      {children}
    </MUIAccordion>
  );
}

export function AccordionTrigger({
  children,
  className,
  expandIcon,
  ...props
}: React.ComponentProps<typeof AccordionSummary> & { children?: React.ReactNode }) {
  return (
    <AccordionSummary
      expandIcon={
        expandIcon ?? (
          <ExpandMoreIcon className="transition-transform duration-200 text-gray-500" />
        )
      }
      className={cn(
        "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium hover:underline",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
        className
      )}
      {...props}
    >
      {children}
    </AccordionSummary>
  );
}

export function AccordionContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof AccordionDetails> & { children?: React.ReactNode }) {
  return (
    <AccordionDetails className={cn("text-sm pt-0 pb-4", className)} {...props}>
      {children}
    </AccordionDetails>
  );
}
