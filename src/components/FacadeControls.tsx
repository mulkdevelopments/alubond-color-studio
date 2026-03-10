import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'
import type { FacadeSettings, PanelTransform, TypologyType } from './FacadeBuilding'
import type { AlubondColor } from '../types'

/** Competitor-aligned order: square, triangle, 2 diagonals, diamond, X, vertical/horizontal line, 2 vert, 2 horiz */
const TYPOLOGY_ORDER: TypologyType[] = [
  'square',
  'triangleDown',
  'diagonal',
  'diagonalTR',
  'diamond',
  'x',
  'verticalLine',
  'horizontalLine',
  'twoVertical',
  'twoHorizontal',
]

function TypologyIcon({ type, active, color }: { type: TypologyType; active: boolean; color: string }) {
  const stroke = active ? color : 'currentColor'
  const size = 20
  const vb = 24
  const common = { width: size, height: size, viewBox: `0 0 ${vb} ${vb}`, fill: 'none' as const, stroke: stroke, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'square':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /></svg>
    case 'diagonal':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="4" x2="20" y2="20" /></svg>
    case 'diagonalTR':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
    case 'verticalLine':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
    case 'horizontalLine':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
    case 'twoVertical':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="9.33" y1="4" x2="9.33" y2="20" /><line x1="14.67" y1="4" x2="14.67" y2="20" /></svg>
    case 'twoHorizontal':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="9.33" x2="20" y2="9.33" /><line x1="4" y1="14.67" x2="20" y2="14.67" /></svg>
    case 'parallelogram':
      return (
        <svg {...common}>
          <path d="M6 6 L18 6 L20 18 L4 18 Z" stroke={stroke} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
          <line x1="18" y1="6" x2="20" y2="12" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="6" y1="6" x2="4" y2="12" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" stroke={stroke} strokeWidth={1.5} strokeDasharray="2 1.5" strokeLinecap="round" />
          <line x1="20" y1="18" x2="20" y2="12" stroke={stroke} strokeWidth={1.5} strokeDasharray="2 1.5" strokeLinecap="round" />
          <line x1="4" y1="18" x2="4" y2="12" stroke={stroke} strokeWidth={1.5} strokeDasharray="2 1.5" strokeLinecap="round" />
        </svg>
      )
    case 'x':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
    case 'grid2x2':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
    case 'triangleDown':
      return <svg {...common}><path d="M12 4l8 16H4L12 4z" /></svg>
    case 'triangleRight':
      return <svg {...common}><path d="M4 4h16l-8 16V4z" /></svg>
    case 'diamond':
      return <svg {...common}><path d="M12 4l8 8-8 8-8-8 8-8z" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
    case 'triangleLeft':
      return <svg {...common}><path d="M20 4H4l8 16V4z" /></svg>
    case 'grid3x3': {
      const pad = 3
      const cell = (vb - 2 * pad) / 3
      return (
        <svg {...common}>
          <rect x={pad} y={pad} width={vb - 2 * pad} height={vb - 2 * pad} rx="0.5" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const x = pad + c * cell
              const y = pad + r * cell
              const isFilled = r === 1 && c === 0
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x + 0.5}
                  y={y + 0.5}
                  width={cell - 1}
                  height={cell - 1}
                  fill={isFilled ? 'currentColor' : 'none'}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
              )
            })
          )}
        </svg>
      )
    }
    default:
      return <svg {...common}><rect x="4" y="4" width="16" height="16" /></svg>
  }
}

interface FacadeControlsProps {
  theme: Theme
  settings: FacadeSettings
  onChange: (settings: FacadeSettings) => void
  selectedColor?: AlubondColor | null
  onApplyAll?: () => void
  /** 'horizontal' = bar layout; 'vertical' = stacked in left panel */
  layout?: 'horizontal' | 'vertical'
}

const TRANSFORMS: { value: PanelTransform; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'alternate', label: 'Alternate' },
  { value: 'wave', label: 'Wave' },
  { value: 'fold', label: 'Fold' },
  { value: 'diagonal', label: 'Diagonal' },
]

