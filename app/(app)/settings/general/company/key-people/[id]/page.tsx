"use client";

import { useParams } from "next/navigation";
import KeyPersonProfileClient from "@/components/omnichannel/key-people/KeyPersonProfileClient";

export default function KeyPersonProfilePage() {
  const params = useParams<{ id: string }>();
  return <KeyPersonProfileClient id={params.id} />;
}
