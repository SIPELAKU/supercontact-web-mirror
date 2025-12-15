import Image from 'next/image'
import React from 'react'

export default function AiIntelligenceSummary() {
  return (
      <div className="rounded-2xl border bg-[#EEF3FF] p-6">
        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3EAFF]">
            <Image src="/ai-intelligence-summary.svg" alt="AI Intelligence" width={20} height={20} priority />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#3B5BDB]">AI Intelligence Summary</h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Acme Inc. has recently expanded its engineering team by 15% in Q3, focusing on AI/ML roles. They launched a new enterprise tier last month which has seen significant traction in the fintech sector. Recent signals suggest they
              are evaluating new CRM vendors. Key decision makers have been active on LinkedIn discussing data privacy compliance.
            </p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#D3DEFF] bg-white px-3 py-1 text-xs font-medium text-[#3B5BDB]">Growth Phase</span>
              <span className="rounded-full border border-[#D3DEFF] bg-white px-3 py-1 text-xs font-medium text-[#3B5BDB]">Hiring Surge</span>
            </div>
          </div>
        </div>
      </div>
  )
}
