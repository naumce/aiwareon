# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIWear is an AI-powered virtual try-on application. Users upload reference photos and garment images, and the app generates photorealistic composites using AI. It's a monorepo with a web PWA (root) and a React Native Expo mobile app (`mobile/`).

**Serverless architecture** — no custom backend. All services are external:
- **Supabase**: Auth, PostgreSQL database, file storage, edge functions
- **Google Gemini** (`@google/genai`): AI image generation for virtual try-on
- **Fal.ai**: Alternative AI image generation service
- **Lemon Squeezy**: Payment processing via Supabase edge function webhook

## Common Commands

### Web App (root)
```bash
npm run dev          # Dev server on localhost:3000
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run preview      # Preview production build
npm run test:e2e     # Playwright E2E tests (Chromium, testDir: ./e2e)
```

### Mobile App (mobile/)
```bash
cd mobile
npm start            # Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
```

### Supabase
```bash
supabase start       # Local Supabase (config in supabase/config.toml)
supabase db push     # Apply migrations from supabase/migrations/
```

## Architecture

### Web Stack
React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand + React Router DOM + Framer Motion. PWA enabled via `vite-plugin-pwa`.

### Mobile Stack
React Native 0.81 + Expo 54 + TypeScript + Zustand + React Navigation + Reanimated.

### State Management — Zustand Stores (`src/stores/`)
Each domain has its own store: `authStore`, `creditStore`, `generationStore`, `wardrobeStore`, `outfitStore`. Mobile mirrors this pattern in `mobile/src/stores/`.

### Services Layer (`src/services/`)
- `supabaseClient.ts` — Supabase client initialization
- `geminiService.ts` — Google Gemini AI integration (main AI engine)
- `falService.ts` — Fal.ai integration (alternative AI service)
- `personImageService.ts`, `wardrobeService.ts`, `outfitService.ts` — Domain-specific data operations against Supabase
- `generationService.ts`, `categorizeService.ts` — Orchestration services

### Routing (`src/App.tsx`)
Public routes: `/`, `/login`, `/forgot-password`, `/reset-password`, `/pricing`
Protected routes (wrapped in `ProtectedRoute` + `StudioLayout`): `/studio`, `/studio/tonight`, `/studio/wardrobe`, `/studio/outfits`, `/studio/account`, `/studio/history`

### Credit System
Users have credits deducted per generation. Managed via `creditStore` and Supabase. Credits are purchased through Lemon Squeezy integration.

## Environment Variables

### Web (`.env`)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_FAL_API_KEY
```

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_GEMINI_API_KEY
EXPO_PUBLIC_FAL_API_KEY
```

Mobile validates env vars at runtime in `mobile/src/config.ts`.

## Key Conventions

- **Design aesthetic**: Premium dark theme with peach/apricot accent colors. Background: `#F7F5F2` (light mode), accent: `#C9A0FF`.
- **Component organization**: Pages in `src/pages/`, reusable components in `src/components/`, auth components isolated in `src/components/auth/`.
- **Web and mobile share patterns** but not code — parallel implementations of stores, services, and screens.
- **Comprehensive docs** live in `docs/` (01 through 13, plus `TECHNICAL_DOCS.md` index and `GOLDEN_HOUR_VISION.md` feature spec).
