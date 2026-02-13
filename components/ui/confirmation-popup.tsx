"use client";

import React from "react";
import ReactDOM from "react-dom";
import { AppButton } from "./app-button";

interface ConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false,
}) => {
    // Prevent closing when clicking inside the modal
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const getTitleColor = () => {
        switch (variant) {
            case "danger":
                return "text-red-500"; // Red title for danger variant as requested (white bg style)
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
            case "warning":
                return "primary";
            case "info":
                return "primary";
            default:
                return "primary";
        }
    };

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
                            >
                                {confirmText}
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )
    );
};
