import { useState, useEffect } from 'react'
import { brand } from '../theme'

export type AppMode = 'landing' | 'studio' | 'ifc' | 'image'

interface LandingPageProps {
  onSelectMode: (mode: AppMode) => void
}

type IntroPhase = 'idle' | 'alubond' | 'pipe' | 'subtitle' | 'cards'

const CARDS: {
  mode: AppMode
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  cta: string
}[] = [
  {
    mode: 'studio',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Explore Gallery',
    subtitle: 'No upload needed',
    description:
      'Browse 3D building models and apply Alubond facade materials, textures, and finishes in real time.',
    cta: 'Start exploring',
  },
  {
    mode: 'ifc',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="12" y1="12" x2="12" y2="18" />
      </svg>
    ),
    title: 'Upload IFC Model',
    subtitle: 'Import your BIM file',
    description: 'Import an IFC building file and visualize it with the full facade collection.',
    cta: 'Upload IFC',
  },
  {
    mode: 'image',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    title: 'Upload Image',
    subtitle: 'Photo or render',
    description: 'Upload a building image; AI applies your chosen facade materials to the visualization.',
    cta: 'Upload image',
  },
]

export function LandingPage({ onSelectMode }: LandingPageProps) {
  const [phase, setPhase] = useState<IntroPhase>('idle')
  const [hoveredCard, setHoveredCard] = useState<AppMode | null>(null)

  useEffect(() => {
    const t0 = window.setTimeout(() => setPhase('alubond'), 120)
    const t1 = window.setTimeout(() => setPhase('pipe'), 580)
    const t2 = window.setTimeout(() => setPhase('subtitle'), 820)
    const t3 = window.setTimeout(() => setPhase('cards'), 1550)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [])

  const showAlubond = phase !== 'idle'
  const showPipe = phase === 'pipe' || phase === 'subtitle' || phase === 'cards'
  const showSubtitle = phase === 'subtitle' || phase === 'cards'
  const showCards = phase === 'cards'

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        background: '#000000',
        color: '#fafafa',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          /* Anchor from top so branding never shifts when cards mount below */
          justifyContent: 'flex-start',
          paddingTop: 'clamp(100px, 20vh, 200px)',
          paddingLeft: 'clamp(20px, 4vw, 40px)',
          paddingRight: 'clamp(20px, 4vw, 40px)',
          paddingBottom: 'clamp(32px, 6vh, 64px)',
          maxWidth: 1120,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Centered branding — sequence: Alubond → | → Colour Studio (position fixed vs viewport top) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 0,
            width: '100%',
            marginBottom: 'clamp(48px, 6vh, 72px)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 'clamp(1.875rem, 5.5vw, 3rem)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              lineHeight: 1.15,
              opacity: showAlubond ? 1 : 0,
              transform: showAlubond ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.55s ease, transform 0.55s ease',
            }}
          >
            Alubond
          </span>

          <span
            aria-hidden
            style={{
              fontSize: 'clamp(1.875rem, 5.5vw, 3rem)',
              fontWeight: 200,
              color: 'rgba(255, 255, 255, 0.22)',
              marginLeft: '0.4em',
              marginRight: '0.4em',
              lineHeight: 1.15,
              opacity: showPipe ? 1 : 0,
              transform: showPipe ? 'scaleY(1)' : 'scaleY(0.3)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
          >
            |
          </span>

          <span
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: 'rgba(245, 245, 245, 0.72)',
              lineHeight: 1.2,
              opacity: showSubtitle ? 1 : 0,
              transform: showSubtitle ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.55s ease, transform 0.55s ease',
            }}
          >
            Colour Studio
          </span>
        </div>

        {/* Three options — appear after branding */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 1040,
            pointerEvents: showCards ? 'auto' : 'none',
          }}
        >
          {CARDS.map((card, index) => {
            const isHovered = hoveredCard === card.mode
            const enterMs = index * 80
            return (
              <button
                key={card.mode}
                type="button"
                onClick={() => onSelectMode(card.mode)}
                onMouseEnter={() => setHoveredCard(card.mode)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex: '1 1 280px',
                  maxWidth: 340,
                  minWidth: 260,
                  padding: '28px 24px 26px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  borderRadius: 2,
                  border: `1px solid ${isHovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
                  background: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  opacity: showCards ? 1 : 0,
                  transform: showCards ? 'translateY(0)' : 'translateY(18px)',
                  transition: `opacity 0.55s ease ${enterMs}ms, transform 0.55s ease ${enterMs}ms, border-color 0.25s ease, background 0.25s ease`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: isHovered ? brand.orange : 'rgba(255,255,255,0.45)',
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: '#f5f5f5',
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.38)',
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.5)',
                    flex: 1,
                  }}
                >
                  {card.description}
                </p>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isHovered ? brand.orange : 'rgba(255,255,255,0.55)',
                    marginTop: 4,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {card.cta} →
                </span>
              </button>
            )
          })}
        </div>
      </main>

      <footer
        style={{
          padding: '20px 24px 28px',
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          flexShrink: 0,
          opacity: showCards ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}
      >
        Alubond U.S.A — Fire-retardant metal composites — Digital facade visualization
      </footer>
    </div>
  )
}
