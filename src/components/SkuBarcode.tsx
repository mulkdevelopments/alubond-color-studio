import { useEffect, useRef, type CSSProperties } from 'react'
import JsBarcode from 'jsbarcode'

/** CODE128-safe payload (printable ASCII, trimmed). */
export function sanitizeSkuForBarcode(sku: string): string {
  const t = sku.replace(/[^\x20-\x7E]/g, '-').replace(/\s+/g, ' ').trim()
  return t.length > 0 ? t.slice(0, 80) : 'ALUBOND'
}

type Props = {
  value: string
  /** Bar height in px */
  height?: number
  /** Narrow bar width */
  barWidth?: number
  displayValue?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Renders CODE128 from SKU (or similar) into an SVG via JsBarcode.
 */
export function SkuBarcode({
  value,
  height = 40,
  barWidth = 1.5,
  displayValue = true,
  className,
  style,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    while (el.firstChild) el.removeChild(el.firstChild)
    const payload = sanitizeSkuForBarcode(value)
    try {
      JsBarcode(el, payload, {
        format: 'CODE128',
        width: barWidth,
        height,
        displayValue,
        margin: 0,
        background: '#ffffff',
        lineColor: '#000000',
        fontSize: displayValue ? 11 : 0,
        textMargin: displayValue ? 2 : 0,
      })
    } catch {
      try {
        JsBarcode(el, 'SKU', {
          format: 'CODE128',
          width: barWidth,
          height,
          displayValue: false,
          margin: 0,
          background: '#ffffff',
        })
      } catch {
        /* ignore */
      }
    }
  }, [value, height, barWidth, displayValue])

  return <svg ref={svgRef} className={className} style={{ display: 'block', maxWidth: '100%', ...style }} />
}
