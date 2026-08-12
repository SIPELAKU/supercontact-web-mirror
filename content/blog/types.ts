export type Localized<T> = { id: T; en: T };

export type BlogBodyBlock =
    | { type: 'h2'; text: Localized<string> }
    | { type: 'p'; text: Localized<string> }
    | { type: 'list'; items: Localized<string[]> }
    | { type: 'callout'; text: Localized<string> };

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
}
