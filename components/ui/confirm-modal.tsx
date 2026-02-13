"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, Trash2, X } from "lucide-react";
import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

type ConfirmationType = "delete" | "submit" | "approve" | "reject" | "warning" | "info" | "custom"

interface ConfirmationConfig {
    type: ConfirmationType
    title: string
    message: React.ReactNode
    confirmText?: string
    cancelText?: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
}

interface ConfirmationContextType {
    showConfirmation: (config: ConfirmationConfig) => void
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function useConfirmation() {
    const context = useContext(ConfirmationContext)
    if (!context) {
        throw new Error("useConfirmation must be used within ConfirmationProvider")
    }
    return context
}

export function ConfirmationProvider({ children, dismissible }: { children: React.ReactNode, dismissible?: boolean }) {
    const [config, setConfig] = useState<ConfirmationConfig | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const showConfirmation = useCallback((newConfig: ConfirmationConfig) => {
        setConfig(newConfig)
    }, [])

    const handleConfirm = async () => {
        if (!config) return

        setIsLoading(true)
        try {
            await config.onConfirm()
            setConfig(null)
        } catch (error) {
            console.error("Confirmation action failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        if (config?.onCancel) {
            config.onCancel()
        }
        setConfig(null)
    }

    const getTypeConfig = (type: ConfirmationType) => {
        switch (type) {
            case "delete":
                return {
                    icon: <Trash2 className="w-6 h-6" />,
                    iconBg: "bg-red-100",
                    iconColor: "text-red-600",
                    confirmBg: "bg-red-600 hover:bg-red-700",
                    confirmText: config?.confirmText ?? "Delete",
                    cancelText: config?.cancelText ?? "Cancel",
                }
            case "submit":
                return {
                    icon: <CheckCircle className="w-6 h-6" />,
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    confirmBg: "bg-blue-600 hover:bg-blue-700",
                    confirmText: config?.confirmText ?? "Submit",
                    cancelText: config?.cancelText ?? "Cancel",
                }
            case "approve":
                return {
                    icon: <CheckCircle className="w-6 h-6" />,
                    iconBg: "bg-green-100",
                    iconColor: "text-green-600",
                    confirmBg: "bg-green-600 hover:bg-green-700",
                    confirmText: config?.confirmText ?? "Approve",
                    cancelText: config?.cancelText ?? "Cancel",
                }
            case "reject":
                return {
                    icon: <AlertCircle className="w-6 h-6" />,
                    iconBg: "bg-orange-100",
                    iconColor: "text-orange-600",
                    confirmBg: "bg-orange-600 hover:bg-orange-700",
                    confirmText: config?.confirmText ?? "Reject",
                    cancelText: config?.cancelText ?? "Cancel",
                }
            case "warning":
                return {
                    icon: <AlertTriangle className="w-6 h-6" />,
                    iconBg: "bg-yellow-100",
                    iconColor: "text-yellow-600",
                    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
                    confirmText: config?.confirmText ?? "Continue",
                    cancelText: config?.cancelText ?? "Cancel",
                }
            case "info":
                return {
                    icon: <Info className="w-6 h-6" />,
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    confirmBg: "bg-blue-600 hover:bg-blue-700",
                    confirmText: config?.confirmText ?? "OK",
                    cancelText: config?.cancelText ?? "Cancel",
                }
            case "custom":
                return {
                    icon: <Info className="w-6 h-6" />,
                    iconBg: "bg-gray-100",
                    iconColor: "text-gray-600",
                    confirmBg: "bg-gray-900 hover:bg-gray-800",
                    confirmText: config?.confirmText ?? "Confirm",
                    cancelText: config?.cancelText ?? "Cancel",
                }
        }
    }

    if (!config) {
        return <ConfirmationContext.Provider value={{ showConfirmation }}>{children}</ConfirmationContext.Provider>
    }

    const typeConfig = getTypeConfig(config.type)

    return (
        <ConfirmationContext.Provider value={{ showConfirmation }}>
            {children}

            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={dismissible !== false ? handleCancel : undefined}>

                <div
                    className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >

                    <button
                        onClick={dismissible !== false ? handleCancel : undefined}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className={`${typeConfig.iconBg} ${typeConfig.iconColor} rounded-full p-3 shrink-0`}>
                            {typeConfig.icon}
                        </div>

                        <div className="flex-1 pt-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.title}</h3>

                            <p className="text-sm text-gray-600 leading-relaxed">{config.message}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {typeConfig.cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${typeConfig.confirmBg}`}
                        >
                            {isLoading ? "Processing..." : typeConfig.confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </ConfirmationContext.Provider>
    )
}