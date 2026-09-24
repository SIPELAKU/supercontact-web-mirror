"use client";

import { useParams } from "next/navigation";
import ProspectProfileClient from "@/components/data-intelligence/prospecting/ProspectProfileClient";

export default function ProspectProfilePage() {
    const params = useParams();
    const id = params.id as string;

    return <ProspectProfileClient personId={id} />;
}
