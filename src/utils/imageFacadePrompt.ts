import { getFinishLabel } from '../data/palettes'
import type { AlubondColor } from '../types'

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

/**
 * Explain workspace capture + strict output framing: refs column must not appear in the generated image.
 */
export function buildFacadeReferenceImageSuffix(hasTexturePanelReferences: boolean): string {
  if (!hasTexturePanelReferences) return ''
  return (
    ' INPUT: One image with the real building on the left and a narrow Alubond reference strip on the right (sample panels; may show small labels). ' +
    'Use that strip ONLY as material reference for colour, gloss, grain, and patina. It is NOT part of the site or architecture. ' +
    ' OUTPUT (CRITICAL): Produce a single final photograph or render that shows ONLY the building with cladding applied. ' +
    'Do NOT include the reference strip, swatches, sample tiles, or any "refs" / "Alubond refs" text in the output. ' +
    'Crop mentally to the building: the result must look like a normal professional façade photo—same building, full bleed, no sidebar. ' +
    'For fusion finishes, alternate or blend across the building panel grid only. Photorealistic, daylight, clear sky.'
  )
}
