import { CircularProgress } from "@mui/material";

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-full min-h-[calc(100vh-64px)]">
            <CircularProgress size={40} />
        </div>
    );
}
