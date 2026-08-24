"use client";

import { useParams } from "next/navigation";
import { KbAccessGuard } from "@/components/knowledge/KbAccessGuard";
import KnowledgeArticleEditorClient from "@/components/knowledge/KnowledgeArticleEditorClient";

export default function KnowledgeArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <KbAccessGuard>
      <KnowledgeArticleEditorClient articleId={id} />
    </KbAccessGuard>
  );
}
