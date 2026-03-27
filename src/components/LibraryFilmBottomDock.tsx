import type { AlubondColor, PaletteStyle } from '../types'
import type { Theme, WorkspaceAppearance } from '../theme'
import { brand, getWorkspaceShell } from '../theme'
import { libraryTabs } from '../data/palettes'
import { FilmStripColorRail } from './FilmStripColorRail'
import { FusionAiPanel } from './FusionAiPanel'

export function LibraryFilmBottomDock({
  theme,
  workspaceAppearance,
  libraryTab,
  onLibraryTabChange,
  colours,
  selectedColors,
  onTogglePaletteColor,
}: {
  theme: Theme
  workspaceAppearance: WorkspaceAppearance
  libraryTab: PaletteStyle
  onLibraryTabChange: (id: PaletteStyle) => void
  colours: AlubondColor[]
  selectedColors: AlubondColor[]
  onTogglePaletteColor: (color: AlubondColor) => void
}) {
  const shell = getWorkspaceShell(workspaceAppearance)
  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        role="tablist"
        aria-label="Library categories"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 4,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: 2,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: `${brand.orange}44 transparent`,
        }}
      >
        {libraryTabs.map((tab) => {
          const isActive = libraryTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onLibraryTabChange(tab.id)}
              style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                background: isActive ? shell.iconBgActive : shell.iconBg,
                border: `1px solid ${isActive ? shell.borderAccent : shell.borderSoft}`,
                borderRadius: 999,
                color: isActive ? brand.orange : shell.textMuted,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                letterSpacing: '0.02em',
                boxShadow: isActive ? shell.specular : shell.specularSoft,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {libraryTab === 'Fusion' ? (
        <FusionAiPanel
          variant="dock"
          theme={theme}
          selectedColors={selectedColors}
          onTogglePaletteColor={onTogglePaletteColor}
        />
      ) : null}

      <FilmStripColorRail
        variant="bottomBar"
        theme={theme}
        colours={colours}
        selectedColors={selectedColors}
        onTogglePaletteColor={onTogglePaletteColor}
      />
    </div>
  )
}
