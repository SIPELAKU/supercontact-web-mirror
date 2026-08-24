import type { Metadata } from "next";
import { fetchHelpConfig } from "@/lib/api/help-center-public";
import HelpHomeClient from "@/components/help-center/public/HelpHomeClient";

// Rendered on demand by slug (no generateStaticParams) - never prerendered at
// build. Mirrors how /m/[id] fetches its data at request/runtime instead of at
// build, avoiding a build-time fetch by an unknown slug.
export const dynamic = "force-dynamic";

// Indexable portal metadata derived from the tenant's config. Unlike /m/, the
// help center is meant to be found by search engines (see robots.ts ALLOW).
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const config = await fetchHelpConfig(params.slug);
    const name = config.display_name || "Help Center";
    return {
      title: `${name} Help Center`,
      description:
        config.welcome_subtext ||
        config.welcome_headline ||
        `Guides, answers and support for ${name}.`,
      robots: { index: true, follow: true },
      icons: config.favicon_url ? { icon: config.favicon_url } : undefined,
    };
  } catch {
    // Disabled / unknown portal (404) - don't advertise it.
    return { title: "Help Center", robots: { index: false, follow: false } };
  }
}

export default function HelpHomePage() {
  return <HelpHomeClient />;
}
