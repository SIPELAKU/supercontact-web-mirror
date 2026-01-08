# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup placeholder

---

## [0.1.0] - 2025-01-08

### Detail Versi 0.1.0

#### 🚀 Initial Setup & Configuration

- **Deskripsi:**
  - **Project Initialization:** Setup Next.js 15 project dengan TypeScript dan Tailwind CSS
  - **Material-UI Integration:** Konfigurasi MUI dengan theme customization untuk Supercontact branding
  - **Deployment Pipeline:** Setup 3-tier deployment di Vercel (Development, Staging, Production)
  - **Environment Configuration:** Konfigurasi environment variables untuk multi-environment setup
  - **Package Management:** Setup dependency management dengan `npm` dan `--legacy-peer-deps` flag untuk kompatibilitas MUI
  - **FastAPI Integration:** Setup koneksi ke FastAPI backend dengan base URL configuration

#### 🛠️ Technical Setup

- **Deskripsi:**
  - **ESLint & Prettier:** Konfigurasi code quality tools
  - **Git Workflow:** Setup branching strategy (dev, staging, main)
  - **README Documentation:** Dokumentasi lengkap untuk developer onboarding
  - **CHANGELOG Structure:** Setup semantic versioning dan changelog convention
  - **Release Scripts:** Added npm scripts untuk automated versioning dan Git tagging

---

## 📋 Changelog Update Workflow

### Kapan & Bagaimana Update CHANGELOG?

#### 1️⃣ **Setiap Feature Branch (Ongoing)**

Saat develop feature baru, tambahkan entry di section `[Unreleased]`:

```markdown
## [Unreleased]

### Added
- Fitur bulk import kontak dari CSV/Excel
- API endpoint untuk duplicate contact detection

### Fixed
- Bug validation email yang terlalu strict
- Loading state tidak muncul saat submit form

### Changed
- Improve performance contact table dengan virtual scrolling
```

**Format:**
- Gunakan bullet points
- Mulai dengan kata kerja (Added, Fixed, Changed, Removed, etc.)
- Singkat tapi jelas - jelaskan WHAT dan WHY

#### 2️⃣ **Sebelum Merge ke `dev` (Pull Request)**

Pastikan semua perubahan sudah masuk `[Unreleased]`. Ini untuk tracking progress dari versi ke versi.

#### 3️⃣ **Sebelum Merge ke `staging` (Release Candidate)**

Move semua content dari `[Unreleased]` ke version baru dengan format lengkap:

```markdown
## [Unreleased]

### Added
- Initial project setup placeholder

---

## [1.2.0] - 2025-01-15

### Detail Versi 1.2.0

#### ✨ Fitur Bulk Import Kontak

- **Deskripsi:**
  - **CSV/Excel Upload:** Implementasi drag-and-drop file upload
  - **Field Mapping:** Interface untuk mapping kolom file ke field kontak
  - **Validation:** Real-time validation untuk email dan phone format
  - **Preview & Confirm:** Preview data sebelum final import
  - **API Integration:** Endpoint `/api/v1/contacts/bulk-import`
  - **Impact:** Mengurangi waktu input manual hingga 90%

#### 🐛 Bug Fix Contact Form

- **Deskripsi:**
  - **Email Validation:** Perbaikan regex untuk support subdomain
  - **Loading State:** Fix button disabled state during API call
```

#### 4️⃣ **Sebelum Merge ke `main` (Production Release)**

1. Final review CHANGELOG
2. Pastikan format sudah benar dan lengkap
3. Create Git tag dengan npm script:

```bash
# Review current version
cat package.json | grep version

# Create release (pilih salah satu)
npm run release:patch   # Bug fixes: 1.2.3 → 1.2.4
npm run release:minor   # New features: 1.2.3 → 1.3.0
npm run release:major   # Breaking changes: 1.2.3 → 2.0.0
```

4. Verify tag created:

```bash
git tag -l
# Output: v1.3.0

git show v1.3.0
# Shows commit details and tag message
```

---

