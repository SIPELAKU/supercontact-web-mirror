const BASE_URL = 'https://www.smartsales.id';

export function ogImageUrl(params: { title: string; category?: string }): string {
    const search = new URLSearchParams({ title: params.title });
    if (params.category) {
        search.set('category', params.category);
    }
    return `${BASE_URL}/api/og?${search.toString()}`;
}
