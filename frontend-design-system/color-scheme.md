# Color Scheme - OpenAI Inspired

## Overview

The Infere frontend uses an OpenAI-inspired color palette with signature green (`#10A37F`) as the primary brand color. The system supports both light and dark modes with smooth transitions.

## How Colors Work

**Two-Step System:**

1. **Define in CSS** (`index.css`):
```css
:root {
  --primary: 163 82% 35%;        /* HSL values for #10A37F */
  --background: 0 0% 100%;        /* White */
}

.dark {
  --primary: 163 82% 35%;         /* Same green! */
  --background: 210 20% 5%;       /* Dark blue-black */
}
```

2. **Use in components via Tailwind**:
```tsx
<Button className="bg-primary text-primary-foreground">
// Compiles to: background-color: hsl(var(--primary))
```

**Why this approach?**
- Change colors once, affects entire app
- Dark mode switches automatically
- No need to remember hex codes

## Primary Brand Color

**OpenAI Green:**
- Value: `hsl(163 82% 35%)` = `#10A37F`
- Unified across light and dark modes
- Hover states:
  - Light: `hsl(163 82% 33%)` = `#0E9B74` (slightly darker)
  - Dark: `hsl(163 80% 39%)` = `#13B187` (slightly brighter)

**Usage:**
```tsx
// Primary actions
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">

// Accent/highlight
<Card className="border hover:border-primary/30">

// Icon boxes
<div className="bg-primary/10">
  <Icon className="text-primary" />
</div>
```

## Light Mode Colors

**Structural:**
- Background: `0 0% 100%` = `#FFFFFF` (pure white)
- Foreground: `0 0% 9%` = `#171717` (near black)
- Card: `0 0% 100%` = `#FFFFFF`
- Muted: `0 0% 98%` = `#FAFAFA` (very light gray)
- Border: `0 0% 90%` = `#E5E5E5` (light borders)

**Interactive:**
- Secondary: `0 0% 94%` = `#F0F0F0` (light gray)
- Accent: `163 45% 94%` = `#E8F7F4` (subtle mint highlight)
- Input: `0 0% 98%` = `#FAFAFA`

**Sidebar:**
- Background: `0 0% 98%` = `#FAFAFA`
- Accent (hover): `0 0% 94%` = `#F0F0F0`

## Dark Mode Colors

**Structural:**
- Background: `210 20% 5%` = `#0B0D0F` (warm dark blue-black, NOT pure black)
- Foreground: `0 0% 90%` = `#E6E6E6` (soft white)
- Card: `210 8% 10%` = `#161819` (slightly lighter than bg)
- Muted: `210 14% 8%` = `#111315` (dark but visible)
- Border: `0 0% 16%` = `#2A2A2A` (visible but subtle)

**Interactive:**
- Secondary: `210 10% 11%` = `#1B1D1F` (subtle variation)
- Accent: `163 18% 15%` = `#1E2A27` (dark mint)
- Input: `210 8% 10%` = `#161819`

**Sidebar:**
- Background: `210 14% 8%` = `#111315` (darker than main bg)
- Accent (hover): `210 10% 11%` = `#1B1D1F`

**Why warm dark?**
Pure black (`#000000`) is harsh on eyes. The slight blue tint creates a more professional, comfortable reading experience.

## Status Colors

**Consistent across light and dark modes:**

- **Success**: `hsl(142 76% 36%)` - Green for success states
- **Warning**: `hsl(38 92% 50%)` - Orange for warnings
- **Destructive**: `hsl(0 72% 51%)` - Red for destructive actions

**Usage:**
```tsx
<Alert variant="success">Operation successful</Alert>
<Badge variant="warning">Pending</Badge>
<Button variant="destructive">Delete</Button>
```

## Chart Colors

**5-color palette for data visualization:**

1. `--chart-1`: `163 82% 35%` (OpenAI Green)
2. `--chart-2`: `142 76% 36%` (Success Green)
3. `--chart-3`: `38 92% 50%` (Warning Orange)
4. `--chart-4`: `217 91% 60%` (Info Blue)
5. `--chart-5`: `0 72% 51%` (Destructive Red)

**Dark mode adjustments:**
Slightly brighter versions (35%→40%, 50%→55%) for better visibility.

## Special Effects

**Glass Cards:**
```tsx
<Card className="glass-card">
// Light: bg-white/80 backdrop-blur-md
// Dark: bg-black/50 backdrop-blur-md
```

**Gradient Text:**
```tsx
<h1 className="gradient-text">
// bg-gradient-to-r from-purple-600 to-indigo-600
```

**Custom Scrollbar:**
- Track: Transparent
- Thumb: `hsl(var(--muted-foreground) / 0.3)`
- Hover: `hsl(var(--muted-foreground) / 0.5)`

## Mode Transition

**Smooth animation:**
```css
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

All interactive elements (cards, buttons, inputs) have 300ms transitions.

## Opacity Modifiers

**Tailwind opacity syntax:**
```tsx
// 10% opacity for subtle backgrounds
<div className="bg-primary/10">

// 30% opacity for hover states
<Card className="hover:border-primary/30">

// 50% opacity for muted backgrounds
<div className="bg-muted/50">

// 80% opacity for glass effects
<div className="bg-white/80 dark:bg-black/80">
```

## Common Color Combinations

**Primary Button:**
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
```

**Card with hover:**
```tsx
<Card className="border hover:border-primary/30 transition-colors">
```

**Icon Box:**
```tsx
<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
  <Icon className="h-5 w-5 text-primary" />
</div>
```

**Stat Section:**
```tsx
<div className="p-3 rounded-md bg-muted/50 border">
  <div className="text-xs font-semibold text-muted-foreground">
    📊 STATISTICS
  </div>
</div>
```

**Muted Text:**
```tsx
<p className="text-sm text-muted-foreground">Description</p>
```

## CSS Variables Reference

**Complete list in `index.css`:**

```
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--primary-hover
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--success
--success-foreground
--warning
--warning-foreground
--destructive
--destructive-foreground
--border
--input
--ring
--radius (0.75rem)
--sidebar-background
--sidebar-foreground
--sidebar-primary
--sidebar-accent
--sidebar-border
--code-background
--chart-1 through --chart-5
```

## Common Mistakes

❌ **Using hex colors directly**:
```tsx
// Bad
<div style={{ color: '#10A37F' }}>
// Good
<div className="text-primary">
```

❌ **Forgetting dark mode**:
```tsx
// Bad - only works in light mode
<div className="bg-white text-black">
// Good - adapts to mode
<div className="bg-background text-foreground">
```

❌ **Wrong opacity syntax**:
```tsx
// Bad - invalid
<div className="bg-primary opacity-10">
// Good - correct syntax
<div className="bg-primary/10">
```

❌ **Inconsistent status colors**:
```tsx
// Bad - custom red
<span className="text-red-500">Error</span>
// Good - semantic color
<span className="text-destructive">Error</span>
```
