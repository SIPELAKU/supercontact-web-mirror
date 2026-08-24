import { KbAccessGuard } from "@/components/knowledge/KbAccessGuard";
import KnowledgeArticleListClient from "@/components/knowledge/KnowledgeArticleListClient";

export default function KnowledgeBasePage() {
  return (
    <KbAccessGuard>
      <KnowledgeArticleListClient />
    </KbAccessGuard>
  );
}
