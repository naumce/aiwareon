# Apple HIG Designer Skill - Quick Guide

## ✅ Installation Status
**Installed:** User-level (`~/.claude/skills/apple-hig-designer`)
**Status:** Active and ready to use

---

## 🎯 What It Does

This skill helps Claude Code design professional iOS/macOS-style interfaces that follow Apple's Human Interface Guidelines (HIG):

- **SF Pro Typography** system with exact letter-spacing
- **Apple System Colors** with automatic light/dark mode
- **8pt Grid Spacing System**
- **HIG-Compliant Components** (buttons, cards, inputs, sheets, alerts, etc.)
- **Apple-Standard Animations** with cubic-bezier easing
- **Accessibility** built-in (WCAG AA compliant)

---

## 🚀 How to Use It

### Basic Usage

Just mention it in your requests:

```
"Use apple-hig-designer to create a login screen"
"Design an Apple-style profile page"
"Create HIG-compliant components for the Studio screen"
```

### Trigger Phrases

- "Design an Apple-style..."
- "Create a HIG-compliant..."
- "iOS-style component"
- "Following HIG principles..."

### Advanced Usage (Style Fusion)

Combine with other aesthetics:

```
"Using apple-hig-designer with a luxury brand aesthetic, create a wardrobe screen"
"Apple HIG + minimalist cyberpunk for the gallery"
```

---

## 📱 Perfect for AIWear Mobile

Since your mobile app is built with **React Native + Expo**, this skill will help you:

### 1. **Consistent Apple-Style UI**
```
"Use apple-hig-designer to redesign the StudioScreen with proper HIG components"
```

### 2. **Bottom Tab Navigation**
```
"Create an Apple HIG-compliant bottom tab bar for Studio, Wardrobe, Gallery, Account"
```

### 3. **Modals & Sheets**
```
"Design a HIG-compliant sheet for the BuyCreditsScreen with detents"
```

### 4. **Authentication Screens**
```
"Apple-style login screen with biometric authentication UI"
```

### 5. **Cards & Lists**
```
"HIG-compliant wardrobe item cards with swipe actions"
```

---

## 🎨 Key Features for Mobile

### Typography
- Uses SF Pro Display (≥20pt) and SF Pro Text (<20pt)
- Automatic fallback to system fonts: `-apple-system, BlinkMacSystemFont`
- Exact letter-spacing values from Apple's Figma kit

### Colors
- System colors that adapt to light/dark mode
- Semantic colors (label-primary, bg-secondary, etc.)
- Translucent fills and materials

### Touch Targets
- Minimum 44×44pt (iOS standard)
- Proper padding for accessibility

### Components
- **Buttons**: Primary (capsule), Secondary, Destructive
- **Cards**: Solid backgrounds (default) or glass effects (optional)
- **Inputs**: Rounded with focus states
- **Sheets**: Bottom sheets with grabber and detents
- **Alerts**: Center modals with proper button layouts
- **Lists**: Grouped style with inset separators
- **Tab Bars**: Bottom tabs with SF Symbols

---

## 📋 Example Requests for AIWear Mobile

### Studio Screen
```
"Use apple-hig-designer to create the Studio screen with:
- Image upload area with dashed border
- Camera/gallery buttons
- Generation controls (style selector, quality toggle)
- Generate button (prominent CTA)
- Recent generations preview grid"
```

### Wardrobe Screen
```
"Apple HIG wardrobe screen with:
- Grid of clothing item cards
- Add item floating action button
- Category filter tabs at top
- Swipe-to-delete on cards"
```

### Gallery Screen
```
"HIG-compliant gallery with:
- Masonry grid of generated images
- Pull-to-refresh
- Image detail sheet on tap
- Share/save actions"
```

### Account Screen
```
"Apple-style account screen with:
- Profile header with avatar
- Credits display card
- Grouped list sections (settings, subscription, support)
- Sign out button"
```

### Buy Credits Modal
```
"HIG sheet for buying credits:
- Credit packages as cards
- Apple-style pricing display
- Purchase button (prominent)
- In-app purchase integration"
```

---

## 🎯 Best Practices

### 1. **Solid Backgrounds by Default**
Glass/blur effects are only used when explicitly requested:
```
❌ "Create a card" → Will use solid background
✅ "Create a glass card" → Will use glass effect
```

### 2. **Dark Mode Support**
All components automatically support dark mode via:
```css
@media (prefers-color-scheme: dark) { ... }
```

### 3. **Accessibility**
- Minimum contrast ratios (WCAG AA)
- Reduced motion support
- Semantic HTML/proper ARIA labels

### 4. **Platform Conventions**
- Bottom tabs (not top)
- Swipe gestures (back, dismiss)
- System fonts (not custom fonts)

---

## 📚 Skill Resources

The skill includes these reference files:

1. **Skill.md** - Core design principles, component patterns
2. **REFERENCE.md** - Layout patterns, navigation, forms
3. **resources/**
   - `figma-design-tokens.md` - Exact values from Apple's Figma kit
   - `ui-patterns.md` - Full-page code examples
   - `components.jsx` - React component examples
   - `design-tokens.css` - CSS custom properties

---

## 🔄 Integration with IMPROVEMENTS.md

The apple-hig-designer skill will help implement items from [IMPROVEMENTS.md](IMPROVEMENTS.md):

- **Priority 1**: Error boundary, splash screen designs
- **Priority 2**: Component library standardization
- **Priority 3**: UI performance optimizations (consistent styling)
- **Priority 4**: Onboarding screens, feature walkthroughs

---

## 💡 Pro Tips

### Combine with ENV Values
Since you have env configs in `mobile/env/`:
```
"Use apple-hig-designer to create a settings screen that shows the API configuration status from config.ts"
```

### React Native Specific
```
"Apple HIG button component in React Native using TouchableOpacity and StyleSheet"
```

### Navigation Integration
```
"HIG-compliant stack navigator header with back button and title for React Navigation"
```

---

## 🎬 Ready to Start!

Now that the skill is installed, you can start using it immediately:

1. ✅ Skill is active
2. ✅ Mobile project structure analyzed
3. ✅ Ready to design HIG-compliant components

Try it:
```
"Use apple-hig-designer to redesign the LandingScreen with a modern Apple aesthetic"
```

---

**Note:** The skill is installed at user-level, so it's available in all your Claude Code projects, not just this one!
