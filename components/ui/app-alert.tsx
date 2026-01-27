"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import React from "react";

export type AlertVariant = "success" | "failed" | "warning" | "info";

interface AppAlertProps {
  variant: AlertVariant;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: "bg-[#7BDD3E]", // Vibrant Green
    colorClass: "text-[#7BDD3E]",
    defaultTitle: "Success",
  },
  failed: {
    icon: AlertCircle,
    bgClass: "bg-[#F34E4E]", // Vibrant Red
    colorClass: "text-[#F34E4E]",
    defaultTitle: "Failed",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-[#FFB02E]", // Vibrant Orange/Yellow
    colorClass: "text-[#FFB02E]",
    defaultTitle: "Warning",
  },
  info: {
    icon: Info,
    bgClass: "bg-[#3AC7FF]", // Vibrant Blue
    colorClass: "text-[#3AC7FF]",
    defaultTitle: "Info",
  },
};

export function AppAlert({
  variant,
  title,
  description,
  onClose,
  className,
}: AppAlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex w-full max-w-md items-start gap-4 rounded-xl p-4 shadow-lg transition-all",
        config.bgClass,
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className={cn("h-7 w-7", config.colorClass)} />
      </div>

      <div className="flex flex-1 flex-col justify-center py-1">
        <h3 className="text-xl font-bold text-white leading-tight">
          {title || config.defaultTitle}
        </h3>
        {description && (
          <p className="mt-0.5 text-base font-medium text-white/90">
            {description}
          </p>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
