import { useState } from 'react'
import { brand } from '../theme'

export type AppMode = 'landing' | 'studio' | 'ifc' | 'image'

interface LandingPageProps {
  onSelectMode: (mode: AppMode) => void
}

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
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Explore Gallery',
    subtitle: 'No upload needed',
    description:
      'Browse 3D building models and instantly apply Alubond facade materials, textures, and finishes in real-time.',
    cta: 'Start Exploring',
  },
  {
    mode: 'ifc',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="12" y1="12" x2="12" y2="18" />
      </svg>
    ),
    title: 'Upload IFC Model',
    subtitle: 'Import your BIM file',
    description:
      'Import your own IFC building file and visualize it with our complete facade collection.',
    cta: 'Upload IFC File',
  },
  {
    mode: 'image',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    title: 'Upload Image',
    subtitle: 'Any building photo or render',
    description:
      'Upload a building photo or render. AI will apply your chosen facade materials for a stunning visualization.',
    cta: 'Upload Image',
  },
]

export function LandingPage({ onSelectMode }: LandingPageProps) {
  const [hoveredCard, setHoveredCard] = useState<AppMode | null>(null)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${brand.navyDark} 0%, ${brand.navy} 50%, #1A3260 100%)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/alubond-logo.png"
            alt="Alubond"
            style={{ height: 44, objectFit: 'contain' }}
          />
          <div style={{ height: 28, width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Color Studio
          </span>
        </div>
      </header>

      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px 60px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 56, maxWidth: 680 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 52,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
            }}
          >
            Design Your Facade,{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${brand.orange}, #FFB366)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Digitally
            </span>
          </h1>
          <p
            style={{
              margin: '20px auto 0',
              fontSize: 17,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              maxWidth: 520,
              fontWeight: 400,
            }}
          >
            Visualize Alubond facade materials on your building — choose from our
            3D gallery, upload a BIM model, or bring any building image.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 1080,
            width: '100%',
          }}
        >
          {CARDS.map((card) => {
            const isHovered = hoveredCard === card.mode
            return (
              <button
                key={card.mode}
                type="button"
                onClick={() => onSelectMode(card.mode)}
                onMouseEnter={() => setHoveredCard(card.mode)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex: '1 1 300px',
                  maxWidth: 340,
                  minWidth: 280,
                  background: isHovered
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isHovered ? 'rgba(232,119,34,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 16,
                  padding: '36px 28px 32px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-6px)' : 'none',
                  boxShadow: isHovered
                    ? `0 24px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(232,119,34,0.15)`
                    : '0 4px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  outline: 'none',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: isHovered
                      ? `rgba(232,119,34,0.15)`
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isHovered ? 'rgba(232,119,34,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isHovered ? brand.orange : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {card.icon}
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {card.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 13,
                      color: brand.orange,
                      fontWeight: 500,
                      marginTop: 4,
                      display: 'block',
                    }}
                  >
                    {card.subtitle}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {card.description}
                </p>

                <div
                  style={{
                    marginTop: 8,
                    padding: '11px 20px',
                    borderRadius: 10,
                    background: isHovered ? brand.orange : 'transparent',
                    border: `1.5px solid ${isHovered ? brand.orange : 'rgba(232,119,34,0.6)'}`,
                    color: isHovered ? '#fff' : brand.orange,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.01em',
                  }}
                >
                  {card.cta} →
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: '20px 40px',
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(255,255,255,0.25)',
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}
      >
        Alubond U.S.A — Fire Retardant Metal Composites — Digital Facade Visualization
      </footer>
    </div>
  )
}
