# 12 - Key Design Decisions

## Architectural Decisions

### 1. Serverless / BaaS Architecture
**Decision:** No custom backend server. Direct client-to-Supabase and client-to-Gemini.

**Trade-offs:**
- ✅ Faster development, lower costs
- ❌ API keys exposed in client bundle

### 2. Zustand for State Management
**Decision:** Zustand over Redux or Context.

**Trade-offs:**
- ✅ Minimal boilerplate, simple API
- ❌ Less tooling than Redux

### 3. Credit-Based Monetization
Charge on generation, not download. Credits via RPC only.

### 4. Mobile-First Design
Primary target is mobile web/PWA with `MobileShell` wrapper.

### 5. Base64 Images in State
Simplifies handling but is memory intensive.

### 6. LocalStorage for Saved Models
Instant offline access but limited to ~5MB, not synced.

### 7. RLS-First Security
All data access controlled at database level via Row Level Security.

### 8. Split-Screen Studio Layout
Desktop: Editor (left) + Showcase (right). Mobile: stacked.
