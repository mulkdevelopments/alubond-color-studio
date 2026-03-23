export type Theme = 'light' | 'dark' | 'workspace'

/**
 * Alubond brand palette derived from the logo:
 * - Navy:   #1B2D5B  (primary brand color)
 * - Orange: #E87722  (accent — the "o" in Alubond)
 * - Silver: #A0A8B8  (decorative arc)
 */
export const brand = {
  navy: '#1B2D5B',
  navyLight: '#2A4078',
  navyDark: '#111D3A',
  orange: '#E87722',
  orangeHover: '#F08A3A',
  silver: '#A0A8B8',
  silverLight: '#C8CDD6',
} as const

/**
 * Liquid glass UI chrome — frosted surfaces, specular edges, brand-tinted ambience.
 * Use with backdrop-filter for true glass; pair with `.app-liquid-mesh` background layer.
 */
export const glassChrome = {
  blur: 'blur(28px) saturate(155%)',
  blurMedium: 'blur(18px) saturate(145%)',
  blurHeavy: 'blur(40px) saturate(150%)',
  /** Primary floating panel fill — on true black */
  surface: 'rgba(255, 255, 255, 0.065)',
  surfaceHover: 'rgba(255, 255, 255, 0.095)',
  surfaceDeep: 'rgba(0, 0, 0, 0.55)',
  rail: 'rgba(255, 255, 255, 0.035)',
  border: 'rgba(255, 255, 255, 0.13)',
  borderSoft: 'rgba(255, 255, 255, 0.075)',
  borderAccent: 'rgba(232, 119, 34, 0.35)',
  specular: 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
  specularSoft: 'inset 0 1px 0 rgba(255, 255, 255, 0.07)',
  shadowFloat: '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04) inset',
  shadowLift: '0 24px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
  iconBg: 'rgba(255, 255, 255, 0.065)',
  iconBgActive: 'rgba(232, 119, 34, 0.2)',
  toolbar: 'rgba(0, 0, 0, 0.68)',
  /** Match landing: white + soft gray */
  text: 'rgba(255, 255, 255, 0.94)',
  textMuted: 'rgba(245, 245, 245, 0.55)',
} as const

/** Workspace: black + neutral gray liquid vignette (no blue). */
export const workspace = {
  canvas: '#000000',
  /** Radial vignette — gray lift + faint warm accent */
  sceneBg:
    'radial-gradient(ellipse 125% 100% at 50% 42%, rgba(42, 42, 42, 0.55) 0%, rgba(232, 119, 34, 0.03) 38%, rgba(0, 0, 0, 0.96) 52%, #000000 100%)',
  panel: 'transparent',
  card: glassChrome.surface,
  border: glassChrome.borderSoft,
  borderLight: glassChrome.border,
  text: glassChrome.text,
  textMuted: glassChrome.textMuted,
  iconBg: glassChrome.iconBg,
  iconBgActive: glassChrome.iconBgActive,
  toolbarBg: glassChrome.toolbar,
  toolbarBorder: glassChrome.border,
} as const

export const themeTokens = {
  light: {
    sidebarBg: 'rgba(255,255,255,0.72)',
    border: 'rgba(27, 45, 91, 0.12)',
    text: '#1B2D5B',
    textMuted: '#5E6A80',
    cardBg: 'rgba(255,255,255,0.85)',
    buttonBg: 'rgba(255,255,255,0.9)',
    buttonBorder: 'rgba(27, 45, 91, 0.14)',
    toggleOffBg: 'rgba(224, 228, 235, 0.9)',
    primary: '#1B2D5B',
    primaryHover: '#2A4078',
    accent: '#E87722',
    accentHover: '#F08A3A',
    selectedBorder: '#E87722',
    imgPlaceholder: 'rgba(237, 240, 244, 0.8)',
    iconBtnBg: 'rgba(27,45,91,0.08)',
    iconBtnColor: '#1B2D5B',
    skeletonBg: '#EDF0F4',
    skeletonBar: '#D4D9E2',
    compareDivider: '#D4D9E2',
    headerBg: 'rgba(255,255,255,0.75)',
    headerText: '#1B2D5B',
    headerTextMuted: 'rgba(27,45,91,0.55)',
    canvasBg: 'linear-gradient(180deg, #eef2f8 0%, #e4e9f2 100%)',
  },
  dark: {
    sidebarBg: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255,255,255,0.1)',
    text: 'rgba(255, 255, 255, 0.94)',
    textMuted: 'rgba(245, 245, 245, 0.52)',
    cardBg: 'rgba(255,255,255,0.055)',
    buttonBg: 'rgba(255,255,255,0.07)',
    buttonBorder: 'rgba(255,255,255,0.12)',
    toggleOffBg: 'rgba(255,255,255,0.06)',
    primary: '#d4d4d4',
    primaryHover: '#f5f5f5',
    accent: '#E87722',
    accentHover: '#F08A3A',
    selectedBorder: '#E87722',
    imgPlaceholder: 'rgba(0, 0, 0, 0.5)',
    iconBtnBg: 'rgba(255,255,255,0.07)',
    iconBtnColor: 'rgba(255, 255, 255, 0.9)',
    skeletonBg: 'rgba(255,255,255,0.05)',
    skeletonBar: 'rgba(255,255,255,0.1)',
    compareDivider: 'rgba(255,255,255,0.08)',
    headerBg: 'rgba(0, 0, 0, 0.5)',
    headerText: 'rgba(255, 255, 255, 0.94)',
    headerTextMuted: 'rgba(245, 245, 245, 0.5)',
    canvasBg: 'radial-gradient(ellipse 100% 85% at 50% 48%, #161616 0%, #000000 72%)',
  },
  workspace: {
    sidebarBg: 'transparent',
    border: glassChrome.borderSoft,
    text: glassChrome.text,
    textMuted: glassChrome.textMuted,
    cardBg: glassChrome.surface,
    buttonBg: glassChrome.iconBg,
    buttonBorder: glassChrome.border,
    toggleOffBg: 'rgba(255,255,255,0.06)',
    primary: '#1B2D5B',
    primaryHover: '#2A4078',
    accent: '#E87722',
    accentHover: '#F08A3A',
    selectedBorder: '#E87722',
    imgPlaceholder: 'rgba(255,255,255,0.04)',
    iconBtnBg: glassChrome.iconBg,
    iconBtnColor: glassChrome.text,
    skeletonBg: 'rgba(255,255,255,0.05)',
    skeletonBar: 'rgba(255,255,255,0.1)',
    compareDivider: 'rgba(255,255,255,0.08)',
    headerBg: glassChrome.surfaceDeep,
    headerText: glassChrome.text,
    headerTextMuted: glassChrome.textMuted,
    canvasBg: '#000000',
  },
} as const

export function getThemeTokens(theme: Theme) {
  return themeTokens[theme === 'workspace' ? 'workspace' : theme]
}
