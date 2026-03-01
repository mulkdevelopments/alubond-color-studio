export type Theme = 'light' | 'dark'

export const themeTokens = {
  light: {
    sidebarBg: '#f6f8fa',
    border: '#d0d7de',
    text: '#24292f',
    textMuted: '#57606a',
    cardBg: '#ffffff',
    buttonBg: '#ffffff',
    buttonBorder: '#d0d7de',
    toggleOffBg: '#eaeef2',
    primary: '#238636',
    primaryHover: '#2ea043',
    selectedBorder: '#0969da',
    imgPlaceholder: '#eaeef2',
    iconBtnBg: 'rgba(0,0,0,0.06)',
    iconBtnColor: '#24292f',
    skeletonBg: '#eaeef2',
    skeletonBar: '#d0d7de',
    compareDivider: '#d0d7de',
  },
  dark: {
    sidebarBg: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    cardBg: '#21262d',
    buttonBg: '#21262d',
    buttonBorder: '#30363d',
    toggleOffBg: '#30363d',
    primary: '#238636',
    primaryHover: '#2ea043',
    selectedBorder: '#58a6ff',
    imgPlaceholder: '#0d1117',
    iconBtnBg: 'rgba(0,0,0,0.5)',
    iconBtnColor: '#fff',
    skeletonBg: '#21262d',
    skeletonBar: '#30363d',
    compareDivider: '#30363d',
  },
} as const

export function getThemeTokens(theme: Theme) {
  return themeTokens[theme]
}
