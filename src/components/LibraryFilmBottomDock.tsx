import type { AlubondColor, PaletteStyle } from '../types'
import type { Theme } from '../theme'
import { brand, glassChrome } from '../theme'
import { libraryTabs } from '../data/palettes'
import { FilmStripColorRail } from './FilmStripColorRail'
import { FusionAiPanel } from './FusionAiPanel'

export function LibraryFilmBottomDock({
  theme,
  libraryTab,
  onLibraryTabChange,
  colours,
  selectedColor,
  onSelectColor,
  isSameColor,
}: {
  theme: Theme
  libraryTab: PaletteStyle
  onLibraryTabChange: (id: PaletteStyle) => void
  colours: AlubondColor[]
  selectedColor: AlubondColor | null
  onSelectColor: (color: AlubondColor | null) => void
  isSameColor: (a: AlubondColor | null, b: AlubondColor | null) => boolean
}) {
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
                background: isActive ? glassChrome.iconBgActive : glassChrome.iconBg,
                border: `1px solid ${isActive ? glassChrome.borderAccent : glassChrome.borderSoft}`,
                borderRadius: 999,
                color: isActive ? brand.orange : glassChrome.textMuted,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                letterSpacing: '0.02em',
                boxShadow: isActive ? glassChrome.specular : glassChrome.specularSoft,
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
          selectedColor={selectedColor}
          onSelectColor={onSelectColor}
          isSameColor={isSameColor}
        />
      ) : null}

      <FilmStripColorRail
        variant="bottomBar"
        theme={theme}
        colours={colours}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
        isSameColor={isSameColor}
      />
    </div>
  )
}
