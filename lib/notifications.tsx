"use client";

import { AppAlert, AlertVariant } from "@/components/ui/app-alert";
import toast from "react-hot-toast";

interface ToastOptions {
  description?: string;
  duration?: number;
}

const showNotification = (
  variant: AlertVariant,
  title?: string,
  options?: ToastOptions,
) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible
            ? "animate-in fade-in slide-in-from-top-4"
            : "animate-out fade-out slide-out-to-top-4"
        } pointer-events-auto flex w-full max-w-md`}
      >
        <AppAlert
          variant={variant}
          title={title}
          description={options?.description}
          onClose={() => toast.dismiss(t.id)}
        />
      </div>
    ),
    {
      duration: options?.duration || 4000,
      position: "top-right",
    },
  );
};

export const notify = {
  success: (title?: string, options?: ToastOptions) =>
    showNotification("success", title, options),
  error: (title?: string, options?: ToastOptions) =>
    showNotification("failed", title || "Failed", options),
  warning: (title?: string, options?: ToastOptions) =>
    showNotification("warning", title, options),
  info: (title?: string, options?: ToastOptions) =>
    showNotification("info", title, options),
};
