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

/** Tripo-style workspace: dark charcoal base. Scene uses radial gradient. */
export const workspace = {
  canvas: '#1A1A1A',
  /** Radial gradient for 3D scene: slightly lighter center, darker edges */
  sceneBg: 'radial-gradient(ellipse 120% 120% at 50% 50%, #2a2a2a 0%, #1c1c1c 45%, #0d0d0d 100%)',
  panel: '#252525',
  card: '#2C2C2C',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.1)',
  text: 'rgba(255,255,255,0.9)',
  textMuted: 'rgba(255,255,255,0.5)',
  iconBg: 'rgba(255,255,255,0.06)',
  iconBgActive: 'rgba(232,119,34,0.2)',
  toolbarBg: 'rgba(37,37,37,0.95)',
  toolbarBorder: 'rgba(255,255,255,0.08)',
} as const

export const themeTokens = {
  light: {
    sidebarBg: '#F5F7FA',
    border: '#E0E4EB',
    text: '#1B2D5B',
    textMuted: '#5E6A80',
    cardBg: '#FFFFFF',
    buttonBg: '#FFFFFF',
    buttonBorder: '#D4D9E2',
    toggleOffBg: '#E0E4EB',
    primary: '#1B2D5B',
    primaryHover: '#2A4078',
    accent: '#E87722',
    accentHover: '#F08A3A',
    selectedBorder: '#E87722',
    imgPlaceholder: '#EDF0F4',
    iconBtnBg: 'rgba(27,45,91,0.07)',
    iconBtnColor: '#1B2D5B',
    skeletonBg: '#EDF0F4',
    skeletonBar: '#D4D9E2',
    compareDivider: '#D4D9E2',
    headerBg: '#1B2D5B',
    headerText: '#FFFFFF',
    headerTextMuted: 'rgba(255,255,255,0.7)',
    canvasBg: '#EDF0F4',
  },
  dark: {
    sidebarBg: '#0E1525',
    border: '#1E2A40',
    text: '#E4E9F1',
    textMuted: '#8892A4',
    cardBg: '#152036',
    buttonBg: '#1A2744',
    buttonBorder: '#2A3B58',
    toggleOffBg: '#1E2A40',
    primary: '#3B5998',
    primaryHover: '#4A6DB5',
    accent: '#E87722',
    accentHover: '#F08A3A',
    selectedBorder: '#E87722',
    imgPlaceholder: '#0A1020',
    iconBtnBg: 'rgba(255,255,255,0.08)',
    iconBtnColor: '#E4E9F1',
    skeletonBg: '#152036',
    skeletonBar: '#1E2A40',
    compareDivider: '#1E2A40',
    headerBg: '#0A1020',
    headerText: '#E4E9F1',
    headerTextMuted: 'rgba(255,255,255,0.55)',
    canvasBg: '#0E1525',
  },
  workspace: {
    sidebarBg: '#252525',
    border: 'rgba(255,255,255,0.08)',
    text: 'rgba(255,255,255,0.9)',
    textMuted: 'rgba(255,255,255,0.5)',
    cardBg: '#2C2C2C',
    buttonBg: 'rgba(255,255,255,0.06)',
    buttonBorder: 'rgba(255,255,255,0.1)',
    toggleOffBg: 'rgba(255,255,255,0.08)',
    primary: '#1B2D5B',
    primaryHover: '#2A4078',
    accent: '#E87722',
    accentHover: '#F08A3A',
    selectedBorder: '#E87722',
    imgPlaceholder: 'rgba(255,255,255,0.04)',
    iconBtnBg: 'rgba(255,255,255,0.06)',
    iconBtnColor: 'rgba(255,255,255,0.9)',
    skeletonBg: 'rgba(255,255,255,0.06)',
    skeletonBar: 'rgba(255,255,255,0.1)',
    compareDivider: 'rgba(255,255,255,0.1)',
    headerBg: '#252525',
    headerText: 'rgba(255,255,255,0.9)',
    headerTextMuted: 'rgba(255,255,255,0.5)',
    canvasBg: '#1A1A1A',
  },
} as const

export function getThemeTokens(theme: Theme) {
  return themeTokens[theme === 'workspace' ? 'workspace' : theme]
}
