/**
 * Film-strip scroll feedback: layered mechanical motion (body + sprocket scrape + metal ping).
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

/** Mechanical advance: low moving mass + short grit + tiny metal hit (not tonal / “voicey”). */
export function playFilmAdvanceTick(): void {
  const now = performance.now()
  if (now - lastTickAt < MIN_MS) return
  lastTickAt = now

  const c = getCtx()
  if (!c || c.state !== 'running') return

  const t0 = c.currentTime
  const master = c.createGain()
  master.gain.value = 0.82
  master.connect(c.destination)

  // Body: triangle mass sliding/seating, pitch drops as it settles
  const body = c.createOscillator()
  body.type = 'triangle'
  body.frequency.setValueAtTime(168, t0)
  body.frequency.exponentialRampToValueAtTime(52, t0 + 0.036)
  const bodyG = c.createGain()
  bodyG.gain.setValueAtTime(0, t0)
  bodyG.gain.linearRampToValueAtTime(0.1, t0 + 0.0018)
  bodyG.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.05)
  body.connect(bodyG)
  bodyG.connect(master)
  body.start(t0)
  body.stop(t0 + 0.054)

  // Grit: very short band-pass noise ≈ sprocket teeth / rail
  const len = Math.floor(c.sampleRate * 0.028)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 0.6
  }
  const noise = c.createBufferSource()
  noise.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2100
  bp.Q.value = 2.4
  const nG = c.createGain()
  nG.gain.setValueAtTime(0, t0)
  nG.gain.linearRampToValueAtTime(0.065, t0 + 0.0006)
  nG.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.019)
  noise.connect(bp)
  bp.connect(nG)
  nG.connect(master)
  noise.start(t0)
  noise.stop(t0 + 0.028)

  // Ping: brief sine decay = small metal contact
  const ping = c.createOscillator()
  ping.type = 'sine'
  ping.frequency.setValueAtTime(2400, t0)
  ping.frequency.exponentialRampToValueAtTime(720, t0 + 0.022)
  const pingG = c.createGain()
  pingG.gain.setValueAtTime(0, t0)
  pingG.gain.linearRampToValueAtTime(0.022, t0 + 0.0004)
  pingG.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.026)
  ping.connect(pingG)
  pingG.connect(master)
  ping.start(t0)
  ping.stop(t0 + 0.03)
}
