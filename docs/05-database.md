# 05 - Database Architecture

## Database Type

**PostgreSQL** via Supabase (managed)

## Schema Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Profiles table, triggers, RLS, credit RPC |
| `supabase/media.sql` | Media items table, storage bucket, RLS |
| `supabase/credits_hardening.sql` | Additional credit security |
| `supabase/lemonsqueezy_integration.sql` | Payment webhook tables |

## Tables

### `profiles`
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  credits integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Purpose:** User profile data and credit balance

### `media_items`
```sql
create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  bucket_id text not null default 'aiwear-media',
  object_path text not null,
  created_at timestamptz not null default now()
);
```

**Purpose:** Metadata for user-generated media stored in Supabase Storage

## Relationships

```
auth.users (Supabase internal)
    │
    ├── 1:1 ──→ profiles (via id FK)
    │
    └── 1:N ──→ media_items (via user_id FK)
```

## Indexes

```sql
create index media_items_user_id_created_at_idx
on public.media_items (user_id, created_at desc);
```

**Purpose:** Optimizes `listMyMedia()` query ordering

## Row Level Security (RLS)

### profiles
| Policy | Operation | Rule |
|--------|-----------|------|
| `profiles: read own` | SELECT | `auth.uid() = id` |
| *(no update policy)* | UPDATE | REVOKED from authenticated |

### media_items
| Policy | Operation | Rule |
|--------|-----------|------|
| `media_items: select own` | SELECT | `auth.uid() = user_id` |
| `media_items: insert own` | INSERT | `auth.uid() = user_id` |
| `media_items: delete own` | DELETE | `auth.uid() = user_id` |

### storage.objects (aiwear-media bucket)
| Policy | Operation | Rule |
|--------|-----------|------|
| `read own` | SELECT | `bucket_id = 'aiwear-media' AND split_part(name, '/', 1) = auth.uid()` |
| `write own` | INSERT | Same pattern |
| `delete own` | DELETE | Same pattern |

## Stored Functions

### `deduct_credits(amount_to_deduct integer)`
```sql
-- Security definer (runs as function owner, not caller)
-- Validates auth.uid() exists
-- Validates amount > 0
-- Ensures profile exists (upsert)
-- Atomic UPDATE with credit check
-- Raises exception if insufficient
```

### `handle_new_user()` (Trigger)
```sql
-- Triggered after INSERT on auth.users
-- Creates profiles row with 10 starting credits
-- ON CONFLICT DO NOTHING (idempotent)
```

## Data Access Patterns

| Operation | Client Call | SQL |
|-----------|-------------|-----|
| Get profile | `getProfile(userId)` | `SELECT credits, full_name FROM profiles WHERE id = $1` |
| Deduct credits | `deductCredits(userId, amt)` | `SELECT deduct_credits($1)` (RPC) |
| Upload media | `uploadMedia()` | Storage API + `INSERT INTO media_items` |
| List media | `listMyMedia()` | `SELECT * FROM media_items ORDER BY created_at DESC` |

## ORM / Query Layer

**None** - Raw Supabase JS client:
```typescript
supabase.from('profiles').select('credits, full_name').eq('id', userId).single();
```
