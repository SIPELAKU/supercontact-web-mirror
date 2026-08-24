import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { NotificationsProvider } from "@/lib/context/NotificationsContext";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { MuiLocalizationProvider } from "@/components/providers/MuiLocalizationProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <MuiLocalizationProvider>
            <NotificationsProvider>
                <ReactQueryProvider>
                    <AuthenticatedLayout>{children}</AuthenticatedLayout>
                </ReactQueryProvider>
            </NotificationsProvider>
        </MuiLocalizationProvider>
    );
}
