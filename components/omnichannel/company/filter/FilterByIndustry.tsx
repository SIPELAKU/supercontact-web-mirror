import { Industry, IndustryOption } from "@/lib/types/Company";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";

interface FilterByIndustryProps {
  INDUSTRY_OPTIONS: IndustryOption[];
  value: Industry;
  onChange: (value: Industry) => void;
}

export default function FilterByIndustry({ INDUSTRY_OPTIONS, value, onChange }: FilterByIndustryProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value as Industry);
  };

  return (
    <FormControl size="small">
      <Select
        displayEmpty
        value={value}
        onChange={handleChange}
        renderValue={(selected) => {
          if (!selected) {
            return <span className="text-gray-400">Select Industry</span>;
          }
          return selected;
        }}
        className="max-h-[38px]! min-w-[175px]! rounded-md!"
      >
        {INDUSTRY_OPTIONS.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
