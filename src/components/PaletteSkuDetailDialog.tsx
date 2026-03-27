import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { AlubondColor } from '../types'
import { getFinishLabel } from '../data/palettes'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'
import { getFusionTextureCycle } from '../utils/fusionPanelCycle'
import { SkuQrCode } from './SkuQrCode'
import { brand, getStudioModalChrome, type Theme } from '../theme'

const PANEL_PREVIEW_MAX = 220

function Row({
  label,
  children,
  labelColor,
  valueColor,
}: {
  label: string
  children: React.ReactNode
  labelColor: string
  valueColor: string
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '128px 1fr', gap: 12, fontSize: 13, alignItems: 'start' }}>
      <div style={{ color: labelColor, fontWeight: 600 }}>{label}</div>
      <div style={{ color: valueColor, lineHeight: 1.45 }}>{children}</div>
    </div>
  )
}

export function PaletteSkuDetailDialog({
  color,
  theme,
  onClose,
}: {
  color: AlubondColor
  theme: Theme
  onClose: () => void
}) {
  const panel = getStudioModalChrome(theme)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const cycle = getFusionTextureCycle(color)

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="palette-sku-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 12000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          border: 'none',
          margin: 0,
          padding: 0,
          background: panel.overlay,
          cursor: 'pointer',
        }}
      />
      <div
        style={{
          position: 'relative',
          maxWidth: 560,
          width: '100%',
          borderRadius: 16,
          border: `1px solid ${panel.panelBorder}`,
          background: panel.panelBg,
          boxShadow: panel.panelShadow,
          padding: '24px 24px 20px',
          maxHeight: 'min(90vh, 640px)',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="palette-sku-dialog-title"
          style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: panel.text, lineHeight: 1.25 }}
        >
          {color.name}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: panel.muted }}>{color.collection}</p>

        <div
          style={{
            padding: 16,
            background: '#fff',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            overflow: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {color.panelTexture ? (
              <img
                src={getPanelTextureUrl(color.panelTexture)}
                alt=""
                style={{
                  maxWidth: color.panelTextureSecondary ? PANEL_PREVIEW_MAX * 0.92 : PANEL_PREVIEW_MAX,
                  maxHeight: PANEL_PREVIEW_MAX,
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 10,
                  border: '1px solid rgba(0,0,0,0.12)',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: Math.min(PANEL_PREVIEW_MAX, 200),
                  aspectRatio: '1',
                  borderRadius: 10,
                  background: color.hex,
                  border: '1px solid rgba(0,0,0,0.12)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
                }}
              />
            )}
            {color.panelTextureSecondary ? (
              <img
                src={getPanelTextureUrl(color.panelTextureSecondary)}
                alt=""
                style={{
                  maxWidth: PANEL_PREVIEW_MAX * 0.92,
                  maxHeight: PANEL_PREVIEW_MAX,
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 10,
                  border: '1px solid rgba(0,0,0,0.12)',
                  display: 'block',
                }}
              />
            ) : null}
          </div>
          <span style={{ fontSize: 13, color: '#333', fontWeight: 600, letterSpacing: '0.02em', textAlign: 'center' }}>
            {color.collection} · {color.sku}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row label="SKU / code" labelColor={panel.skuRowLabel} valueColor={panel.skuRowValue}>
            {color.sku}
          </Row>
          <Row label="Finish" labelColor={panel.skuRowLabel} valueColor={panel.skuRowValue}>
            {getFinishLabel(color)}
          </Row>
          {color.fusionOf && color.fusionOf.length >= 2 ? (
            <Row label="Fusion" labelColor={panel.skuRowLabel} valueColor={panel.skuRowValue}>
              {color.fusionOf.join(' + ')}
            </Row>
          ) : null}
          <Row label="QR code" labelColor={panel.skuRowLabel} valueColor={panel.skuRowValue}>
            <div
              style={{
                padding: 12,
                background: '#fff',
                borderRadius: 10,
                display: 'inline-block',
                lineHeight: 0,
              }}
            >
              <SkuQrCode value={color.sku} size={PANEL_PREVIEW_MAX} marginSize={2} />
            </div>
          </Row>
          {cycle && cycle.length > 0 ? (
            <Row label="Fusion cycle" labelColor={panel.skuRowLabel} valueColor={panel.skuRowValue}>
              <ul style={{ margin: 0, paddingLeft: 18, color: panel.text }}>
                {cycle.map((p, i) => (
                  <li key={`${p.folder}-${p.fileId}-${i}`} style={{ fontSize: 12, marginBottom: 4 }}>
                    <code style={{ color: panel.text }}>
                      {p.folder}/{p.fileId}
                    </code>
                  </li>
                ))}
              </ul>
            </Row>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 22,
            width: '100%',
            padding: '11px 16px',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            borderRadius: 10,
            background: brand.orange,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
