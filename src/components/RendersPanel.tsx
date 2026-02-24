export interface GeneratedRender {
  id: string
  dataUrl: string
  createdAt: number
  paletteName?: string
}

interface RendersPanelProps {
  renders: GeneratedRender[]
  onGenerate: () => void
  onDelete: (id: string) => void
  onDownload: (render: GeneratedRender) => void
  isGenerating?: boolean
  generateError?: string | null
  aiEnabled: boolean
  onAiEnabledChange: (enabled: boolean) => void
}

export function RendersPanel({
  renders,
  onGenerate,
  onDelete,
  onDownload,
  isGenerating = false,
  generateError = null,
  aiEnabled,
  onAiEnabledChange,
}: RendersPanelProps) {
  return (
    <aside
      style={{
        width: 360,
        minWidth: 300,
        background: '#ffffff',
        borderLeft: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Generated renders</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>
          Capture the current view with your facade selection.
        </p>
      </header>
      <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14, color: '#1a1a1a' }}>3D-Render</span>
          <button
            type="button"
            role="switch"
            aria-checked={aiEnabled}
            onClick={() => onAiEnabledChange(!aiEnabled)}
            style={{
              width: 44,
              height: 24,
              padding: 0,
              borderRadius: 12,
              border: '1px solid #1a1a1a',
              cursor: 'pointer',
              background: aiEnabled ? '#1a1a1a' : '#ffffff',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: aiEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: aiEnabled ? '#ffffff' : '#1a1a1a',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 500,
            background: '#1a1a1a',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating…' : 'Generate render'}
        </button>
        {generateError && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              background: 'rgba(200, 50, 50, 0.1)',
              border: '1px solid #b03030',
              borderRadius: 8,
              fontSize: 13,
              color: '#b03030',
            }}
          >
            {generateError}
          </div>
        )}
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {isGenerating && <RenderSkeleton />}
        {renders.length === 0 && !isGenerating && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: 13,
              textAlign: 'center',
              padding: 24,
            }}
          >
            No renders yet. Position the view and click “Generate render” to add one.
          </div>
        )}
        {renders.map((render) => (
          <div
            key={render.id}
            style={{
              background: '#f5f5f5',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
            }}
          >
            <div
              style={{
                aspectRatio: '4/3',
                background: '#e8e8e8',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={render.dataUrl}
                alt="Generated render"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#fafafa',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => onDownload(render)}
                  title="Download"
                  style={iconBtnStyle}
                >
                  ⬇
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(render.id)}
                  title="Remove"
                  style={iconBtnStyle}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ padding: '10px 12px' }}>
              {render.paletteName && (
                <div style={{ fontSize: 12, color: '#666' }}>{render.paletteName}</div>
              )}
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                {new Date(render.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function RenderSkeleton() {
  return (
    <>
      <style>{`
        @keyframes renders-skeleton-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          background: '#f5f5f5',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      >
        <div
          style={{
            aspectRatio: '4/3',
            background: '#e0e0e0',
            animation: 'renders-skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              height: 12,
              width: '70%',
              borderRadius: 4,
              background: '#e0e0e0',
              animation: 'renders-skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: 10,
              width: '45%',
              borderRadius: 4,
              background: '#e8e8e8',
              animation: 'renders-skeleton-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.2s',
            }}
          />
        </div>
      </div>
    </>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.6)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 14,
}
