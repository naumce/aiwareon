# 07 - Environment & Configuration

## Environment Variables

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_GEMINI_API_KEY` | Google AI API key | `AIzaSy...` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbG...` (JWT) |

### Optional Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Fallback for Gemini key (non-Vite prefix) |
| `VITE_LEMONSQUEEZY_CHECKOUT_URL` | Payment checkout URL |

## Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Template (committed) |
| `.env.local` | Local development (gitignored) |

## How Variables Are Loaded

### Vite Config (`vite.config.ts`)
```typescript
const env = loadEnv(mode, '.', '');
const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;

define: {
    'process.env.API_KEY': JSON.stringify(geminiApiKey),
    'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey)
}
```

### In Code
```typescript
// Vite exposes VITE_ prefixed vars via import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

## Config Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build, dev server, plugins |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind theme customization |
| `postcss.config.cjs` | PostCSS plugins (Tailwind, Autoprefixer) |

## Vite Configuration

```typescript
// vite.config.ts
{
    server: {
        port: 3000,
        host: '0.0.0.0',  // Accessible on LAN
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),  // @ = src/
        }
    }
}
```

**Note:** PWA plugin is commented out (disabled)

## TypeScript Configuration

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "jsx": "react-jsx",
        "strict": true,
        "paths": {
            "@/*": ["./src/*"]
        }
    }
}
```

## Tailwind Theme

Custom colors defined in `tailwind.config.js`:
```javascript
colors: {
    'bg': '#000000',
    'surface': '#201A17',
    'dune-peach': '#F2C299',
    'apricot-dust': '#E49C69',
    'ember-rock': '#C56C39',
    // ...
}
```

## Build Modes

| Mode | Command | Behavior |
|------|---------|----------|
| Development | `npm run dev` | Hot reload, source maps |
| Production | `npm run build` | Minified, optimized |
| Preview | `npm run preview` | Serve production build locally |

## Secrets Handling

1. **Client-side only** - No server-side secrets
2. `VITE_SUPABASE_ANON_KEY` is **intentionally public** (RLS protects data)
3. `VITE_GEMINI_API_KEY` is exposed in client bundle (**RISK**: should use proxy)
4. Supabase service role key is **never** in frontend (only in Edge Functions)

## Dev vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Build | Vite dev server | `vite build` → static files |
| Source maps | Enabled | Disabled |
| API key exposure | Same | Same (both exposed) |
| PWA | Disabled | Disabled (commented out) |
