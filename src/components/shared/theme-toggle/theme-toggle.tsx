'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
