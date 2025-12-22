import Image from "next/image";

interface AiIntelligenceSummaryProps {
  description: string;
  tags: string[];
}

export default function AiIntelligenceSummary({ description, tags }: AiIntelligenceSummaryProps) {
  return (
    <div className="rounded-2xl border bg-[#EEF3FF] p-6">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3EAFF]">
          <Image src="/ai-intelligence-summary.svg" alt="AI Intelligence" width={20} height={20} priority />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#3B5BDB]">Ai Intelligence Summary.</h3>

          <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#D3DEFF] bg-white px-3 py-1 text-xs font-medium text-[#3B5BDB]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
