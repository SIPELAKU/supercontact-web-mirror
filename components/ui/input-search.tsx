"use client";

import { ReadonlyURLSearchParams } from "next/navigation";
import { Input } from "./input";

interface InputSearchProps {
  placeholder: string;
  handleSearch: (e: string) => void;
  searchParams: ReadonlyURLSearchParams;
}

export default function InputSearch({
  placeholder,
  handleSearch,
  searchParams,
}: InputSearchProps) {
  return (
    <Input
      className="max-w-[260px] focus:outline-[#6A5BF7]"
      placeholder={placeholder}
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get("q")?.toString()}
    />
  );
}
