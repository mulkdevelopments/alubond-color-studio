import { QRCodeSVG } from 'qrcode.react'
import { sanitizeSkuForBarcode } from './SkuBarcode'

type Props = {
  value: string
  /** Pixel width/height of the QR module area. */
  size?: number
  /** Quiet zone in modules (smaller helps tiny film-strip overlays). */
  marginSize?: number
}

/** QR encoding the SKU (or safe fallback) for scanning in the palette detail dialog. */
export function SkuQrCode({ value, size = 200, marginSize = 2 }: Props) {
  const payload = sanitizeSkuForBarcode(value)
  return (
    <QRCodeSVG
      value={payload}
      size={size}
      level="M"
      marginSize={marginSize}
      bgColor="#ffffff"
      fgColor="#000000"
      title={`QR code for ${payload}`}
      role="img"
    />
  )
}
