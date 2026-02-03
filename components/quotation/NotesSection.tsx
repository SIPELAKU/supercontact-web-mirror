"use client";

import { AppTextarea } from "../ui/app-textarea";

interface NotesCardProps {
  notes: string;
  onChange: (value: string) => void;
}


export default function NotesCard({ notes, onChange }: NotesCardProps) {
  return (
    <div className="bg-white p-6">
      <h2 className="mb-3 text-base font-semibold">Note:</h2>
      <AppTextarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        isBgWhite
      />
    </div>
  );
}
