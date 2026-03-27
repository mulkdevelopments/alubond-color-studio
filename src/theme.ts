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

/** Workspace shell (header, rails, dock) — light vs dark glass. */
export type WorkspaceAppearance = 'light' | 'dark'

export type WorkspaceShell = {
  blur: string
  blurMedium: string
  blurHeavy: string
  surface: string
  surfaceDeep: string
  rail: string
  border: string
  borderSoft: string
  borderAccent: string
  specular: string
  specularSoft: string
  shadowFloat: string
  iconBg: string
  iconBgActive: string
  toolbar: string
  text: string
  textMuted: string
  appBackground: string
  mainSceneBg: string
  mainInsetShadow: string
  studioDropdownBg: string
  studioDropdownBorder: string
  studioDropdownShadow: string
  studioDropdownItemMuted: string
  dockChromeShadow: string
}

const workspaceShellDark: WorkspaceShell = {
  blur: glassChrome.blur,
  blurMedium: glassChrome.blurMedium,
  blurHeavy: glassChrome.blurHeavy,
  surface: glassChrome.surface,
  surfaceDeep: glassChrome.surfaceDeep,
  rail: glassChrome.rail,
  border: glassChrome.border,
  borderSoft: glassChrome.borderSoft,
  borderAccent: glassChrome.borderAccent,
  specular: glassChrome.specular,
  specularSoft: glassChrome.specularSoft,
  shadowFloat: glassChrome.shadowFloat,
  iconBg: glassChrome.iconBg,
  iconBgActive: glassChrome.iconBgActive,
  toolbar: glassChrome.toolbar,
  text: glassChrome.text,
  textMuted: glassChrome.textMuted,
  appBackground: '#000000',
  mainSceneBg: workspace.sceneBg,
  mainInsetShadow: 'inset 0 0 80px rgba(0,0,0,0.25)',
  studioDropdownBg: '#0a0a0a',
  studioDropdownBorder: 'rgba(255,255,255,0.14)',
  studioDropdownShadow: '0 16px 48px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
  studioDropdownItemMuted: 'rgba(255,255,255,0.88)',
  dockChromeShadow:
    '0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px rgba(232,119,34,0.08)',
}

const workspaceShellLight: WorkspaceShell = {
  blur: glassChrome.blur,
  blurMedium: glassChrome.blurMedium,
  blurHeavy: glassChrome.blurHeavy,
  surface: 'rgba(255,255,255,0.88)',
  surfaceDeep: 'rgba(255,255,255,0.94)',
  rail: 'rgba(255,255,255,0.72)',
  border: 'rgba(27, 45, 91, 0.14)',
  borderSoft: 'rgba(27, 45, 91, 0.1)',
  borderAccent: 'rgba(232, 119, 34, 0.42)',
  specular: 'inset 0 1px 0 rgba(255,255,255,0.95)',
  specularSoft: 'inset 0 1px 0 rgba(255,255,255,0.75)',
  shadowFloat: '0 8px 28px rgba(27,45,91,0.1), 0 0 0 1px rgba(27,45,91,0.06) inset',
  iconBg: 'rgba(27,45,91,0.07)',
  iconBgActive: 'rgba(232, 119, 34, 0.2)',
  toolbar: 'rgba(255,255,255,0.94)',
  text: '#1B2D5B',
  textMuted: 'rgba(27, 45, 91, 0.52)',
  appBackground: '#e4e9f2',
  mainSceneBg:
    'radial-gradient(ellipse 125% 100% at 50% 40%, rgba(255,255,255,0.98) 0%, rgba(236, 241, 250, 1) 45%, #d8e0ee 100%)',
  mainInsetShadow: 'inset 0 0 72px rgba(27,45,91,0.07)',
  studioDropdownBg: '#ffffff',
  studioDropdownBorder: 'rgba(27, 45, 91, 0.12)',
  studioDropdownShadow: '0 16px 40px rgba(27,45,91,0.12), inset 0 1px 0 rgba(255,255,255,1)',
  studioDropdownItemMuted: 'rgba(27, 45, 91, 0.78)',
  dockChromeShadow:
    '0 12px 36px rgba(27,45,91,0.12), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(232,119,34,0.1)',
}

export function getWorkspaceShell(appearance: WorkspaceAppearance): WorkspaceShell {
  return appearance === 'light' ? workspaceShellLight : workspaceShellDark
}

/** Modals / generate dialogs — match workspace light vs dark. */
export function getStudioModalChrome(theme: Theme) {
  const isLight = theme === 'light'
  if (isLight) {
    return {
      overlay: 'rgba(27, 45, 91, 0.38)',
      panelBg: '#ffffff',
      panelBorder: 'rgba(27, 45, 91, 0.14)',
      text: '#1B2D5B',
      muted: 'rgba(27, 45, 91, 0.55)',
      fieldBg: '#f1f4f9',
      fieldBorder: 'rgba(27, 45, 91, 0.16)',
      cancelBg: '#e8ecf4',
      panelShadow: '0 24px 56px rgba(27, 45, 91, 0.16)',
      skuRowLabel: 'rgba(27, 45, 91, 0.5)',
      skuRowValue: '#1B2D5B',
    } as const
  }
  return {
    overlay: 'rgba(0, 0, 0, 0.55)',
    panelBg: '#0a0a0a',
    panelBorder: 'rgba(255, 255, 255, 0.12)',
    text: '#f0f0f0',
    muted: 'rgba(255, 255, 255, 0.58)',
    fieldBg: '#141414',
    fieldBorder: 'rgba(255, 255, 255, 0.12)',
    cancelBg: '#1a1a1a',
    panelShadow: '0 20px 60px rgba(0, 0, 0, 0.55)',
    skuRowLabel: 'rgba(255, 255, 255, 0.45)',
    skuRowValue: 'rgba(255, 255, 255, 0.92)',
  } as const
}
