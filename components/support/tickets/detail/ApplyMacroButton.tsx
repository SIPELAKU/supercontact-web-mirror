"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import { useTicketMacros, useApplyTicketMacro } from "@/lib/hooks/useTicketMacros";

interface ApplyMacroButtonProps {
    ticketId: string;
}

export function ApplyMacroButton({ ticketId }: ApplyMacroButtonProps) {
    const { data } = useTicketMacros();
    const macros = data?.data?.data || [];
    const applyMutation = useApplyTicketMacro(ticketId);
    const [selectedMacro, setSelectedMacro] = useState("");

    if (macros.length === 0) return null;

    const handleApply = async (macroId: string) => {
        setSelectedMacro(macroId);
        try {
            await applyMutation.mutateAsync(macroId);
            notify.success("Macro applied");
        } catch (error: any) {
            notify.error("Error", { description: error.message || "Failed to apply macro" });
        } finally {
            setSelectedMacro("");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Zap size={16} className="text-gray-400" />
            <AppSelect
                isBgWhite
                placeholder={applyMutation.isPending ? "Applying..." : "Apply Macro..."}
                value={selectedMacro}
                disabled={applyMutation.isPending}
                options={macros.map((m) => ({ value: m.id, label: m.name }))}
                onChange={(e) => handleApply(e.target.value as string)}
            />
            {applyMutation.isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
    );
}
