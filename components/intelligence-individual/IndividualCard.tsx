import React from 'react'
import { KeyPerson } from '@/lib/types/individual-intelligence'
import { Avatar } from '@mui/material'
import { AppInput } from '../ui/app-input'

interface IndividualCardProps {
    person: KeyPerson;
    company: {
        company_name: string;
        industry: string;
        description: string;
    };
    selected: boolean;
    onToggleSelect: (id: string) => void;
    isSelectionEnabled: boolean;
}

export const IndividualCard: React.FC<IndividualCardProps> = ({ person, company, selected, onToggleSelect, isSelectionEnabled }) => {
    return (
        <div
            className={`relative p-6 bg-white border rounded-xl shadow-lg transition-all ${isSelectionEnabled ? 'cursor-pointer hover:shadow-md' : ''} ${selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}
            onClick={() => isSelectionEnabled && onToggleSelect(person.id)}
        >
            {/* Selection Checkbox */}
            {isSelectionEnabled && (
                <div className="absolute top-4 right-4 z-10">
                    <AppInput
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(person.id)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Industry Badge */}
            <div className="inline-block px-3 py-1 mb-4 text-[11px] lg:text-[12px] xl:text-[13px] font-medium uppercase bg-[#ededf0] rounded-full text-[#262B43]/80">
                {company.industry}
            </div>

            {/* Company Info */}
            <h3 className="text-lg font-medium text-[#262B43]/90 mb-2 truncate pr-8">{company.company_name}</h3>
            <p className="text-sm text-[#262B43]/70 mb-6 line-clamp-2 h-10">
                {company.description}
            </p>

            {/* Key People Box - Showing specific person */}
            <div className="p-4 bg-[#f2f4f5] rounded-lg">
                <div className="text-[10px] font-medium text-[#7E84A3] uppercase tracking-wider mb-3">KEY PEOPLE</div>
                <div className="flex items-center gap-3">
                    <Avatar
                        src={person.avatar_url}
                        alt={person.name}
                        sx={{ width: 40, height: 40 }}
                    >
                        {person.name?.charAt(0)}
                    </Avatar>
                    <div className="min-w-0">
                        <div className="text-sm font-medium truncate text-[#262B43]">{person.name || 'N/A'}</div>
                        <div className="text-xs text-[#7E84A3] truncate">{person.role}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
