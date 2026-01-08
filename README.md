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
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
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
   - Create Pull Request from `staging` → `main`
   - Get approval from Tech Lead/PM
   - Merge to `main`
   - Auto-deploy to **Production** environment

#### Branch Protection Rules

| Branch | Direct Push | Requires PR | Requires Review |
|--------|-------------|-------------|-----------------|
| `main` | ❌ Blocked | ✅ Required | ✅ Required (2+) |
| `staging` | ❌ Blocked | ✅ Required | ✅ Required (1+) |
| `dev` | ⚠️ Allowed* | ✅ Preferred | ✅ Recommended |

*Only for hotfixes or urgent fixes with team notification.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** Material-UI (MUI)
- **Package Manager:** npm
- **Backend:** FastAPI
- **Deployment:** Vercel

## 📌 Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (X.0.0): Breaking changes, major architecture updates
- **MINOR** (0.X.0): New features, backward-compatible
- **PATCH** (0.0.X): Bug fixes, minor improvements

### Examples

```
1.0.0   → Initial production release
1.1.0   → Added contact import feature
1.1.1   → Fixed contact validation bug
1.2.0   → Added bulk actions feature
2.0.0   → Migration to Next.js 15 (breaking change)
```

All notable changes are documented in [CHANGELOG.md](./CHANGELOG.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 🤝 Contribution

1. Always use **`npm install --legacy-peer-deps`** for installation to avoid dependency conflicts.
2. Ensure `package-lock.json` is always synced with `package.json`.
3. Follow the **Semantic Versioning** in your commit messages and changelogs.
4. Always create **Pull Requests** - never push directly to `staging` or `main`.
5. Update **CHANGELOG.md** for every significant change.

### Commit Message Convention

```
<type>(<scope>): <subject>

Examples:
feat(contacts): add bulk import feature
fix(form): resolve validation error
docs: update README deployment guide
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

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

This flag tells npm to ignore peer dependency conflicts and use the legacy resolution algorithm.

### Issue: Build Fails on Vercel

**Problem:** TypeScript or ESLint errors during build

**Solution:**
```bash
# Check for type errors locally
npm run build

# Fix linting issues
npm run lint
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vercel Deployment](https://vercel.com/docs)

---

Built with ❤️ by Solvera Team