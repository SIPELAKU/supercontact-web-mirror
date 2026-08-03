import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { useTicketCategories } from "@/lib/hooks/useTicketCategories";

interface TicketCategorySelectProps {
    value: string | null;
    onChange: (categoryId: string | null) => void;
}

export default function TicketCategorySelect({ value, onChange }: TicketCategorySelectProps) {
    const { data, isLoading } = useTicketCategories();
    const categories = data?.data?.data || [];

    const options = categories.map((c) => ({ value: c.id, label: c.name }));
    const selected = options.find((opt) => opt.value === value) || null;

    return (
        <AppAutocomplete
            isBgWhite
            options={options}
            placeholder="Select category"
            value={selected}
            loading={isLoading}
            onChange={(_e, newValue) =>
                onChange((newValue as { value: string; label: string } | null)?.value || null)
            }
        />
    );
}
