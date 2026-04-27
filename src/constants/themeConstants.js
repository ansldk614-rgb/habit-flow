export const THEMES = [
  {
    id: 'neonMatrix',
    name: 'Neon Matrix',
    description: 'Black, white, and neon green dashboard theme.',
    colors: {
      bg: '#050805',
      surface: '#0d1110',
      surfaceAlt: '#111816',
      border: '#1f2a24',
      borderStrong: '#2f4a38',
      text: '#f2f5f2',
      muted: '#8b9a8f',
      accent: '#39ff4a',
      accentText: '#050805',
      accentSoft: '#123d1a',
      accentGlow: 'rgba(57, 255, 74, 0.35)',
      danger: '#ff4d3d',
      warning: '#f5c542',
    },
  },
  {
    id: 'midnightIndigo',
    name: 'Midnight Indigo',
    description: 'Dark navy productivity theme with indigo and cyan accents.',
    colors: {
      bg: '#020617',
      surface: '#0f172a',
      surfaceAlt: '#111827',
      border: '#1e293b',
      borderStrong: '#334155',
      text: '#e5e7eb',
      muted: '#94a3b8',
      accent: '#818cf8',
      accentText: '#020617',
      accentSoft: '#312e81',
      accentGlow: 'rgba(129, 140, 248, 0.32)',
      danger: '#fb7185',
      warning: '#fbbf24',
    },
  },
  {
    id: 'warmGraphite',
    name: 'Warm Graphite',
    description: 'Warm graphite routine theme with amber accents.',
    colors: {
      bg: '#0c0a09',
      surface: '#1c1917',
      surfaceAlt: '#292524',
      border: '#44403c',
      borderStrong: '#57534e',
      text: '#fafaf9',
      muted: '#a8a29e',
      accent: '#f59e0b',
      accentText: '#0c0a09',
      accentSoft: '#451a03',
      accentGlow: 'rgba(245, 158, 11, 0.28)',
      danger: '#ef4444',
      warning: '#facc15',
    },
  },
  {
    id: 'softMintDay',
    name: 'Soft Mint Day',
    description: 'Clean light theme with fresh mint and soft green accents.',
    colors: {
      bg: '#F6FBF8',
      surface: '#FFFFFF',
      surfaceAlt: '#EEF7F2',
      border: '#D6E6DB',
      borderStrong: '#B7CFBF',
      text: '#18241D',
      muted: '#66786E',
      accent: '#34C37A',
      accentText: '#FFFFFF',
      accentSoft: '#DDF5E7',
      accentGlow: 'rgba(52, 195, 122, 0.22)',
      danger: '#E45B5B',
      warning: '#E4A63B',
    },
  },
  {
    id: 'warmPaperPeach',
    name: 'Warm Paper Peach',
    description: 'Warm light theme with ivory paper background and peach accents.',
    colors: {
      bg: '#FFF9F3',
      surface: '#FFFFFF',
      surfaceAlt: '#FFF1E6',
      border: '#EFDCCD',
      borderStrong: '#DDBFA9',
      text: '#2C221B',
      muted: '#7C6B5F',
      accent: '#E47A4E',
      accentText: '#FFFFFF',
      accentSoft: '#FCE5DA',
      accentGlow: 'rgba(228, 122, 78, 0.22)',
      danger: '#DA5B5B',
      warning: '#D89A2F',
    },
  },
]

export const DEFAULT_THEME_ID = 'neonMatrix'
export const THEME_STORAGE_KEY = 'habit-flow-theme'

export function getThemeById(themeId) {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES.find((theme) => theme.id === DEFAULT_THEME_ID)
}

export function isValidThemeId(themeId) {
  return THEMES.some((theme) => theme.id === themeId)
}

export function getStoredThemeId() {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_ID
  }

  const storedThemeId = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isValidThemeId(storedThemeId) ? storedThemeId : DEFAULT_THEME_ID
}

export function saveThemeId(themeId) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, isValidThemeId(themeId) ? themeId : DEFAULT_THEME_ID)
}

function hexToRgb(value) {
  if (typeof value !== 'string' || !value.startsWith('#')) {
    return null
  }

  const hex = value.slice(1)
  if (![3, 6].includes(hex.length)) {
    return null
  }

  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : hex
  const number = Number.parseInt(normalized, 16)

  if (Number.isNaN(number)) {
    return null
  }

  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`
}

export function applyTheme(theme) {
  if (!theme?.colors || typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVariableName = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    root.style.setProperty(`--color-${cssVariableName}`, value)

    const rgbValue = hexToRgb(value)
    if (rgbValue) {
      root.style.setProperty(`--color-${cssVariableName}-rgb`, rgbValue)
    }
  })
}
