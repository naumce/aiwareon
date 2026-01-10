# 04 - Authentication & Authorization

## Auth Implementation

Authentication is handled entirely by **Supabase Auth** with the client SDK. No custom backend auth logic exists.

### Auth Store Location
`src/stores/authStore.ts`

## Auth Providers

| Provider | Method | Implementation |
|----------|--------|----------------|
| Email/Password | `signInWithEmail()`, `signUpWithEmail()` | `supabase.auth.signInWithPassword()` |
| Google OAuth | `signInWithGoogle()` | `supabase.auth.signInWithOAuth({ provider: 'google' })` |

### OAuth Configuration
```typescript
// From authStore.ts
options: {
    redirectTo: window.location.origin,
    queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
    }
}
```

## User Lifecycle

### 1. Signup
```
User submits email/password
    ↓
supabase.auth.signUp()
    ↓
If email confirmation required → needsConfirmation: true
    ↓
User clicks email link
    ↓
Session created → trigger on_auth_user_created
    ↓
profiles row auto-created (10 credits)
```

### 2. Login
```
User submits credentials
    ↓
supabase.auth.signInWithPassword()
    ↓
Session returned
    ↓
authStore.setSession(session)
    ↓
Computed values updated (isGuest, userLabel, userId)
```

### 3. Session Persistence
```typescript
// supabaseClient.ts
auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
}
```

### 4. Auth State Listener
```typescript
// In initAuth()
supabase.auth.onAuthStateChange((_event, session) => {
    get().setSession(session);
});
```

## Permissions & Roles

### Database Level (RLS)
```sql
-- Users can only read their own profile
create policy "profiles: read own"
on public.profiles for select
using (auth.uid() = id);

-- Direct UPDATE disabled (credits via RPC only)
revoke update on table public.profiles from authenticated;
```

### UI Level
- No formal role system in frontend
- `/admin` page exists but has no role guard (**GAP**)
- All authenticated users can access all routes

## Guards & Middleware

**IMPORTANT:** No route guards exist in the current codebase.

```typescript
// App.tsx - Routes are NOT protected
<Route path="/dashboard" element={
    <MobileShell><DashboardPage /></MobileShell>
} />
```

**GAP:** Unauthenticated users can navigate to `/dashboard`, `/studio`, etc. directly. Pages may fail gracefully but there's no redirect to `/auth`.

## Auth State Shape

```typescript
interface AuthState {
    session: any | null;
    isLoading: boolean;
    isInitialized: boolean;
    isGuest: boolean;         // Computed: !session
    userLabel: string;        // Computed: full_name || email || 'Guest'
    userInitial: string;      // First letter of userLabel
    userEmail: string | null;
    userId: string | null;
}
```

## Security Considerations

1. **PKCE Flow** - Used for OAuth to prevent code interception
2. **RLS Policies** - Database enforces row ownership
3. **Credit RPC** - Credits modified via secure RPC, not direct UPDATE
4. **No Client-Side Secrets** - Anon key is public, service key never exposed
