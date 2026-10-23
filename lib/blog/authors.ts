import { Localized } from '@/content/blog/types';

// Roster penulis untuk E-E-A-T. Sengaja di kode (bukan CMS): datanya statis &
// sedikit, dan tiap penulis = satu entitas Person yang konsisten di seluruh
// artikel. Nama author di CMS (author_name_id) di-resolve ke profil ini; kalau
// tak cocok (mis. "Tim SmartSales" generik) → DEFAULT_AUTHOR sebagai
// penanggung jawab konten. Penulis per-artikel bisa diubah di Directus admin
// dengan mengetik nama yang cocok di kolom author.
export interface Author {
    slug: string;
    name: string;
    role: Localized<string>;
    linkedin: string;
}

export const AUTHORS: Author[] = [
    {
        slug: 'orison-situmorang',
        name: 'Orison Situmorang',
        role: { id: 'Founder SmartSales', en: 'Founder, SmartSales' },
        linkedin: 'https://www.linkedin.com/in/orison-situmorang/',
    },
    {
        slug: 'jonathan-maringka',
        name: 'Jonathan Maringka',
        role: { id: 'Business Development Manager', en: 'Business Development Manager' },
        linkedin: 'https://www.linkedin.com/in/jonathanmaringka/',
    },
    {
        slug: 'pramana-setya-wibawa',
        name: 'Pramana Setya Wibawa',
        role: { id: 'Software Product Manager', en: 'Software Product Manager' },
        linkedin: 'https://www.linkedin.com/in/pramana-setya-wibawa-0a7609121/',
    },
];

// Penanggung jawab konten default (Founder) untuk artikel tanpa penulis
// spesifik / bernama "Tim SmartSales".
export const DEFAULT_AUTHOR: Author = AUTHORS[0];

const norm = (s: string) => s.trim().toLowerCase();

export function resolveAuthor(name?: string): Author {
    if (name) {
        const n = norm(name);
        const found = AUTHORS.find((a) => norm(a.name) === n);
        if (found) return found;
    }
    return DEFAULT_AUTHOR;
}
