import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/useTheme'

/** Sharp square icon button that switches between the light and dark themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-foreground transition-colors hover:bg-surface"
    >
      {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
    </button>
  )
}
