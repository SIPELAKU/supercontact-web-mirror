"use client";

import { useState } from "react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchTickets } from "@/lib/api/tickets";
import { Ticket } from "@/lib/types/Ticket";

interface TicketPickerAutocompleteProps {
    excludeTicketId?: string;
    value: Ticket | null;
    onChange: (ticket: Ticket | null) => void;
}

export function TicketPickerAutocomplete({ excludeTicketId, value, onChange }: TicketPickerAutocompleteProps) {
    const { getToken } = useAuth();
    const [options, setOptions] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    const handleInputChange = async (_: React.SyntheticEvent, inputValue: string) => {
        if (!inputValue || inputValue.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetchTickets(token, 1, 10, inputValue);
            const tickets = (res.data?.tickets || []).filter((t) => t.id !== excludeTicketId);
            setOptions(tickets);
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppAutocomplete
            isBgWhite
            fullWidth
            options={options}
            loading={loading}
            value={value}
            onChange={(_, val) => onChange(val as Ticket | null)}
            onInputChange={handleInputChange}
            getOptionLabel={(option: any) => (option ? `#${option.ticket_code} - ${option.subject}` : "")}
            isOptionEqualToValue={(option: any, val: any) => option.id === val.id}
            placeholder="Search by ticket code or subject..."
        />
    );
}
