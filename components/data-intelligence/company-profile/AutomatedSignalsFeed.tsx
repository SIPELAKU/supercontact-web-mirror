"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { formatDistanceToNow } from "date-fns";

// Read-only counterpart to components/omnichannel/company/detail-company/
// RecentSignals.tsx (which is a manually-curated "Add Signal" feed for the
// tenant's own profile) - this one has no add/edit affordance since it's
// meant to show automated detections (website/employee-count/new-location
// changes, see B4's SignalEngineService), not user-entered notes.
//
// Purely presentational - CompanyProfile360Client fetches real notifications
// filtered by entity_type=organization&entity_id=<organizationId> (B4) and
// maps them into AutomatedSignal[] before passing them down here.
export interface AutomatedSignal {
    id: string;
    title: string;
    description?: string;
    detectedAt: string;
}

interface AutomatedSignalsFeedProps {
    signals: AutomatedSignal[];
    isLoading?: boolean;
}

export default function AutomatedSignalsFeed({ signals, isLoading }: AutomatedSignalsFeedProps) {
    return (
        <Card className="rounded-2xl! shadow-lg!">
            <CardContent className="p-6!">
                <Typography className="text-base! font-semibold!">Recent Signals</Typography>

                {isLoading ? (
                    <Typography className="mt-4 text-sm! text-slate-500!">Loading signals...</Typography>
                ) : signals.length === 0 ? (
                    <Typography className="mt-4 text-sm! text-slate-500!">
                        No signals detected yet. Signals appear here automatically as changes are found on
                        scheduled re-checks (website updates, headcount changes, new locations).
                    </Typography>
                ) : (
                    <div className="mt-6 space-y-5">
                        {signals.slice(0, 5).map((item, index) => (
                            <div key={item.id} className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                    <div className="relative mt-1">
                                        <span className="block h-2.5 w-2.5 rounded-full bg-blue-500" />
                                        {index !== signals.slice(0, 5).length - 1 && (
                                            <span className="absolute left-1/2 top-3 h-10 w-0.5 -translate-x-1/2 bg-slate-200" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Typography className="text-sm! font-semibold!">{item.title}</Typography>
                                        {item.description && (
                                            <Typography className="text-xs! text-slate-600!">{item.description}</Typography>
                                        )}
                                    </div>
                                </div>
                                <Typography className="whitespace-nowrap text-[10px]! text-slate-400!">
                                    {(() => {
                                        try {
                                            return formatDistanceToNow(new Date(item.detectedAt), { addSuffix: true });
                                        } catch {
                                            return item.detectedAt;
                                        }
                                    })()}
                                </Typography>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
