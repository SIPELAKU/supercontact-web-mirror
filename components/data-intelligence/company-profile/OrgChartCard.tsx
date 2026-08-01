"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { usePeopleGroupedBySeniority } from "@/lib/hooks/usePeople";

// C2: same two-part "summary card + View All drill-down" idiom as
// OrganizationStructureCard (components/omnichannel/company/detail-company/
// OrganizationStructureCard.tsx), which is a stub with no real logic to
// reuse for a shared cross-tenant Organization's people - this is a
// genuinely new component in that same visual pattern.
interface OrgChartCardProps {
    organizationId: string | null;
    viewAllHref: string;
}

export default function OrgChartCard({ organizationId, viewAllHref }: OrgChartCardProps) {
    const { data, isLoading } = usePeopleGroupedBySeniority(organizationId);
    const groups = data?.groups || [];
    const totalPeople = groups.reduce((sum, group) => sum + group.people.length, 0);

    return (
        <Card className="rounded-2xl! shadow-lg!">
            <CardContent className="p-0!">
                <div className="p-5">
                    <Typography className="text-base! font-semibold!">Org Chart</Typography>
                    {organizationId && !isLoading && (
                        <Typography className="mt-1 text-xs! text-slate-500!">
                            {totalPeople > 0
                                ? `${totalPeople} ${totalPeople === 1 ? "person" : "people"} across ${groups.length} seniority ${groups.length === 1 ? "tier" : "tiers"}`
                                : "No people recorded yet"}
                        </Typography>
                    )}
                </div>

                {groups.length > 0 && (
                    <>
                        <Divider />
                        <div className="space-y-2 p-5">
                            {groups.slice(0, 3).map((group) => (
                                <div key={group.band} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{group.label}</span>
                                    <span className="font-semibold text-slate-900">{group.people.length}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <Divider />

                <div className="p-5 text-center">
                    {organizationId ? (
                        <Link
                            href={viewAllHref}
                            className="cursor-pointer text-xs font-medium text-[#5479EE] hover:underline"
                        >
                            View Full Org Chart
                        </Link>
                    ) : (
                        <span className="text-xs text-slate-400">Save to CRM to build an org chart</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
