/**
 * Calls OpenAI (gpt-4o-mini) to generate fusion suggestions using real panel assets
 * from public/Panels/. Requires VITE_OPENAI_API_KEY in .env.
 */

import {
  isValidPanelTexture,
  getPanelCatalogForFolders,
  getPanelTextureFolderList,
} from '../data/panelTextureInventory'
import type { FusionCombo } from '../types'

export interface FusionSuggestion {
  name: string
  whyGood: string
  /** Ordered panels that rotate by facade row: row r uses panels[r % length]. */
  panels: { folder: string; fileId: string }[]
}

export interface FusionGenerationOptions {
  /** How many panel palettes rotate in each fusion (2–4). Not “how many ideas”. */
  palettesPerFusion: number
  /** Only panels from these folders. Must be non-empty. */
  folders: string[]
}

/** How many distinct fusion ideas each Generate click asks for. */
export const FUSION_IDEAS_PER_RUN = 6

const PALETTES_MIN = 2
const PALETTES_MAX = 4

function clampPalettesPerFusion(n: number): number {
  if (!Number.isFinite(n)) return 2
  return Math.min(PALETTES_MAX, Math.max(PALETTES_MIN, Math.round(n)))
}

function buildSystemPrompt(
  catalog: string,
  folderNames: string[],
  palettesPerFusion: number
): string {
  const folderList = folderNames.join(', ')
  return `You are an expert in architectural facades and Alubond ACP (aluminium composite panel) finishes.

You must suggest facade "fusions". Each fusion uses exactly ${palettesPerFusion} REAL panel products that ROTATE BY ROW on the building:
- Row 0 (bottom row index 0) uses panels[0], row 1 uses panels[1], … row ${palettesPerFusion - 1} uses panels[${palettesPerFusion - 1}], then row ${palettesPerFusion} wraps to panels[0] again.

The user restricted choices to ONLY these folders (folder names must match exactly): ${folderList}

CATALOG FORMAT: each line is "folder|fileId" (copy character-for-character).

FULL CATALOG (only valid choices):
${catalog}

Return a JSON array of exactly ${FUSION_IDEAS_PER_RUN} suggestions. Each suggestion MUST have:
- "name": short professional name for this multi-panel rhythm
- "panels": an array of exactly ${palettesPerFusion} objects, each like {"folder":"wood","fileId":"AB-SS-003"} where folder|fileId matches ONE catalog line exactly (order = rotation order by row)
- "whyGood": one sentence (max 100 chars) why this set works for contemporary facades

Rules:
- Each "panels" entry must match one catalog line; folders must be from: ${folderList}
- Use ${palettesPerFusion} entries in "panels" — no more, no fewer.
- Prefer variety across folders when ${palettesPerFusion} >= 3 (e.g. patina + anodise + metallic).
- Do not invent folders or fileIds not in the catalog.
Return only the JSON array, no markdown.`
}

export async function generateFusionSuggestions(
  options: FusionGenerationOptions
): Promise<FusionSuggestion[]> {
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if (!key || typeof key !== 'string') {
    throw new Error('OpenAI API key not set. Add VITE_OPENAI_API_KEY to your .env file.')
  }

  const folders =
    options.folders.length > 0 ? [...new Set(options.folders)] : getPanelTextureFolderList()
  const known = new Set(getPanelTextureFolderList())
  const unknown = folders.filter((f) => !known.has(f))
  if (unknown.length > 0) {
    throw new Error(`Unknown panel folder(s): ${unknown.join(', ')}`)
  }
  if (folders.length === 0) {
    throw new Error('Select at least one panel category.')
  }

  const palettesPerFusion = clampPalettesPerFusion(options.palettesPerFusion)
  const catalog = getPanelCatalogForFolders(folders)
  if (!catalog.trim()) {
    throw new Error('No panels available for the selected categories.')
  }

  const allowed = new Set(folders)
  const systemPrompt = buildSystemPrompt(catalog, folders, palettesPerFusion)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate exactly ${FUSION_IDEAS_PER_RUN} fusion suggestions. Each must include exactly ${palettesPerFusion} panels in "panels" (rotation order). Only use catalog lines from the system message. Folders allowed: ${folders.join(', ')}. Return only the JSON array.`,
        },
      ],
      temperature: 0.75,
      max_tokens: Math.min(4096, 800 + FUSION_IDEAS_PER_RUN * palettesPerFusion * 80),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI API error: ${res.status}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('No response from OpenAI')

  let raw = content
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) throw new Error('Invalid response format')

  const out: FusionSuggestion[] = []
  for (const x of parsed) {
    if (x == null || typeof x !== 'object') continue
    const o = x as Record<string, unknown>
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const whyGood = typeof o.whyGood === 'string' ? o.whyGood.trim().slice(0, 120) : ''
    const panelsRaw = o.panels
    if (!name || !whyGood || !Array.isArray(panelsRaw)) continue
    if (panelsRaw.length !== palettesPerFusion) continue

    const panels: { folder: string; fileId: string }[] = []
    let ok = true
    for (const p of panelsRaw) {
      if (p == null || typeof p !== 'object') {
        ok = false
        break
      }
      const rec = p as Record<string, unknown>
      const folder = typeof rec.folder === 'string' ? rec.folder.trim() : ''
      const fileId = typeof rec.fileId === 'string' ? rec.fileId.trim() : ''
      if (!allowed.has(folder) || !isValidPanelTexture(folder, fileId)) {
        ok = false
        break
      }
      panels.push({ folder, fileId })
    }
    if (!ok || panels.length !== palettesPerFusion) continue

    out.push({ name, whyGood, panels })
    if (out.length >= FUSION_IDEAS_PER_RUN) break
  }

  if (out.length === 0) {
    throw new Error('No valid fusions returned. Try again or adjust categories.')
  }
  return out
}

export const FUSION_PALETTES_MIN = PALETTES_MIN
export const FUSION_PALETTES_MAX = PALETTES_MAX

/** Map panel folder to fusion label / material hints. */
export function fusionComboForFolder(folder: string): FusionCombo {
  switch (folder) {
    case 'metalic':
    case 'sparkle':
      return 'metallic'
    case 'anodise':
      return 'anodise'
    case 'wood':
      return 'wood'
    case 'patina':
      return 'patina'
    default:
      return 'matte'
  }
}

export function materialPropsForFolder(folder: string): { metalness: number; roughness: number } {
  switch (folder) {
    case 'metalic':
    case 'sparkle':
      return { metalness: 0.88, roughness: 0.4 }
    case 'anodise':
      return { metalness: 0.95, roughness: 0.25 }
    case 'wood':
      return { metalness: 0, roughness: 0.7 }
    case 'patina':
      return { metalness: 0.5, roughness: 0.6 }
    default:
      return { metalness: 0, roughness: 0.8 }
  }
}
