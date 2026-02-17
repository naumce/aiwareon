---
name: frontend-design-system
description: Use when building new frontend pages or components in React/TypeScript. Provides gold standard patterns for page layouts, cards, modals, and color schemes based on Pull Requests, Evaluators V2/V3, and Prompts V2 pages.
---

# Frontend Design System

## Overview

Reference guide for building frontend pages that match the Infere design standard. Based on three gold standard pages: Pull Requests, Evaluators V2/V3, and Prompts V2. Uses OpenAI-inspired color scheme with shadcn/ui components and Tailwind CSS.

## When to Use

Use this skill when:
- Building a new list/overview page
- Creating a detail view or modal
- Implementing card-based layouts
- Applying the color scheme consistently
- Adding animations and interactions

**Don't use for:**
- Backend API design
- Database schema design
- Non-React frameworks

## Quick Pattern Selection

### Decision Tree: What Are You Building?

**List/Overview Page?**
→ Use: Page Layout + Lifecycle Cards + Filters
→ See: `patterns/page-layouts.md`, `patterns/lifecycle-cards.md`

**Creation/Edit Flow?**
→ Use: Prompt Palette Modal
→ See: `patterns/prompt-palette.md`

**Detail/Deep-Dive View?**
→ Use: Detail Sheet (right-sliding panel)
→ See: `patterns/detail-sheets.md`

**Stats or Metrics Display?**
→ Use: Emoji-headed stat sections
→ See: `patterns/stats-display.md`

## Component Matrix

| Page Type | Layout | Cards | Filters | Detail | Modal |
|-----------|--------|-------|---------|--------|-------|
| Pull Requests | ✓ | ✓ | ✓ | - | - |
| Evaluators V2/V3 | ✓ | ✓ | ✓ | ✓ | ✓ |
| Prompts V2 | ✓ | ✓ | ✓ | ✓ | ✓ |

## Color System Quick Reference

**Primary Brand:** OpenAI Green `hsl(163 82% 35%)` = `#10A37F`

**Usage:**
```tsx
// Use Tailwind utilities, not direct colors
<Button className="bg-primary text-primary-foreground">
<Card className="border hover:border-primary/30">
```

**How it works:**
- Colors defined as CSS variables in `index.css`
- Tailwind converts `bg-primary` to `hsl(var(--primary))`
- Dark mode automatically switches values

See `color-scheme.md` for complete palette.

## Common Patterns

### Page Header (3-Tier Structure)

```tsx
<div className="flex-1 overflow-auto">
  {/* Tier 1: Header */}
  <div className="px-6 py-4 border-b">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Title</h1>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
    </div>
  </div>

  {/* Tier 2: Filters */}
  <div className="px-6 py-3 border-b bg-muted/30">
    <div className="flex items-center gap-2">
      <SearchInput />
      <FilterDropdown />
    </div>
  </div>

  {/* Tier 3: Content */}
  <div className="p-6 space-y-3">
    {items.map(item => <LifecycleCard key={item.id} {...item} />)}
  </div>
</div>
```

### Lifecycle Card (Collapsible)

```tsx
<Card className="p-4 hover:border-primary/30 transition-colors">
  {/* Collapsed: Always visible */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <IconBox icon={icon} />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge>{type}</Badge>
          <span>Quick stats</span>
        </div>
      </div>
    </div>
    <Button onClick={() => setExpanded(!expanded)}>
      {expanded ? <ChevronUp /> : <ChevronDown />}
    </Button>
  </div>

  {/* Expanded: Slides in */}
  {expanded && (
    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
      <p>{description}</p>
      <StatSection emoji="📊" title="STATISTICS" stats={stats} />
    </div>
  )}
</Card>
```

### Stat Section (Emoji Header)

```tsx
<div className="p-3 rounded-md bg-muted/50 border">
  <div className="text-xs font-semibold text-muted-foreground mb-2">
    📊 STATISTICS
  </div>
  <div className="grid grid-cols-2 gap-2 text-sm">
    <div>
      <span className="text-muted-foreground">Requests:</span>
      <span className="ml-2 font-medium">1,234</span>
    </div>
  </div>
</div>
```

## Deep Dive Documentation

**Complete patterns with code examples:**
- `color-scheme.md` - Full color palette and usage
- `patterns/page-layouts.md` - 3-tier page structure
- `patterns/lifecycle-cards.md` - Collapsible cards
- `patterns/detail-sheets.md` - Right-sliding panels (800px)
- `patterns/prompt-palette.md` - Universal modal system
- `patterns/stats-display.md` - Metrics and emoji sections
- `patterns/navigation.md` - Sidebar and routing
- `patterns/interactions.md` - Animations, hover, keyboard

## Technology Stack

- React 18/19 + TypeScript
- Vite bundling
- TanStack Query (server state)
- Zustand (client state)
- shadcn/ui + Radix primitives
- Tailwind CSS
- Lucide React icons
- Framer Motion (animations)

## Common Mistakes

❌ **Using hex colors directly**: Use Tailwind utilities instead
```tsx
// Bad
<div style={{ backgroundColor: '#10A37F' }}>
// Good
<div className="bg-primary">
```

❌ **Inconsistent spacing**: Stick to the 3-tier layout
```tsx
// Bad - random padding
<div className="px-4 py-2">
// Good - standard tier 1
<div className="px-6 py-4 border-b">
```

❌ **Missing hover states**: Cards need hover feedback
```tsx
// Bad
<Card className="p-4">
// Good
<Card className="p-4 hover:border-primary/30 transition-colors">
```

❌ **No animations**: Expansion should be smooth
```tsx
// Bad - instant appearance
{expanded && <Content />}
// Good - animated entrance
{expanded && <Content className="animate-in slide-in-from-top-2" />}
```

## Real-World Examples

**Reference implementations in codebase:**
- Pull Requests: `frontend-service/user-frontend/src/pages/git/AllPullRequestsPage.tsx`
- Evaluators V2: `frontend-service/user-frontend/src/pages/evaluators/EvaluatorsV2.tsx`
- Prompts V2: `frontend-service/user-frontend/src/pages/promptsv2/PromptsV2.tsx`
- Prompt Detail Sheet: `frontend-service/user-frontend/src/components/promptsv2/PromptDetailSheet.tsx`
- Prompt Palette: `frontend-service/user-frontend/src/promptpalette/components/PromptBuilderModal.tsx`
