"use client";

import { Alert, AlertTitle, Button } from "@mui/material";

export default function UsersTableError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {message ?? "Failed to load users data."}

        {onRetry && (
          <Button
            variant="contained"
            color="error"
            size="small"
            className="mt-4"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Alert>
    </div>
  );
}
