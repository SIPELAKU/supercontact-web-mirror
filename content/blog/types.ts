export type Localized<T> = { id: T; en: T };

export type BlogBodyBlock =
    | { type: 'h2'; text: Localized<string> }
    | { type: 'p'; text: Localized<string> }
    | { type: 'list'; items: Localized<string[]> }
    | { type: 'callout'; text: Localized<string> }
    | { type: 'table'; headers: Localized<string[]>; rows: Localized<string[][]> }
    // Hub tautan internal (untuk pillar page): tiap item menaut ke /blog/<slug>.
    | { type: 'linklist'; title?: Localized<string>; items: BlogLinkItem[] };

export interface BlogLinkItem {
    slug: string;
    label: Localized<string>;
    desc?: Localized<string>;
}

export interface BlogFaqItem {
    q: Localized<string>;
    a: Localized<string>;
}

export interface BlogArticle {
    slug: string;
    category: Localized<string>;
    publishedDate: string;
    updatedDate?: string;
    author: Localized<string>;
    title: Localized<string>;
    description: Localized<string>;
    h1: Localized<string>;
    intro: Localized<string>;
    body: BlogBodyBlock[];
    faq?: BlogFaqItem[];
    relatedSlugs: string[];
    primaryCtaHref: string;
    primaryCtaLabel: Localized<string>;
    // Field SEO opsional dari CMS (tidak diisi oleh file .ts lama)
    metaTitle?: string;
    metaDescription?: string;
    canonicalOverride?: string;
    ogImageOverride?: string;
}
