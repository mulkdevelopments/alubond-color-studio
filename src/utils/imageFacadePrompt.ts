import { getFinishLabel } from '../data/palettes'
import type { AlubondColor } from '../types'
import { colorUsesPanelTextureRefs } from './paletteReferenceImages'

/** Reduce odd Unicode, control chars, and symbols that some image APIs mishandle. */
export function sanitizePromptFragment(text: string, maxLen: number): string {
  const s = text
    .normalize('NFKC')
    .replace(/&/g, ' and ')
    .replace(/[<>{}[\]\\]/g, ' ')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return s.length <= maxLen ? s : `${s.slice(0, maxLen - 1)}…`
}

const IMAGE_FACADE_PROMPT_BASE =
  'Real building photograph. Apply Alubond ACP facade cladding. ' +
  'Preserve building shape, windows, structure, and proportions. ' +
  'Change only visible facade surfaces to match: '

export function buildFacadePrompt(color: AlubondColor | null): string {
  if (!color) {
    return (
      IMAGE_FACADE_PROMPT_BASE +
      'Modern silver metallic ACP. Photorealistic cladding, daylight, clear sky, professional architectural render.'
    )
  }
  const finishDesc: Record<string, string> = {
    matte: 'smooth matte',
    metallic: 'brushed metallic reflective',
    anodise: 'anodised aluminium sheen',
    wood: 'wood-grain ACP',
    patina: 'aged patina copper tones',
    fusion: 'mixed-material fusion',
  }
  const finishLabel = sanitizePromptFragment(getFinishLabel(color), 80)
  const finishPrompt =
    color.finish === 'fusion' && color.fusionOf && color.fusionOf.length >= 2
      ? `fusion: ${color.fusionOf.map((f) => sanitizePromptFragment(f, 24)).join(' and ')} (${finishLabel})`
      : sanitizePromptFragment(finishDesc[color.finish] ?? String(color.finish), 120)
  const name = sanitizePromptFragment(color.name, 120)
  const hexRaw = color.hex.startsWith('#') ? color.hex : `#${color.hex}`
  const hex = sanitizePromptFragment(hexRaw, 16)
  const sku = sanitizePromptFragment(color.sku, 80)
  return (
    IMAGE_FACADE_PROMPT_BASE +
    `Swatch ${name}, ${hex}, SKU ${sku}. Finish: ${finishPrompt}. ` +
    'Photorealistic Alubond-style ACP panels, natural daylight, clear sky.'
  )
}

/**
 * Short prompt for retry when the API returns a generic server error (long/complex prompts).
 */
export function buildFacadePromptMinimal(color: AlubondColor | null): string {
  const hex = color ? sanitizePromptFragment(color.hex, 12) : '#c0c8d0'
  const name = color ? sanitizePromptFragment(color.name, 80) : 'silver metallic'
  const finish = color ? sanitizePromptFragment(getFinishLabel(color), 60) : 'metallic'
  return (
    'Image edit: apply photorealistic aluminium composite panel facade only. ' +
    `Color ${hex}, ${name}, ${finish} finish. ` +
    'Keep building shape and windows unchanged. If the input has a reference strip on the side, omit it from the output—building only. Daylight, clear sky.'
  )
}

/** Image Studio: describe several finishes for one façade (bands / zones / rhythm). */
export function buildFacadePromptMulti(colors: AlubondColor[]): string {
  if (colors.length === 0) return buildFacadePrompt(null)
  if (colors.length === 1) return buildFacadePrompt(colors[0])
  const segments = colors.map((c) => {
    const name = sanitizePromptFragment(c.name, 80)
    const hexRaw = c.hex.startsWith('#') ? c.hex : `#${c.hex}`
    const hex = sanitizePromptFragment(hexRaw, 16)
    const sku = sanitizePromptFragment(c.sku, 64)
    const finish = sanitizePromptFragment(getFinishLabel(c), 60)
    return `${name} ${hex} SKU ${sku} (${finish})`
  })
  return (
    IMAGE_FACADE_PROMPT_BASE +
    `Apply these Alubond finishes across the visible façade in a coherent rhythm (horizontal or vertical bands, distinct zones, or a regular panel grid)—not random noise: ${segments.join(' · ')}. ` +
    'Photorealistic ACP panels, natural daylight, clear sky.'
  )
}

/**
 * Image Studio → NanoBanana: base multi-finish prompt plus explicit solid-colour instructions when no texture sheet is sent for those swatches.
 */
export function buildImageStudioFacadePrompt(colors: AlubondColor[]): string {
  const base = buildFacadePromptMulti(colors)
  const solids = colors.filter((c) => !colorUsesPanelTextureRefs(c))
  if (solids.length === 0) return base
  const solidLines = solids.map(
    (c) =>
      `${sanitizePromptFragment(c.name, 72)} (${sanitizePromptFragment(c.hex.startsWith('#') ? c.hex : `#${c.hex}`, 14)}, SKU ${sanitizePromptFragment(c.sku, 48)})`
  )
  return (
    base +
    ` SOLID / UNIFORM FINISHES (no separate product texture image for these—use exact name, hex, and SKU on the façade): ${solidLines.join('; ')}. `
  )
}

export function buildFacadePromptMinimalMulti(colors: AlubondColor[]): string {
  if (colors.length === 0) return buildFacadePromptMinimal(null)
  if (colors.length === 1) return buildFacadePromptMinimal(colors[0])
  const parts = colors.map((c) => {
    const hex = sanitizePromptFragment(c.hex, 12)
    const name = sanitizePromptFragment(c.name, 48)
    const finish = sanitizePromptFragment(getFinishLabel(c), 48)
    return `${name} ${hex} (${finish})`
  })
  return (
    'Image edit: apply photorealistic aluminium composite panel facade only. ' +
    `Multiple finishes: ${parts.join('; ')}. ` +
    'Vary them in clear bands or zones on the façade. Keep building shape and windows unchanged. If the input has a reference strip on the side, omit it from the output—building only. Daylight, clear sky.'
  )
}

/**
 * Image Studio: image 1 = client building only; images 2+ = catalogue panel textures (when present). Solids rely on text.
 */
export function buildFacadeReferenceImageSuffix(texturePanelImageCount: number): string {
  const refBlock =
    texturePanelImageCount > 0
      ? `Images 2 through ${texturePanelImageCount + 1} are official Alubond panel texture files from our library—reproduce colour, gloss, grain, pattern, and patina on the building exactly as each sample appears. `
      : ''
  return (
    ' INPUT: Image 1 is always the client’s building photograph only—this is the façade to clad; do not treat any UI from our app as part of the scene. ' +
    refBlock +
    'Solid/uniform colours are defined in the prompt text when no texture image exists for them—match those names and hex values precisely. ' +
    'Reference panel images are not architecture—they are material targets only. ' +
    ' OUTPUT (CRITICAL): A single photorealistic image of ONLY the same building with the selected Alubond finishes applied. ' +
    'No swatches, sample boards, sidebars, or “refs” labels in the output. Same geometry and windows; professional façade photo, daylight, clear sky. ' +
    'For fusion finishes, follow the panel rhythm on the existing façade grid.'
  )
}
