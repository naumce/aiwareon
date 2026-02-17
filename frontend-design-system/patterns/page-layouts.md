# Page Layout Pattern

## Overview

All gold standard pages (Pull Requests, Evaluators, Prompts V2) follow a consistent 3-tier structure that creates visual hierarchy and predictable user experience.

## 3-Tier Structure

### Tier 1: Page Header
**Purpose:** Identity and context

```tsx
<div className="px-6 py-4 border-b">
  <div className="flex items-center gap-3">
    {/* Icon Box */}
    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <GitPullRequest className="h-5 w-5 text-primary" />
    </div>

    {/* Title & Description */}
    <div>
      <h1 className="text-2xl font-semibold">Pull Requests</h1>
      <p className="text-sm text-muted-foreground">
        Review and manage pull requests across all repositories
      </p>
    </div>
  </div>
</div>
```

**Key elements:**
- Icon box: `h-10 w-10` with `bg-primary/10` and `text-primary` icon
- Title: `text-2xl font-semibold`
- Description: `text-sm text-muted-foreground`
- Spacing: `px-6 py-4 border-b`

### Tier 2: Filters/Controls
**Purpose:** Actions and filtering

```tsx
<div className="px-6 py-3 border-b bg-muted/30">
  <div className="flex items-center gap-2">
    {/* Search */}
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-9"
      />
    </div>

    {/* Filters */}
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by..." />
      </SelectTrigger>
    </Select>

    {/* Actions */}
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Create New
    </Button>
  </div>
</div>
```

**Key elements:**
- Background: `bg-muted/30` for subtle distinction
- Layout: `flex items-center gap-2`
- Search with icon: `relative` container, absolute positioned icon
- Spacing: `px-6 py-3 border-b`

### Tier 3: Content Area
**Purpose:** Main content display

```tsx
<div className="p-6 space-y-3">
  {items.map(item => (
    <LifecycleCard key={item.id} {...item} />
  ))}
</div>
```

**Key elements:**
- Spacing: `p-6` for padding, `space-y-3` for vertical gaps
- Cards or content items go here

## Complete Example

```tsx
export function MyListPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="flex-1 overflow-auto">
      {/* Tier 1: Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Page Title</h1>
            <p className="text-sm text-muted-foreground">Page description</p>
          </div>
        </div>
      </div>

      {/* Tier 2: Filters */}
      <div className="px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Tier 3: Content */}
      <div className="p-6 space-y-3">
        {filteredItems.map(item => (
          <LifecycleCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
```

## Responsive Behavior

### Mobile (< 640px)
```tsx
// Reduce padding
<div className="px-4 py-3"> {/* instead of px-6 py-4 */}

// Stack filters vertically
<div className="flex flex-col gap-2"> {/* instead of flex-row */}

// Full-width search
<div className="relative w-full"> {/* instead of max-w-sm */}
```

### Desktop (>= 640px)
```tsx
// Standard spacing
<div className="px-6 py-4">

// Horizontal layout
<div className="flex items-center gap-2">
```

## Variations

### With Quick Stats Bar

Add between Tier 1 and Tier 2:

```tsx
<div className="px-6 py-3 bg-muted/20 border-b">
  <div className="flex items-center gap-6">
    <div className="text-sm">
      <span className="text-muted-foreground">Total:</span>
      <span className="ml-2 font-semibold">{total}</span>
    </div>
    <div className="text-sm">
      <span className="text-muted-foreground">Active:</span>
      <span className="ml-2 font-semibold text-success">{active}</span>
    </div>
  </div>
</div>
```

### With Collapsible Insights

Add insight section that can collapse:

```tsx
<Collapsible open={showInsights} onOpenChange={setShowInsights}>
  <div className="px-6 py-3 border-b bg-muted/20">
    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
      <ChevronDown className="h-4 w-4" />
      Insights
    </CollapsibleTrigger>
  </div>
  <CollapsibleContent>
    <div className="px-6 py-4 border-b">
      {/* Insights content */}
    </div>
  </CollapsibleContent>
</Collapsible>
```

## Common Mistakes

❌ **Inconsistent padding**:
```tsx
// Bad - random values
<div className="px-4 py-2">
<div className="px-8 py-3">

// Good - standard tiers
<div className="px-6 py-4"> {/* Tier 1 */}
<div className="px-6 py-3"> {/* Tier 2 */}
<div className="p-6">       {/* Tier 3 */}
```

❌ **Missing icon box**:
```tsx
// Bad - just icon
<Icon className="h-5 w-5" />

// Good - icon in box
<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
  <Icon className="h-5 w-5 text-primary" />
</div>
```

❌ **Wrong border placement**:
```tsx
// Bad - border on bottom of content
<div className="p-6 border-b">

// Good - border on header/filter sections
<div className="px-6 py-4 border-b"> {/* Header */}
<div className="p-6">                 {/* Content - no border */}
```

❌ **Missing background on filters**:
```tsx
// Bad - no visual distinction
<div className="px-6 py-3 border-b">

// Good - subtle background
<div className="px-6 py-3 border-b bg-muted/30">
```

## Real-World Examples

- **Pull Requests**: `frontend-service/user-frontend/src/pages/git/AllPullRequestsPage.tsx`
- **Evaluators V2**: `frontend-service/user-frontend/src/pages/evaluators/EvaluatorsV2.tsx`
- **Prompts V2**: `frontend-service/user-frontend/src/pages/promptsv2/PromptsV2.tsx`
