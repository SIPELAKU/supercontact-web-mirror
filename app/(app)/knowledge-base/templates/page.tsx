import { KbAccessGuard } from "@/components/knowledge/KbAccessGuard";
import KbTemplateGallery from "@/components/knowledge/KbTemplateGallery";

// KB Template Gallery — industry starter packs. Both backend endpoints
// (GET /knowledge/templates, POST .../install) are knowledge:manage-gated,
// so the page requires manage, not just read.
export default function KnowledgeTemplatesPage() {
  return (
    <KbAccessGuard requireManage>
      <KbTemplateGallery />
    </KbAccessGuard>
  );
}
