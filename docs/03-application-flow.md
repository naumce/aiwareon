# 03 - Application Flow

## Application Lifecycle

### 1. Bootstrap (`src/main.tsx`)
```tsx
ReactDOM.createRoot(document.getElementById('root')!)
  .render(<React.StrictMode><App /></React.StrictMode>);
```

### 2. App Initialization (`src/App.tsx`)
```
App mounts
    ↓
useEffect: initAuth() + initGuestShots()
    ↓
Check isSupabaseConfigured()
    ↓
If not configured → ConfigErrorScreen
If loading → LoadingScreen
If ready → Render Routes
```

### 3. Route Rendering
- Public routes: `/`, `/auth`
- Protected routes wrapped in `<MobileShell>`: `/dashboard`, `/studio`, `/result`, `/library`, `/admin`

## State Management Flow

### Zustand Store Pattern
```
Component → useStore() → Get state/actions
                ↓
        Action triggered
                ↓
        set() updates state
                ↓
        Component re-renders
```

### Store Dependencies
```
┌─────────────┐     ┌──────────────┐
│  authStore  │────→│ creditStore  │
│  (session)  │     │ (syncCredits)│
└─────────────┘     └──────────────┘
        │
        ▼
┌─────────────────────────────────┐
│        supabaseClient           │
│ (auth, profiles table, storage) │
└─────────────────────────────────┘
```

## Request/Response Flow

### Generation Flow
```
1. User uploads images in StudioPage
2. Clicks "Generate Try-On"
3. handleGenerate() called:
   - setStatus({ isProcessing: true })
   - virtualTryOn(userPhoto, garmentPhoto, pose, quality)
   - Gemini API processes images
   - Returns base64 result
   - setComposite(result)
   - addToHistory(result)
4. Result displayed in Showcase panel
```

### Credit Deduction Flow
```
1. User initiates generation
2. creditStore.deduct(userId, amount)
3. supabase.rpc('deduct_credits', { amount })
4. PostgreSQL function executes
5. If insufficient → exception thrown
6. If success → syncCredits() to refresh UI
```

## Frontend → Service Communication

| Action | Frontend Call | Service Layer |
|--------|--------------|---------------|
| Login | `authStore.signInWithEmail()` | `supabase.auth.signInWithPassword()` |
| Generate | `virtualTryOn()` | `@google/genai models.generateContent()` |
| Upload Media | `mediaService.uploadMedia()` | `supabase.storage.upload()` |
| Get Profile | `getProfile(userId)` | `supabase.from('profiles').select()` |
| Deduct Credits | `deductCredits()` | `supabase.rpc('deduct_credits')` |

## Error Handling Strategy

1. **Try-Catch in Services** - All async operations wrapped
2. **Status Objects** - `{ error: string | null }` return pattern
3. **Store Error State** - `status.error` in studioStore
4. **UI Error Display** - Conditional rendering of error messages
5. **Console Logging** - All errors logged for debugging
