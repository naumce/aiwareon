# Prompt Palette Pattern

## Overview

Prompt Palette is the **universal modal system** for creating and editing prompts, evaluators, and templates. It's context-aware, configuration-driven, and features a split-panel layout. Height: 90vh for maximum workspace.

## Split-Panel Architecture

```tsx
<Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
  <DialogContent className="max-w-[95vw] md:max-w-[800px] h-[90vh] p-0 gap-0 flex flex-col">
    {/* Header */}
    <ModalHeader />
    <ProgressIndicator />

    {/* Split Content */}
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
      {/* Left: Editor (60%) */}
      <div className="w-full md:w-[60%] flex flex-col overflow-hidden border-b md:border-b-0 md:border-r">
        <QuickActionsToolbar onPreview={togglePreview} />

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-3">
          <ValidationFeedback />
          {sections.map((section) => (
            <SectionRenderer key={section.id} {...section} />
          ))}
        </div>
      </div>

      {/* Right: Preview/Test (40%) */}
      <div className="w-full md:w-[40%] flex flex-col overflow-hidden">
        <TestPanel />
      </div>
    </div>

    {/* Footer */}
    <ModalFooter context={context} />
  </DialogContent>
</Dialog>
```

## Context-Aware Behavior

| Context | Footer Actions | Right Panel | Use Case |
|---------|---------------|-------------|----------|
| `git` | Cancel, Test, Commit | Hidden (optional) | Git-based prompt editing |
| `playground` | Cancel, Run | Always shown | Testing prompts |
| `requests` | Cancel, Save ▼, Run | Always shown | Dataset row editing |
| `evaluator` | Cancel, Test, Save | Hidden | Creating evaluators |
| `code-evaluator` | Cancel, Save | Hidden | Code-based evaluators |

**Usage:**
```tsx
// Open modal with context
openModal({
  context: 'git',
  gitState: { repoId, branch, promptId },
  template: existingTemplate,
});
```

## Key Components

### ModalHeader

```tsx
<div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0">
  <div>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground">{context}</p>
  </div>
  <Button variant="ghost" size="icon" onClick={closeModal}>
    <X className="h-4 w-4" />
  </Button>
</div>
```

### ProgressIndicator

Shows completion percentage:
```tsx
<div className="h-1 bg-muted">
  <div
    className="h-full bg-primary transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

### QuickActionsToolbar

```tsx
<div className="px-5 py-2 border-b flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Button size="sm" variant="ghost">
      <Undo2 className="h-4 w-4" />
    </Button>
    <Button size="sm" variant="ghost">
      <Redo2 className="h-4 w-4" />
    </Button>
  </div>
  <Button size="sm" variant="outline" onClick={onPreview}>
    <Eye className="h-4 w-4 mr-2" />
    Preview
  </Button>
</div>
```

### ValidationFeedback

Real-time validation messages:
```tsx
{errors.length > 0 && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Validation Error</AlertTitle>
    <AlertDescription>
      {errors.map(e => <div key={e.field}>{e.message}</div>)}
    </AlertDescription>
  </Alert>
)}
```

### ModalFooter (Context-Aware)

**Git Context:**
```tsx
<DialogFooter className="px-5 py-3 border-t flex items-center justify-between">
  <Button variant="ghost" onClick={closeModal}>Cancel</Button>
  <div className="flex gap-2">
    <Button variant="outline" onClick={handleTest}>
      <Play className="h-4 w-4 mr-2" />
      Test
    </Button>
    <Button onClick={handleCommit}>
      <GitCommit className="h-4 w-4 mr-2" />
      Commit
    </Button>
  </div>
</DialogFooter>
```

**Requests Context (with dropdown):**
```tsx
<DialogFooter className="px-5 py-3 border-t flex items-center justify-between">
  <Button variant="ghost" onClick={closeModal}>Cancel</Button>
  <div className="flex gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleSaveToRepo}>
          <GitBranch className="h-4 w-4 mr-2" />
          Save to Repository
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSaveToDataset}>
          <Database className="h-4 w-4 mr-2" />
          Save to Dataset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button onClick={handleRun}>
      <Play className="h-4 w-4 mr-2" />
      Run
    </Button>
  </div>
