import type { Metadata } from "next";
import { fetchHelpConfig } from "@/lib/api/help-center-public";
import HelpCategoryClient from "@/components/help-center/public/HelpCategoryClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; categorySlug: string };
}): Promise<Metadata> {
  try {
    const config = await fetchHelpConfig(params.slug);
    const name = config.display_name || "Help Center";
    return {
      title: `${name} Help Center`,
      description: `Browse help articles for ${name}.`,
      robots: { index: true, follow: true },
      icons: config.favicon_url ? { icon: config.favicon_url } : undefined,
    };
  } catch {
    return { title: "Help Center", robots: { index: false, follow: false } };
  }
}

export default function HelpCategoryPage() {
  return <HelpCategoryClient />;
}
