# 02 - Features & Capabilities

## Main Features

### 1. Virtual Try-On Generation
- Upload reference human photo
- Upload target garment image
- AI generates photorealistic composite
- Preserves face, hair, accessories

### 2. Video Animation
- Convert static try-on to video
- Fabric physics simulation
- Multiple pose options (Mirror, Editorial, Catwalk)

### 3. Quality Levels
- **Standard** (1 credit): Faster, lower resolution
- **Studio** (2 credits): Higher fidelity, 4K output

### 4. Saved Models
- Save up to 5 reference photos locally
- Quick-select for repeat generations
- Stored in localStorage (compressed JPEG)

### 5. Media Library
- Cloud storage for generated media
- Filter by type (image/video)
- Sort by date
- Download capabilities

### 6. Credit System
- New users start with 10 credits
- Deducted on generation (not download)
- Guest users get 2 free shots (localStorage)
- Lemon Squeezy integration for purchases

### 7. Authentication
- Email/password signup/login
- Google OAuth
- Session persistence

## Core Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **Pages** | `src/pages/` | Route-level components |
| **Stores** | `src/stores/` | Zustand state management |
| **Services** | `src/services/` | API/DB communication |
| **Hooks** | `src/hooks/` | Reusable React hooks |
| **Components** | `src/components/` | UI components |

## Key Capabilities

### AI Generation Pipeline
```
User Photo + Garment → geminiService.virtualTryOn()
                              ↓
                    Gemini 2.5/3.0 Image Model
                              ↓
                    Base64 PNG Result
                              ↓
              Optional: geminiService.animateTryOn()
                              ↓
                    Veo 3.1 Video Model
                              ↓
                    MP4 Video Blob
```

### Offline Capabilities
- IndexedDB stores render history (`storageService.ts`)
- LocalStorage stores saved models (`modelStore.ts`)
- Guest shots persist across sessions

### Responsive Design
- Mobile-first with `MobileShell` wrapper
- Bottom navigation for app routes
- Desktop split-screen layout in Studio
