# Dark Mode Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a manual dark/light mode toggle with localStorage persistence and smooth theme transitions.

**Architecture:** React Context API manages theme state globally. A ThemeProvider wraps the app, reads/writes to localStorage, and applies the `dark` class to `<html>`. A ThemeToggle button in the sidebar consumes this context.

**Tech Stack:** Next.js 14 (App Router), React Context API, TypeScript, Tailwind CSS, Lucide React (icons)

---

## Task 1: Create Theme Context with Types

**Files:**
- Create: `lib/theme-context.tsx`

**Step 1: Create the theme context file**

Create `lib/theme-context.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Run only on client after mount
  useEffect(() => {
    setMounted(true)

    // Read from localStorage
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      } else {
        // Default to dark
        applyTheme('dark')
      }
    } catch (e) {
      // localStorage not available, use default
      applyTheme('dark')
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)

    // Persist to localStorage
    try {
      localStorage.setItem('theme', newTheme)
    } catch (e) {
      // localStorage not available, silently fail
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add lib/theme-context.tsx
git commit -m "feat: add ThemeProvider context with localStorage persistence"
```

---

## Task 2: Update Root Layout with ThemeProvider

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Read current layout**

Run: `cat app/layout.tsx`
Expected: See current layout structure

**Step 2: Add ThemeProvider and blocking script**

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nella Pro - Revenue OS",
  description: "Sistema de gestión de leads con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground h-full overflow-hidden`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 3: Verify build**

Run: `npm run dev`
Expected: Dev server starts without errors

**Step 4: Test in browser**

Navigate to: `http://localhost:3000/dashboard`
Expected: Page renders with dark theme by default

**Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: integrate ThemeProvider in root layout with FOUC prevention"
```

---

## Task 3: Update Light Mode Colors in CSS

**Files:**
- Modify: `app/globals.css`

**Step 1: Read current CSS**

Run: `head -100 app/globals.css`
Expected: See current `:root` variables

**Step 2: Update :root variables for light mode**

Update the `:root` section in `app/globals.css` (around line 45):

```css
:root {
  --background: #FFFFFF;
  --foreground: #050505;
  --card: #F8F9FA;
  --card-foreground: #050505;
  --popover: #F8F9FA;
  --popover-foreground: #050505;
  --primary: #CEF25D;
  --primary-foreground: #050505;
  --secondary: #E5E7EB;
  --secondary-foreground: #050505;
  --muted: #F3F4F6;
  --muted-foreground: #6B7280;
  --accent: #CEF25D;
  --accent-foreground: #050505;
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: #FFFFFF;
  --border: rgba(0, 0, 0, 0.08);
  --input: rgba(0, 0, 0, 0.08);
  --ring: #CEF25D;
  --chart-1: #CEF25D;
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #6B7280;
  --sidebar-primary: #CEF25D;
  --sidebar-primary-foreground: #050505;
  --sidebar-accent: #F3F4F6;
  --sidebar-accent-foreground: #050505;
  --sidebar-border: rgba(0, 0, 0, 0.08);
  --sidebar-ring: #CEF25D;
}
```

**Step 3: Verify CSS compiles**

Run: `npm run dev`
Expected: No CSS errors in console

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: update light mode color variables"
```

---

## Task 4: Create ThemeToggle Button Component

**Files:**
- Create: `components/theme-toggle.tsx`

**Step 1: Create theme toggle component**

Create `components/theme-toggle.tsx`:

```typescript
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CEF25D]/30 transition-all duration-300 group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <Sun
          className={`absolute inset-0 size-5 text-[#888888] group-hover:text-[#CEF25D] transition-all duration-300 ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50'
          }`}
        />
        {/* Moon icon for dark mode */}
        <Moon
          className={`absolute inset-0 size-5 text-[#888888] group-hover:text-[#CEF25D] transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
    </button>
  )
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/theme-toggle.tsx
git commit -m "feat: add ThemeToggle button component with animated icons"
```

---

## Task 5: Add ThemeToggle to Sidebar

**Files:**
- Modify: `app/(dashboard)/layout.tsx`

**Step 1: Read current dashboard layout**

Run: `cat app/\(dashboard\)/layout.tsx`
Expected: See sidebar structure with logo

**Step 2: Import and add ThemeToggle to sidebar header**

Update `app/(dashboard)/layout.tsx`:

```typescript
"use client"

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Layers,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contactos', href: '/contacts', icon: Users },
  { name: 'Kanban', href: '/kanban', icon: Layers },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo and Theme Toggle */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Nella <span className="text-primary">Pro</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Revenue OS</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all w-full text-left">
            <Settings className="size-5" />
            Configuración
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-red-400 transition-all w-full text-left">
            <LogOut className="size-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
```

**Step 3: Test in browser**

Run: `npm run dev`
Navigate to: `http://localhost:3000/dashboard`
Expected: See theme toggle button next to logo

**Step 4: Click toggle button**

Action: Click the theme toggle button
Expected: Theme switches between light and dark, icon animates smoothly

**Step 5: Test persistence**

Action: Refresh the page
Expected: Theme preference is maintained

**Step 6: Commit**

```bash
git add app/\(dashboard\)/layout.tsx
git commit -m "feat: add ThemeToggle to sidebar header"
```

---

## Task 6: Update Dashboard Colors to Use Semantic Classes

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Replace hardcoded colors with Tailwind semantic classes**

Update color classes in `app/(dashboard)/dashboard/page.tsx`:

