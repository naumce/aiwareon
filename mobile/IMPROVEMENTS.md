# AIWear Mobile - Improvement Roadmap

**Last Updated:** 2026-02-10
**Total Items:** 9 categories, ~35 action items

---

## 🚨 Priority 1: Critical (Security & Stability)

### 1.1 Security Enhancements
**Impact:** High | **Effort:** Medium | **Timeline:** 1-2 days

- [ ] **URGENT: Remove hardcoded Supabase credentials** ([config.ts:10-11](src/config.ts#L10-L11))
  - Move ALL credentials to `.env` with no fallbacks
  - Update config to throw error if required vars missing
  ```typescript
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing required environment variables');
  }
  ```

- [ ] **Migrate to expo-secure-store** for sensitive data
  - Replace AsyncStorage with SecureStore for tokens
  - Implement encrypted credential storage
  ```bash
  npx expo install expo-secure-store
  ```

- [ ] **Add request signing for API calls**
  - Implement HMAC signature for Supabase requests
  - Add API request validation layer

- [ ] **Implement rate limiting**
  - Add client-side rate limiting for AI generation
  - Prevent abuse with exponential backoff
  - Max 5 generations per minute per user

- [ ] **Add image upload validation**
  - Validate file size (max 10MB)
  - Check MIME types (jpeg, png only)
  - Sanitize file names
  - Scan for malicious content

- [ ] **Add biometric authentication**
  ```bash
  npx expo install expo-local-authentication
  ```
  - Face ID / Touch ID for sensitive operations
  - Secure app re-entry after background

### 1.2 Error Handling & Stability
**Impact:** High | **Effort:** Low | **Timeline:** 4 hours

- [ ] **Add Error Boundary component**
  ```typescript
  // src/components/ErrorBoundary.tsx
  import React from 'react';
  import { View, Text, Button } from 'react-native';

  export class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      // Log to error tracking service (Sentry)
      console.error('Error caught:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <View>
            <Text>Something went wrong</Text>
            <Button title="Restart" onPress={() => this.setState({ hasError: false })} />
          </View>
        );
      }
      return this.props.children;
    }
  }
  ```

- [ ] **Create proper SplashScreen component**
  - Replace `null` return in [RootNavigator.tsx:40](src/navigation/RootNavigator.tsx#L40)
  - Add animated logo
  - Show loading progress

- [ ] **Add global error handler**
  ```typescript
  // Catch unhandled promise rejections
  if (__DEV__) {
    require('react-native').LogBox.ignoreLogs(['Warning: ...']);
  }
  ```

---

## ⚡ Priority 2: High (Developer Experience & Quality)

### 2.1 Code Quality & Linting
**Impact:** High | **Effort:** Low | **Timeline:** 2 hours

- [ ] **Setup ESLint + Prettier**
  ```bash
  npm install -D \
    eslint \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin \
    eslint-plugin-react \
    eslint-plugin-react-native \
    prettier \
    eslint-config-prettier \
    eslint-plugin-prettier
  ```

- [ ] **Create `.eslintrc.js`**
  ```javascript
  module.exports = {
    root: true,
    extends: [
      'expo',
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-native/all',
      'prettier',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-native'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'warn',
    },
  };
  ```

- [ ] **Create `.prettierrc.js`**
  ```javascript
  module.exports = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 4,
  };
  ```

- [ ] **Add Git hooks with Husky**
  ```bash
  npm install -D husky lint-staged
  npx husky init
  ```

- [ ] **Configure lint-staged**
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
  ```

### 2.2 Build & Development Scripts
**Impact:** Medium | **Effort:** Low | **Timeline:** 30 minutes

- [ ] **Add missing package.json scripts**
  ```json
  {
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web",
      "build": "eas build --platform all",
      "build:android": "eas build --platform android",
      "build:ios": "eas build --platform ios",
      "eject": "expo eject",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "lint": "eslint src/ --ext .ts,.tsx",
      "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
      "format": "prettier --write \"src/**/*.{ts,tsx}\"",
      "type-check": "tsc --noEmit",
      "validate": "npm run type-check && npm run lint && npm run test",
      "clean": "rm -rf node_modules .expo .expo-shared ios/build android/build",
      "clean:install": "npm run clean && npm install"
    }
  }
  ```

### 2.3 Testing Framework
**Impact:** High | **Effort:** Medium | **Timeline:** 1 day

- [ ] **Setup Jest + React Native Testing Library**
  ```bash
  npm install -D \
    jest \
    @testing-library/react-native \
    @testing-library/jest-native \
    @types/jest
  ```

- [ ] **Create `jest.config.js`**
  ```javascript
  module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.stories.tsx',
    ],
  };
  ```

- [ ] **Write unit tests for stores**
  - `authStore.test.ts`
  - `creditStore.test.ts`
  - `generationStore.test.ts`

- [ ] **Write integration tests for key flows**
  - Authentication flow
  - Image generation flow
  - Credit purchase flow

- [ ] **Add E2E tests with Detox**
  ```bash
  npm install -D detox detox-cli
  ```

---

## 📈 Priority 3: Medium (Features & Performance)

### 3.1 Configuration & Environment
**Impact:** Medium | **Effort:** Low | **Timeline:** 2 hours

- [ ] **Create environment-specific configs**
  - `.env.development`
  - `.env.staging`
  - `.env.production`

- [ ] **Update `.env.example` with all required variables**
  ```bash
  # Supabase (Required)
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

  # AI Services (Optional but recommended)
  EXPO_PUBLIC_FAL_API_KEY=your-fal-key
  EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key

  # Feature Flags
  EXPO_PUBLIC_ENABLE_ANALYTICS=true
  EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true

  # App Config
  EXPO_PUBLIC_API_TIMEOUT=30000
  EXPO_PUBLIC_MAX_IMAGE_SIZE=10485760
  ```

- [ ] **Add startup validation**
  ```typescript
  // src/config.ts
  export function initializeApp() {
    const validation = validateConfig();

    if (!validation.isValid) {
      console.error('Missing required config:', validation.missing);
      Alert.alert(
        'Configuration Error',
        'App is not properly configured. Please check environment variables.'
      );
    }

    if (!hasAIServices()) {
      console.warn('No AI services configured - some features will be disabled');
    }
  }
  ```

- [ ] **Add config TypeScript types**
  ```typescript
  export type Environment = 'development' | 'staging' | 'production';
  export const ENV: Environment = process.env.NODE_ENV as Environment;
  ```

### 3.2 Performance Optimizations
**Impact:** Medium | **Effort:** Medium | **Timeline:** 2 days

- [ ] **Enable Hermes engine** (if not already enabled)
  ```json
  // app.json
  "jsEngine": "hermes"
  ```

- [ ] **Add React.memo() to expensive components**
  - Gallery image cards
  - Wardrobe item renderers
  - Studio preview components

- [ ] **Implement FlatList optimizations**
  ```typescript
  <FlatList
    data={items}
    renderItem={renderItem}
    keyExtractor={(item) => item.id}
    // Performance props
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    updateCellsBatchingPeriod={50}
    initialNumToRender={10}
    windowSize={5}
    // Memory optimization
    getItemLayout={(data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
  />
  ```

- [ ] **Add image caching with react-native-fast-image**
  ```bash
  npm install react-native-fast-image
  ```

- [ ] **Implement lazy loading for screens**
  ```typescript
  const StudioScreen = React.lazy(() => import('./screens/main/StudioScreen'));
  ```

- [ ] **Add bundle size analysis**
  ```bash
  npx expo-size
  ```

- [ ] **Optimize bundle splitting**
  - Lazy load AI service modules
  - Code split by route

### 3.3 Offline Support & Network Handling
**Impact:** Medium | **Effort:** Medium | **Timeline:** 1 day

- [ ] **Install network info library**
  ```bash
  npx expo install @react-native-community/netinfo
  ```

- [ ] **Create useNetworkStatus hook**
  ```typescript
  // src/hooks/useNetworkStatus.ts
  import { useEffect, useState } from 'react';
  import NetInfo from '@react-native-community/netinfo';

  export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState(true);
    const [isInternetReachable, setIsInternetReachable] = useState(true);

    useEffect(() => {
      return NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected ?? false);
        setIsInternetReachable(state.isInternetReachable ?? false);
      });
    }, []);

    return { isConnected, isInternetReachable };
  }
  ```

- [ ] **Add offline banner component**
  ```typescript
  {!isConnected && <OfflineBanner />}
  ```

- [ ] **Implement queue for failed requests**
  - Store failed generations
  - Retry when connection restored
  - Show sync status

- [ ] **Add AsyncStorage caching**
  - Cache user data
  - Cache generated images metadata
  - Implement cache invalidation strategy

---

## 🚀 Priority 4: Nice-to-Have (Enhancement)

### 4.1 Architecture & Missing Features
**Impact:** Medium | **Effort:** High | **Timeline:** 1 week

- [ ] **Implement deep linking**
  ```typescript
  // app.json
  "scheme": "aiwear",
  "ios": {
    "associatedDomains": ["applinks:aiwear.app"]
  },
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "data": {
          "scheme": "https",
          "host": "aiwear.app"
        }
      }
    ]
  }
  ```

- [ ] **Setup push notifications**
  ```bash
  npx expo install expo-notifications expo-device
  ```
  - Generation complete notifications
  - Credit purchase confirmations
  - Marketing campaigns

- [ ] **Add analytics integration**
  ```bash
  npx expo install expo-analytics-amplitude
  # OR
  npx expo install @segment/analytics-react-native
  ```
  - Track screen views
  - Track user events (generations, purchases)
  - Track errors and crashes

- [ ] **Implement crash reporting**
  ```bash
  npx expo install sentry-expo
  ```

- [ ] **Add feature flags system**
  ```typescript
  // src/services/featureFlags.ts
  export const featureFlags = {
    enableNewStudio: false,
    enableSocialSharing: true,
    enableAdvancedEditing: false,
  };
  ```

- [ ] **Add app tour / onboarding**
  - First-time user walkthrough
  - Feature highlights
  - Tutorial screens

### 4.2 Build & Deployment (EAS)
**Impact:** High | **Effort:** Medium | **Timeline:** 1 day

- [ ] **Install EAS CLI**
  ```bash
  npm install -g eas-cli
  eas login
  ```

- [ ] **Configure EAS Build**
  ```bash
  eas build:configure
  ```

- [ ] **Create `eas.json`**
  ```json
  {
    "cli": {
      "version": ">= 7.0.0"
    },
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal",
        "ios": {
          "simulator": true
        }
      },
      "preview": {
        "distribution": "internal",
        "ios": {
          "simulator": false
        }
      },
      "production": {
        "autoIncrement": true
      }
    },
    "submit": {
      "production": {
        "ios": {
          "appleId": "your-apple-id@example.com",
          "ascAppId": "1234567890"
        },
        "android": {
          "serviceAccountKeyPath": "./secrets/google-play-key.json",
          "track": "internal"
        }
      }
    }
  }
  ```

- [ ] **Setup CI/CD pipeline**
  - GitHub Actions for automated builds
  - Automated testing on PR
  - Deploy to TestFlight / Google Play Internal Testing

- [ ] **Create build scripts**
  ```json
  {
    "scripts": {
      "build:dev": "eas build --profile development --platform all",
      "build:preview": "eas build --profile preview --platform all",
      "build:prod": "eas build --profile production --platform all",
      "submit:ios": "eas submit --platform ios",
      "submit:android": "eas submit --platform android"
    }
  }
  ```

### 4.3 Documentation
**Impact:** Low | **Effort:** Medium | **Timeline:** 2 days

- [ ] **Create comprehensive README**
  - Prerequisites
  - Detailed setup instructions
  - Environment variable guide
  - Troubleshooting section

- [ ] **Add API integration guide**
  - `docs/API_INTEGRATION.md`
  - Supabase setup
  - Fal.ai integration
  - Gemini API setup

- [ ] **Document state management patterns**
  - `docs/STATE_MANAGEMENT.md`
  - Zustand store structure
  - When to use stores vs local state
  - Best practices

- [ ] **Create component usage guide**
  - `docs/COMPONENTS.md`
  - UI component library
  - Usage examples
  - Props documentation

- [ ] **Add contribution guidelines**
  - `CONTRIBUTING.md`
  - Code style guide
  - PR process
  - Commit message conventions

- [ ] **Create testing guide**
  - `docs/TESTING.md`
  - How to write tests
  - Testing patterns
  - E2E test setup

- [ ] **Add architecture decision records (ADRs)**
  - `docs/adr/`
  - Document key technical decisions
  - Why Zustand over Redux
  - Why Expo over bare React Native

### 4.4 Monorepo Integration
**Impact:** Medium | **Effort:** Medium | **Timeline:** 1 day

- [ ] **Setup workspace in root package.json**
  ```json
  {
    "workspaces": [
      "mobile",
      "web",
      "backend"
    ]
  }
  ```

- [ ] **Create shared packages**
  ```
  packages/
  ├── shared-types/      # Shared TypeScript types
  ├── shared-utils/      # Shared utility functions
  └── shared-config/     # Shared configuration
  ```

- [ ] **Share types between mobile/web/backend**
  ```typescript
  // packages/shared-types/src/user.ts
  export interface User {
    id: string;
    email: string;
    credits: number;
  }
  ```

- [ ] **Centralize shared utilities**
  - Image processing utils
  - Validation functions
  - Constants and enums

- [ ] **Create unified build pipeline**
  - Build all projects with one command
  - Shared linting configuration
  - Shared TypeScript config base

---

## 📊 Implementation Timeline

### Week 1: Critical Items
- ✅ Fix security issues (hardcoded credentials)
- ✅ Add error boundary
- ✅ Create splash screen
- ✅ Setup ESLint + Prettier
- ✅ Add missing scripts

### Week 2: Quality & Testing
- ✅ Setup testing framework
- ✅ Write core unit tests
- ✅ Add environment validation
- ✅ Implement offline support

### Week 3: Performance & Features
- ✅ Optimize rendering performance
- ✅ Add deep linking
- ✅ Setup push notifications
- ✅ Add analytics

### Week 4: Build & Deploy
- ✅ Configure EAS Build
- ✅ Setup CI/CD pipeline
- ✅ Create documentation
- ✅ Monorepo integration

---

## 🎯 Success Metrics

### Security
- [ ] Zero hardcoded credentials in codebase
- [ ] All sensitive data in SecureStore
- [ ] Rate limiting active on all AI endpoints

### Performance
- [ ] App launch time < 3 seconds
- [ ] Gallery scrolling at 60 FPS
- [ ] Bundle size < 20MB

### Quality
- [ ] Test coverage > 70%
- [ ] Zero ESLint errors
- [ ] Zero TypeScript errors

### User Experience
- [ ] Offline mode functional
- [ ] Error recovery graceful
- [ ] Loading states everywhere

---

## 📝 Notes

- **Security items should be completed FIRST** - do not deploy to production until Priority 1 is complete
- Testing framework should be set up early to enable TDD for new features
- Performance optimizations can be done incrementally
- Documentation should be updated as features are implemented
- Consider using feature branches for each major improvement category

---

## 🔗 Related Files

- [package.json](package.json) - Dependencies and scripts
- [app.json](app.json) - Expo configuration
- [tsconfig.json](tsconfig.json) - TypeScript configuration
- [src/config.ts](src/config.ts) - Environment configuration
- [.env.example](.env.example) - Environment variable template
- [README.md](README.md) - Project documentation

---

**Generated:** 2026-02-10
**Version:** 1.0
**Status:** 🟡 In Progress