</DialogFooter>
```

## Configuration-Driven Sections

**Section registry** (`config/sectionRegistry.tsx`):
```tsx
export const getSectionsForContext = (context: Context) => {
  switch (context) {
    case 'git':
      return [
        { sectionId: 'basic', component: BasicSection },
        { sectionId: 'messages', component: MessageBuilder },
        { sectionId: 'variables', component: VariableManager },
        { sectionId: 'model', component: ModelConfig },
      ];
    case 'evaluator':
      return [
        { sectionId: 'basic', component: BasicSection },
        { sectionId: 'scoring', component: ScoringConfig },
        { sectionId: 'test', component: TestPanel },
      ];
    // ... more contexts
  }
};
```

**SectionRenderer:**
```tsx
export function SectionRenderer({ sectionId, config }: Props) {
  const Component = config.component;
  return (
    <div data-section={sectionId} className="space-y-3">
      <Component />
    </div>
  );
}
```

## Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape: Close modal
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }

    // Cmd+S: Save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }

    // Cmd+Enter: Run test
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTest();
    }

    // Alt+1-5: Jump to sections
    if (e.altKey && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const sectionIndex = parseInt(e.key) - 1;
      jumpToSection(sectionIndex);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Responsive Sizing

```tsx
const getModalSize = (context: Context) => {
  switch (context) {
    case 'playground':
      return 'max-w-[95vw] lg:max-w-[1400px]'; // Largest for testing
    case 'code-evaluator':
      return 'max-w-[95vw] lg:max-w-[1200px]'; // Large for code editor
    case 'evaluator':
      return 'max-w-[95vw] md:max-w-[900px]';  // Medium
    case 'inline':
      return 'max-w-[95vw] sm:max-w-[600px]';  // Small for quick edits
    default:
      return 'max-w-[95vw] md:max-w-[800px]';  // Default
  }
};
```

## State Management (Zustand)

```tsx
interface PromptBuilderStore {
  // State
  isOpen: boolean;
  context: Context;
  template: Template | null;
  gitState?: GitState;
  requestsState?: RequestsState;
  isDirty: boolean;
  isLoading: boolean;

  // Actions
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
  updateTemplate: (updates: Partial<Template>) => void;
  setLoading: (loading: boolean) => void;
}

export const usePromptBuilderStore = create<PromptBuilderStore>((set) => ({
  isOpen: false,
  context: 'git',
  template: null,
  isDirty: false,
  isLoading: false,

  openModal: (config) => set({
    isOpen: true,
    context: config.context,
    template: config.template,
    gitState: config.gitState,
    requestsState: config.requestsState,
  }),

  closeModal: () => set({
    isOpen: false,
    template: null,
  }),

  updateTemplate: (updates) => set((state) => ({
    template: { ...state.template, ...updates },
    isDirty: true,
  })),

  setLoading: (loading) => set({ isLoading: loading }),
}));
```

## Common Mistakes

❌ **Wrong modal height**:
```tsx
// Bad - default height
<DialogContent className="max-w-[800px]">

// Good - 90vh for workspace
<DialogContent className="max-w-[800px] h-[90vh] p-0 flex flex-col">
```

❌ **Not using configuration**:
```tsx
// Bad - hardcoding sections
<MessageBuilder />
<VariableManager />
<ModelConfig />

// Good - configuration-driven
{getSectionsForContext(context).map(section => (
  <SectionRenderer key={section.id} {...section} />
))}
```

❌ **Missing keyboard shortcuts**:
```tsx
// Bad - no shortcuts
// Good - Escape, Cmd+S, Cmd+Enter, Alt+1-5
```

❌ **Wrong split ratio**:
```tsx
// Bad - 50/50 split
<div className="md:w-[50%]">Editor</div>
<div className="md:w-[50%]">Preview</div>

// Good - 60/40 split
<div className="md:w-[60%]">Editor</div>
<div className="md:w-[40%]">Preview</div>
```

## Real-World Example

**PromptBuilderModal**: `frontend-service/user-frontend/src/promptpalette/components/PromptBuilderModal.tsx`
**ModalFooter**: `frontend-service/user-frontend/src/promptpalette/components/ModalFooter.tsx`
