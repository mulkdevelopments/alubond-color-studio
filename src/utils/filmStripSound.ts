/**
 * Short mechanical "advance" tick for film-strip scrolling (Web Audio API).
 * Browsers require a user gesture before audio can play — call unlockFilmAudio() on first tap.
 */

let ctx: AudioContext | null = null
let lastTickAt = 0
const MIN_MS = 65

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  return ctx
}

/** Call from pointerdown on the strip (or any first interaction) so scroll ticks can play. */
export function unlockFilmAudio(): void {
  const c = getCtx()
  if (c?.state === 'suspended') void c.resume()
}

/** Soft mechanical click while scrolling the film rail. */
export function playFilmAdvanceTick(): void {
  const now = performance.now()
  if (now - lastTickAt < MIN_MS) return
  lastTickAt = now

  const c = getCtx()
  if (!c || c.state !== 'running') return

  const t0 = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  const filter = c.createBiquadFilter()

  osc.type = 'square'
  osc.frequency.setValueAtTime(320, t0)
  osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.04)

  filter.type = 'bandpass'
  filter.frequency.value = 420
  filter.Q.value = 0.9

  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(0.055, t0 + 0.008)
  gain.gain.linearRampToValueAtTime(0, t0 + 0.05)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)

  osc.start(t0)
  osc.stop(t0 + 0.06)
}
