# Lifecycle Cards Pattern

## Overview

Lifecycle cards are the **core reusable component** for displaying list items with expandable details. Used across Pull Requests, Evaluators, and Prompts V2 pages. Features two states: collapsed (default) and expanded (user-triggered).

## Two-State Design

### Collapsed State (Always Visible)

```tsx
<Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
  <div className="flex items-center justify-between">
    {/* Left: Icon + Title + Badges */}
    <div className="flex items-center gap-3 flex-1">
      {/* Icon Box */}
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      {/* Title + Quick Stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary">{type}</Badge>
          <Badge variant="outline">{category}</Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span>📊 {requests} requests</span>
          <span>⚡ {latency}ms</span>
          <span>✓ {successRate}%</span>
        </div>
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit();
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
  </div>
</Card>
```

**Key Elements:**
- Card padding: `p-4`
- Hover effect: `hover:border-primary/30 transition-colors`
- Icon box: `h-10 w-10 bg-primary/10`
- Title: `font-semibold`
- Quick stats: `text-sm text-muted-foreground` with emoji icons
- Actions: Stop propagation on nested buttons

### Expanded State (Smooth Animation)

```tsx
{expanded && (
  <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
    {/* Description */}
    <p className="text-sm text-muted-foreground">
      {description}
    </p>

    {/* Metadata Line */}
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>Updated {updatedAt}</span>
      <span>•</span>
      <span>v{version}</span>
      <span>•</span>
      <span className="font-mono">{commitHash}</span>
    </div>

    {/* Stats Section */}
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

    {/* Evaluators Section */}
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

    {/* Action Buttons */}
    <div className="flex items-center gap-2 pt-2">
      <Button size="sm" variant="outline">
        <Play className="h-3.5 w-3.5 mr-1.5" />
        Test
      </Button>
      <Button size="sm">
        <Rocket className="h-3.5 w-3.5 mr-1.5" />
        Deploy
      </Button>
      <Button size="sm" variant="outline">
        <GitCompare className="h-3.5 w-3.5 mr-1.5" />
        Compare
      </Button>
    </div>
  </div>
)}
```

**Key Elements:**
- Animation: `animate-in slide-in-from-top-2` (200ms ease-out)
- Spacing: `mt-4 space-y-3`
- Emoji section headers: `📊 STATISTICS`, `🎯 EVALUATORS`, `🌳 BRANCHES`
- Stat boxes: `p-3 rounded-md bg-muted/50 border`
- Action buttons: `size="sm"` with icons

## Complete Component Example

```tsx
interface LifecycleCardProps {
  id: string;
  icon: ReactNode;
  title: string;
  type: string;
  category: string;
  description: string;
  stats: {
    requests: number;
    latency: number;
    successRate: number;
  };
  evaluators?: Array<{ id: string; name: string; score: number }>;
  onEdit?: () => void;
  onDeploy?: () => void;
  defaultExpanded?: boolean;
}

export function LifecycleCard({
  id,
  icon,
  title,
  type,
  category,
  description,
  stats,
  evaluators,
  onEdit,
  onDeploy,
  defaultExpanded = false,
}: LifecycleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCardClick = () => {
    setExpanded(!expanded);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeploy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeploy?.();
  };

  return (
    <Card
      className="p-4 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Collapsed State */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{title}</h3>
              <Badge variant="secondary">{type}</Badge>
              <Badge variant="outline">{category}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>📊 {stats.requests} requests</span>
              <span>⚡ {stats.latency}ms</span>
              <span>✓ {stats.successRate}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded State */}
      {expanded && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
          <p className="text-sm text-muted-foreground">{description}</p>

          {/* Stats Section */}
          <div className="p-3 rounded-md bg-muted/50 border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              📊 STATISTICS
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Requests:</span>
                <span className="ml-2 font-medium">{stats.requests}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Latency:</span>
                <span className="ml-2 font-medium">{stats.latency}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Success:</span>
                <span className="ml-2 font-medium">{stats.successRate}%</span>
              </div>
            </div>
          </div>

          {/* Evaluators (if present) */}
          {evaluators && evaluators.length > 0 && (
            <div className="p-3 rounded-md bg-muted/50 border">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                🎯 EVALUATORS
              </div>
              <div className="space-y-1 text-sm">
                {evaluators.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between">
                    <span>{ev.name}</span>
                    <span className="font-medium">{ev.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="outline">
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Test
            </Button>
            {onDeploy && (
              <Button size="sm" onClick={handleDeploy}>
                <Rocket className="h-3.5 w-3.5 mr-1.5" />
                Deploy
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
```

## Emoji Section Headers

**Standard sections:**
- 📊 STATISTICS - Metrics and numbers
- 🎯 EVALUATORS - Evaluation scores
- 🌳 BRANCHES - Git branch info
- 🚀 DEPLOYMENTS - Deployment status
- ⚠️ ERRORS - Error information
- 💬 MESSAGES - Message preview

**Format:**
```tsx
<div className="text-xs font-semibold text-muted-foreground mb-2">
  📊 SECTION_NAME
</div>
```

## Animation Classes

**From `index.css`:**
```css
@keyframes slide-in-from-top {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-from-top-2 {
  animation: slide-in-from-top 0.2s ease-out;
}
```

**Usage:**
```tsx
<div className="animate-in slide-in-from-top-2">
```

## Event Handling

**Stop propagation on nested actions:**
```tsx
// Card expands on click
<Card onClick={() => setExpanded(!expanded)}>
  {/* Button should NOT trigger card click */}
  <Button onClick={(e) => {
    e.stopPropagation();
    handleEdit();
  }}>
    Edit
  </Button>
</Card>
```

## Common Mistakes

❌ **Missing hover effect**:
```tsx
// Bad
<Card className="p-4">

// Good
<Card className="p-4 hover:border-primary/30 transition-colors">
```

❌ **No animation on expansion**:
```tsx
// Bad - instant appearance
{expanded && <div>Content</div>}

// Good - smooth slide-in
{expanded && <div className="animate-in slide-in-from-top-2">Content</div>}
```

❌ **Forgetting stopPropagation**:
```tsx
// Bad - edit button also expands card
<Button onClick={handleEdit}>Edit</Button>

// Good - only edit action fires
<Button onClick={(e) => { e.stopPropagation(); handleEdit(); }}>Edit</Button>
```

❌ **Wrong stat box styling**:
```tsx
// Bad - no background distinction
<div className="p-3 border">

// Good - muted background
<div className="p-3 rounded-md bg-muted/50 border">
```

❌ **Missing icon box**:
```tsx
// Bad - naked icon
<Icon className="h-5 w-5 text-primary" />

// Good - icon in box
<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
  <Icon className="h-5 w-5 text-primary" />
</div>
```

## Real-World Examples

- **Prompt Cards**: `frontend-service/user-frontend/src/components/promptsv2/PromptLifecycleCard.tsx`
- **Evaluator Cards**: `frontend-service/user-frontend/src/components/evaluators/EvaluatorLifecycleCard.tsx`
- **PR Cards**: `frontend-service/user-frontend/src/pages/git/AllPullRequestsPage.tsx` (inline)
