/**
 * Calls OpenAI (gpt-4o-mini) to generate fusion palette suggestions:
 * two-colour combinations with a short "why it's good" line.
 * Requires VITE_OPENAI_API_KEY in .env.
 */

export interface FusionSuggestion {
  name: string
  hex: string
  hexSecondary: string
  whyGood: string
}

const SYSTEM_PROMPT = `You are an expert in architectural facades and Alubond ACP (aluminium composite panel) finishes.
Generate fusion palette suggestions: each suggestion is a TWO-colour combination for building facades.
Return a JSON array of 4 to 6 suggestions. Each item must have:
- "name": a short, evocative name (e.g. "Dusk Bronze + Silver Mist")
- "hex": valid CSS hex for the first colour (e.g. "#2c3e50")
- "hexSecondary": valid CSS hex for the second colour
- "whyGood": one short sentence (max 80 chars) explaining why this combination works well for facades (e.g. "Warm and cool balance; timeless for offices.")

Rules: use real hex codes; names should be professional; whyGood should be specific to architecture/facades. Return only the JSON array, no markdown.`

export async function generateFusionSuggestions(): Promise<FusionSuggestion[]> {
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if (!key || typeof key !== 'string') {
    throw new Error('OpenAI API key not set. Add VITE_OPENAI_API_KEY to your .env file.')
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: 'Generate 5 amazing fusion palette suggestions for contemporary building facades. Return only the JSON array.',
        },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI API error: ${res.status}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('No response from OpenAI')

  // Strip markdown code block if present
  let raw = content
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) throw new Error('Invalid response format')

  return parsed
    .filter(
      (x): x is FusionSuggestion =>
        x != null &&
        typeof (x as FusionSuggestion).name === 'string' &&
        typeof (x as FusionSuggestion).hex === 'string' &&
        typeof (x as FusionSuggestion).hexSecondary === 'string' &&
        typeof (x as FusionSuggestion).whyGood === 'string'
    )
    .map((x) => ({
      name: (x as FusionSuggestion).name.trim(),
      hex: normalizeHex((x as FusionSuggestion).hex),
      hexSecondary: normalizeHex((x as FusionSuggestion).hexSecondary),
      whyGood: (x as FusionSuggestion).whyGood.trim().slice(0, 120),
    }))
}

function normalizeHex(s: string): string {
  const m = s.trim().match(/^#?([0-9A-Fa-f]{6})$/)
  return m ? `#${m[1]}` : '#6b7280'
}
