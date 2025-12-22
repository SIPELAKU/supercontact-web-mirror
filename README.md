This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Poppins font.

## Path Resolution Setup

This project uses TypeScript path mapping with the `@` symbol for cleaner imports. The configuration is set up in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"],
      "@/public/*": ["./public/*"]
    }
  }
}
```

### Usage Examples

Instead of relative imports:
```typescript
import { useAuth } from "../../../lib/context/AuthContext";
import Button from "../../components/ui/button";
```

Use absolute imports with `@`:
```typescript
import { useAuth } from "@/lib/context/AuthContext";
import Button from "@/components/ui/button";
```

### VSCode Setup

The project includes VSCode settings in `.vscode/settings.json` for optimal TypeScript support:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "shortest"
}
```

### Troubleshooting Path Resolution

If VSCode doesn't recognize `@` imports:

1. **Restart TypeScript Server**: Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. **Check tsconfig.json**: Ensure `baseUrl` is set to `"."` and paths are correctly configured
3. **Reload VSCode**: Sometimes a full reload helps with path resolution
4. **Verify file structure**: Make sure files exist in the paths you're importing from

### Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── lib/                   # Utilities, hooks, types, context
│   ├── api.ts            # API functions
│   ├── context/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── type/             # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── scripts/              # Build and deployment scripts
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



# SMOKE TEST ALIF (dev)