import { Metadata } from "next";
import OpClient from "@/components/solusi/operasional/OpClient";

export const metadata: Metadata = {
    title: "Solution for Operations Teams | SmartSales",
    description: "Automate field processes and monitor activities in real-time with SmartSales Operations Industry Solution.",
};

export default function OperationsPage() {
    return <OpClient />;
}
