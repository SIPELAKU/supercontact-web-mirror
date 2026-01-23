# 📚 DOKUMENTASI PROJECT - SuperContact Web

> **Version**: 0.6.2  
> **Last Updated**: 23 Januari 2026  
> **Framework**: Next.js 14.2.5 (App Router)

---

## 📋 Daftar Isi

1. [Overview Project](#-overview-project)
2. [Tech Stack](#-tech-stack)
3. [Struktur Folder](#-struktur-folder)
4. [Dependencies](#-dependencies)
5. [Arsitektur Aplikasi](#-arsitektur-aplikasi)
6. [Routing & Pages](#-routing--pages)
7. [State Management](#-state-management)
8. [API Layer](#-api-layer)
9. [Authentication](#-authentication)
10. [Styling](#-styling)
11. [Development Guide](#-development-guide)
12. [Quality Assessment](#-quality-assessment)

---

## 🎯 Overview Project

**SuperContact** adalah platform Sales Management dan CRM (Customer Relationship Management) yang komprehensif, dibangun dengan Next.js 14 menggunakan App Router.

### Fitur Utama
| Module | Deskripsi |
|--------|-----------|
| **Analytics Dashboard** | Visualisasi data penjualan dan performa tim |
| **Lead Management** | Pengelolaan leads dengan tampilan Kanban/Table |
| **Email Marketing** | Campaigns, Mailing Lists, Subscribers |
| **Omnichannel** | WhatsApp, Chat, Instagram integrations |
| **Organization** | Manajemen company, departments |
| **Users & Roles** | User management dengan role-based access |
| **Sales Pipeline** | Pipeline, Products, Quotations |

---

## 🛠 Tech Stack

### Core Framework
| Technology | Version | Deskripsi |
|------------|---------|-----------|
| **Next.js** | 14.2.5 | React framework dengan App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |

### UI & Styling
| Technology | Version | Deskripsi |
|------------|---------|-----------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **MUI (Material-UI)** | 5.16.4 | Component library |
| **Radix UI** | Latest | Headless UI primitives |

### State Management
| Technology | Version | Deskripsi |
|------------|---------|-----------|
| **React Query** | 5.90.19 | Server state management |
| **Zustand** | 5.0.9 | Client state management |

### Data & Utils
| Technology | Version | Deskripsi |
|------------|---------|-----------|
| **Axios** | 1.13.2 | HTTP client |
| **date-fns** | 3.6.0 | Date utility |
| **Recharts** | 2.12.7 | Charts & visualization |

---

## 📁 Struktur Folder

```
supercontact-web/
├── 📁 app/                      # Next.js App Router pages
│   ├── 📁 (account)/            # Account group routes
│   │   ├── email-verification/
│   │   └── new-password/
│   ├── 📁 (auth)/               # Auth group routes
│   │   ├── forgot-password/
│   │   ├── login/
│   │   └── register/
│   ├── 📁 admin/                # Admin pages
│   ├── 📁 analytics/            # Analytics dashboard
│   │   └── dashboard/
│   ├── 📁 api/                  # API routes
│   │   ├── auth/
│   │   ├── company/
│   │   ├── contact/
│   │   ├── logs/
│   │   ├── notes/
│   │   ├── proxy/
│   │   ├── roles/
│   │   ├── sales/
│   │   └── v1/
│   ├── 📁 contact/              # Contact page
│   ├── 📁 email-marketing/      # Email marketing module
│   │   ├── campaigns/
│   │   ├── mailing-list/
│   │   └── subscribers/
│   ├── 📁 inbox/                # Inbox page
│   ├── 📁 lead-management/      # Lead management
│   ├── 📁 omnichannel/          # Omnichannel integrations
│   │   ├── chat/
│   │   ├── instagram/
│   │   └── whatsapp/
│   ├── 📁 organization/         # Organization management
│   ├── 📁 profile/              # User profile
│   ├── 📁 profile-user-setting/ # Profile settings
│   ├── 📁 roles/                # Roles management
│   ├── 📁 sales/                # Sales module
│   │   ├── pipeline/
│   │   ├── product/
│   │   └── quotation/
│   ├── 📁 users/                # Users management
│   ├── error.tsx                # Global error boundary
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx            # 404 page
│   └── page.tsx                 # Home page (redirect)
│
├── 📁 components/               # Reusable components
│   ├── 📁 email-marketing/      # Email marketing components
│   ├── 📁 forms/                # Form components
│   ├── 📁 layout/               # Layout components
│   │   ├── AuthenticatedLayout.tsx
│   │   ├── ProfileDropdown.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── 📁 lead-management/      # Lead management components
│   ├── 📁 modal/                # Modal components
│   ├── 📁 omnichannel/          # Omnichannel components
│   ├── 📁 organization/         # Organization components
│   ├── 📁 pipeline/             # Pipeline components
│   ├── 📁 product/              # Product components
│   ├── 📁 quotation/            # Quotation components
│   ├── 📁 roles/                # Roles components
│   ├── 📁 ui/                   # Base UI components (30 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── 📁 users/                # Users components
│
├── 📁 lib/                      # Utilities & logic
│   ├── 📁 api/                  # ⭐ API modules (new structure)
│   │   ├── auth.ts              # Auth API functions
│   │   ├── contacts.ts          # Contacts API
│   │   ├── leads.ts             # Leads API
│   │   ├── notes.ts             # Notes API
│   │   ├── users.ts             # Users & Profile API
│   │   ├── index.ts             # Barrel exports
│   │   └── 📁 email-marketing/
│   │       ├── campaigns.ts
│   │       ├── mailing-lists.ts
│   │       ├── subscribers.ts
│   │       └── index.ts
│   ├── 📁 context/              # React contexts
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── SidebarContext.tsx   # Sidebar state
│   ├── 📁 data/                 # Static data & constants
│   ├── 📁 helper/               # Helper functions
│   ├── 📁 hooks/                # Custom React hooks
│   │   ├── useCampaigns.ts
│   │   ├── useContacts.ts
│   │   ├── useLeads.ts
│   │   ├── useMailingLists.ts
│   │   ├── useRoles.ts
│   │   ├── useSubscribers.ts
│   │   └── useUsers.ts
│   ├── 📁 models/               # Data models
│   ├── 📁 store/                # Zustand stores
│   │   ├── contact/
│   │   ├── pipeline/
│   │   ├── product/
│   │   └── quotation/
│   ├── 📁 types/                # TypeScript types
│   │   ├── email-marketing.ts
│   │   ├── Pipeline.ts
│   │   ├── Users.ts
│   │   └── ...
│   ├── 📁 utils/                # Utility functions
│   │   ├── axiosClient.ts       # Axios configured instance
│   │   ├── cookies.ts           # Cookie utilities
│   │   ├── errorHandler.ts      # Error handling
│   │   └── logger.ts            # Logging utility
│   ├── ReactQueryProvider.tsx   # React Query provider
│   └── utils.ts                 # General utilities
│
├── 📁 public/                   # Static assets
│   ├── 📁 assets/               # Images & logos
│   └── 📁 icons/                # Icon files
│
├── .env                         # Environment variables
├── .gitignore
├── .gitlab-ci.yml               # GitLab CI/CD config
├── eslint.config.mjs            # ESLint configuration
├── next.config.mjs              # Next.js configuration
├── package.json
├── postcss.config.mjs           # PostCSS configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 📦 Dependencies

### Production Dependencies (33)

| Package | Version | Kategori | Deskripsi |
|---------|---------|----------|-----------|
| `next` | 14.2.5 | Core | React framework |
| `react` | 18.3.1 | Core | UI library |
| `react-dom` | 18.3.1 | Core | React DOM |
| `@mui/material` | 5.16.4 | UI | Material Design components |
| `@mui/icons-material` | 5.16.4 | UI | Material icons |
| `@mui/x-data-grid` | 8.24.0 | UI | Data grid component |
| `@emotion/react` | 11.13.0 | UI | CSS-in-JS (MUI dep) |
| `@emotion/styled` | 11.13.0 | UI | Styled components (MUI dep) |
| `@radix-ui/react-dialog` | 1.1.15 | UI | Dialog primitive |
| `@radix-ui/react-slot` | 1.2.4 | UI | Slot primitive |
| `tailwind-merge` | 3.4.0 | Styling | Tailwind class merger |
| `class-variance-authority` | 0.7.1 | Styling | Variant styling |
| `clsx` | 2.1.1 | Styling | Class name utility |
| `@tanstack/react-query` | 5.90.19 | State | Server state |
| `@tanstack/react-table` | 8.19.3 | UI | Table library |
| `zustand` | 5.0.9 | State | Client state |
| `axios` | 1.13.2 | HTTP | HTTP client |
| `@dnd-kit/core` | 6.3.1 | DnD | Drag and drop |
| `@dnd-kit/sortable` | 10.0.0 | DnD | Sortable |
| `@dnd-kit/modifiers` | 9.0.0 | DnD | DnD modifiers |
| `recharts` | 2.12.7 | Charts | Chart library |
| `date-fns` | 3.6.0 | Date | Date utilities |
| `js-cookie` | 3.0.5 | Auth | Cookie management |
| `lucide-react` | 0.562.0 | Icons | Icon library |
| `@tabler/icons-react` | 3.36.1 | Icons | Icon library |
| `react-icons` | 5.5.0 | Icons | Icon library |
| `react-hot-toast` | 2.6.0 | UI | Toast notifications |
| `sweetalert2` | 11.26.4 | UI | Alert modals |
| `sweetalert2-react-content` | 5.1.0 | UI | SweetAlert React |
| `react-email-editor` | 1.7.11 | Email | Email template editor |
| `bumpp` | 10.3.2 | Dev | Version bumping |

### Dev Dependencies (11)

| Package | Version | Deskripsi |
|---------|---------|-----------|
| `typescript` | 5.x | TypeScript compiler |
| `tailwindcss` | 4.x | CSS framework |
| `@tailwindcss/postcss` | 4.x | PostCSS plugin |
| `eslint` | 8.57.0 | Linter |
| `eslint-config-next` | 14.2.5 | Next.js ESLint rules |
| `@eslint/eslintrc` | 3.x | ESLint config |
| `@types/node` | 20.14.12 | Node.js types |
| `@types/react` | 18.3.3 | React types |
| `@types/react-dom` | 18.3.0 | React DOM types |
| `@types/js-cookie` | 3.0.6 | Cookie types |
| `tw-animate-css` | 1.4.0 | Animation utilities |

---

## 🏗 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│                   Next.js App                        │
│  ┌─────────────────────────────────────────────────┐│
│  │           App Router (app/)                     ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        ││
│  │  │  Pages  │  │ Layouts │  │  API    │        ││
│  │  │  (17)   │  │  (1)    │  │ Routes  │        ││
│  │  └────┬────┘  └────┬────┘  └────┬────┘        ││
│  └───────┼────────────┼────────────┼─────────────┘│
│          │            │            │               │
│  ┌───────▼────────────▼────────────▼─────────────┐│
│  │              Components (145)                  ││
│  │  ┌────────┐  ┌────────┐  ┌────────┐          ││
│  │  │   UI   │  │ Layout │  │Features│          ││
│  │  │  (30)  │  │  (5)   │  │  (8)   │          ││
│  │  └────────┘  └────────┘  └────────┘          ││
│  └─────────────────────────────────────────────┘│
│          │                                        │
│  ┌───────▼────────────────────────────────────┐  │
│  │                lib/                         │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │  │
│  │  │ API  │ │Hooks │ │Store │ │Utils │      │  │
│  │  │ (9)  │ │ (11) │ │ (4)  │ │ (8)  │      │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘      │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│               Backend API Server                     │
│          (NEXT_PUBLIC_API_URL/.env)                 │
└─────────────────────────────────────────────────────┘
```

---

## 🛤 Routing & Pages

### Route Groups

| Group | Path | Deskripsi |
|-------|------|-----------|
| `(auth)` | `/login`, `/register`, `/forgot-password` | Halaman publik (tanpa sidebar) |
| `(account)` | `/email-verification`, `/new-password` | Account recovery |

### Protected Routes

| Module | Routes |
|--------|--------|
| **Analytics** | `/analytics/dashboard` |
| **Lead Management** | `/lead-management` |
| **Email Marketing** | `/email-marketing/campaigns`, `/email-marketing/mailing-list`, `/email-marketing/subscribers` |
| **Omnichannel** | `/omnichannel/whatsapp`, `/omnichannel/chat`, `/omnichannel/instagram` |
| **Sales** | `/sales/pipeline`, `/sales/product`, `/sales/quotation` |
| **Organization** | `/organization` |
| **Users** | `/users`, `/roles` |
| **Profile** | `/profile`, `/profile-user-setting` |

---

## 🔄 State Management

### Server State (React Query)

```typescript
// Contoh penggunaan hook
import { useLeads } from '@/lib/hooks/useLeads';

function LeadList() {
  const { data, isLoading, error } = useLeads();
  // ...
}
```

| Hook | Query Key | API Function |
|------|-----------|--------------|
| `useLeads()` | `['leads']` | `fetchLeads()` |
| `useContacts()` | `['contacts']` | `fetchContacts()` |
| `useUsers()` | `['users']` | `fetchUsers()` |
| `useCampaigns()` | `['campaigns']` | `fetchCampaigns()` |
| `useMailingLists()` | `['mailing-lists']` | `fetchMailingLists()` |
| `useSubscribers()` | `['subscribers']` | `fetchSubscribers()` |

### Client State (Zustand)

```typescript
// Contoh store
import { useViewMode } from '@/lib/hooks/useLeadStore';

const { viewMode, setViewMode } = useViewMode();
```

| Store | Location | State |
|-------|----------|-------|
| Lead View Mode | `lib/hooks/useLeadStore.ts` | Table/Kanban toggle |
| Contact | `lib/store/contact/` | Contact state |
| Pipeline | `lib/store/pipeline/` | Pipeline state |
| Product | `lib/store/product/` | Product state |
| Quotation | `lib/store/quotation/` | Quotation state |

---

## 🌐 API Layer

### Struktur Modular (New)

```
lib/api/
├── index.ts              # Re-exports all functions
├── auth.ts               # 4 functions
├── leads.ts              # 4 functions
├── contacts.ts           # 1 function
├── users.ts              # 3 functions
├── notes.ts              # 3 functions
└── email-marketing/
    ├── campaigns.ts      # 5 functions
    ├── mailing-lists.ts  # 6 functions
    └── subscribers.ts    # 4 functions
```

### API Functions

| Module | Functions |
|--------|-----------|
| **Auth** | `registerUser`, `verifyOTP`, `resendOTP`, `resetPassword` |
| **Leads** | `fetchLeads`, `createLead`, `updateLead`, `deleteLead` |
| **Contacts** | `fetchContacts` |
| **Users** | `fetchUsers`, `fetchProfile`, `updateProfile` |
| **Notes** | `fetchNotes`, `createNote`, `updateNote` |
| **Campaigns** | `fetchCampaigns`, `fetchCampaignDetail`, `createCampaign`, `updateCampaign`, `deleteCampaign` |
| **Mailing Lists** | `fetchMailingLists`, `fetchMailingListDetail`, `createMailingList`, `updateMailingList`, `deleteMailingList`, `deleteMailingListSubscriber` |
| **Subscribers** | `fetchSubscribers`, `createSubscriber`, `updateSubscriber`, `deleteSubscriber` |

### Usage

```typescript
// Import dari barrel export
import { fetchLeads, createLead, fetchProfile } from '@/lib/api';

// Atau import specific module
import { fetchLeads } from '@/lib/api/leads';
```

---

## 🔐 Authentication

### Flow

```
1. User login → POST /auth/login
2. Token disimpan di cookie (access_token)
3. AuthContext menyediakan state auth ke seluruh app
4. Protected routes redirect ke /login jika tidak authenticated
```

### AuthContext

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  getToken: () => Promise<string>;
}
```

### Cookie Configuration

| Property | Value |
|----------|-------|
| Name | `access_token` |
| Expires | 1 hour |
| Secure | Production only |
| SameSite | Strict |

---

## 🎨 Styling

### Approach

1. **Tailwind CSS** - Utility classes untuk layout & spacing
2. **MUI Components** - Pre-built components dengan theming
3. **Custom UI Components** - `/components/ui/` dengan CVA (class-variance-authority)

### CSS Variables (globals.css)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --accent: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}
```

---

## 🚀 Development Guide

### Prerequisites

- Node.js 18+
- npm atau yarn

### Setup

```bash
# Clone repository
git clone <repo-url>
cd supercontact-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan backend URL

# Run development server
npm run dev
```

### Scripts

| Script | Command | Deskripsi |
|--------|---------|-----------|
| `dev` | `next dev --port=3100` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Run linter |
| `type-check` | `tsc --noEmit` | TypeScript check |
| `release` | `bumpp` | Version bump |

### Environment Variables

```env
NEXT_PUBLIC_API_URL=<backend-api-url>
BACKEND_URL=<backend-url-for-proxy>
```

---

## 📊 Quality Assessment

### Current Score: 7.5/10

| Metric | Score | Status |
|--------|-------|--------|
| **Architecture** | 8/10 | ✅ Modular API |
| **Performance** | 6.5/10 | ✅ Event-based auth |
| **Security** | 7/10 | ✅ Good |
| **Code Quality** | 7/10 | ⚠️ Build errors bypassed |
| **SEO** | 7/10 | ✅ Metadata added |
| **Error Handling** | 7/10 | ✅ Error boundaries |

### Recommendations

1. ⚠️ Enable `typescript.ignoreBuildErrors: false` di `next.config.mjs`
2. ⚠️ Convert static pages ke Server Components
3. ℹ️ Consolidate icon libraries (3 libraries → 1)

---

## 📝 Changelog

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk history perubahan.

---

*Dokumentasi ini di-generate pada 23 Januari 2026*
