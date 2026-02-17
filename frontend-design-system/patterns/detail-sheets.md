# Detail Sheets Pattern

## Overview

Detail sheets are **right-sliding sidebar panels** that provide deep-dive information without leaving the current page. Primary example: PromptDetailSheet in Prompts V2. Width: 800px on desktop, full-width on mobile.

## Structure

```tsx
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
    {/* Header */}
    <div className="px-6 py-4 border-b flex-shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>

    {/* Tabbed Content */}
    <Tabs defaultValue="lifecycle" className="flex-1 flex flex-col min-h-0">
      <TabsList className="px-6 py-3 border-b flex-shrink-0">
        <TabsTrigger value="lifecycle">🧪 Lifecycle V2</TabsTrigger>
        <TabsTrigger value="tree">🌳 Branch Tree</TabsTrigger>
        <TabsTrigger value="observability">📊 Observability</TabsTrigger>
        <TabsTrigger value="evaluators">🎯 Evaluators</TabsTrigger>
        <TabsTrigger value="deployments">🚀 Deployments</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <TabsContent value="lifecycle" className="px-6 py-4 mt-0">
            {/* Tab content */}
          </TabsContent>
          <TabsContent value="tree" className="px-6 py-4 mt-0">
            {/* Tab content */}
          </TabsContent>
          {/* More tabs... */}
        </ScrollArea>
      </div>
    </Tabs>

    {/* Footer Actions */}
    <div className="px-6 py-4 border-t flex items-center gap-2 flex-shrink-0">
      <Button>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <Button>
        <Rocket className="h-4 w-4 mr-2" />
        Deploy
      </Button>
      <Button variant="outline">
        <GitCompare className="h-4 w-4 mr-2" />
        Compare
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

## Key Features

### Width

```tsx
// Desktop: 800px max
// Mobile: Full width
<SheetContent className="w-full sm:max-w-[800px]">
```

### Tabs with Emoji Icons

**5 Standard Tabs:**
- 🧪 **Lifecycle V2** - Current state and history
- 🌳 **Branch Tree** - Git branch visualization
- 📊 **Observability** - Metrics, trends, status breakdown
- 🎯 **Evaluators** - Evaluation scores, last run, trends
- 🚀 **Deployments** - Token mapping, versions

```tsx
<TabsList>
  <TabsTrigger value="lifecycle">🧪 Lifecycle V2</TabsTrigger>
  <TabsTrigger value="tree">🌳 Branch Tree</TabsTrigger>
  <TabsTrigger value="observability">📊 Observability</TabsTrigger>
  <TabsTrigger value="evaluators">🎯 Evaluators</TabsTrigger>
  <TabsTrigger value="deployments">🚀 Deployments</TabsTrigger>
</TabsList>
```

### Sticky Header/Footer

**Header**: Fixed at top with back button
**Footer**: Fixed at bottom with actions
**Content**: Scrollable between them

```tsx
<SheetContent className="p-0 flex flex-col">
  {/* Sticky Header */}
  <div className="px-6 py-4 border-b flex-shrink-0">
    ...
  </div>

  {/* Scrollable Content */}
  <div className="flex-1 overflow-hidden">
    <ScrollArea className="h-full">
      ...
    </ScrollArea>
  </div>

  {/* Sticky Footer */}
  <div className="px-6 py-4 border-t flex-shrink-0">
    ...
  </div>
</SheetContent>
```

### Animation

**Built-in Sheet component animation:**
- Slides in from right
- Overlay fade-in
- Duration: ~300ms

## Complete Example

```tsx
interface DetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    title: string;
    subtitle: string;
    // ... other data
  };
}

