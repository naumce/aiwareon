# 13 - Gaps, Risks & TODOs

## Security Gaps

### 1. Exposed API Key
**Location:** `geminiService.ts`
**Issue:** `VITE_GEMINI_API_KEY` is bundled in client code.
**Risk:** Anyone can extract and abuse the key.
**Fix:** Proxy API calls through Supabase Edge Function.

### 2. No Route Guards
**Location:** `App.tsx`
**Issue:** Routes like `/dashboard`, `/studio` have no auth check.
**Risk:** Unauthenticated users can access protected pages.
**Fix:** Add `ProtectedRoute` wrapper component.

### 3. No Admin Role Check
**Location:** `AdminPage.tsx`
**Issue:** Any authenticated user can access `/admin`.
**Fix:** Add `is_admin` column to profiles, check in component.

---

## Missing Features

### 1. Credit Deduction Not Wired
**Location:** `StudioPage.tsx`
**Issue:** `handleGenerate()` calls `virtualTryOn()` but never deducts credits.
**Fix:** Call `creditStore.deduct()` before generation.

### 2. PWA Disabled
**Location:** `vite.config.ts`
**Issue:** VitePWA plugin is commented out.
**Impact:** No offline support, no install prompt.

### 3. Error Boundary Gaps
**Issue:** Only top-level ErrorBoundary exists.
**Fix:** Add boundaries around critical components.

---

## Technical Debt

| Area | Issue |
|------|-------|
| Types | `session: any` in authStore |
| Unused code | `useGestures.ts` not used |
| Duplicate files | `App.tsx` exists in root and src |
| Missing tests | No test files exist |

---

## Performance Risks

1. **Large base64 in state** - Memory pressure on mobile
2. **No image lazy loading** - All media loads at once
3. **No pagination** - `listMyMedia()` loads all items

---

## Recommendations

1. Add backend proxy for Gemini API
2. Implement route guards
3. Add role-based access control
4. Enable PWA with service worker
5. Add unit and integration tests
6. Implement proper TypeScript types for Supabase
