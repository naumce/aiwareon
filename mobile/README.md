# AIWear Mobile

React Native (Expo) mobile app for AIWear - AI Virtual Try-On.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Add your Supabase and AI service keys to `.env`

4. Start the development server:
```bash
npm start
```

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start web version

## Project Structure

```
mobile/
├── App.tsx                 # Main app entry
├── src/
│   ├── config.ts           # Environment config
│   ├── theme/              # Design tokens
│   ├── types/              # TypeScript types
│   ├── navigation/         # React Navigation setup
│   │   ├── RootNavigator   # Auth-conditional root
│   │   └── MainTabs        # Bottom tab navigator
│   ├── screens/
│   │   ├── auth/           # Auth flow screens
│   │   │   ├── LandingScreen
│   │   │   ├── LoginScreen
│   │   │   └── ForgotPasswordScreen
│   │   └── main/           # Main app screens
│   │       ├── StudioScreen
│   │       ├── WardrobeScreen
│   │       ├── GalleryScreen
│   │       └── AccountScreen
│   ├── stores/             # Zustand stores
│   │   └── authStore       # Auth state
│   ├── services/           # API services
│   │   └── supabaseClient  # Supabase client
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utility functions
```

## Tech Stack

- **Framework**: Expo SDK 54
- **Navigation**: React Navigation 6
- **State**: Zustand
- **Backend**: Supabase
- **AI**: Fal AI, Google Gemini
