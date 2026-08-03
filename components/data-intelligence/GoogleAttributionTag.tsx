// Google Maps Platform terms require attribution wherever Maps-sourced
// content is displayed. Shown alongside the source badge whenever a record's
// data came from google_maps - see the backend's Amendment A remediation
// (organization_service.py / company_intelligence_mixins.py's
// _expire_stale_google_maps_fields).
interface GoogleAttributionTagProps {
    source?: string | null;
}

export function GoogleAttributionTag({ source }: GoogleAttributionTagProps) {
    if (source !== "google_maps") return null;

    return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            via Google
        </span>
    );
}
