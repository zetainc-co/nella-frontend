# Dark Mode Toggle Design

**Date:** February 13, 2026
**Status:** Approved
**Author:** Design Session with User

---

## Overview

Implement a manual dark/light mode toggle for the Nella Pro application. Users can switch themes via a toggle button in the sidebar header, with their preference persisted in localStorage.

**Goals:**
- Allow users to manually switch between light and dark themes
- Remember user preference across sessions
- Provide smooth, flicker-free theme transitions
- Maintain existing dark mode design as default

---

## Requirements Summary

- **Toggle Type:** Manual switch (not system preference)
- **Location:** Sidebar header, next to "Nella Pro" logo
- **Persistence:** localStorage (client-side)
- **Default Theme:** Dark mode
- **Behavior:** Immediate visual feedback, no page reload needed

---

## Architecture

### Approach: React Context + CSS Classes

We'll use React Context to manage theme state globally and toggle the `dark` class on the `<html>` element. The app's CSS already defines variables for both `:root` (light) and `.dark` (dark) themes, so we only need to switch the class to change colors application-wide.

**Why this approach:**
- Leverages existing CSS variable system
- Simple React pattern, no external dependencies
- Easy to access theme state from any component
- Full control over implementation

**Component hierarchy:**
```
RootLayout
└── ThemeProvider (context)
    └── DashboardLayout
        └── Sidebar
            └── ThemeToggle (button)
```

---

## Components & Files

### New Files

**1. `lib/theme-context.tsx`**
- Exports `ThemeProvider` component
- Exports `useTheme()` hook
- Manages theme state and localStorage sync
- Handles HTML class manipulation

**2. `components/theme-toggle.tsx`**
- Toggle button UI component
- Sun icon for light mode, moon icon for dark mode
- Smooth icon transitions
- Consumes `useTheme()` hook

### Modified Files

**1. `app/layout.tsx`**
- Remove hardcoded `className="dark"` from `<html>`
- Make it client component or use a client wrapper
- Wrap children with `<ThemeProvider>`
- Add inline blocking script to prevent flash

**2. `app/(dashboard)/layout.tsx`**
- Import and add `<ThemeToggle />` in sidebar header
- Place next to "Nella Pro" logo

**3. `app/globals.css`**
- Update `:root` variables to proper light mode colors
- Keep `.dark` variables as-is (already correct)

---

## Data Flow

### Initial Page Load

1. `ThemeProvider` runs client-side effect on mount
2. Reads `localStorage.getItem('theme')`
3. If found, uses saved value; otherwise defaults to `"dark"`
4. Applies theme by adding/removing `dark` class on `<html>` element
5. CSS variables automatically switch based on class

### User Interaction

1. User clicks `<ThemeToggle />` button
2. Component calls `setTheme('light')` or `setTheme('dark')`
3. `ThemeProvider` updates React state
4. Provider writes to `localStorage.setItem('theme', newTheme)`
5. Provider updates `document.documentElement.classList`
6. CSS variables switch (`:root` vs `.dark`)
7. All components re-render with new theme colors

### Subsequent Visits

1. Blocking script in `<head>` runs before React hydration
2. Reads `localStorage.getItem('theme')`
3. Immediately applies `dark` class if theme is "dark"
4. React hydrates with correct theme, no flash

**Flow diagram:**
```
┌─────────────┐
│ localStorage│
└──────┬──────┘
       │ read on load
       ▼
┌──────────────┐      ┌─────────────┐
│ThemeProvider │◄─────│ useTheme()  │
│   (Context)  │      │    hook     │
└──────┬───────┘      └─────▲───────┘
       │                    │
       │ applies class      │ consumes
       ▼                    │
┌──────────────┐      ┌─────┴───────┐
│ <html> class │      │ ThemeToggle │
│   "dark"     │      │   Button    │
└──────────────┘      └─────────────┘
       │
       │ CSS cascade
       ▼
┌──────────────┐
│ All UI       │
│ Components   │
└──────────────┘
```

---

## Edge Cases & Error Handling

### Flash of Unstyled Content (FOUC)

