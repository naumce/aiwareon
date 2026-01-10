# 06 - Hooks & State Layer

## State Management: Zustand

All global state is managed via Zustand stores in `src/stores/`.

## Stores Overview

| Store | File | Purpose |
|-------|------|---------|
| `useAuthStore` | `authStore.ts` | Session, user identity, auth actions |
| `useCreditStore` | `creditStore.ts` | Credit balance, deduction, guest shots |
| `useStudioStore` | `studioStore.ts` | Try-on state, uploads, generation |
| `useModelStore` | `modelStore.ts` | Saved reference photos (localStorage) |

---

## authStore

### State
```typescript
session: any | null
isLoading: boolean
isInitialized: boolean
isGuest: boolean           // Computed
userLabel: string          // Computed  
userEmail: string | null
userId: string | null
```

### Actions
| Action | Purpose |
|--------|---------|
| `initAuth()` | Bootstrap session, setup listener |
| `setSession(session)` | Update session + computed values |
| `signInWithGoogle()` | OAuth via Supabase |
| `signInWithEmail(email, pw)` | Email/password login |
| `signUpWithEmail(email, pw)` | Email/password registration |
| `signOut()` | Clear session |

---

## creditStore

### State
```typescript
credits: number
isLoading: boolean
guestShotsLeft: number   // LocalStorage persisted
```

### Actions
| Action | Purpose |
|--------|---------|
| `syncCredits(userId)` | Fetch from DB |
| `deduct(userId, amount)` | Call RPC, then sync |
| `useGuestShot()` | Decrement localStorage counter |
| `initGuestShots()` | Load from localStorage |
| `getCreditWarning()` | Returns 'empty' | 'critical' | 'low' | null |

---

## studioStore

### State
```typescript
userPhoto: string | null      // Base64
garmentPhoto: string | null   // Base64
composite: string | null      // Generated result
videoUrl: string | null       // Animated result
selectedPose: string          // 'mirror' | 'editorial' | 'walk'
quality: 'standard' | 'studio'
status: GenerationState       // { isProcessing, progressMessage, error }
sessionHistory: string[]      // Recent results (in-memory)
```

### Actions
| Action | Purpose |
|--------|---------|
| `setUserPhoto(photo)` | Set reference image |
| `setGarmentPhoto(photo)` | Set garment image |
| `setComposite(result)` | Store generation result |
| `setStatus(update)` | Update processing state |
| `addToHistory(url)` | Prepend to session history |
| `reset()` | Clear all state |

### Helpers
| Method | Returns |
|--------|---------|
| `getSelectedPose()` | Full PoseOption object |
| `getCost()` | 1 for standard, 2 for studio |
| `canGenerate()` | Boolean check for required inputs |

---

## modelStore

### State
```typescript
models: SavedModel[]  // { id, name, image, savedAt }
```

### Actions
| Action | Purpose |
|--------|---------|
| `loadModels()` | Read from localStorage |
| `saveModel(name, image)` | Compress + save to localStorage |
| `deleteModel(id)` | Remove from localStorage |
| `canSaveMore()` | Check < 5 models |

**Storage:** `localStorage.aiwear_saved_models` (max 5, compressed JPEG)

---

## Custom Hooks

Location: `src/hooks/`

### useMediaQuery.ts

| Hook | Purpose |
|------|---------|
| `useMediaQuery(query)` | Raw media query match |
| `useIsMobile()` | < 640px |
| `useIsTablet()` | >= 768px |
| `useIsDesktop()` | >= 1024px |
| `useBreakpoint()` | Returns 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' |
| `useIsTouchDevice()` | Detect touch capability |
| `useSafeAreaInsets()` | iOS notch/home indicator insets |
| `useViewportHeight()` | Actual vh (handles mobile chrome) |
| `usePrefersReducedMotion()` | Accessibility preference |
| `usePrefersDarkMode()` | System color scheme |

### useGestures.ts
Gesture detection hooks (swipe, pinch, etc.) - **Not currently used in pages**

---

## Data Flow Example

```
User clicks "Generate"
    ↓
StudioPage: handleGenerate()
    ↓
useStudioStore.setStatus({ isProcessing: true })
    ↓
virtualTryOn() → Gemini API
    ↓
Result received
    ↓
useStudioStore.setComposite(result)
useStudioStore.addToHistory(result)
    ↓
Component re-renders with composite displayed
```
