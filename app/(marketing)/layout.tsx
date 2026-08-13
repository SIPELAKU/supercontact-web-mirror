import MarketingShell from "@/components/layout/MarketingShell";
import ReactQueryProvider from "@/lib/ReactQueryProvider";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReactQueryProvider>
            <MarketingShell>{children}</MarketingShell>
        </ReactQueryProvider>
    );
}
