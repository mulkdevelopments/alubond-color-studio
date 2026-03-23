import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { AlubondColor } from '../types'
import { getFinishLabel } from '../data/palettes'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'
import { getFusionTextureCycle } from '../utils/fusionPanelCycle'
import { SkuBarcode } from './SkuBarcode'
import { brand } from '../theme'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, fontSize: 13, alignItems: 'start' }}>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</div>
      <div style={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.45 }}>{children}</div>
    </div>
  )
}

export function PaletteSkuDetailDialog({ color, onClose }: { color: AlubondColor; onClose: () => void }) {
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
          background: 'rgba(0,0,0,0.65)',
          cursor: 'pointer',
        }}
      />
      <div
        style={{
          position: 'relative',
          maxWidth: 440,
          width: '100%',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          background: '#0a0a0a',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
          padding: '24px 24px 20px',
          maxHeight: 'min(90vh, 640px)',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="palette-sku-dialog-title"
          style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#f5f5f5', lineHeight: 1.25 }}
        >
          {color.name}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{color.collection}</p>

        <div
          style={{
            padding: '12px 14px',
            background: '#fff',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <SkuBarcode value={color.sku} height={52} barWidth={1.8} displayValue />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row label="SKU / code">{color.sku}</Row>
          <Row label="Finish">{getFinishLabel(color)}</Row>
          {color.fusionOf && color.fusionOf.length >= 2 ? (
            <Row label="Fusion">{color.fusionOf.join(' + ')}</Row>
          ) : null}
          {color.panelTexture ? (
            <Row label="Panel texture">
              <img
                src={getPanelTextureUrl(color.panelTexture)}
                alt=""
                style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </Row>
          ) : null}
          {color.panelTextureSecondary ? (
            <Row label="Panel B">
              <img
                src={getPanelTextureUrl(color.panelTextureSecondary)}
                alt=""
                style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </Row>
          ) : null}
          {cycle && cycle.length > 0 ? (
            <Row label="Fusion cycle">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {cycle.map((p, i) => (
                  <li key={`${p.folder}-${p.fileId}-${i}`} style={{ fontSize: 12, marginBottom: 4 }}>
                    <code>
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
