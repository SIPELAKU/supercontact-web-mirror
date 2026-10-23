import { BlogArticle } from '@/content/blog/types';

// Blog kini dibaca dari CMS Directus (terpisah dari kode), bukan dari
// content/blog/*.ts. Frontend tetap memakai bentuk BlogArticle yang sama.
const CMS = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms-smartsales.smartcore.id';
const REVALIDATE = 300; // ISR: artikel baru muncul tanpa redeploy

const FIELDS = [
    'slug', 'status', 'published_date', 'updated_date',
    'author_name_id', 'author_name_en',
    'title_id', 'title_en', 'description_id', 'description_en',
    'h1_id', 'h1_en', 'intro_id', 'intro_en',
    'body', 'faq', 'related_slugs',
    'cta_href', 'cta_label_id', 'cta_label_en',
    'meta_title', 'meta_description', 'canonical_override', 'og_image_override',
    'category_id.name_id', 'category_id.name_en', 'category_id.slug',
].join(',');

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(r: any): BlogArticle {
    const cat = r.category_id || {};
    return {
        slug: r.slug,
        category: { id: cat.name_id ?? '', en: cat.name_en ?? cat.name_id ?? '' },
        publishedDate: r.published_date ?? '',
        updatedDate: r.updated_date ?? undefined,
        author: {
            id: r.author_name_id ?? 'Tim SmartSales',
            en: r.author_name_en ?? 'SmartSales Team',
        },
        title: { id: r.title_id, en: r.title_en ?? r.title_id },
        description: { id: r.description_id ?? '', en: r.description_en ?? r.description_id ?? '' },
        h1: { id: r.h1_id ?? r.title_id, en: r.h1_en ?? r.h1_id ?? r.title_id },
        intro: { id: r.intro_id ?? '', en: r.intro_en ?? r.intro_id ?? '' },
        body: Array.isArray(r.body) ? r.body : [],
        faq: Array.isArray(r.faq) ? r.faq : [],
        relatedSlugs: Array.isArray(r.related_slugs) ? r.related_slugs : [],
        primaryCtaHref: r.cta_href ?? '/register',
        primaryCtaLabel: {
            id: r.cta_label_id ?? 'Coba SmartSales Gratis',
            en: r.cta_label_en ?? 'Try SmartSales Free',
        },
        metaTitle: r.meta_title ?? undefined,
        metaDescription: r.meta_description ?? undefined,
        canonicalOverride: r.canonical_override ?? undefined,
        ogImageOverride: r.og_image_override ?? undefined,
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getAllArticles(): Promise<BlogArticle[]> {
    try {
        const res = await fetch(
            `${CMS}/items/articles?filter[status][_eq]=published&sort=-published_date&limit=-1&fields=${FIELDS}`,
            { next: { revalidate: REVALIDATE } },
        );
        if (!res.ok) return [];
        const json = await res.json();
        return (json.data ?? []).map(mapRow);
    } catch {
        return [];
    }
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    const all = await getAllArticles();
    return all.find((a) => a.slug === slug) ?? null;
}

export function getRelated(article: BlogArticle, all: BlogArticle[], limit = 3): BlogArticle[] {
    return article.relatedSlugs
        .map((s) => all.find((a) => a.slug === s))
        .filter((a): a is BlogArticle => Boolean(a))
        .slice(0, limit);
}
