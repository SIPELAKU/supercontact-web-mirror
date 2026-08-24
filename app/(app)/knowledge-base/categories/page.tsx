import { KbAccessGuard } from "@/components/knowledge/KbAccessGuard";
import KnowledgeCategoriesClient from "@/components/knowledge/KnowledgeCategoriesClient";

export default function KnowledgeCategoriesPage() {
  return (
    <KbAccessGuard>
      <KnowledgeCategoriesClient />
    </KbAccessGuard>
  );
}
