import { Industry, IndustryOption } from "@/lib/types/Company";
import { AppSelect } from "@/components/ui/app-select";
import { SelectChangeEvent } from "@mui/material";

interface FilterByIndustryProps {
  INDUSTRY_OPTIONS: IndustryOption[];
  value: Industry;
  onChange: (value: Industry) => void;
}

export default function FilterByIndustry({
  INDUSTRY_OPTIONS,
  value,
  onChange,
}: FilterByIndustryProps) {
  const handleChange = (e: SelectChangeEvent<unknown>) => {
    onChange(e.target.value as Industry);
  };

  const options = INDUSTRY_OPTIONS.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  return (
    <AppSelect
      placeholder="Select Industry"
      value={value}
      onChange={handleChange}
      options={options}
      sx={{ minWidth: "175px" }}
      isBgWhite
    />
  );
}
