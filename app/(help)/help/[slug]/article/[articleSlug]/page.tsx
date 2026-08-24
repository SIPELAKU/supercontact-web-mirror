import type { Metadata } from "next";
import { fetchHelpArticle, fetchHelpConfig } from "@/lib/api/help-center-public";
import HelpArticleClient from "@/components/help-center/public/HelpArticleClient";

export const dynamic = "force-dynamic";

// Per-article indexable metadata (title + excerpt). Falls back to a generic
// title if the article or portal can't be resolved (404 -> noindex).
export async function generateMetadata({
  params,
}: {
  params: { slug: string; articleSlug: string };
}): Promise<Metadata> {
  try {
    const [config, article] = await Promise.all([
      fetchHelpConfig(params.slug).catch(() => null),
      fetchHelpArticle(params.slug, params.articleSlug),
    ]);
    const siteName = config?.display_name || "Help Center";
    return {
      title: `${article.title} - ${siteName}`,
      description: article.excerpt || `${article.title} - ${siteName}`,
      robots: { index: true, follow: true },
      icons: config?.favicon_url ? { icon: config.favicon_url } : undefined,
    };
  } catch {
    return { title: "Help Center", robots: { index: false, follow: false } };
  }
}

export default function HelpArticlePage() {
  return <HelpArticleClient />;
}
