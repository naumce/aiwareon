# Interactions Pattern

## Overview

Consistent animations, hover states, keyboard shortcuts, and loading patterns create a polished user experience across all pages.

## Animations

### Card Expansion

```css
/* From index.css */
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
{expanded && (
  <div className="animate-in slide-in-from-top-2">
    Content
  </div>
)}
```

### Hover Lift

```css
.hover-lift {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Usage:**
```tsx
<Card className="hover-lift">
  Content
</Card>
```

### Fade In

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fade-in 0.2s ease-out;
}
```

**Usage:**
```tsx
<Alert className="fade-in">
  Message
</Alert>
```

### Scale In (Modal Entrance)

```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scale-in 0.2s ease-out;
}
```

### Slide from Right (Sheet)

Built into Sheet component - no custom CSS needed.

## Hover States

### Cards

```tsx
<Card className="hover:border-primary/30 transition-colors">
  Content
</Card>
```

### Buttons

Primary buttons get intensity increase:
```tsx
<Button className="bg-primary hover:bg-primary-hover">
  Action
</Button>
```

### Action Buttons in Cards

```tsx
<Button
  size="sm"
  variant="ghost"
  className="opacity-0 group-hover:opacity-100 transition-opacity"
>
  <Edit className="h-4 w-4" />
</Button>

// On card:
<Card className="group">
  ...actions...
</Card>
```

### Links

```tsx
<a className="text-primary hover:underline">
  Link text
</a>
```

## Keyboard Shortcuts

### Global

| Shortcut | Action | Context |
|----------|--------|---------|
| `/` | Focus search | List pages |
| `Escape` | Close modal/sheet | Modals, sheets |
| `Arrow keys` | Navigate lists | List items |

**Implementation:**
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '/') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Modal-Specific

| Shortcut | Action |
|----------|--------|
| `Escape` | Close modal |
| `Cmd+S` | Save |
| `Cmd+Enter` | Run/test |
| `Alt+1-5` | Jump to sections |

**Implementation:**
```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing
    const isTyping =
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).tagName === 'TEXTAREA';

    if (isTyping && e.key !== 'Escape') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }

    if (e.altKey && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      jumpToSection(parseInt(e.key) - 1);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

## Loading States

### Spinner

```tsx
import { Loader2 } from 'lucide-react';

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      Save
    </>
  )}
</Button>
```

### Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton';

{isLoading ? (
  <div className="space-y-3">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
) : (
  items.map(item => <Card key={item.id} {...item} />)
)}
```

### Disabled State

```tsx
<Button disabled={isSubmitting} className="disabled:opacity-50 disabled:cursor-not-allowed">
  Submit
</Button>
```

## Focus States

### Focus Ring

```css
.focus-ring {
  transition: box-shadow 0.2s ease-in-out;
}

.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--primary));
}
```

**Usage:**
```tsx
<Input className="focus-ring" />
```

### Visible Outlines

All focusable elements should have visible focus states for accessibility:
```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  Action
</Button>
```

## Transitions

### Standard Timing

```tsx
// Quick interactions (200ms)
<div className="transition-colors duration-200">

// Standard (300ms)
<div className="transition-all duration-300">

// Slow/emphasized (500ms)
<div className="transition-transform duration-500">
```

### Dark Mode Transition

Applied globally to body:
```css
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

All components automatically transition colors:
```css
.card, .btn, .input {
  transition-property: background-color, border-color, color;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success("Saved successfully!");

// Error
toast.error("Failed to save");

// Loading with promise
toast.promise(savePromise, {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
});

// With action
toast.success("Saved", {
  action: {
    label: "Undo",
    onClick: () => handleUndo(),
  },
});
```

## Progress Indicators

### Linear Progress

```tsx
<div className="h-1 bg-muted rounded-full overflow-hidden">
  <div
    className="h-full bg-primary transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Circular Progress

```tsx
import { Loader2 } from 'lucide-react';

<div className="flex items-center justify-center p-8">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
```

## Scroll Behavior

### Custom Scrollbar

Applied automatically via `index.css`:
```css
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
```

### Smooth Scrolling

```tsx
// Scroll to section smoothly
element.scrollIntoView({ behavior: 'smooth', block: 'start' });

// CSS class
<div className="scroll-smooth overflow-y-auto">
  Content
</div>
```

## Common Mistakes

❌ **Missing transitions**:
```tsx
// Bad - instant change
<Card className="border">

// Good - smooth transition
<Card className="border hover:border-primary/30 transition-colors">
```

❌ **Wrong animation duration**:
```tsx
// Bad - too slow
<div className="animate-in slide-in-from-top duration-1000">

// Good - quick and snappy
<div className="animate-in slide-in-from-top-2"> {/* 200ms */}
```

❌ **No loading state**:
```tsx
// Bad - button just disabled
<Button disabled={isLoading}>Save</Button>

// Good - spinner shows progress
<Button disabled={isLoading}>
  {isLoading ? <Loader2 className="animate-spin" /> : <Save />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

❌ **Forgetting keyboard shortcuts**:
```tsx
// Bad - mouse-only modal
<Dialog>...</Dialog>

// Good - Escape to close, keyboard nav
<Dialog onEscapeKeyDown={closeModal}>
  ...keyboard event handlers...
</Dialog>
```

❌ **No focus states**:
```tsx
// Bad - no visible focus
<button>Click me</button>

// Good - clear focus ring
<Button className="focus-visible:ring-2 focus-visible:ring-primary">
  Click me
</Button>
```

## Real-World Examples

- **Animations**: `frontend-service/user-frontend/src/index.css`
- **Keyboard Shortcuts**: `frontend-service/user-frontend/src/promptpalette/components/PromptBuilderModal.tsx`
- **Loading States**: Throughout all pages and components
