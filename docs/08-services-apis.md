# 08 - Services & APIs

## Service Files

Location: `src/services/`

| File | Purpose |
|------|---------|
| `supabaseClient.ts` | Supabase client, auth helpers, credit RPC |
| `geminiService.ts` | AI image/video generation |
| `mediaService.ts` | Upload/list media to Supabase Storage |
| `storageService.ts` | Local IndexedDB history |

---

## supabaseClient.ts

### Exports
```typescript
export const supabase: SupabaseClient | null
export const isSupabaseConfigured: () => boolean
export const getProfile: (userId) => Promise<{credits, full_name} | null>
export const deductCredits: (userId, amount) => Promise<{error: string | null}>
```

### Initialization
```typescript
// Only creates client if URL/key are valid
export const supabase = (isValidSupabaseUrl(url) && looksLikeJwt(key))
    ? createClient(url, key, { auth: { flowType: 'pkce', ... } })
    : null;
```

---

## geminiService.ts

### Exports
```typescript
export const virtualTryOn: (
    referencePhoto: string,
    dressBase64: string,
    poseDescription: string,
    quality: 'standard' | 'studio'
) => Promise<string>  // Returns base64 PNG

export const animateTryOn: (
    compositeBase64: string,
    motionDescription: string,
    onProgress: (msg) => void
) => Promise<Blob>  // Returns MP4 blob
```

### AI Models Used
| Function | Model |
|----------|-------|
| `virtualTryOn` (standard) | `gemini-2.5-flash-image` |
| `virtualTryOn` (studio) | `gemini-3-pro-image-preview` |
| `animateTryOn` | `veo-3.1-fast-generate-preview` |

### Image Processing
- Input images resized to max 640-2048px depending on quality
- Output returned as base64 PNG

---

## mediaService.ts

### Exports
```typescript
export async function uploadMedia(params: {
    userId: string;
    kind: 'image' | 'video';
    dataUrl?: string;
    blob?: Blob;
}): Promise<MediaItem>

export async function listMyMedia(
    limit?: number, 
    offset?: number
): Promise<MediaItem[]>

export async function createSignedMediaUrl(
    item: Pick<MediaItem, 'bucket_id' | 'object_path'>,
    expiresInSec?: number
): Promise<string>
```

### Storage Pattern
Objects stored at: `{userId}/{kind}/{timestamp}.{ext}`

---

## storageService.ts (IndexedDB)

### Exports
```typescript
export const initDB: () => Promise<IDBDatabase>
export const saveRender: (base64: string) => Promise<void>
export const getHistory: (limit?: number) => Promise<string[]>
export const clearAllHistory: () => Promise<void>
```

### Database Structure
- **DB Name:** `AiWear_DB`
- **Store Name:** `history`
- **Schema:** `{ id (auto), image: string, timestamp: number }`

---

## External Services

### Google Gemini API
- **Endpoint:** `@google/genai` SDK
- **Auth:** API key in headers
- **Usage:** Image generation, video generation
- **Rate Limits:** Subject to Google AI quotas

### Supabase
- **Auth:** JWT-based, PKCE flow
- **Database:** PostgreSQL with RLS
- **Storage:** S3-compatible blob storage
- **Functions:** Edge Functions (Deno) for webhooks

---

## Error Handling

### Service-Level Pattern
```typescript
try {
    // API call
} catch (error) {
    console.error("Context:", error);
    throw error;  // or return { error: message }
}
```

### Retry Logic (geminiService)
```typescript
if (retries > 0 && error.status === 500) {
    await delay(2000);
    return virtualTryOn(..., retries - 1);
}
```

---

## Edge Functions

Location: `supabase/functions/`

### lemonsqueezy-webhook
```typescript
// Handles POST from Lemon Squeezy after purchase
// Verifies webhook signature
// Adds credits to user profile
```

**Note:** Requires `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
