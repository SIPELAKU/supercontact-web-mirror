import { CompanyStatus, StatusOption } from "@/lib/types/Company";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";

interface FilterByStatusProps {
  STATUS_OPTIONS: StatusOption[];
  value: CompanyStatus;
  onChange: (value: CompanyStatus) => void;
}

export default function FilterByStatus({ STATUS_OPTIONS, value, onChange }: FilterByStatusProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value as CompanyStatus);
  };
  return (
    <FormControl size="small">
      <Select
        displayEmpty
        value={value}
        onChange={handleChange}
        renderValue={(selected) => {
          if (!selected) {
            return <span className="text-gray-400">Select Status</span>;
          }
          return selected;
        }}
        className="max-h-[38px]! min-w-[175px]! rounded-md!"
      >
        {STATUS_OPTIONS.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
