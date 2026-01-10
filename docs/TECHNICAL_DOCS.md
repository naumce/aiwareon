# AiWear Technical Documentation Index

> **Last Updated:** 2026-01-05  
> **Project:** AiWear - AI Fashion Studio  
> **Version:** 0.0.0

---

## Documentation Modules

This documentation is split into focused modules for easier navigation and maintenance.

| Module | File | Description |
|--------|------|-------------|
| Project Overview | [01-project-overview.md](./01-project-overview.md) | Architecture, tech stack, problem statement |
| Features & Capabilities | [02-features-capabilities.md](./02-features-capabilities.md) | Core modules, entry points |
| Application Flow | [03-application-flow.md](./03-application-flow.md) | Lifecycle, state management, request flow |
| Authentication | [04-authentication.md](./04-authentication.md) | Auth providers, user lifecycle, guards |
| Database Architecture | [05-database.md](./05-database.md) | Schema, tables, RLS policies |
| Hooks & State | [06-hooks-state.md](./06-hooks-state.md) | Zustand stores, custom hooks |
| Environment & Config | [07-environment-config.md](./07-environment-config.md) | Env vars, build config |
| Services & APIs | [08-services-apis.md](./08-services-apis.md) | Internal/external services |
| Pages & Routes | [09-pages-routes.md](./09-pages-routes.md) | Route structure, page mapping |
| Folder Structure | [10-folder-structure.md](./10-folder-structure.md) | Directory breakdown |
| Data Flows | [11-data-flows.md](./11-data-flows.md) | Auth, generation, credit flows |
| Design Decisions | [12-design-decisions.md](./12-design-decisions.md) | Trade-offs, constraints |
| Gaps & Risks | [13-gaps-risks.md](./13-gaps-risks.md) | TODOs, potential issues |

---

## Quick Start for Developers

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local
# Fill in: VITE_GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# 3. Setup Supabase (run in SQL Editor)
# - supabase/schema.sql (profiles + credits)
# - supabase/media.sql (storage + media_items)
# - supabase/credits_hardening.sql (security)

# 4. Run dev server
npm run dev
# Opens at http://localhost:3000
```

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Landing │ │  Auth   │ │ Studio  │ │ Library │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
│       └───────────┴───────────┴───────────┘             │
│                        │                                │
│  ┌─────────────────────┴─────────────────────┐         │
│  │           Zustand Stores                   │         │
│  │  authStore │ creditStore │ studioStore    │         │
│  └─────────────────────┬─────────────────────┘         │
└────────────────────────┼────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌───────────────┐                 ┌───────────────┐
│   Supabase    │                 │  Google AI    │
│  (Auth + DB)  │                 │   (Gemini)    │
│  PostgreSQL   │                 │  Image/Video  │
└───────────────┘                 └───────────────┘
```

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + TypeScript | UI Framework |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| State | Zustand 5 | Global state management |
| Routing | React Router DOM 7 | Client-side routing |
| Animation | Framer Motion 11 | UI animations |
| Build | Vite 6 | Dev server + bundler |
| Auth/DB | Supabase | PostgreSQL + Auth + Storage |
| AI | Google Gemini | Image generation + Video |

---

## Critical Paths

1. **Virtual Try-On Flow:** `StudioPage → geminiService.virtualTryOn() → Result`
2. **Auth Flow:** `AuthPage → authStore.signIn*() → Supabase Auth → Dashboard`
3. **Credit Flow:** `Generation → creditStore.deduct() → supabase.rpc('deduct_credits')`
4. **Media Storage:** `Result → mediaService.uploadMedia() → Supabase Storage`
