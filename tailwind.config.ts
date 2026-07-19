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
  // No dark mode, ever. There are zero dark variants and the class trigger is
  // never applied, so the app is permanently light.
  darkMode: 'class',
  theme: {
    // Replace the palette entirely so only on brand colors can be used.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#FFFFFF',
      background: '#FFFFFF',
      foreground: '#0A0A0A',
      muted: '#666666',
      border: '#EAEAEA',
      surface: '#FAFAFA',
      accent: {
        DEFAULT: 'var(--accent)',
        foreground: '#FFFFFF',
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
