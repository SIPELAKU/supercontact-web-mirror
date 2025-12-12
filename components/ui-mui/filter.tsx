"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui-mui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui-mui/dropdown-menu";

import React, { useState } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters?: FilterConfig[];
  width?: string;
}

export function FilterBar({ filters = [], width = "200px" }: FilterBarProps) {
  const [anchorElMap, setAnchorElMap] = useState<Record<number, HTMLElement | null>>({});

  const handleOpen = (index: number, event: any) => {
    setAnchorElMap((prev) => ({ ...prev, [index]: event.currentTarget }));
  };

  const handleClose = (index: number) => {
    setAnchorElMap((prev) => ({ ...prev, [index]: null }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

      {filters.map((filter, index) => {
        const open = Boolean(anchorElMap[index]);
        
        return (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                onClick={(e) => handleOpen(index, e)}
                className="
                  bg-white
                  border border-gray-300
                  rounded-lg
                  h-11
                  text-gray-700
                  px-4
                  flex items-center justify-between
                  font-normal
                "
                style={{ width }}
              >
                <span>
                  {filter.value === "all" ? filter.label : filter.value}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              anchorEl={anchorElMap[index] || null}
              open={open}
              onClose={() => handleClose(index)}
              className="bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-40"
            >
              <div
                className="w-full"
                style={{
                  width: anchorElMap[index]?.offsetWidth || "auto",
                }}
              >
                {filter.options.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    className="
                    text-gray-700 
                    text-sm 
                    px-3 py-2 
                    cursor-pointer
                    rounded-md
                    hover:bg-gray-100
                  "
                    onClick={() => {
                      filter.onChange(opt.value);
                      handleClose(index);
                    }}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

    </div>
  );
}
