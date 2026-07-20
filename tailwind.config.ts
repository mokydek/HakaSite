import type { Config } from 'tailwindcss'

/**
 * HakaSite design tokens. Single source of truth for the palette, corner
 * radius scale, and typography. The palette is monochrome plus exactly one
 * accent.
 *
 * The accent hex lives in ONE place only: the --accent CSS variable in
 * src/styles/index.css (:root). Every accent utility (bg-accent, text-accent,
 * ring-accent) resolves to that variable, so a rebrand is a one line change.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Dark mode is driven by a `.dark` class on <html>, toggled by the
  // ThemeProvider. Every color below resolves to a CSS variable that flips
  // between the light (:root) and dark (.dark) values in styles/index.css.
  darkMode: 'class',
  theme: {
    // Replace the palette entirely so only on brand colors can be used.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#FFFFFF',
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      muted: 'var(--muted)',
      border: 'var(--border)',
      surface: 'var(--surface)',
      accent: {
        DEFAULT: 'var(--accent)',
        foreground: 'var(--accent-foreground)',
      },
    },
    // Replace the radius scale so no token exceeds 2px. full stays available
    // for the rare circular element such as the spinner. Default to square.
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '2px',
      md: '2px',
      lg: '2px',
      xl: '2px',
      '2xl': '2px',
      '3xl': '2px',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
