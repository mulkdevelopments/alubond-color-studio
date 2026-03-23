import { useRef, useCallback } from 'react'
import type { AlubondColor } from '../types'
import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'
import { getFinishLabel } from '../data/palettes'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'
import { getFusionTextureCycle } from '../utils/fusionPanelCycle'
import { playFilmAdvanceTick, unlockFilmAudio } from '../utils/filmStripSound'

interface FilmStripColorRailProps {
  theme: Theme
  colours: AlubondColor[]
  selectedColor: AlubondColor | null
  onSelectColor: (color: AlubondColor | null) => void
  isSameColor: (a: AlubondColor | null, b: AlubondColor | null) => boolean
  /** `topDock` = compact header bar; `bottomBar` = full-size film for fixed bottom dock; `panel` = sidebar rail */
  variant?: 'panel' | 'topDock' | 'bottomBar'
}

/** Top / bottom sprocket row — old 35mm-style perforations */
function SprocketRow({ compact }: { compact?: boolean }) {
  const h = compact ? 6 : 11
  return (
    <div
      aria-hidden
      style={{
        height: h,
        flexShrink: 0,
        background: '#0a0a0a',
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent 0,
          transparent 9px,
          rgba(255,255,255,0.04) 9px,
          rgba(255,255,255,0.04) 10px,
          transparent 10px,
          transparent 22px
        )`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '2px 0',
          backgroundImage: `repeating-linear-gradient(
            90deg,
            #1a1a1a 0,
            #1a1a1a 5px,
            transparent 5px,
            transparent 14px
          )`,
          backgroundSize: '14px 100%',
          borderRadius: 1,
          opacity: 0.95,
        }}
      />
    </div>
  )
}

export function FilmStripColorRail({
  theme,
  colours,
  selectedColor,
  onSelectColor,
  isSameColor,
  variant = 'panel',
}: FilmStripColorRailProps) {
  const t = getThemeTokens(theme)
  const dock = variant === 'topDock'
  const bottomBar = variant === 'bottomBar'
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastScrollLeft = useRef(0)

  const handleInteractionStart = useCallback(() => {
    unlockFilmAudio()
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const dx = Math.abs(el.scrollLeft - lastScrollLeft.current)
    if (dx >= 3) {
      playFilmAdvanceTick()
      lastScrollLeft.current = el.scrollLeft
    }
  }, [])

  const renderSwatchInner = (color: AlubondColor) => {
    const textureCycle = getFusionTextureCycle(color)
    const fusionMultiTextures = !!(textureCycle && textureCycle.length >= 2)
    const fusionDual =
      color.finish === 'fusion' &&
      (fusionMultiTextures || color.hexSecondary != null || color.panelTextureSecondary != null)
    const dualPanel = fusionMultiTextures || !!(color.panelTexture && color.panelTextureSecondary)
    const r = dock ? 7 : 10

    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          display: fusionDual ? 'flex' : 'block',
          borderRadius: r,
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)',
          background:
            color.panelTexture && !dualPanel
              ? `url("${getPanelTextureUrl(color.panelTexture)}") center/cover`
              : undefined,
        }}
      >
        {fusionMultiTextures && textureCycle ? (
          textureCycle.map((ref, idx) => (
            <div
              key={`${color.sku}-${ref.folder}-${ref.fileId}-${idx}`}
              style={{
                flex: 1,
                minWidth: 0,
                background: `url("${getPanelTextureUrl(ref)}") center/cover`,
              }}
            />
          ))
        ) : dualPanel && fusionDual ? (
          <>
            <div
              style={{
                flex: 1,
                background: `url("${getPanelTextureUrl(color.panelTexture!)}") center/cover`,
              }}
            />
            <div
              style={{
                flex: 1,
                background: `url("${getPanelTextureUrl(color.panelTextureSecondary!)}") center/cover`,
              }}
            />
          </>
        ) : fusionDual && color.panelTexture && color.hexSecondary && !color.panelTextureSecondary ? (
          <>
            <div
              style={{
                flex: 1,
                background: `url("${getPanelTextureUrl(color.panelTexture)}") center/cover`,
              }}
            />
            <div style={{ flex: 1, background: color.hexSecondary }} />
          </>
        ) : fusionDual && color.hexSecondary ? (
          <>
            <div style={{ flex: 1, background: color.hex }} />
            <div style={{ flex: 1, background: color.hexSecondary }} />
          </>
        ) : !color.panelTexture ? (
          <div style={{ width: '100%', height: '100%', background: color.hex }} />
        ) : null}
      </div>
    )
  }

  const filmShell = (
      <div
        style={{
          borderRadius: dock ? 14 : 20,
          overflow: 'hidden',
          border: `1px solid rgba(255,255,255,0.1)`,
          boxShadow: dock
            ? '0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          background: 'linear-gradient(180deg, #2b2b2b 0%, #121212 40%, #1e1e1e 100%)',
        }}
      >
        <SprocketRow compact={dock} />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onPointerDown={handleInteractionStart}
          onWheel={handleInteractionStart}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: dock ? 8 : 14,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: dock ? '6px 8px' : '12px 14px',
            maxHeight: dock ? 72 : undefined,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: `${brand.orange}33 transparent`,
          }}
        >
          {colours.length === 0 ? (
            <div
              style={{
                padding: '20px 16px',
                fontSize: 12,
                color: t.textMuted,
                width: '100%',
                textAlign: 'center',
              }}
            >
              No colours in this category.
            </div>
          ) : (
            colours.map((color) => {
              const selected = isSameColor(selectedColor, color)

              return (
                <button
                  key={color.sku}
                  type="button"
                  onClick={() => {
                    unlockFilmAudio()
                    playFilmAdvanceTick()
                    onSelectColor(selected ? null : color)
                  }}
                  style={{
                    flex: '0 0 auto',
                    width: dock ? 64 : 92,
                    padding: dock ? 4 : 7,
                    borderRadius: dock ? 10 : 14,
                    border: `2px solid ${selected ? brand.orange : 'rgba(255,255,255,0.12)'}`,
                    background: 'linear-gradient(145deg, #3a3a3a 0%, #1f1f1f 100%)',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: selected
                      ? `0 0 0 1px rgba(232,119,34,0.4), 0 6px 18px rgba(232,119,34,0.2), inset 0 1px 0 rgba(255,255,255,0.08)`
                      : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.35)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                    transform: selected ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {renderSwatchInner(color)}
                  <div
                    style={{
                      marginTop: dock ? 4 : 6,
                      textAlign: 'left',
                      minHeight: dock ? 14 : 34,
                    }}
                  >
                    <div
                      style={{
                        fontSize: dock ? 7 : 9,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.85)',
                        letterSpacing: '0.04em',
                        lineHeight: 1.15,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: dock ? 56 : undefined,
                      }}
                      title={`${color.sku} · ${color.name}`}
                    >
                      {color.sku}
                    </div>
                    {!dock && (
                      <>
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 500,
                            color: t.textMuted,
                            marginTop: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={color.name}
                        >
                          {color.name}
                        </div>
                        {color.finish === 'fusion' && color.fusionOf && color.fusionOf.length >= 2 && (
                          <div style={{ fontSize: 7, color: t.textMuted, marginTop: 2, opacity: 0.85 }}>
                            {getFinishLabel(color)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
        <SprocketRow compact={dock} />
      </div>
  )

  if (dock) {
    return <div style={{ flexShrink: 0, minWidth: 0, width: '100%' }}>{filmShell}</div>
  }

  if (bottomBar) {
    return (
      <div style={{ flexShrink: 0, width: '100%', minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: t.textMuted,
            marginBottom: 8,
            paddingLeft: 2,
          }}
        >
          Colour library — film
        </div>
        {filmShell}
      </div>
    )
  }

  return (
    <div
      style={{
        flexShrink: 0,
        padding: '8px 10px 12px',
        borderTop: `1px solid ${t.border}`,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: t.textMuted,
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        Colour library — film
      </div>
      {filmShell}
    </div>
  )
}
