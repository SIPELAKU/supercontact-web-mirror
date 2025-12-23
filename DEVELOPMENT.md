# Development Guide

## Path Resolution Setup

This project uses TypeScript path mapping for cleaner imports. All imports should use the `@` symbol instead of relative paths.

### Correct Import Patterns

✅ **Use these patterns:**
```typescript
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { fetchUsers } from "@/lib/api";
```

❌ **Avoid these patterns:**
```typescript
import { useAuth } from "../../../lib/context/AuthContext";
import { Button } from "../../components/ui/button";
import { fetchUsers } from "../lib/api";
```

## Component Props Interface

When creating reusable components, always define proper TypeScript interfaces:

### SelectDealStage Component

```typescript
interface Props {
  value: string;
  onChange: (val: string) => void;
  data: DealStage[];  // ✅ Use 'data' prop name
  placeholder?: string;
  className?: string;
}
```

### Common Prop Naming Conventions

- `data` - for arrays of options/items
- `value` - for controlled component values
- `onChange` - for value change handlers
- `onSelect` - for selection handlers
- `loading` - for loading states
- `disabled` - for disabled states

## Git Workflow Best Practices

### Before Merging

1. **Pull latest changes from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Check for TypeScript errors:**
   ```bash
   npm run type-check
   ```

3. **Run linting:**
   ```bash
   npm run lint
   ```

4. **Test the build:**
   ```bash
   npm run build
   ```

### Component Interface Changes

When modifying component interfaces:

1. **Search for all usages:**
   ```bash
   # Search for component usage
   grep -r "SelectDealStage" src/
   ```

2. **Update all import statements:**
   - Check both the component file and all files that import it
   - Ensure prop names match the interface

3. **Test in development:**
   ```bash
   npm run dev
   ```

## VSCode Setup

### Required Extensions

1. **TypeScript Importer** - Auto-import with correct paths
2. **Path Intellisense** - Autocomplete for file paths
3. **ES7+ React/Redux/React-Native snippets** - React snippets

### Workspace Settings

The project includes `.vscode/settings.json` with optimal TypeScript settings. If you're not seeing proper IntelliSense:

1. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Reload VSCode window: `Ctrl+Shift+P` → "Developer: Reload Window"

## Common Issues & Solutions

### 1. "Cannot find module '@/...'"

**Solution:** Check `tsconfig.json` paths configuration and restart TypeScript server.

### 2. "Export default doesn't exist"

**Solution:** Check if the import should be named export instead:
```typescript
// ❌ Wrong
import useUsers from "@/lib/hooks/useUsers";

// ✅ Correct
import { useUsers } from "@/lib/hooks/useUsers";
```

### 3. Component prop type errors

**Solution:** Check the component's interface definition and ensure prop names match:
```typescript
// Component expects 'data' prop
<SelectDealStage 
  data={dealStages}  // ✅ Correct
  dealStages={dealStages}  // ❌ Wrong prop name
/>
```

### 4. Differences between dev and branch

**Causes:**
- Outdated branch not synced with main
- Different component interfaces
- Missing dependency updates

**Prevention:**
- Regularly rebase your branch with main
- Use consistent prop naming conventions
- Always test builds before merging

### 5. Icons disappearing in sidebar

**Causes:**
- SVG files not loading properly
- Next.js Image component issues with SVG
- Network issues or caching problems

**Solutions:**
1. **Check SVG files exist:**
   ```bash
   ls -la public/assets/*.svg
   ```

2. **Clear browser cache and reload**

3. **Test icon loading:**
   Add `<IconTest />` component to any page to debug icon loading

4. **Restart development server:**
   ```bash
   npm run dev
   ```

5. **Check browser console for errors**

**Fallback system:**
- Sales icon falls back to BarChart3 (Lucide)
- Omnichannel icon falls back to Users (Lucide)
- All other icons use Lucide React icons

## API Integration Patterns

### Hooks Usage

```typescript
// ✅ Correct pattern
const { data: usersResponse, isLoading, error } = useUsers();
const users = usersResponse?.data?.users || [];

// ❌ Avoid direct destructuring without null checks
const { data: { users } } = useUsers(); // Can cause runtime errors
```

### Error Handling

```typescript
// ✅ Proper error handling
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  onError: (error) => {
    logger.error("Failed to fetch users:", error);
  }
});

if (error) {
  return <div>Error: {error.message}</div>;
}
```

## Build & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Environment Variables

Required environment variables in `.env`:

```env
NODE_TLS_REJECT_UNAUTHORIZED=0  # For development SSL bypass
NEXT_PUBLIC_API_URL=your_api_url
```

### CI/CD Pipeline

The project includes GitHub Actions for:
- TypeScript type checking
- ESLint validation
- Build verification
- GitLab mirroring

Check `.github/workflows/` for pipeline configurations.