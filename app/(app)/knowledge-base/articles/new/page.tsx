import { KbAccessGuard } from "@/components/knowledge/KbAccessGuard";
import KnowledgeArticleEditorClient from "@/components/knowledge/KnowledgeArticleEditorClient";

export default function NewKnowledgeArticlePage() {
  return (
    <KbAccessGuard>
      <KnowledgeArticleEditorClient />
    </KbAccessGuard>
  );
}