## 🏷️ Git Tags & Release Management

### Why Git Tags?

Git tags memberikan:
- ✅ Snapshot permanent dari setiap release
- ✅ Easy rollback ke versi sebelumnya
- ✅ Clear version history di GitHub Releases
- ✅ Integration dengan CI/CD pipeline

### Tag Naming Convention

Format: `vMAJOR.MINOR.PATCH`

```
v1.0.0  → First production release
v1.1.0  → Feature update
v1.1.1  → Bug fix
v2.0.0  → Breaking change
```

### Creating Tags

#### Automatic (Recommended)

```bash
# Script will auto-increment, commit, tag, and push
npm run release:patch   # 1.2.3 → 1.2.4
npm run release:minor   # 1.2.3 → 1.3.0
npm run release:major   # 1.2.3 → 2.0.0
```

#### Manual (Advanced)

```bash
# Update package.json version manually
npm version 1.3.0 --no-git-tag-version

# Commit changes
git add package.json CHANGELOG.md
git commit -m "chore(release): v1.3.0"

# Create annotated tag
git tag -a v1.3.0 -m "Release v1.3.0: Contact import feature
- Added bulk CSV/Excel import
- Improved validation
- Fixed mobile responsive issues"

# Push commit and tag
git push origin main
git push origin v1.3.0
```

### Viewing Tags

```bash
# List all tags
git tag -l

# List tags with messages (9 lines)
git tag -l -n9

# List tags matching pattern
git tag -l "v1.*"

# Show specific tag details
git show v1.3.0

# Show tags with commit hash
git log --oneline --decorate
```

### Deleting Tags

```bash
# Delete local tag
git tag -d v1.2.3

# Delete remote tag
git push origin --delete v1.2.3
# or
git push origin :refs/tags/v1.2.3
```

---

## 🔄 Rollback Guide

### Scenario 1: Emergency Rollback Production

**Situation:** Production v1.3.0 has critical bug, need to rollback to v1.2.5 immediately

```bash
# 1. Verify available tags
git tag -l

# 2. Checkout stable version
git checkout v1.2.5

# 3. Create emergency hotfix branch
git checkout -b hotfix/emergency-rollback-v1.2.5

# 4. Push to main (EMERGENCY ONLY - inform team first!)
git push origin hotfix/emergency-rollback-v1.2.5:main --force

# 5. Update CHANGELOG
echo "## [1.2.5-hotfix] - $(date +%Y-%m-%d)
### Fixed
- Emergency rollback from v1.3.0 due to critical bug
- Rolled back to stable v1.2.5
" >> CHANGELOG.md

git add CHANGELOG.md
git commit -m "chore: emergency rollback to v1.2.5"
git push origin main

# 6. Notify team immediately via Slack/Discord
```

⚠️ **CRITICAL:** Force push ke `main` bypasses branch protection. Only for emergencies!

### Scenario 2: Rollback via Vercel (Zero Downtime)

**Recommended method** - No Git manipulation needed!

