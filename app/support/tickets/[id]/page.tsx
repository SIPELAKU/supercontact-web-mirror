"use client";

import { useParams } from "next/navigation";
import { TicketDetailClient } from "@/components/support/tickets/detail/TicketDetailClient";

export default function TicketDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return <TicketDetailClient id={id} />;
}
