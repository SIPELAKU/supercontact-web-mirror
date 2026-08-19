"use client";

import React from "react";
import ReactDOM from "react-dom";
import { AppButton } from "./app-button";

export interface ConfirmationOptions {
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "discard" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

/**
 * Imperative helper around ConfirmationPopup for one-off confirms
 * (replaces the old useConfirmation()/ConfirmationProvider from confirm-modal).
 *
 * const { confirm, confirmationPopup } = useConfirmationPopup();
 * confirm({ title, description, onConfirm });
 * ...render {confirmationPopup} anywhere in the tree.
 */
export function useConfirmationPopup() {
    const [options, setOptions] = React.useState<ConfirmationOptions | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const confirm = React.useCallback((opts: ConfirmationOptions) => {
        setOptions(opts);
    }, []);

    const handleClose = () => {
        if (isLoading) return;
        options?.onCancel?.();
        setOptions(null);
    };

    const handleConfirm = async () => {
        if (!options) return;
        setIsLoading(true);
        try {
            await options.onConfirm();
            setOptions(null);
        } catch (error) {
            console.error("Confirmation action failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmationPopup = options ? (
        <ConfirmationPopup
            isOpen
            onClose={handleClose}
            onConfirm={handleConfirm}
            title={options.title}
            description={options.description}
            confirmText={options.confirmText}
            cancelText={options.cancelText}
            variant={options.variant}
            isLoading={isLoading}
        />
    ) : null;

    return { confirm, confirmationPopup };
}

interface ConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    /**
     * "danger"  = destructive action (red, confirm defaults to "Delete")
     * "discard" = unsaved-changes guard (amber/neutral, confirm defaults to "Discard")
     */
    variant?: "danger" | "discard" | "warning" | "info";
    isLoading?: boolean;
    /** Optional extra content (e.g. a list of affected items) rendered under the description. */
    children?: React.ReactNode;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false,
    children,
}) => {
    // Prevent closing when clicking inside the modal
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const resolvedConfirmText =
        confirmText ??
        (variant === "danger" ? "Delete" : variant === "discard" ? "Discard" : "Confirm");

    const getTitleColor = () => {
        switch (variant) {
            case "danger":
                return "text-red-500"; // Red title for danger variant as requested (white bg style)
            case "discard":
                return "text-gray-900"; // Neutral title; amber confirm button carries the accent
            case "warning":
                return "text-yellow-600";
            case "info":
                return "text-blue-600";
            default:
                return "text-gray-900";
        }
    };

    const getButtonVariant = () => {
        switch (variant) {
            case "danger":
                return "danger";
            case "discard":
                return "primary";
            case "warning":
                return "primary";
            case "info":
                return "primary";
            default:
                return "primary";
        }
    };

    // Amber accent for the discard variant, distinct from the red danger variant.
    const discardButtonSx =
        variant === "discard"
            ? {
                  backgroundColor: "#D97706", // amber-600
                  "&:hover": { backgroundColor: "#B45309" }, // amber-700
              }
            : undefined;

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return (
        ReactDOM.createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop - handles click outside */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Content - relative to sit on top of backdrop */}
                <div
                    className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10"
                    onClick={handleModalClick}
                >
                    <div className="p-8">
                        <h2 className={`text-2xl font-bold mb-4 ${getTitleColor()}`}>
                            {title}
                        </h2>
                        <p className="text-gray-600 text-base leading-relaxed mb-8">
                            {description}
                        </p>

                        {children && <div className="mb-8 -mt-4">{children}</div>}

                        <div className="flex items-center justify-end gap-3">
                            <AppButton
                                variantStyle="outline"
                                color="gray"
                                onClick={onClose}
                                disabled={isLoading}
                                className="min-w-[100px]"
                            >
                                {cancelText}
                            </AppButton>
                            <AppButton
                                variantStyle={getButtonVariant()}
                                onClick={onConfirm}
                                isLoading={isLoading}
                                className="min-w-[120px]"
                                sx={discardButtonSx}
                            >
                                {resolvedConfirmText}
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )
    );
};
