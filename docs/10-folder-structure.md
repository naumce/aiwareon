# 10 - Folder & File Structure

## High-Level Structure

```
aiwear/
├── docs/                    # Technical documentation (this)
├── public/                  # Static assets
├── src/                     # Application source code
├── supabase/                # Database schemas + edge functions
├── prompts/                 # AI/documentation prompts
├── dist/                    # Build output (gitignored)
├── node_modules/            # Dependencies (gitignored)
│
├── index.html               # Vite entry HTML
├── package.json             # Dependencies + scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind theme
├── tsconfig.json            # TypeScript config
├── postcss.config.cjs       # PostCSS plugins
└── README.md                # Quick start guide
```

---

## /src Breakdown

```
src/
├── main.tsx                 # React DOM render entry
├── App.tsx                  # Router + providers
├── types.ts                 # TypeScript interfaces
├── vite-env.d.ts            # Vite type declarations
│
├── components/              # React components
│   ├── layout/              # Layout components
│   ├── studio/              # Studio-specific components
│   └── ui/                  # Generic UI components
│
├── hooks/                   # Custom React hooks
│   ├── index.ts
│   ├── useMediaQuery.ts
│   └── useGestures.ts
│
├── pages/                   # Route-level pages
│   ├── index.ts             # Barrel export
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── StudioPage.tsx
│   ├── ResultPage.tsx
│   ├── LibraryPage.tsx
│   └── AdminPage.tsx
│
├── services/                # API/DB service layer
│   ├── index.ts
│   ├── supabaseClient.ts
│   ├── geminiService.ts
│   ├── mediaService.ts
│   └── storageService.ts
│
├── stores/                  # Zustand state stores
│   ├── authStore.ts
│   ├── creditStore.ts
│   ├── studioStore.ts
│   └── modelStore.ts
│
└── styles/
    └── index.css            # Tailwind imports + custom CSS
```

---

## /src/components Breakdown

### layout/
```
Container.tsx        # Max-width wrapper with padding
Header.tsx           # App header with tabs, credits, user menu
MobileNav.tsx        # Bottom nav icons (not directly used)
MobileShell.tsx      # Mobile wrapper with bottom nav
index.ts             # Barrel export
```

### studio/
```
ImageUpload.tsx      # Photo upload/camera capture
SavedModels.tsx      # Reference photo gallery
PoseSelector.tsx     # Movement pose buttons
QualityToggle.tsx    # Standard/Studio toggle
SaveModelDialog.tsx  # Save reference modal
GenerationLoader.tsx # Loading animation
Collections.tsx      # Collection management
CompareView.tsx      # Before/after comparison
ShareButton.tsx      # Social sharing
OnboardingFlow.tsx   # First-time user guide
EnhancedPoseSelector.tsx # Extended pose UI
index.ts             # Barrel export
```

### ui/
```
Button.tsx           # Button variants
Card.tsx             # Card container
Input.tsx            # Form input
Modal.tsx            # Modal dialog
ErrorBoundary.tsx    # React error boundary
SkipLink.tsx         # Accessibility skip link
AnimatedBackground.tsx # Background effects
...etc
index.ts             # Barrel export
```

---

## /supabase Breakdown

```
supabase/
├── schema.sql                    # profiles table, RLS, triggers
├── media.sql                     # media_items table, storage
├── credits_hardening.sql         # Credit security policies
├── lemonsqueezy_integration.sql  # Payment tables
│
└── functions/
    └── lemonsqueezy-webhook/
        └── index.ts              # Edge function for payments
```

---

## Important Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | React bootstrap |
| `src/App.tsx` | Router + global setup |
| `src/stores/studioStore.ts` | Core generation state |
| `src/services/geminiService.ts` | AI API integration |
| `src/services/supabaseClient.ts` | Auth + database |
| `supabase/schema.sql` | Primary DB schema |
| `tailwind.config.js` | Design system tokens |
