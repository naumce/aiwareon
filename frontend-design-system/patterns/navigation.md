# Navigation Pattern

## Overview

Navigation is handled through AppSidebar component with three mode sections (Lab, Infere, Git) and collapsible behavior. Uses shadcn/ui Sidebar primitives with custom styling.

## Sidebar Structure

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const sections = useSidebarNavigation();

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Logo className="h-6 w-6" />
          <span className="font-semibold">Infere</span>
        </div>
        <ThemeToggle />
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.mode}>
            <SidebarGroupLabel>{section.mode}</SidebarGroupLabel>
            <SidebarMenu>
              {section.groups.map((group) => (
                <div key={group.name}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {group.name}
                  </div>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
```

## Git Mode Navigation Structure

From `config/navigation.js`:

```javascript
export const gitModeNavigation = {
  mode: 'Git',
  groups: [
    {
      name: 'Overview',
      items: [
        { label: 'Dashboard', href: '/git/dashboard', icon: LayoutDashboard },
        { label: 'Repositories', href: '/git/repositories', icon: FolderGit2 },
      ],
    },
    {
      name: 'Development',
      items: [
        { label: 'Pull Requests', href: '/git/pull-requests', icon: GitPullRequest },
        { label: 'Prompts', href: '/git/prompts', icon: FileText },
        { label: 'Deployments', href: '/git/deployments', icon: Rocket },
      ],
    },
    {
      name: 'Quality',
      items: [
        { label: 'Testing', href: '/git/testing', icon: TestTube },
        { label: 'Monitoring', href: '/git/monitoring', icon: Activity },
      ],
    },
    {
      name: 'Access',
      items: [
        { label: 'Keys', href: '/git/keys', icon: Key },
      ],
    },
    {
      name: 'Configuration',
      items: [
        { label: 'Policies', href: '/git/policies', icon: Shield },
        { label: 'Webhooks', href: '/git/webhooks', icon: Webhook },
      ],
    },
  ],
};
```

## Collapsible Sidebar

```tsx
// Sidebar provider with state
<SidebarProvider defaultOpen={true}>
  <AppSidebar />
  <SidebarInset>
    {/* Page content */}
  </SidebarInset>
</SidebarProvider>

// Trigger button
import { useSidebar } from '@/components/ui/sidebar';

function PageHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button variant="ghost" onClick={toggleSidebar}>
      <Menu className="h-4 w-4" />
    </Button>
  );
}
```

## Active State Styling

```tsx
// Automatic active state via Link
<SidebarMenuButton asChild>
  <Link to="/git/pull-requests">
    <GitPullRequest className="h-4 w-4" />
    <span>Pull Requests</span>
  </Link>
</SidebarMenuButton>

// CSS handles active state
// .sidebar-menu-button[data-active="true"] {
//   background: hsl(var(--sidebar-accent));
//   color: hsl(var(--sidebar-accent-foreground));
// }
```

## Icon-Only Collapsed Mode

When sidebar is collapsed (`data-collapsible="icon"`):
- Text is hidden
- Only icons shown
- Tooltip appears on hover

```css
/* From index.css */
[data-collapsible="icon"] [data-sidebar="menu-button"] > span:not(:first-child) {
  width: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
  visibility: hidden !important;
}

[data-collapsible="icon"] [data-sidebar="menu-button"][data-active="true"] {
  background: hsl(var(--primary) / 0.12) !important;
}
```

## Mobile Behavior

On mobile (< 768px):
- Sidebar becomes a sheet (overlay)
- Triggered by menu button
- Closes on navigation

```tsx
<SidebarProvider>
  {/* Mobile: Sheet overlay */}
  {/* Desktop: Persistent sidebar */}
  <AppSidebar />
  <SidebarInset>
    <PageHeader /> {/* Contains menu toggle */}
    {children}
  </SidebarInset>
</SidebarProvider>
```

## Theme Toggle

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

## User Menu (Footer)

```tsx
function UserMenu() {
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Routing with React Router

```tsx
// App.tsx
<Routes>
  <Route path="/" element={<Layout />}>
    {/* Lab Mode */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/tokens" element={<Tokens />} />

    {/* Git Mode */}
    <Route path="/git/pull-requests" element={<PullRequests />} />
    <Route path="/git/prompts" element={<Prompts />} />
    <Route path="/git/deployments" element={<Deployments />} />

    {/* Infere Mode */}
    <Route path="/observability" element={<Observability />} />
  </Route>
</Routes>

// Layout.tsx
function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet /> {/* Page content renders here */}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

## Common Mistakes

❌ **Missing group labels**:
```tsx
// Bad - no visual grouping
<SidebarMenu>
  {items.map(item => <SidebarMenuItem>...</SidebarMenuItem>)}
</SidebarMenu>

// Good - grouped with labels
<SidebarGroup>
  <SidebarGroupLabel>Development</SidebarGroupLabel>
  <SidebarMenu>
    {items.map(item => <SidebarMenuItem>...</SidebarMenuItem>)}
  </SidebarMenu>
</SidebarGroup>
```

❌ **Wrong icon size**:
```tsx
// Bad - too large
<Icon className="h-6 w-6" />

// Good - standard size
<Icon className="h-4 w-4" />
```

❌ **Not using SidebarMenuButton**:
```tsx
// Bad - custom button styling
<Link to="/path" className="flex items-center gap-2 p-2">

// Good - SidebarMenuButton handles styling
<SidebarMenuButton asChild>
  <Link to="/path">
    <Icon />
    <span>Label</span>
  </Link>
</SidebarMenuButton>
```

❌ **Forgetting mobile toggle**:
```tsx
// Bad - no way to open sidebar on mobile
<PageHeader>
  <h1>Title</h1>
</PageHeader>

// Good - menu button for mobile
<PageHeader>
  <Button variant="ghost" onClick={toggleSidebar}>
    <Menu />
  </Button>
  <h1>Title</h1>
</PageHeader>
```

## Real-World Examples

- **AppSidebar**: `frontend-service/user-frontend/src/components/layout/AppSidebar.jsx`
- **Navigation Config**: `frontend-service/user-frontend/src/config/navigation.js`
