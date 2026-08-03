import { Chip } from "@mui/material";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { useTicketTags } from "@/lib/hooks/useTicketTags";

interface TicketTagsInputProps {
    value: string[];
    onChange: (tagNames: string[]) => void;
}

// freeSolo + multiple lets an agent pick an existing tag or type a brand-new
// one - the backend resolves names to tags (case-insensitive get-or-create)
// at ticket create/update time.
export default function TicketTagsInput({ value, onChange }: TicketTagsInputProps) {
    const { data } = useTicketTags();
    const existingTagNames = (data?.data?.data || []).map((t) => t.name);

    return (
        <AppAutocomplete
            isBgWhite
            multiple
            freeSolo
            options={existingTagNames}
            value={value}
            filterOptions={(options: string[], state: { inputValue: string }) => {
                const input = state.inputValue.trim().toLowerCase();
                if (!input) return options;
                return options.filter((opt) => opt.toLowerCase().includes(input));
            }}
            onChange={(_e, newValue) => onChange((newValue as string[]) || [])}
            renderTags={(tagValue: string[], getTagProps: any) =>
                tagValue.map((option: string, index: number) => (
                    <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        sx={{ backgroundColor: "#5479EE1A", color: "#5479EE", fontWeight: 500 }}
                    />
                ))
            }
            placeholder="Add tags..."
        />
    );
}
