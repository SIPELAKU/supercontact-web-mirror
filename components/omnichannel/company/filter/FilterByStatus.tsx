import { CompanyStatus, StatusOption } from "@/lib/types/Company";
import { AppSelect } from "@/components/ui/app-select";
import { SelectChangeEvent } from "@mui/material";

interface FilterByStatusProps {
  STATUS_OPTIONS: StatusOption[];
  value: CompanyStatus;
  onChange: (value: CompanyStatus) => void;
}

export default function FilterByStatus({
  STATUS_OPTIONS,
  value,
  onChange,
}: FilterByStatusProps) {
  const handleChange = (e: SelectChangeEvent<unknown>) => {
    onChange(e.target.value as CompanyStatus);
  };

  const options = STATUS_OPTIONS.map((opt) => ({
    value: opt.value as string | number,
    label: opt.label,
  }));

  return (
    <AppSelect
      placeholder="Select Status"
      value={value}
      onChange={handleChange}
      options={options}
      sx={{ minWidth: "175px" }}
    />
  );
}
