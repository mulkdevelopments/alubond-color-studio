/**
 * Wood-grain texture to match reference panel:
 * Dense fine vertical grain, natural undulations, medium-dark brown grain lines,
 * exact base colour, matte finish. No lightening.
 */

const cache = new Map<string, string>()
const SIZE = 384

/** Normalize hex to lowercase for consistent cache key (palette + facade). */
export function normalizeWoodHex(hex: string): string {
  const h = hex.replace('#', '').toLowerCase()
  return h.length === 6 ? '#' + h : hex
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function seed(x: number, y: number, s: number): number {
  const n = (x * 7 + y * 31 + s * 127) % 991
  return (n * n * 0.0001) % 1
}

export function getWoodGrainDataUrl(baseHex: string): string {
  const key = normalizeWoodHex(baseHex)
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return baseHex

  const [r, g, b] = hexToRgb(key)
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Very soft horizontal bands (growth rings) – minimal so base stays exact
  for (let band = 0; band < 8; band++) {
    const y = (band / 8) * SIZE + seed(band, 0, 1) * 8
    const grad = ctx.createLinearGradient(0, y - 8, 0, y + 8)
    const d = Math.floor(seed(band, 1, 2) * 6) - 3
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.5, `rgba(${Math.max(0, r + d)},${Math.max(0, g + d)},${Math.max(0, b + d)},0.06)`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SIZE, SIZE)
  }

  // Primary vertical grain: dense, fine, natural waviness (main grain lines)
  const mainGrain = 180
  for (let i = 0; i < mainGrain; i++) {
    const baseX = (i / mainGrain) * SIZE + (i * 11) % 6
    const darkR = Math.max(0, r - 28 - (i % 5) * 5)
    const darkG = Math.max(0, g - 24 - (i % 5) * 4)
    const darkB = Math.max(0, b - 18 - (i % 5) * 4)
    const alpha = 0.58 + seed(i, 2, 3) * 0.22

    ctx.beginPath()
    for (let py = 0; py <= SIZE; py += 3) {
      const t = py / SIZE
      const wave =
        Math.sin(t * Math.PI * 2.5 + i * 0.35) * 1.4 +
        Math.sin(t * Math.PI * 6 + i * 0.7) * 0.5
      const x = baseX + wave
      if (py === 0) ctx.moveTo(x, py)
      else ctx.lineTo(x, py)
    }
    ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},${alpha})`
    ctx.lineWidth = 0.5 + (i % 4) * 0.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  // Finer dark grain (tight vertical lines, gray-brown)
  for (let i = 0; i < 220; i++) {
    const baseX = (i / 220) * SIZE + (i * 13) % 5
    const darkR = Math.max(0, r - 38 - (i % 6) * 6)
    const darkG = Math.max(0, g - 32 - (i % 6) * 5)
    const darkB = Math.max(0, b - 26 - (i % 6) * 4)
    const alpha = 0.38 + seed(i, 6, 7) * 0.24

    ctx.beginPath()
    for (let py = 0; py <= SIZE; py += 4) {
      const t = py / SIZE
      const wave = Math.sin(t * Math.PI * 3 + i * 0.4) * 0.7
      const x = baseX + wave
      if (py === 0) ctx.moveTo(x, py)
      else ctx.lineTo(x, py)
    }
    ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},${alpha})`
    ctx.lineWidth = 0.35
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Very subtle lighter streaks (only a hint so base colour isn’t lightened)
  for (let i = 0; i < 35; i++) {
    const baseX = (i / 35) * SIZE + (i * 17) % 7
    const lightR = Math.min(255, r + 8 + (i % 2) * 2)
    const lightG = Math.min(255, g + 6 + (i % 2) * 2)
    const lightB = Math.min(255, b + 4 + (i % 2))
    const alpha = 0.08 + seed(i, 8, 9) * 0.06

    ctx.beginPath()
    for (let py = 0; py <= SIZE; py += 6) {
      const t = py / SIZE
      const wave = Math.sin(t * Math.PI * 4 + i * 0.5) * 0.6
      const x = baseX + wave
      if (py === 0) ctx.moveTo(x, py)
      else ctx.lineTo(x, py)
    }
    ctx.strokeStyle = `rgba(${lightR},${lightG},${lightB},${alpha})`
    ctx.lineWidth = 0.8
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Matte: very fine noise only (no groove/ridge so colour stays exact)
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const n = ((i * 13 + 17) % 15) - 7
    data[i] = Math.max(0, Math.min(255, data[i] + n))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
  }
  ctx.putImageData(imageData, 0, 0)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.94)
  cache.set(key, dataUrl)
  return dataUrl
}
