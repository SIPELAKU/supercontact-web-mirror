"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, CheckCircle2 } from "lucide-react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import { createPersonEnrichmentJob } from "@/lib/api/person-intelligence";
import { ENRICH_ALL_COST, ENRICH_ALL_FIELDS } from "@/lib/types/person-intelligence";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

export interface EnrichPersonQuery {
    full_name: string;
    company_name?: string | null;
    company_domain?: string | null;
    linkedin_url?: string | null;
    title?: string | null;
    location?: string | null;
}

interface EnrichPersonDialogProps {
    open: boolean;
    onClose: () => void;
    person: EnrichPersonQuery;
    availableCredits: number | null;
    /** LOCAL/DEV backends bypass the credit check server-side — mirror that
     * here so the button is never disabled and the copy doesn't warn about
     * a shortfall that will not actually block anything. */
    unlimitedCredits?: boolean;
    /** Called once the job is successfully queued, so the caller can refresh
     * its credit balance and (on the profile page) start polling job status. */
    onQueued?: (jobId: string) => void;
}

// One-click, not per-field: the product decision here is that "Enrich"
// always requests everything we can find (email + phone) for a flat price,
// rather than making the user pick fields before every click. See
// PersonEnrichmentJobCreateRequest.fields on the backend — a future UI can
// still request a narrower set without any API change.
export function EnrichPersonDialog({
    open,
    onClose,
    person,
    availableCredits,
    unlimitedCredits,
    onQueued,
}: EnrichPersonDialogProps) {
    const { getToken } = useAuth();
    const [step, setStep] = useState<"confirm" | "done">("confirm");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setStep("confirm");
            setJobId(null);
        }
    }, [open]);

    const insufficientCredit =
        !unlimitedCredits && availableCredits !== null && availableCredits < ENRICH_ALL_COST;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const token = await getToken();
            const result = await createPersonEnrichmentJob(token, {
                full_name: person.full_name,
                company_name: person.company_name || undefined,
                company_domain: person.company_domain || undefined,
                linkedin_url: person.linkedin_url || undefined,
                title: person.title || undefined,
                location: person.location || undefined,
                fields: [...ENRICH_ALL_FIELDS],
            });
            setJobId(result.job_id);
            setStep("done");
            onQueued?.(result.job_id);
        } catch (err: any) {
            notify.error("Enrichment failed", { description: handleError(err, "Enrich Person") });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === "done") {
        return (
            <AppDialog open={open} onClose={onClose} title="Enrichment queued" maxWidth="xs">
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                    <div className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 size={28} className="text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                        Job <span className="font-mono text-gray-800">#{jobId?.slice(0, 8)}</span> is running for{" "}
                        <span className="font-medium text-gray-900">{person.full_name}</span>. You'll see fresh
                        data here shortly — no need to wait on this screen.
                    </p>
                    <p className="text-xs text-gray-400">{ENRICH_ALL_COST} credits reserved, settled when the job finishes.</p>
                    <AppButton variantStyle="primary" fullWidth onClick={onClose} className="mt-2">
                        Done
                    </AppButton>
                </div>
            </AppDialog>
        );
    }

    return (
        <AppDialog
            open={open}
            onClose={onClose}
            title={`Enrich ${person.full_name}`}
            description="One click looks up every verified channel we can find. Search stayed free — this queues a metered job."
            maxWidth="xs"
            actions={
                <>
                    <AppButton variantStyle="outline" color="gray" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </AppButton>
                    <AppButton
                        variantStyle="primary"
                        onClick={handleConfirm}
                        isLoading={isSubmitting}
                        disabled={insufficientCredit}
                    >
                        Enrich · {ENRICH_ALL_COST} credits
                    </AppButton>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                    <Mail size={16} className="shrink-0 text-[#5479EE]" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Verified email</div>
                        <div className="text-xs text-gray-400">Pattern-match + provider verification</div>
                    </div>
                    <span className="text-xs font-semibold text-[#3F3F8A]">1 credit</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                    <Phone size={16} className="shrink-0 text-[#5479EE]" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Verified phone</div>
                        <div className="text-xs text-gray-400">Mobile line-type detection + validation</div>
                    </div>
                    <span className="text-xs font-semibold text-[#3F3F8A]">2 credits</span>
                </div>

                <div className="mt-2 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-600">Total cost</span>
                    <span className="text-sm font-bold text-gray-900">{ENRICH_ALL_COST} credits</span>
                </div>
                {unlimitedCredits ? (
                    <p className="text-right text-xs font-medium text-emerald-600">Unlimited credit (dev) — never blocked.</p>
                ) : (
                    availableCredits !== null && (
                        <p className="text-right text-xs text-gray-400">
                            {availableCredits.toLocaleString()} available now →{" "}
                            <span className="font-medium text-gray-600">
                                {Math.max(availableCredits - ENRICH_ALL_COST, 0).toLocaleString()} after
                            </span>
                        </p>
                    )
                )}
                {insufficientCredit && (
                    <p className="text-right text-xs font-medium text-rose-600">
                        Not enough credit for this enrichment.
                    </p>
                )}
            </div>
        </AppDialog>
    );
}
