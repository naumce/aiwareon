# 09 - Pages & Routes

## Route Structure

Defined in `src/App.tsx`:

```typescript
<Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/dashboard" element={<MobileShell><DashboardPage /></MobileShell>} />
    <Route path="/studio" element={<MobileShell><StudioPage /></MobileShell>} />
    <Route path="/result" element={<MobileShell><ResultPage /></MobileShell>} />
    <Route path="/library" element={<MobileShell><LibraryPage /></MobileShell>} />
    <Route path="/admin" element={<MobileShell><AdminPage /></MobileShell>} />
</Routes>
```

## Pages Overview

| Route | Page | Auth Required | Purpose |
|-------|------|---------------|---------|
| `/` | LandingPage | No | Marketing, CTA to get started |
| `/auth` | AuthPage | No | Login/Signup |
| `/dashboard` | DashboardPage | Yes* | User home, credits, recent |
| `/studio` | StudioPage | Yes* | Virtual try-on creation |
| `/result` | ResultPage | Yes* | View/download generation |
| `/library` | LibraryPage | Yes* | Media gallery |
| `/admin` | AdminPage | Yes* | User management, stats |

*No route guards implemented - pages fail gracefully without auth

---

## Page Details

### LandingPage (`/`)
**File:** `src/pages/LandingPage.tsx`
**Components:**
- Header (fixed, transparent)
- Hero section with animated background
- Features grid

**Services:** None

---

### AuthPage (`/auth`)
**File:** `src/pages/AuthPage.tsx`
**Components:**
- Login/Signup form
- Google OAuth button
- Error/success messages

**Services:** `authStore.signIn*()`, `authStore.signUp*()`

---

### DashboardPage (`/dashboard`)
**File:** `src/pages/DashboardPage.tsx`
**Components:**
- Credit card display
- "New Creation" button
- Recent history scroll

**Services:** `useCreditStore`, `useAuthStore`

---

### StudioPage (`/studio`)
**File:** `src/pages/StudioPage.tsx`
**Components:**
- SavedModels
- ImageUpload (2x)
- QualityToggle
- PoseSelector
- Generate button
- Result showcase

**Services:** `useStudioStore`, `virtualTryOn()`

**Layout:** Split-screen (desktop), stacked (mobile)

---

### ResultPage (`/result`)
**File:** `src/pages/ResultPage.tsx`
**Components:**
- Result image/video display
- Action buttons (Animate, Re-render, Discard, Download)

**Services:** `useStudioStore`, `animateTryOn()`, `mediaService.uploadMedia()`

---

### LibraryPage (`/library`)
**File:** `src/pages/LibraryPage.tsx`
**Components:**
- Filter tabs (All/Images/Videos)
- Sort buttons
- Media grid
- Lightbox view

**Services:** `mediaService.listMyMedia()`, `createSignedMediaUrl()`

---

### AdminPage (`/admin`)
**File:** `src/pages/AdminPage.tsx`
**Components:**
- Stats cards
- Add credits form
- User list table

**Services:** `supabase.from('profiles')` direct queries

**Note:** No admin role check - any logged-in user can access

---

## Page → Component → Service Mapping

```
StudioPage
├── SavedModels            → useModelStore
├── ImageUpload            → (local state, file/camera input)
├── QualityToggle          → useStudioStore.setQuality
├── PoseSelector           → useStudioStore.setSelectedPose
└── handleGenerate()       → virtualTryOn() → Gemini API

LibraryPage
├── Filter/Sort            → local state
├── MediaGrid              → mediaService.listMyMedia()
└── MediaItem.onClick      → createSignedMediaUrl()

AuthPage
├── LoginForm              → authStore.signInWithEmail()
├── SignupForm             → authStore.signUpWithEmail()
└── GoogleButton           → authStore.signInWithGoogle()
```

---

## MobileShell Wrapper

All authenticated routes are wrapped in `<MobileShell>`:
- Provides bottom navigation
- Adds `pb-24` padding for nav clearance
- Shows ambient background glow
- Constrains content to `max-w-md` (448px)
