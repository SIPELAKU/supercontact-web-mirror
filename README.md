# Supercontact Web 📞

Frontend repository for **Supercontact**, a contact management platform.
Built with **Next.js** and deployed via **Vercel** with a multi-environment pipeline.

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS Version recommended)
- **npm** (Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd supercontact-web
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > **Important:** Always use `--legacy-peer-deps` flag to resolve dependency conflicts between Material-UI and React types. This ensures compatibility across all packages.

3. Setup Environment Variables:
   
   Copy `.env.example` to `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env.local
   ```
   
   Required Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://supercontact-api-dev-hpfi.onrender.com/api/v1
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier

# Release Management
npm run release:patch    # Create patch release (0.0.X)
npm run release:minor    # Create minor release (0.X.0)
npm run release:major    # Create major release (X.0.0)
npm run tag:list         # List all version tags
```

## 🔄 Deployment Workflow & Environments

We adhere to a strict **3-Tier Deployment Pipeline**. Please ensure you are working on the correct branch.

| Environment | Branch | URL (Frontend) | Audience |
|------------|--------|----------------|----------|
| **Development** | `dev` | [solvera-supercontact-dev.vercel.app](https://solvera-supercontact-dev.vercel.app) | Developers (Integration Testing) |
| **Staging** | `staging` | [solvera-supercontact-staging.vercel.app](https://solvera-supercontact-staging.vercel.app) | QA, BA, PO (UAT & Validation) |
| **Production** | `main` | [solvera-supercontact.vercel.app](https://solvera-supercontact.vercel.app) | End Users (Live) |

### Branching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Git Workflow & Deployment                    │
└─────────────────────────────────────────────────────────────────┘

feature/contact-form ──┐
                       │
feature/dashboard ─────┼──► dev ────────► staging ────────► main
                       │      │              │                │
feature/settings ──────┘      │              │                │
                              ▼              ▼                ▼
                        [Auto Deploy]  [Auto Deploy]   [Auto Deploy]
                              │              │                │
                              ▼              ▼                ▼
                      ┌───────────┐    ┌──────────┐    ┌────────────┐
                      │    DEV    │    │ STAGING  │    │ PRODUCTION │
                      │  vercel   │    │  vercel  │    │   vercel   │
                      └───────────┘    └──────────┘    └────────────┘
                           │                │                 │
                           ▼                ▼                 ▼
                     [Integration]     [UAT/QA]         [End Users]
```

#### Workflow Steps:

1. **Create Feature Branch**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Develop & Commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/your-feature-name
   ```

3. **Pull Request to `dev`**
   - Create PR from `feature/your-feature-name` → `dev`
   - Request code review from team
   - **IMPORTANT:** Update `CHANGELOG.md` sebelum merge (lihat bagian [Changelog Workflow](#changelog-workflow))
   - Merge after approval
   - Auto-deploy to **Development** environment

4. **Promote to Staging** (Sprint Review / Release Candidate)
   ```bash
   git checkout staging
   git merge dev
   git push origin staging
   ```
   - Auto-deploy to **Staging** environment
   - QA/BA/PO perform UAT

5. **Promote to Production** (Release)
   ```bash
   # Option A: Manual merge dengan Git tag
   git checkout main
   git merge staging
   npm run release:patch  # atau minor/major
   
   # Option B: Via Pull Request
   # - Create PR from staging → main
   # - Get approval from Tech Lead/PM
   # - Merge to main
   # - Create release tag manually
   git tag -a v1.2.3 -m "Release v1.2.3: Contact import feature"
   git push origin v1.2.3
   ```
   - Auto-deploy to **Production** environment

#### Branch Protection Rules

| Branch | Direct Push | Requires PR | Requires Review |
|--------|-------------|-------------|-----------------|
| `main` | ❌ Blocked | ✅ Required | ✅ Required (2+) |
| `staging` | ❌ Blocked | ✅ Required | ✅ Required (1+) |
| `dev` | ⚠️ Allowed* | ✅ Preferred | ✅ Recommended |

*Only for hotfixes or urgent fixes with team notification.

## 📌 Semantic Versioning & Release Management

This project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (X.0.0): Breaking changes, major architecture updates
- **MINOR** (0.X.0): New features, backward-compatible
- **PATCH** (0.0.X): Bug fixes, minor improvements

### Creating a Release

#### Step 1: Update CHANGELOG.md

Sebelum create release, pastikan `CHANGELOG.md` sudah diupdate dengan format yang benar (lihat [CHANGELOG.md](./CHANGELOG.md)).

#### Step 2: Create Release Tag

```bash
# Untuk bug fixes (0.0.X)
npm run release:patch

# Untuk fitur baru (0.X.0)
npm run release:minor

# Untuk breaking changes (X.0.0)
npm run release:major
```

Script ini akan otomatis:
1. ✅ Update version di `package.json`
2. ✅ Create Git commit dengan message `chore(release): vX.Y.Z`
3. ✅ Create Git tag `vX.Y.Z`
4. ✅ Push commit dan tag ke repository

#### Step 3: Verify Release

```bash
# List all version tags
npm run tag:list

# Check current version
npm version
```

### Git Tags Reference

```bash
# List all tags dengan message
git tag -l -n9

# List tags dengan pattern
git tag -l "v1.*"

# Show tag details
git show v1.2.3

# Delete local tag (jika salah)
git tag -d v1.2.3

# Delete remote tag (jika sudah push)
git push origin :refs/tags/v1.2.3
```

### Rollback ke Versi Sebelumnya

#### Scenario 1: Rollback Production (Emergency)

```bash
# 1. Cek tag yang tersedia
git tag -l

# 2. Checkout ke tag versi sebelumnya
git checkout v1.2.3

# 3. Create hotfix branch dari tag
git checkout -b hotfix/rollback-to-v1.2.3

# 4. Force push ke main (EMERGENCY ONLY)
git push origin hotfix/rollback-to-v1.2.3:main --force

# 5. Vercel akan auto-deploy versi lama
```

⚠️ **IMPORTANT:** Force push ke `main` hanya untuk emergency. Segera inform team di Slack/Discord.

#### Scenario 2: Rollback via Vercel Dashboard (Recommended)

1. Buka [Vercel Dashboard](https://vercel.com/solvera/supercontact)
2. Go to **Deployments** tab
3. Cari deployment dengan tag yang benar
4. Klik **"Promote to Production"**
5. ✅ Zero downtime rollback tanpa Git manipulation

#### Scenario 3: Rollback Development/Staging

```bash
# Dev environment
git checkout dev
git reset --hard v1.2.3
git push origin dev --force

# Staging environment
git checkout staging
git reset --hard v1.2.3
git push origin staging --force
```

### Version History

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk history lengkap semua versi.

## 📝 Changelog Workflow

### Kapan Update CHANGELOG.md?

**WAJIB update CHANGELOG sebelum merge ke `main`** untuk production release. Best practice:

1. ✅ **Setiap PR ke `dev`** - Update section `[Unreleased]`
2. ✅ **Sebelum merge `dev` → `staging`** - Move dari `[Unreleased]` ke version baru
3. ✅ **Sebelum merge `staging` → `main`** - Final review dan create Git tag

### Quick Changelog Update Guide

```markdown
## [Unreleased]

### Added
- Fitur bulk import kontak dari CSV/Excel

### Fixed
- Bug validation email di contact form

### Changed
- Improve performance contact table dengan virtual scrolling
```

Sebelum release ke production, move ke version baru:

```markdown
## [Unreleased]

### Added
- Initial project setup placeholder

---

## [1.2.0] - 2025-01-15

### Detail Versi 1.2.0

#### ✨ Fitur Bulk Import Kontak
...
```

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk format lengkap dan contoh-contoh.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** Material-UI (MUI)
- **Package Manager:** npm
- **Backend:** FastAPI
- **Deployment:** Vercel

## 🤝 Contribution Guidelines

### Development Workflow

1. Always use **`npm install --legacy-peer-deps`** for installation
2. Create feature branch from `dev`
3. Follow commit message convention (see below)
4. **Update CHANGELOG.md** setiap PR
5. Create PR with proper description
6. Request code review
7. Merge after approval

### Commit Message Convention

```
<type>(<scope>): <subject>

Types:
- feat     : New feature
- fix      : Bug fix
- docs     : Documentation changes
- style    : Code style changes (formatting, no logic change)
- refactor : Code refactoring
- perf     : Performance improvements
- test     : Adding tests
- chore    : Build process or auxiliary tool changes

Examples:
feat(contacts): add bulk import feature
fix(form): resolve email validation error
docs(readme): update deployment guide
chore(deps): upgrade MUI to v5.15.0
```

### Pull Request Template

```markdown
## 📝 Description
Brief description of changes

## 🎯 Type of Change
- [ ] Bug fix (patch)
- [ ] New feature (minor)
- [ ] Breaking change (major)
- [ ] Documentation update

## ✅ Checklist
- [ ] Updated CHANGELOG.md
- [ ] Tested locally
- [ ] No console errors
- [ ] Code reviewed

## 🔗 Related Issues
Closes #123
```

## 🔧 Troubleshooting

### Issue: Dependency Conflict (MUI & React Types)

**Problem:**
```
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^18.0.0" from @mui/material@5.x.x
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

### Issue: Build Fails on Vercel

**Problem:** TypeScript or ESLint errors during build

**Solution:**
```bash
# Check for type errors locally
npm run build

# Fix linting issues
npm run lint:fix
```

### Issue: Wrong Version Tag

**Problem:** Created wrong tag or typo

**Solution:**
```bash
# Delete local tag
git tag -d v1.2.3

# Delete remote tag
git push origin :refs/tags/v1.2.3

# Create correct tag
npm run release:patch
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

## 📞 Support

Untuk pertanyaan atau issue:
1. Check [CHANGELOG.md](./CHANGELOG.md) untuk version history
2. Create GitHub issue dengan proper label
3. Contact team lead di Slack channel `#supercontact-dev`

---

Built with ❤️ by Solvera Team | Current Version: See [package.json](./package.json)