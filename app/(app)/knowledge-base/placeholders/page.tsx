import { KbAccessGuard } from "@/components/knowledge/KbAccessGuard";
import KnowledgePlaceholdersClient from "@/components/knowledge/KnowledgePlaceholdersClient";

export default function KnowledgePlaceholdersPage() {
  return (
    <KbAccessGuard>
      <KnowledgePlaceholdersClient />
    </KbAccessGuard>
  );
}
