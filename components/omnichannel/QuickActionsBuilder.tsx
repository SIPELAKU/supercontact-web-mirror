"use client";

import React from "react";
import {
  MessageCircle,
  FileText,
  ShoppingCart,
  TrendingUp,
  LifeBuoy,
  Info,
  Calendar,
  Star,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { SelectChangeEvent } from "@mui/material";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import type { QuickAction } from "@/lib/types/omnichannel";

// FIXED icon key set the widget client (widget/) knows how to render. These
// exact 8 keys must stay in sync with the widget - do NOT add keys it can't
// render. The lucide icon here is only the admin-side preview; the widget maps
// the same keys to its own glyphs.
export const WIDGET_QUICK_ACTION_ICON_KEYS = [
  "chat",
  "quote",
  "order",
  "sales",
  "help",
  "info",
  "calendar",
  "star",
] as const;

export type WidgetQuickActionIconKey = (typeof WIDGET_QUICK_ACTION_ICON_KEYS)[number];

const ICON_GLYPHS: Record<WidgetQuickActionIconKey, LucideIcon> = {
  chat: MessageCircle,
  quote: FileText,
  order: ShoppingCart,
  sales: TrendingUp,
  help: LifeBuoy,
  info: Info,
  calendar: Calendar,
  star: Star,
};

const ICON_LABELS: Record<WidgetQuickActionIconKey, string> = {
  chat: "Chat",
  quote: "Quote",
  order: "Order",
  sales: "Sales",
  help: "Help",
  info: "Info",
  calendar: "Calendar",
  star: "Star",
};

const ICON_OPTIONS = WIDGET_QUICK_ACTION_ICON_KEYS.map((key) => {
  const Glyph = ICON_GLYPHS[key];
  return {
    value: key,
    label: (
      <span className="flex items-center gap-2">
        <Glyph size={16} />
        <span>{ICON_LABELS[key]}</span>
      </span>
    ),
  };
});

// Small live preview of the selected icon, so admins see what the card shows.
const IconPreview: React.FC<{ icon: string }> = ({ icon }) => {
  const Glyph = ICON_GLYPHS[(icon as WidgetQuickActionIconKey)] ?? MessageCircle;
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600"
      aria-hidden
    >
      <Glyph size={18} />
    </span>
  );
};

function makeActionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeEmptyQuickAction(): QuickAction {
  return {
    id: makeActionId(),
    label: "",
    description: "",
    icon: "chat",
    target_queue_id: null,
    prefill: null,
  };
}

interface QuickActionsBuilderProps {
  actions: QuickAction[];
  onChange: (actions: QuickAction[]) => void;
  /** Active-queue options plus a leading "None (unrouted)" entry (value ""). */
  queueOptions: { value: string; label: React.ReactNode }[];
  disabled?: boolean;
}

const QuickActionsBuilder: React.FC<QuickActionsBuilderProps> = ({
  actions,
  onChange,
  queueOptions,
  disabled,
}) => {
  const patch = (index: number, changes: Partial<QuickAction>) => {
    onChange(actions.map((a, i) => (i === index ? { ...a, ...changes } : a)));
  };

  const remove = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= actions.length) return;
    const next = [...actions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    onChange([...actions, makeEmptyQuickAction()]);
  };

  return (
    <div className="space-y-3">
      {actions.length === 0 && (
        <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No quick actions yet. Add option cards visitors can tap to start the right conversation.
        </p>
      )}

      {actions.map((action, index) => (
        <div
          key={action.id}
          className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <IconPreview icon={action.icon} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Action {index + 1}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={disabled || index === 0}
                aria-label={`Move action ${index + 1} up`}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={disabled || index === actions.length - 1}
                aria-label={`Move action ${index + 1} down`}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove action ${index + 1}`}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Label</label>
              <AppInput
                fullWidth
                isBgWhite
                value={action.label}
                disabled={disabled}
                onChange={(e) => patch(index, { label: e.target.value })}
                placeholder="Get a quote"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Icon</label>
              <AppSelect
                isBgWhite
                value={action.icon}
                disabled={disabled}
                options={ICON_OPTIONS}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  patch(index, { icon: e.target.value as string })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <AppInput
              fullWidth
              isBgWhite
              value={action.description}
              disabled={disabled}
              onChange={(e) => patch(index, { description: e.target.value })}
              placeholder="Tell us what you need and we'll send pricing."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Route to queue</label>
              <AppSelect
                isBgWhite
                value={action.target_queue_id ?? ""}
                disabled={disabled}
                options={queueOptions}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  patch(index, { target_queue_id: (e.target.value as string) || null })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Prefill message (optional)</label>
              <AppInput
                fullWidth
                isBgWhite
                value={action.prefill ?? ""}
                disabled={disabled}
                onChange={(e) => patch(index, { prefill: e.target.value || null })}
                placeholder="Hi, I'd like a quote for..."
              />
            </div>
          </div>
        </div>
      ))}

      <AppButton
        type="button"
        onClick={add}
        disabled={disabled}
        variantStyle="outline"
      >
        <Plus size={16} className="mr-2" />
        Add action
      </AppButton>
    </div>
  );
};

export default QuickActionsBuilder;
