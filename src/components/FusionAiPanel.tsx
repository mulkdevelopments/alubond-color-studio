import { useState, useCallback } from 'react'
import type { AlubondColor, PanelTextureRef } from '../types'
import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'
import {
  generateFusionSuggestions,
  type FusionSuggestion,
  fusionComboForFolder,
  materialPropsForFolder,
} from '../services/fusionSuggestions'
import { getPanelTextureFolderList } from '../data/panelTextureInventory'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'

function panelFolderLabel(folder: string): string {
  if (folder === 'stone&marbles') return 'Stone & marbles'
  return folder.charAt(0).toUpperCase() + folder.slice(1)
}

const PALETTES_PER_FUSION_CHOICES = [2, 3, 4] as const

function FusionPanelStrip({
  panels,
  size,
  borderRadius = 10,
}: {
  panels: PanelTextureRef[]
  size: number
  borderRadius?: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}
    >
      {panels.map((ref, i) => (
        <div
          key={`${ref.folder}-${ref.fileId}-${i}`}
          style={{
            flex: 1,
            minWidth: 0,
            background: `url("${getPanelTextureUrl(ref)}") center/cover`,
          }}
        />
      ))}
    </div>
  )
}

export function FusionAiPanel({
  theme,
  selectedColors,
  onTogglePaletteColor,
  variant = 'panel',
}: {
  theme: Theme
  selectedColors: AlubondColor[]
  onTogglePaletteColor: (color: AlubondColor) => void
  /** `dock` = bottom film bar (glass borders); `panel` = sidebar card */
  variant?: 'panel' | 'dock'
}) {
  const t = getThemeTokens(theme)
  const dock = variant === 'dock'
  const [fusionSuggestions, setFusionSuggestions] = useState<FusionSuggestion[]>([])
  const [fusionLoading, setFusionLoading] = useState(false)
  const [fusionError, setFusionError] = useState<string | null>(null)
  const [fusionPalettesPerFusion, setFusionPalettesPerFusion] = useState(3)
  const [fusionParticipants, setFusionParticipants] = useState<string[]>(() => [
    ...getPanelTextureFolderList(),
  ])

  const toggleFusionParticipant = useCallback((folder: string) => {
    setFusionParticipants((prev) =>
      prev.includes(folder) ? prev.filter((f) => f !== folder) : [...prev, folder].sort((a, b) => a.localeCompare(b))
    )
  }, [])

  const fusionSelectAllParticipants = useCallback(() => {
    setFusionParticipants([...getPanelTextureFolderList()])
  }, [])

  const handleGenerateFusionSuggestions = useCallback(async () => {
    setFusionError(null)
    if (fusionParticipants.length === 0) {
      setFusionError('Select at least one panel category to include.')
      return
    }
    setFusionLoading(true)
    try {
      const list = await generateFusionSuggestions({
        palettesPerFusion: fusionPalettesPerFusion,
        folders: fusionParticipants,
      })
      setFusionSuggestions(list)
    } catch (e) {
      setFusionError(e instanceof Error ? e.message : 'Failed to generate suggestions')
      setFusionSuggestions([])
    } finally {
      setFusionLoading(false)
    }
  }, [fusionPalettesPerFusion, fusionParticipants])

  const suggestionToColor = useCallback((s: FusionSuggestion): AlubondColor => {
    const cycle = s.panels.map((p) => ({ folder: p.folder, fileId: p.fileId }))
    const fusionOf = s.panels.map((p) => fusionComboForFolder(p.folder))
    const sku = `AI|${s.panels.map((p) => `${p.folder}|${p.fileId}`).join('+')}`
    const pa = materialPropsForFolder(s.panels[0].folder)
    const pb = materialPropsForFolder(s.panels[s.panels.length > 1 ? 1 : 0].folder)
    return {
      sku,
      name: s.name,
      collection: 'Fusion',
      finish: 'fusion',
      fusionOf,
      hex: '#e5e5e5',
      hexSecondary: '#d4d4d4',
      metalness: pa.metalness,
      roughness: pa.roughness,
      metalnessSecondary: pb.metalness,
      roughnessSecondary: pb.roughness,
      panelTexture: cycle[0],
      ...(cycle[1] ? { panelTextureSecondary: cycle[1] } : {}),
      fusionPanelCycle: cycle.length >= 2 ? cycle : undefined,
    }
  }, [])

  const borderColor = t.border
  const cardBg = dock ? t.buttonBg : t.cardBg
  const fusionApiConfigured =
    typeof import.meta.env.VITE_OPENAI_API_KEY === 'string' &&
    import.meta.env.VITE_OPENAI_API_KEY.trim().length > 0

  return (
    <div
      style={{
        padding: dock ? '0 0 10px' : '12px 16px',
        borderBottom: `1px solid ${t.border}`,
        marginBottom: dock ? 4 : undefined,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {PALETTES_PER_FUSION_CHOICES.map((n) => {
          const active = fusionPalettesPerFusion === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => setFusionPalettesPerFusion(n)}
              disabled={fusionLoading}
              style={{
                minWidth: 36,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 8,
                border: `1px solid ${active ? brand.orange : borderColor}`,
                background: active ? 'rgba(232,119,34,0.15)' : cardBg,
                color: active ? brand.orange : t.text,
                cursor: fusionLoading ? 'wait' : 'pointer',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h4
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 600,
            color: t.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Participants
        </h4>
        <button
          type="button"
          onClick={fusionSelectAllParticipants}
          disabled={fusionLoading}
          style={{
            padding: '2px 8px',
            fontSize: 10,
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            color: brand.orange,
            cursor: fusionLoading ? 'wait' : 'pointer',
            textDecoration: 'underline',
          }}
        >
          Select all
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {getPanelTextureFolderList().map((folder) => {
          const on = fusionParticipants.includes(folder)
          return (
            <button
              key={folder}
              type="button"
              onClick={() => toggleFusionParticipant(folder)}
              disabled={fusionLoading}
              title={folder}
              style={{
                padding: '5px 10px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 999,
                border: `1px solid ${on ? brand.orange : borderColor}`,
                background: on ? 'rgba(232,119,34,0.12)' : cardBg,
                color: on ? t.text : t.textMuted,
                cursor: fusionLoading ? 'wait' : 'pointer',
              }}
            >
              {panelFolderLabel(folder)}
            </button>
          )
        })}
      </div>
      <h4
        style={{
          margin: '0 0 8px',
          fontSize: 10,
          fontWeight: 600,
          color: t.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Generate a fusion
      </h4>
      {!fusionApiConfigured && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 10,
            lineHeight: 1.45,
            color: t.textMuted,
          }}
        >
          Set <code style={{ fontSize: 9 }}>VITE_OPENAI_API_KEY</code> in <code style={{ fontSize: 9 }}>.env</code> to
          enable AI suggestions. Ready-made fusion swatches still apply from the Fusion strip below.
        </p>
      )}
      <button
        type="button"
        onClick={handleGenerateFusionSuggestions}
        disabled={fusionLoading || fusionParticipants.length === 0 || !fusionApiConfigured}
        title={
          !fusionApiConfigured
            ? 'Add VITE_OPENAI_API_KEY to .env'
            : fusionParticipants.length === 0
              ? 'Select at least one category'
              : undefined
        }
        style={{
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 600,
          background:
            fusionLoading || fusionParticipants.length === 0 || !fusionApiConfigured ? borderColor : brand.orange,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor:
            fusionLoading
              ? 'wait'
              : fusionParticipants.length === 0 || !fusionApiConfigured
                ? 'not-allowed'
                : 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {fusionLoading ? 'Generating…' : 'Generate'}
      </button>
      {fusionError && <p style={{ margin: '8px 0 0', fontSize: 11, color: '#f87171' }}>{fusionError}</p>}
      {fusionSuggestions.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fusionSuggestions.map((s, i) => {
            const asColor = suggestionToColor(s)
            const selected = selectedColors.some((x) => x.sku === asColor.sku)
            return (
              <button
                key={`${s.name}-${i}`}
                type="button"
                onClick={() => onTogglePaletteColor(asColor)}
                style={{
                  padding: 10,
                  textAlign: 'left',
                  background: selected ? 'rgba(232,119,34,0.12)' : cardBg,
                  border: `1px solid ${selected ? brand.orange : borderColor}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <FusionPanelStrip panels={s.panels.map((p) => ({ folder: p.folder, fileId: p.fileId }))} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: t.textMuted, marginTop: 2 }}>
                      {s.panels.map((p) => `${p.folder}/${p.fileId}`).join(' → ')}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: t.textMuted, lineHeight: 1.4 }}>{s.whyGood}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