1. Go to [Vercel Dashboard](https://vercel.com/solvera/supercontact)
2. Navigate to **Deployments** tab
3. Find deployment with tag `v1.2.5`
4. Click **"..."** → **"Promote to Production"**
5. Done! Instant rollback with zero downtime

### Scenario 3: Rollback Staging for Re-testing

```bash
# Reset staging to specific version
git checkout staging
git reset --hard v1.2.5
git push origin staging --force

# Vercel will auto-deploy v1.2.5 to staging
```

### Scenario 4: Undo Recent Commit (Before Tag)

```bash
# See recent commits
git log --oneline -n 5

# Revert specific commit
git revert <commit-hash>
git push origin main

# Or reset to previous commit (DESTRUCTIVE)
git reset --hard HEAD~1
git push origin main --force
```

### Scenario 5: Rollback Feature Flag (Soft Rollback)

Instead of Git rollback, disable feature via environment variable:

```env
# .env.production
NEXT_PUBLIC_ENABLE_BULK_IMPORT=false
```

Redeploy → feature disabled without code changes!

---

## 📦 Template untuk Update Selanjutnya

### Quick Template (Unreleased)

```markdown
## [Unreleased]

### Added
- Feature description

### Fixed
- Bug fix description

### Changed
- Change description

### Removed
- Removed feature description
```

### Full Template (Release)

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Detail Versi X.Y.Z

#### 📦 Kategori (pilih yang sesuai)

- **Deskripsi:**
  - **Feature Name:** Detail explanation
  - **Impact:** User/system impact
  - **Technical Notes:** Implementation details
  - **Breaking Changes:** ⚠️ If applicable
```

### Kategori yang Tersedia

- `✨ Fitur Baru` - Penambahan fitur baru
- `🐛 Bug Fix` - Perbaikan bug
- `🚀 Peningkatan Performa` - Optimasi performa aplikasi
- `🔒 Security Fix` - Perbaikan keamanan
- `📝 Documentation` - Update dokumentasi
- `♻️ Refactor` - Refactoring code tanpa mengubah fungsionalitas
- `🎨 UI/UX Enhancement` - Peningkatan tampilan atau user experience
- `🔧 Configuration` - Perubahan konfigurasi
- `🧪 Testing` - Penambahan atau update test
- `🗃️ Database` - Perubahan skema atau migrasi database
- `🚨 Breaking Changes` - Changes yang tidak backward-compatible
- `⚡ Hotfix` - Emergency fixes untuk production

---

## 📚 Contoh Entry Changelog

### Contoh 1: Penambahan Fitur Baru (MINOR Version)

```markdown
## [1.2.0] - 2025-01-15

### Detail Versi 1.2.0

#### ✨ Fitur Bulk Import Kontak

- **Deskripsi:**
  - **CSV/Excel Upload:** Implementasi drag-and-drop file upload untuk import kontak massal
  - **Field Mapping:** Interface untuk mapping kolom file ke field kontak (Name, Email, Phone, Company)
  - **Validation:** Real-time validation untuk format email dan nomor telepon
  - **Preview & Confirm:** Preview data sebelum final import dengan opsi edit
  - **API Integration:** Integrasi dengan endpoint `/api/v1/contacts/bulk-import` dengan progress tracking
  - **Impact:** Mengurangi waktu input manual hingga 90% untuk bulk contact entry
  - **Technical Notes:** Menggunakan PapaParse untuk CSV parsing dan SheetJS untuk Excel

#### 🚀 Peningkatan Performa

- **Deskripsi:**
  - **Virtual Scrolling:** Implementasi react-window untuk handle 10,000+ kontak
  - **Debounced Search:** Optimasi search dengan debounce 300ms
  - **Bundle Size:** Reduce bundle size sebesar 20% dengan dynamic imports
  - **Impact:** Page load time turun dari 3.2s menjadi 1.8s
```

### Contoh 2: Bug Fix (PATCH Version)

```markdown
## [1.1.1] - 2025-01-10

### Detail Versi 1.1.1

#### 🐛 Bug Fix Contact Form

- **Deskripsi:**
  - **Email Validation:** Perbaikan regex email validation untuk support subdomain
  - **Phone Number Format:** Fix issue format nomor telepon internasional
  - **Loading State:** Fix bug tombol submit tidak disabled saat request sedang berjalan
  - **Error Handling:** Menampilkan error message yang lebih deskriptif untuk duplicate contact
  - **Impact:** Mengurangi form submission error dari 15% menjadi 2%

#### 🎨 UI/UX Enhancement

- **Deskripsi:**
  - **Responsive Table:** Perbaikan layout contact table di tablet (768px - 1024px)
  - **Accessibility:** Menambahkan proper ARIA labels dan keyboard navigation
  - **Toast Notifications:** Migrasi dari alert() ke MUI Snackbar untuk feedback message
  - **Impact:** Accessibility score naik dari 78 menjadi 94 (Lighthouse)
```

### Contoh 3: Breaking Changes (MAJOR Version)

```markdown
## [2.0.0] - 2025-02-01

### Detail Versi 2.0.0

#### 🚨 Breaking Changes

- **Deskripsi:**
  - **API Endpoint Migration:**
    - ⚠️ **BREAKING:** Base URL berubah dari `/api/contacts` ke `/api/v2/contacts`
    - Struktur response berubah untuk consistency
    - Old: `{data: {...}, status: 200}`
    - New: `{success: true, data: {...}, meta: {total, page, limit}}`
  - **Contact Model Update:**
    - ⚠️ **BREAKING:** Field `phone` dipecah menjadi `phone_primary` dan `phone_secondary`
    - ⚠️ **BREAKING:** Field `company` sekarang wajib diisi (required)

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Contact Groups:** Fitur untuk grouping kontak berdasarkan kategori/tag
  - **Advanced Search:** Filter berdasarkan company, location, tags, dan custom fields
  - **Export Feature:** Export kontak ke CSV/Excel dengan custom field selection

#### 📝 Migration Guide

**⚠️ REQUIRED ACTION untuk upgrade dari v1.x.x:**

1. Update environment variables:
   ```env
   # Update base URL
   NEXT_PUBLIC_API_URL=https://supercontact-api-dev-hpfi.onrender.com/api/v2
   ```

2. Update API client responses:
   ```typescript
   // Old (v1.x.x)
   const response = await fetch('/api/contacts')
   const { data, status } = await response.json()
   
   // New (v2.0.0)
   const response = await fetch('/api/v2/contacts')
   const { success, data, meta } = await response.json()
   ```

3. Update contact model:
   ```typescript
   // Old
   interface Contact {
     phone: string;
     company?: string;
   }
   
   // New
   interface Contact {
     phone_primary: string;
     phone_secondary?: string;
     company: string; // now required
   }
   ```

4. Run migration script:
   ```bash
   npm run migrate:v2
   ```

**Estimated migration time:** 30-45 minutes
```

### Contoh 4: Hotfix (PATCH Version)

```markdown
## [1.2.4] - 2025-01-16

### Detail Versi 1.2.4

#### ⚡ Emergency Hotfix

- **Deskripsi:**
  - **Critical Bug Fix:** Fixed infinite loop di bulk import yang menyebabkan browser crash
  - **Root Cause:** Race condition di progress tracking state management
  - **Impact:** Production down selama 45 menit, affecting 230 users
  - **Resolution Time:** 30 minutes dari bug report hingga deployed
  - **Rollback:** Emergency rollback dari v1.2.3 → v1.2.2 dilakukan sementara fix di develop

#### 🔒 Security Patch

- **Deskripsi:**
  - **XSS Vulnerability:** Patch untuk prevent XSS attack di contact name field
  - **Input Sanitization:** Added DOMPurify untuk sanitize user input
  - **Impact:** Critical security vulnerability patched
```

---

## 🎯 Versioning Guidelines

### Kapan Increment Version?

#### MAJOR (X.0.0) - Breaking Changes

**Increment when:**
- Breaking changes di API contract atau response structure
- Migration yang membutuhkan action dari developer/user
- Perubahan arsitektur fundamental
- Removal of deprecated features
- Perubahan data model yang tidak backward-compatible
- Changes yang break existing integrations

**Examples:**
- `1.5.3` → `2.0.0`: API endpoint structure completely changed
- `2.1.4` → `3.0.0`: Migration from REST to GraphQL
- `3.2.1` → `4.0.0`: Removed support for legacy authentication

#### MINOR (0.X.0) - New Features

**Increment when:**
- Penambahan fitur baru (backward-compatible)
- Penambahan endpoint API baru
- Enhancement yang tidak break existing functionality
- Deprecation warning (belum removal)
- Penambahan optional fields di API
- New UI components atau pages

**Examples:**
- `1.2.5` → `1.3.0`: Added bulk import feature
- `2.3.2` → `2.4.0`: Added advanced search filters
- `3.1.8` → `3.2.0`: Added contact groups functionality

#### PATCH (0.0.X) - Bug Fixes

**Increment when:**
- Bug fixes yang tidak mengubah API
- Security patches
- Performance improvements tanpa API changes
- Documentation updates
- UI tweaks tanpa functional changes
- Hotfixes untuk production issues
- Dependency updates (non-breaking)

**Examples:**
- `1.2.3` → `1.2.4`: Fixed email validation bug
- `2.4.5` → `2.4.6`: Performance optimization
- `3.1.2` → `3.1.3`: Security patch for XSS

---

## ✅ Changelog Best Practices

### DO ✅

1. **Update setiap merge ke `main`** - Jangan tunggu sampai banyak changes
2. **Be specific** - Jelaskan apa yang berubah, kenapa, dan impact-nya
3. **Group related changes** - Kategorikan dengan emoji dan heading yang jelas
4. **Include breaking changes** - Selalu highlight dengan badge 🚨
5. **Add migration guides** - Untuk major version, sertakan step-by-step
6. **Reference issues** - Link ke GitHub issues (e.g., `Closes #123`)
7. **Use present tense** - "Add feature" bukan "Added feature"
8. **Mention impact** - Jelaskan impact ke user atau system performance

### DON'T ❌

1. **Don't use vague descriptions** - ❌ "Fixed bugs" vs ✅ "Fixed email validation error"
2. **Don't skip [Unreleased]** - Always have running changelog
3. **Don't forget dates** - Every release must have date `[1.2.0] - 2025-01-15`
4. **Don't mix versions** - One version per release, don't combine multiple
5. **Don't skip Git tags** - Every production release needs a Git tag
6. **Don't forget migration notes** - Breaking changes need clear migration guide

### Bad Examples ❌

```markdown
## [1.2.0] - 2025-01-15
- Added import
- Fixed bugs
- Updated UI
- Made improvements
```

**Why bad:**
- Too vague - what import? what bugs? what UI?
- No categorization
- No technical details
- No impact description

### Good Examples ✅

```markdown
## [1.2.0] - 2025-01-15

### Detail Versi 1.2.0

#### ✨ Bulk Contact Import

- **Deskripsi:**
  - **CSV/Excel Support:** User dapat import kontak dari file CSV atau Excel
  - **Smart Mapping:** Auto-detect kolom dan mapping ke field yang sesuai
  - **Validation:** Pre-import validation untuk email, phone, dan required fields
  - **Impact:** Mengurangi waktu input manual hingga 90% untuk bulk contact entry
  - **Technical Notes:** Menggunakan PapaParse untuk CSV parsing dan SheetJS untuk Excel
  - **API Endpoint:** `POST /api/v1/contacts/bulk-import`

#### 🐛 Contact Form Validation

- **Deskripsi:**
  - **Email Regex:** Perbaikan regex untuk support subdomain (e.g., user@mail.company.com)
  - **Phone Format:** Support format internasional dengan country code
  - **Impact:** Form error rate turun dari 15% menjadi 2%
  - **Reference:** Closes #145, #167
```

**Why good:**
- Specific features described
- Clear categorization
- Technical details included
- Impact quantified
- References to issues

---

## 📊 Version History Reference

| Version | Date | Type | Git Tag | Description |
|---------|------|------|---------|-------------|
| 0.1.0 | 2025-01-08 | Initial | v0.1.0 | Project setup, deployment pipeline, FastAPI integration |

---

## 🔗 Related Resources

- **GitHub Releases:** [github.com/solvera/supercontact-web/releases](https://github.com/solvera/supercontact-web/releases)
- **Semantic Versioning:** [semver.org](https://semver.org/spec/v2.0.0.html)
- **Keep a Changelog:** [keepachangelog.com](https://keepachangelog.com/en/1.1.0/)
- **README.md:** [Project README](./README.md)

---

**Note:** Changelog ini adalah living document yang akan terus diupdate seiring development. Pastikan setiap perubahan signifikan didokumentasikan dengan baik untuk tracking, audit, dan rollback purposes. Every release to production MUST have corresponding entry in this changelog and Git tag in repository.