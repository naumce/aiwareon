# 01 - Project Overview

## What This Project Is

**AiWear** is a Progressive Web Application (PWA) for AI-powered virtual garment try-on. Users upload a reference photo of themselves and a garment image, and the system generates a photorealistic composite showing the user wearing that garment.

## Problem Statement

Fashion e-commerce has high return rates due to customers not knowing how clothes will look on them. AiWear solves this by providing:
- Virtual try-on without physical samples
- High-fidelity neural rendering
- Video animation of garments (fabric movement)

## High-Level Architecture

```
┌─────────────────────────────────────────┐
│           Client (Browser/PWA)          │
│  React 19 + Vite + Tailwind + Zustand   │
└────────────────────┬────────────────────┘
                     │ HTTPS
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌───────────┐
│Supabase │   │ Google AI │   │   Local   │
│  Auth   │   │  Gemini   │   │ IndexedDB │
│   DB    │   │   API     │   │ (History) │
│ Storage │   └───────────┘   └───────────┘
└─────────┘
```

**Key Points:**
- **No custom backend server** - Direct client-to-service communication
- Supabase handles auth, database (PostgreSQL), and file storage
- Google Gemini handles AI image/video generation
- IndexedDB provides offline-first local history

## Tech Stack Summary

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 19.2.3 |
| **Language** | TypeScript | 5.8.2 |
| **Build Tool** | Vite | 6.2.0 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **State** | Zustand | 5.0.9 |
| **Routing** | React Router DOM | 7.11.0 |
| **Animation** | Framer Motion | 11.18.2 |
| **Backend** | Supabase | 2.89.0 |
| **AI** | Google Gemini (@google/genai) | 1.34.0 |
| **PWA** | vite-plugin-pwa | 1.2.0 (disabled) |

## Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML shell, loads Vite |
| `src/main.tsx` | React DOM render root |
| `src/App.tsx` | Router + global providers |
| `vite.config.ts` | Build configuration |

## Design Philosophy

1. **Mobile-first PWA** - Designed primarily for mobile with desktop support
2. **Premium dark aesthetic** - Black background with warm apricot/peach accents
3. **Serverless architecture** - No custom backend, relies on BaaS (Supabase) and AI APIs
4. **Credit-based monetization** - Users purchase credits to generate try-ons
