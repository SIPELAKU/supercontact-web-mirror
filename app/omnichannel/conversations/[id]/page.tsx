"use client";

import React from "react";
import { useParams } from "next/navigation";
import ConversationView from "@/components/omnichannel/ConversationView";

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;

  return <ConversationView conversationId={conversationId} />;
}
