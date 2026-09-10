import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogArticleTemplate from '@/components/blog/BlogArticleTemplate';
import { getAllArticles, getRelated } from '@/lib/blog/api';
import { ogImageUrl } from '@/lib/utils/og-image';

const BASE_URL = 'https://smartsales.id';

// ISR: konten dari CMS; artikel/slug baru muncul tanpa redeploy.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
    const all = await getAllArticles();
    return all.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const all = await getAllArticles();
    const article = all.find((a) => a.slug === params.slug);
    if (!article) {
        return {};
    }

    const pageUrl = `${BASE_URL}/blog/${article.slug}`;
    const canonical = article.canonicalOverride || pageUrl;
    const image = article.ogImageOverride || ogImageUrl({ title: article.h1.id, category: article.category.id });
    const title = article.metaTitle || article.title.id;
    const description = article.metaDescription || article.description.id;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: 'SmartSales',
            locale: 'id_ID',
            type: 'article',
            publishedTime: article.publishedDate,
            images: [{ url: image, width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
    const all = await getAllArticles();
    const article = all.find((a) => a.slug === params.slug);
    if (!article) {
        notFound();
    }

    const related = getRelated(article, all);
    const pageUrl = `${BASE_URL}/blog/${article.slug}`;
    const image = article.ogImageOverride || ogImageUrl({ title: article.h1.id, category: article.category.id });

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: article.h1.id, item: pageUrl },
        ],
    };

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.h1.id,
        description: article.description.id,
        image: [image],
        datePublished: article.publishedDate,
        dateModified: article.updatedDate ?? article.publishedDate,
        author: { '@type': 'Organization', name: article.author.id },
        publisher: {
            '@type': 'Organization',
            name: 'SmartSales',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/assets/sc-icon-512.png`, width: 512, height: 512 },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    };

    const faqSchema = article.faq && article.faq.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.faq.map((item) => ({
                '@type': 'Question',
                name: item.q.id,
                acceptedAnswer: { '@type': 'Answer', text: item.a.id },
            })),
        }
        : null;

    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [breadcrumbSchema, articleSchema, ...(faqSchema ? [faqSchema] : [])],
    };

    return (
        <>
            <script
                id={`blog-${article.slug}-schema`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
            />
            <BlogArticleTemplate article={article} related={related} />
        </>
    );
}