export function FacadeControls({ theme, settings, onChange, selectedColor, onApplyAll, layout = 'horizontal' }: FacadeControlsProps) {
  const t = getThemeTokens(theme)
  const isVertical = layout === 'vertical'

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: t.textMuted,
    marginBottom: 5,
  }

  const pillBtn = (isActive: boolean): React.CSSProperties => ({
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: isActive ? 600 : 500,
    background: isActive ? brand.orange : 'transparent',
    border: `1px solid ${isActive ? brand.orange : t.border}`,
    borderRadius: 20,
    color: isActive ? '#fff' : t.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  })

  const counterBtn: React.CSSProperties = {
    width: 26,
    height: 26,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: 'transparent',
    color: t.text,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s ease',
  }

  const sectionBlock = (label: string, content: React.ReactNode) => (
    <div style={{ padding: isVertical ? '12px 14px' : '0 14px', borderBottom: isVertical ? `1px solid ${t.border}` : undefined }}>
      <span style={sectionLabelStyle}>{label}</span>
      <div style={{ marginTop: 6 }}>{content}</div>
    </div>
  )

  const divider = () => (
    isVertical ? null : <div style={{ width: 1, alignSelf: 'stretch', background: t.border, margin: '4px 0' }} />
  )

  const typologyBtn = (typ: TypologyType): React.CSSProperties => ({
    width: 32,
    height: 32,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: `1px solid ${settings.typology === typ ? brand.orange : t.border}`,
    background: settings.typology === typ ? brand.orange : 'transparent',
    color: settings.typology === typ ? '#fff' : t.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  })

  const stepperWrap: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    background: t.sidebarBg ?? 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  }
  const stepperInput: React.CSSProperties = {
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: t.text,
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
  }
  const stepperArrow: React.CSSProperties = {
    width: 24,
    height: 16,
    padding: 0,
    border: 'none',
    borderLeft: `1px solid ${t.border}`,
    background: 'transparent',
    color: t.textMuted,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
  }

  const content = (
    <>
      {sectionBlock('Style & Typology', (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Row 1: first 5 icons (competitor layout) */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TYPOLOGY_ORDER.slice(0, 5).map((typ) => (
              <button
                key={typ}
                type="button"
                title={typ}
                onClick={() => onChange({ ...settings, typology: typ })}
                style={typologyBtn(typ)}
              >
                <TypologyIcon type={typ} active={settings.typology === typ} color="#fff" />
              </button>
            ))}
          </div>
          {/* Row 2: next 5 icons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TYPOLOGY_ORDER.slice(5, 10).map((typ) => (
              <button
                key={typ}
                type="button"
                title={typ}
                onClick={() => onChange({ ...settings, typology: typ })}
                style={typologyBtn(typ)}
              >
                <TypologyIcon type={typ} active={settings.typology === typ} color="#fff" />
              </button>
            ))}
          </div>
          {/* Typology label + stepper (competitor: "typologie 1.") */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: t.textMuted }}>Typology {settings.typologyParam}.</span>
            <div style={stepperWrap}>
              <input
                type="number"
                min={1}
                max={9}
                value={settings.typologyParam}
                onChange={(e) => {
                  const v = Math.min(9, Math.max(1, Number(e.target.value) || 1))
                  onChange({ ...settings, typologyParam: v })
                }}
                style={stepperInput}
                aria-label="Typology parameter"
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  type="button"
                  onClick={() => onChange({ ...settings, typologyParam: Math.min(9, settings.typologyParam + 1) })}
                  style={{ ...stepperArrow, borderLeft: 'none', borderBottom: `1px solid ${t.border}` }}
                  aria-label="Increment"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...settings, typologyParam: Math.max(1, settings.typologyParam - 1) })}
                  style={stepperArrow}
                  aria-label="Decrement"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {divider()}
      {sectionBlock('Columns', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" onClick={() => onChange({ ...settings, columns: Math.max(2, settings.columns - 1) })} style={counterBtn}>−</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, minWidth: 22, textAlign: 'center' }}>{settings.columns}</span>
          <button type="button" onClick={() => onChange({ ...settings, columns: Math.min(16, settings.columns + 1) })} style={counterBtn}>+</button>
        </div>
      ))}
      {divider()}
      {sectionBlock('Rows', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" onClick={() => onChange({ ...settings, rows: Math.max(1, settings.rows - 1) })} style={counterBtn}>−</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, minWidth: 22, textAlign: 'center' }}>{settings.rows}</span>
          <button type="button" onClick={() => onChange({ ...settings, rows: Math.min(12, settings.rows + 1) })} style={counterBtn}>+</button>
        </div>
      ))}
      {divider()}
      {sectionBlock('Transform', (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TRANSFORMS.map((tr) => (
            <button
              key={tr.value}
              type="button"
              title={tr.label}
              onClick={() => onChange({ ...settings, transform: tr.value })}
              style={pillBtn(settings.transform === tr.value)}
            >
              {tr.label}
            </button>
          ))}
        </div>
      ))}
      {divider()}
      {sectionBlock('Tilt', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="range"
            min={0}
            max={45}
            value={settings.tiltAngle}
            onChange={(e) => onChange({ ...settings, tiltAngle: Number(e.target.value) })}
            style={{ width: isVertical ? '100%' : 70, maxWidth: 200 }}
          />
          <span style={{ fontSize: 11, color: t.textMuted, minWidth: 26 }}>{settings.tiltAngle}°</span>
        </div>
      ))}
      {divider()}
      {sectionBlock('Surface', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selectedColor ? (
            <>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: selectedColor.hex, border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
              <button type="button" onClick={onApplyAll} style={{ padding: '5px 14px', fontSize: 11, fontWeight: 600, background: brand.orange, border: 'none', borderRadius: 20, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
                Apply All
              </button>
            </>
          ) : (
            <span style={{ fontSize: 10, color: t.textMuted }}>Select colour</span>
          )}
        </div>
      ))}
    </>
  )

  if (isVertical) {
    return (
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
        <div style={{ padding: '0 14px 8px', borderBottom: `1px solid ${t.border}`, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text }}>Facade controls</h3>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: t.textMuted }}>Style, proportion & transform</p>
        </div>
        {content}
      </div>
    )
  }

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '10px 16px',
        background: t.sidebarBg,
        borderTop: `1px solid ${t.border}`,
      }}
    >
      {content}
    </div>
  )
}
