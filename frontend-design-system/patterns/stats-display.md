# Stats Display Pattern

## Overview

Stats are displayed consistently using emoji-headed sections with compact metric cards. Used in lifecycle cards, detail sheets, and dashboard views.

## Stat Section Format

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
    <div>
      <span className="text-muted-foreground">Latency:</span>
      <span className="ml-2 font-medium">245ms</span>
      <TrendIndicator value={-12} className="ml-1" />
    </div>
    <div>
      <span className="text-muted-foreground">Success:</span>
      <span className="ml-2 font-medium text-success">98.5%</span>
    </div>
    <div>
      <span className="text-muted-foreground">Cost:</span>
      <span className="ml-2 font-medium">$0.12</span>
    </div>
  </div>
</div>
```

## Standard Emoji Headers

| Emoji | Section Name | Usage |
|-------|-------------|-------|
| 📊 | STATISTICS | General metrics and numbers |
| 🎯 | EVALUATORS | Evaluation scores |
| 🌳 | BRANCHES | Git branch information |
| 🚀 | DEPLOYMENTS | Deployment status |
| ⚠️ | ERRORS | Error information |
| 💬 | MESSAGES | Message preview |
| 🔄 | USAGE | Usage patterns |
| 📈 | TRENDS | Trend analysis |
| ⏱️ | PERFORMANCE | Performance metrics |

**Header Format:**
```tsx
<div className="text-xs font-semibold text-muted-foreground mb-2">
  📊 SECTION_NAME
</div>
```

## Trend Indicator Component

```tsx
interface TrendIndicatorProps {
  value: number; // Percentage change
  showValue?: boolean;
}

export function TrendIndicator({ value, showValue = true }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <span className={cn(
      "inline-flex items-center text-xs",
      isPositive && "text-success",
      value < 0 && "text-destructive",
      isNeutral && "text-muted-foreground"
    )}>
      {!isNeutral && (
        isPositive ? (
          <TrendingUp className="h-3 w-3 mr-0.5" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-0.5" />
        )
      )}
      {showValue && `${value > 0 ? '+' : ''}${value}%`}
    </span>
  );
}
```

## Stat Grid Layouts

### 2-Column (Default)

```tsx
<div className="grid grid-cols-2 gap-2 text-sm">
  <div>
    <span className="text-muted-foreground">Label:</span>
    <span className="ml-2 font-medium">Value</span>
  </div>
  {/* More stats */}
</div>
```

### 3-Column (More Stats)

```tsx
<div className="grid grid-cols-3 gap-2 text-sm">
  <div>
    <span className="text-muted-foreground">Requests:</span>
    <span className="ml-2 font-medium">1,234</span>
  </div>
  <div>
    <span className="text-muted-foreground">Latency:</span>
    <span className="ml-2 font-medium">245ms</span>
  </div>
  <div>
    <span className="text-muted-foreground">Success:</span>
    <span className="ml-2 font-medium">98%</span>
  </div>
</div>
```

### Single Column (Detailed)

```tsx
<div className="space-y-2 text-sm">
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">Total Requests</span>
    <span className="font-medium">1,234</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">Avg Latency</span>
    <span className="font-medium">245ms</span>
  </div>
</div>
```

## Large Metric Cards

For dashboard views:

```tsx
<div className="p-6 rounded-lg border bg-card">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-muted-foreground">Total Requests</span>
    <TrendIndicator value={12} />
  </div>
  <div className="text-3xl font-bold">1,234</div>
  <p className="text-xs text-muted-foreground mt-1">
    Last 24 hours
  </p>
</div>
```

## Multiple Section Example

```tsx
<div className="space-y-3">
  {/* Statistics */}
  <div className="p-3 rounded-md bg-muted/50 border">
    <div className="text-xs font-semibold text-muted-foreground mb-2">
      📊 STATISTICS
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <span className="text-muted-foreground">Requests:</span>
        <span className="ml-2 font-medium">1,234</span>
      </div>
      <div>
        <span className="text-muted-foreground">Latency:</span>
        <span className="ml-2 font-medium">245ms</span>
      </div>
    </div>
  </div>

  {/* Evaluators */}
  <div className="p-3 rounded-md bg-muted/50 border">
    <div className="text-xs font-semibold text-muted-foreground mb-2">
      🎯 EVALUATORS
    </div>
    <div className="space-y-1 text-sm">
      {evaluators.map(ev => (
        <div key={ev.id} className="flex items-center justify-between">
          <span>{ev.name}</span>
          <span className="font-medium">{ev.score}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Usage */}
  <div className="p-3 rounded-md bg-muted/50 border">
    <div className="text-xs font-semibold text-muted-foreground mb-2">
      🔄 USAGE
    </div>
    <div className="space-y-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Tokens:</span>
        <span className="font-medium">3</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Branches:</span>
        <span className="font-medium">2</span>
      </div>
    </div>
  </div>
</div>
```

## Status-Colored Values

```tsx
// Success (green)
<span className="font-medium text-success">98.5%</span>

// Warning (orange)
<span className="font-medium text-warning">85%</span>

// Error (red)
<span className="font-medium text-destructive">2.1%</span>

// Neutral
<span className="font-medium">245ms</span>
```

## Inline Quick Stats

For collapsed card state:

```tsx
<div className="flex items-center gap-3 text-sm text-muted-foreground">
  <span>📊 {requests} requests</span>
  <span>⚡ {latency}ms</span>
  <span>✓ {successRate}%</span>
  <span>💰 ${cost}</span>
</div>
```

## Common Mistakes

❌ **Wrong stat box styling**:
```tsx
// Bad - no background
<div className="p-3 border">

// Good - muted background
<div className="p-3 rounded-md bg-muted/50 border">
```

❌ **Missing emoji header**:
```tsx
// Bad - plain text header
<div className="font-semibold mb-2">Statistics</div>

// Good - emoji header
<div className="text-xs font-semibold text-muted-foreground mb-2">
  📊 STATISTICS
</div>
```

❌ **Inconsistent label/value spacing**:
```tsx
// Bad - no spacing
<span className="text-muted-foreground">Requests:</span>
<span className="font-medium">1,234</span>

// Good - ml-2 spacing
<span className="text-muted-foreground">Requests:</span>
<span className="ml-2 font-medium">1,234</span>
```

❌ **Wrong grid for stat count**:
```tsx
// Bad - 3 columns for 4 stats (uneven)
<div className="grid grid-cols-3 gap-2">
  {/* 4 stats here */}
</div>

// Good - 2 columns for even layout
<div className="grid grid-cols-2 gap-2">
  {/* 4 stats here */}
</div>
```

## Real-World Examples

- **Prompt Lifecycle Cards**: `frontend-service/user-frontend/src/components/promptsv2/PromptLifecycleCard.tsx`
- **Evaluator Cards**: `frontend-service/user-frontend/src/components/evaluators/EvaluatorLifecycleCard.tsx`
- **Detail Sheets**: `frontend-service/user-frontend/src/components/promptsv2/PromptDetailSheet.tsx`
