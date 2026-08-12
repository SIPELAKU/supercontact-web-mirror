import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogArticleTemplate from '@/components/blog/BlogArticleTemplate';
import { blogArticles, getArticleBySlug } from '@/content/blog/registry';

const BASE_URL = 'https://www.smartsales.id';

export function generateStaticParams() {
    return blogArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const article = getArticleBySlug(params.slug);
    if (!article) {
        return {};
    }

    const pageUrl = `${BASE_URL}/blog/${article.slug}`;

    return {
        title: article.title.id,
        description: article.description.id,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: article.title.id,
            description: article.description.id,
            url: pageUrl,
            siteName: 'SmartSales',
            locale: 'id_ID',
            type: 'article',
            publishedTime: article.publishedDate,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title.id,
            description: article.description.id,
        },
    };
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
    const article = getArticleBySlug(params.slug);
    if (!article) {
        notFound();
    }

    const pageUrl = `${BASE_URL}/blog/${article.slug}`;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: article.h1.id },
        ],
    };

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.h1.id,
        description: article.description.id,
        datePublished: article.publishedDate,
        dateModified: article.publishedDate,
        author: { '@type': 'Organization', name: 'SmartSales' },
        publisher: {
            '@type': 'Organization',
            name: 'SmartSales',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/assets/sc-logo.png` },
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
            <BlogArticleTemplate article={article} />
        </>
    );
}
