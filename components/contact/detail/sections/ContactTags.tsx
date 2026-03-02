interface ContactTagsProps {
    tags: string[];
}

export const ContactTags = ({ tags }: ContactTagsProps) => {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className={`px-3 py-1 ${tag === "High Priority" ? "bg-[#FEC7C7] text-[#920E0E]" : "bg-[#E7EBF3] text-[#0D121B]"} rounded-[8px] text-xs font-medium`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};
