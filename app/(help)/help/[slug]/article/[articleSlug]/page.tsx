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
      // noindex until article bodies are server-rendered: these routes are
      // force-dynamic client-fetch, so crawlers receive a spinner with no
      // content — indexable spinner pages read as soft-404 noise. Flip back
      // to index:true when the Help Center gets real SSR (roadmap backlog).
      robots: { index: false, follow: true },
      icons: config?.favicon_url ? { icon: config.favicon_url } : undefined,
    };
  } catch {
    return { title: "Help Center", robots: { index: false, follow: false } };
  }
}

export default function HelpArticlePage() {
  return <HelpArticleClient />;
}