**Problem:** React hydrates after initial HTML render, causing a brief flash of wrong theme.

**Solution:** Inline blocking `<script>` in `app/layout.tsx` that runs before React:
```html
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      const theme = localStorage.getItem('theme') || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    })();
  `
}} />
```

This ensures the correct theme class is applied before the page renders.

### localStorage Unavailable

**Scenario:** User has localStorage disabled or browser doesn't support it.

**Handling:**
- Wrap localStorage access in try-catch
- Fall back to "dark" theme if read/write fails
- Application continues to function, just without persistence

### Type Safety

Define strict types:
```typescript
type Theme = 'light' | 'dark'
```

Prevents typos and ensures only valid themes are used.

---

## Light Mode Color Scheme

The existing `:root` variables need to be updated for proper light mode. Current values are dark mode colors.

### Updated `:root` (Light Mode)

```css
:root {
  --background: #FFFFFF;           /* White background */
  --foreground: #050505;           /* Dark text */
  --card: #F8F9FA;                 /* Light gray cards */
  --card-foreground: #050505;      /* Dark text on cards */
  --primary: #CEF25D;              /* Keep neon green accent */
  --primary-foreground: #050505;   /* Dark text on primary */
  --secondary: #E5E7EB;            /* Light gray secondary */
  --muted: #F3F4F6;                /* Very light gray muted */
  --muted-foreground: #6B7280;     /* Medium gray text */
  --border: rgba(0, 0, 0, 0.08);   /* Subtle dark borders */
  --input: rgba(0, 0, 0, 0.08);    /* Input borders */
  --ring: #CEF25D;                 /* Focus ring stays neon */
  /* ... rest of light theme variables */
}
```

### Keep `.dark` As-Is

The `.dark` class variables are already correctly set for dark mode (current design).

---

## Toggle Button Design

### Visual States

**Dark Mode Active:**
- Icon: Moon (🌙)
- Tooltip: "Switch to Light Mode"
- Background: Subtle highlight on hover

**Light Mode Active:**
- Icon: Sun (☀️)
- Tooltip: "Switch to Dark Mode"
- Background: Subtle highlight on hover

### Animation

- Icon fades out and scales down (0.8x)
- New icon fades in and scales up (1x)
- Transition duration: 300ms ease-in-out
- Background color transitions smoothly

### Placement

Located in the sidebar header area, to the right of the "Nella Pro" logo, aligned vertically with the logo text.

---

## Implementation Checklist

- [ ] Create `lib/theme-context.tsx` with ThemeProvider and useTheme
- [ ] Create `components/theme-toggle.tsx` with toggle button UI
- [ ] Update `app/layout.tsx` to use ThemeProvider
- [ ] Add blocking script to prevent flash in `app/layout.tsx`
- [ ] Update `app/(dashboard)/layout.tsx` to include ThemeToggle
- [ ] Update `:root` variables in `app/globals.css` for light mode
- [ ] Test theme switching works correctly
- [ ] Test localStorage persistence across sessions
- [ ] Verify no flash of wrong theme on page load
- [ ] Test with localStorage disabled (graceful fallback)

---

## Success Criteria

1. ✅ User can toggle between light and dark modes via button
2. ✅ Theme preference persists across browser sessions
3. ✅ No flash of wrong theme on page load
4. ✅ Toggle button shows appropriate icon for current theme
5. ✅ All pages and components respect the theme setting
6. ✅ Default theme is dark mode for new users
7. ✅ Theme transitions are smooth and immediate

---

## Future Enhancements (Out of Scope)

- System preference detection on first visit
- Per-user theme settings stored in database
- Scheduled theme switching (auto dark mode at night)
- Custom theme colors beyond light/dark
- Theme preview before applying

These can be added later if needed, but are not part of the initial implementation.

---

## Next Steps

1. Create implementation plan with detailed step-by-step tasks
2. Build ThemeProvider and ThemeToggle components
3. Integrate into layouts
4. Test thoroughly across different scenarios
5. Deploy to production

**Ready to proceed with implementation planning.**
