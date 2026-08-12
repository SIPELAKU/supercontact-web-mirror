import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { ConfirmationProvider } from "@/components/ui/confirm-modal";
import { NotificationsProvider } from "@/lib/context/NotificationsContext";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { MuiLocalizationProvider } from "@/components/providers/MuiLocalizationProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <MuiLocalizationProvider>
            <ConfirmationProvider>
                <NotificationsProvider>
                    <ReactQueryProvider>
                        <AuthenticatedLayout>{children}</AuthenticatedLayout>
                    </ReactQueryProvider>
                </NotificationsProvider>
            </ConfirmationProvider>
        </MuiLocalizationProvider>
    );
}