- Replace `bg-[#050505]` with `bg-background`
- Replace `text-white` with `text-foreground`
- Replace `text-[#888888]` with `text-muted-foreground`
- Replace `bg-[#0A0A0A]` with `bg-card`
- Replace `text-[#CEF25D]` with `text-primary`
- Replace hardcoded border colors with `border-border`

**Example changes:**

```typescript
// Before:
<div className="flex flex-1 flex-col gap-6 p-8 pt-6 min-h-screen">

// After:
<div className="flex flex-1 flex-col gap-6 p-8 pt-6 min-h-screen bg-background">
```

**Step 2: Verify in browser**

Run: `npm run dev`
Navigate to: `http://localhost:3000/dashboard`
Expected: Dashboard works in both light and dark modes

**Step 3: Toggle theme and verify colors**

Action: Click theme toggle multiple times
Expected: All colors transition smoothly, charts remain visible

**Step 4: Commit**

```bash
git add app/\(dashboard\)/dashboard/page.tsx
git commit -m "refactor: use semantic color classes in dashboard"
```

---

## Task 7: Update Contacts Page Colors

**Files:**
- Modify: `app/(dashboard)/contacts/page.tsx`
- Modify: `components/contacts/contacts-table.tsx`

**Step 1: Update contacts page colors**

Update `app/(dashboard)/contacts/page.tsx`:

- Replace `bg-[#050505]` with `bg-background`
- Replace `text-white` with `text-foreground`
- Replace `text-[#888888]` with `text-muted-foreground`
- Replace `bg-[#CEF25D]` with `bg-primary`
- Replace `text-black` with `text-primary-foreground`

**Step 2: Update contacts table colors**

Update `components/contacts/contacts-table.tsx`:

- Replace `bg-[#0A0A0A]` with `bg-card`
- Replace `bg-[#151515]` with `bg-muted`
- Replace hardcoded colors with semantic classes

**Step 3: Test in browser**

Navigate to: `http://localhost:3000/contacts`
Toggle theme and verify readability

**Step 4: Commit**

```bash
git add app/\(dashboard\)/contacts/page.tsx components/contacts/contacts-table.tsx
git commit -m "refactor: use semantic color classes in contacts page"
```

---

## Task 8: Update Login Page for Light Mode

**Files:**
- Modify: `app/(auth)/login/page.tsx`

**Step 1: Update login page colors**

Update `app/(auth)/login/page.tsx`:

- Replace `bg-[#050505]` with `bg-background`
- Replace `text-white` with `text-foreground`
- Replace hardcoded colors with semantic Tailwind classes
- Ensure glassmorphism works in both themes

**Step 2: Test login page in both themes**

Navigate to: `http://localhost:3000/login`
Toggle theme using browser localStorage:
```javascript
// In browser console
localStorage.setItem('theme', 'light')
location.reload()
```

Expected: Login page looks good in both themes

**Step 3: Commit**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "refactor: use semantic color classes in login page"
```

---

## Task 9: Test Full Application

**Step 1: Test dark mode (default)**

Actions:
1. Clear localStorage: `localStorage.clear()`
2. Navigate to `/login`
3. Navigate to `/dashboard`
4. Navigate to `/contacts`
5. Navigate to `/kanban`
6. Navigate to `/chat`

Expected: All pages render correctly in dark mode

**Step 2: Test light mode**

Actions:
1. Click theme toggle
2. Visit all pages again

Expected: All pages render correctly in light mode

**Step 3: Test persistence**

Actions:
1. Set theme to light
2. Refresh page
3. Close and reopen browser
4. Navigate to different pages

Expected: Light mode persists across all actions

**Step 4: Test localStorage disabled**

Actions:
1. Open DevTools → Application → Storage
2. Block cookies/storage
3. Refresh page

Expected: App defaults to dark mode, no errors in console

**Step 5: Document any issues**

Run: `echo "✅ All theme tests passed" >> docs/plans/test-results.md`

---

## Task 10: Final Cleanup and Documentation

**Step 1: Remove any console.logs**

Run: `grep -r "console.log" lib/theme-context.tsx components/theme-toggle.tsx`
Expected: No console.logs found

**Step 2: Update README if needed**

Add to README:
```markdown
## Theme Toggle

The app supports both light and dark modes. Users can toggle between themes using the button in the sidebar header. Theme preference is saved in localStorage.

**Default:** Dark mode
```

**Step 3: Run final build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Final commit**

```bash
git add .
git commit -m "docs: add theme toggle documentation"
```

---

## Verification Checklist

- [ ] ThemeProvider context created with TypeScript types
- [ ] useTheme hook works correctly
- [ ] localStorage persistence functions
- [ ] No flash of wrong theme on page load
- [ ] ThemeToggle button renders in sidebar header
- [ ] Icons animate smoothly when toggling
- [ ] Light mode colors are readable and on-brand
- [ ] Dark mode colors unchanged from original
- [ ] All pages work in both themes
- [ ] Dashboard charts visible in both themes
- [ ] Contacts table readable in both themes
- [ ] Login page styled correctly in both themes
- [ ] Theme persists across page navigation
- [ ] Theme persists across browser sessions
- [ ] Graceful fallback when localStorage unavailable
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build succeeds
- [ ] All commits have clear messages

---

## Success Criteria

✅ User can toggle between light and dark themes via button
✅ Theme preference saved in localStorage
✅ No flash of unstyled content on page load
✅ Smooth animations when switching themes
✅ All UI components readable in both themes
✅ Default theme is dark mode
✅ Works without localStorage (graceful degradation)

**Implementation complete! Ready to test in production.**