export function DetailSheet({ isOpen, onOpenChange, item }: DetailSheetProps) {
  const [activeTab, setActiveTab] = useState('lifecycle');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {item.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="px-6 py-3 border-b flex-shrink-0">
            <TabsTrigger value="lifecycle">🧪 Lifecycle V2</TabsTrigger>
            <TabsTrigger value="tree">🌳 Branch Tree</TabsTrigger>
            <TabsTrigger value="observability">📊 Observability</TabsTrigger>
            <TabsTrigger value="evaluators">🎯 Evaluators</TabsTrigger>
            <TabsTrigger value="deployments">🚀 Deployments</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <TabsContent value="lifecycle" className="px-6 py-4 mt-0">
                <LifecycleContent data={item} />
              </TabsContent>

              <TabsContent value="tree" className="px-6 py-4 mt-0">
                <BranchTreeContent data={item} />
              </TabsContent>

              <TabsContent value="observability" className="px-6 py-4 mt-0">
                <ObservabilityContent data={item} />
              </TabsContent>

              <TabsContent value="evaluators" className="px-6 py-4 mt-0">
                <EvaluatorsContent data={item} />
              </TabsContent>

              <TabsContent value="deployments" className="px-6 py-4 mt-0">
                <DeploymentsContent data={item} />
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => handleEdit(item)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => handleDeploy(item)}>
            <Rocket className="h-4 w-4 mr-2" />
            Deploy
          </Button>
          <Button variant="outline" onClick={() => handleCompare(item)}>
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

## Tab Content Patterns

### Lifecycle Tab

```tsx
<TabsContent value="lifecycle" className="px-6 py-4 mt-0 space-y-4">
  {/* Current State */}
  <div>
    <h3 className="text-sm font-semibold mb-3">Current State</h3>
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Status</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Last Updated</span>
        <span className="text-sm font-medium">{updatedAt}</span>
      </div>
    </div>
  </div>

  {/* History */}
  <div>
    <h3 className="text-sm font-semibold mb-3">History</h3>
    <div className="space-y-2">
      {history.map((event) => (
        <div key={event.id} className="p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{event.action}</span>
            <span className="text-xs text-muted-foreground">{event.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</TabsContent>
```

### Observability Tab

```tsx
<TabsContent value="observability" className="px-6 py-4 mt-0 space-y-4">
  {/* Metrics */}
  <div>
    <h3 className="text-sm font-semibold mb-3">Metrics</h3>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 rounded-lg border bg-card">
        <div className="text-2xl font-bold">{metrics.requests}</div>
        <div className="text-sm text-muted-foreground">Requests</div>
      </div>
      <div className="p-4 rounded-lg border bg-card">
        <div className="text-2xl font-bold">{metrics.latency}ms</div>
        <div className="text-sm text-muted-foreground">Avg Latency</div>
      </div>
    </div>
  </div>

  {/* Status Breakdown */}
  <div>
    <h3 className="text-sm font-semibold mb-3">Status Breakdown</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Success</span>
        <span className="text-sm font-medium text-success">{stats.success}%</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Errors</span>
        <span className="text-sm font-medium text-destructive">{stats.errors}%</span>
      </div>
    </div>
  </div>
</TabsContent>
```

## Common Mistakes

❌ **Wrong width**:
```tsx
// Bad - too narrow or no max width
<SheetContent className="w-[600px]">

// Good - 800px with responsive full-width
<SheetContent className="w-full sm:max-w-[800px]">
```

❌ **No sticky header/footer**:
```tsx
// Bad - everything scrolls
<SheetContent className="p-6">
  <Header />
  <Content />
  <Footer />
</SheetContent>

// Good - flex layout with sticky elements
<SheetContent className="p-0 flex flex-col">
  <div className="flex-shrink-0">Header</div>
  <div className="flex-1 overflow-hidden">Content</div>
  <div className="flex-shrink-0">Footer</div>
</SheetContent>
```

❌ **Missing emoji icons in tabs**:
```tsx
// Bad - plain text
<TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>

// Good - emoji for visual hierarchy
<TabsTrigger value="lifecycle">🧪 Lifecycle V2</TabsTrigger>
```

❌ **No back button**:
```tsx
// Bad - no way to close
<div className="px-6 py-4 border-b">
  <h2>{title}</h2>
</div>

// Good - back button to close
<div className="px-6 py-4 border-b">
  <Button variant="ghost" onClick={() => setIsOpen(false)}>
    <ChevronLeft /> Back
  </Button>
  <h2>{title}</h2>
</div>
```

## Real-World Example

**PromptDetailSheet**: `frontend-service/user-frontend/src/components/promptsv2/PromptDetailSheet.tsx`
