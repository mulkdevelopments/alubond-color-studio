import { useState } from 'react'
import { workspace, brand, glassChrome } from '../theme'

/** Header switcher: Facade Maker vs Image / IFC studios */
export interface StudioModeOption {
  id: string
  name: string
}

export type WorkspaceToolbarPreset = 'facade' | 'ifc' | 'image'

interface WorkspaceLayoutProps {
  studioModeOptions: StudioModeOption[]
  activeStudioModeId: string
  onStudioModeChange: (id: string) => void
  onBack: () => void
  onThemeToggle: () => void
  leftPanel: React.ReactNode
  /** When set with showFacadeTab: left sidebar shows facade controls only (colour library uses bottom dock) */
  facadePanel?: React.ReactNode
  /** Whether the Facade tab is available (e.g. when Facade Maker model is selected) */
  showFacadeTab?: boolean
  rightPanel: React.ReactNode
  children: React.ReactNode
  /** Optional bar below 3D view */
  bottomBar?: React.ReactNode
  /** When set: toolbar fixed at top, this content (tabs + film) fixed at bottom */
  bottomFilmDock?: React.ReactNode
  /** Toolbar actions */
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  compareMode: 'single' | 'split'
  onCompareModeChange: (mode: 'single' | 'split') => void
  onSnapshot: () => void
  onExportPdf: () => void
  paintedCount: number
  /** Header status (default: “{paintedCount} surface(s)”) */
  statusLine?: string
  /** Extra controls before the status line (e.g. IFC) */
  headerAccessory?: React.ReactNode
  /** `facade`: full toolbar · `ifc`: undo/redo/snapshot · `image`: hidden */
  toolbarPreset?: WorkspaceToolbarPreset
  /** When false, right column is omitted */
  showRightPanel?: boolean
}

const LEFT_PANEL_WIDTH = 300
const RIGHT_PANEL_WIDTH = 280
const RIGHT_PANEL_MIN_WIDTH = 220
const CENTER_MIN_WIDTH = 400

export function WorkspaceLayout({
  studioModeOptions,
  activeStudioModeId,
  onStudioModeChange,
  onBack,
  onThemeToggle,
  leftPanel,
  facadePanel,
  showFacadeTab = false,
  rightPanel,
  children,
  bottomBar,
  bottomFilmDock,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  compareMode,
  onCompareModeChange,
  onSnapshot,
  onExportPdf,
  paintedCount,
  statusLine,
  headerAccessory,
  toolbarPreset = 'facade',
  showRightPanel = true,
}: WorkspaceLayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const activeName = studioModeOptions.find((o) => o.id === activeStudioModeId)?.name ?? 'Studio'
  const showFacade = showFacadeTab && facadePanel != null
  const currentLeftPanel = showFacade ? facadePanel : leftPanel

  const useSplitDock = bottomFilmDock != null
  const showTopFloatingToolbar = toolbarPreset !== 'image'

  const iconBtn = (active?: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    border: `1px solid ${active ? glassChrome.borderAccent : glassChrome.borderSoft}`,
    background: active ? glassChrome.iconBgActive : glassChrome.iconBg,
    color: active ? brand.orange : glassChrome.textMuted,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active
      ? `0 0 24px rgba(232,119,34,0.2), ${glassChrome.specular}`
      : glassChrome.specularSoft,
  })

  const status =
    statusLine ??
    `${paintedCount} surface${paintedCount !== 1 ? 's' : ''}`

  const workspaceToolbar =
    toolbarPreset === 'image' ? null : toolbarPreset === 'ifc' ? (
      <>
        <button type="button" onClick={onUndo} disabled={!canUndo} style={{ ...iconBtn(false), opacity: canUndo ? 1 : 0.4 }} title="Undo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} style={{ ...iconBtn(false), opacity: canRedo ? 1 : 0.4 }} title="Redo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
        </button>
        <div style={{ width: 1, height: 22, background: glassChrome.border, margin: '0 4px', opacity: 0.5 }} />
        <button type="button" onClick={onSnapshot} style={iconBtn()} title="Snapshot">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
        </button>
      </>
    ) : (
      <>
        <button type="button" onClick={onUndo} disabled={!canUndo} style={{ ...iconBtn(false), opacity: canUndo ? 1 : 0.4 }} title="Undo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} style={{ ...iconBtn(false), opacity: canRedo ? 1 : 0.4 }} title="Redo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
        </button>
        <div style={{ width: 1, height: 22, background: glassChrome.border, margin: '0 4px', opacity: 0.5 }} />
        <button
          type="button"
          onClick={() => onCompareModeChange(compareMode === 'single' ? 'split' : 'single')}
          style={iconBtn(compareMode === 'split')}
          title="Compare split view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /></svg>
        </button>
        <div style={{ width: 1, height: 22, background: glassChrome.border, margin: '0 4px', opacity: 0.5 }} />
        <button type="button" onClick={onSnapshot} style={iconBtn()} title="Snapshot">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          style={{
            padding: '9px 18px',
            fontSize: 12,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${brand.orangeHover}, ${brand.orange})`,
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginLeft: 4,
            boxShadow: '0 4px 20px rgba(232,119,34,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
          title="Export PDF"
        >
          Export
        </button>
      </>
    )

  const dockChrome: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    background: glassChrome.toolbar,
    backdropFilter: glassChrome.blurHeavy,
    WebkitBackdropFilter: glassChrome.blurHeavy,
    border: `1px solid ${glassChrome.border}`,
    borderRadius: 999,
    boxShadow: `0 16px 48px rgba(0,0,0,0.45), ${glassChrome.specular}, 0 0 0 1px rgba(232,119,34,0.08)`,
  }

  return (
    <div
      className="app-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#000000',
        position: 'relative',
      }}
    >
      <div className="app-liquid-mesh" aria-hidden />
      {/* Liquid glass top bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 50,
          flexShrink: 0,
          height: 52,
          minHeight: 52,
          overflow: 'visible',
          padding: '0 14px 0 10px',
          background: glassChrome.surfaceDeep,
          backdropFilter: glassChrome.blur,
          WebkitBackdropFilter: glassChrome.blur,
          borderBottom: `1px solid ${glassChrome.border}`,
          boxShadow: glassChrome.specular,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            ...iconBtn(),
            width: 32,
            height: 32,
          }}
          title="Back to home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <img src="/alubond-logo.png" alt="Alubond" style={{ height: 26, objectFit: 'contain', opacity: 0.95 }} />
        <div style={{ width: 1, height: 22, background: glassChrome.border, borderRadius: 1, opacity: 0.6 }} />

        {/* Switch Facade Maker / Image Studio / IFC Studio */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
              background: glassChrome.surface,
              border: `1px solid ${glassChrome.border}`,
              borderRadius: 12,
              color: glassChrome.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: glassChrome.specularSoft,
              backdropFilter: glassChrome.blurMedium,
              WebkitBackdropFilter: glassChrome.blurMedium,
            }}
          >
            {activeName}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: dropdownOpen ? 1 : 0.7 }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                onClick={() => setDropdownOpen(false)}
                aria-hidden="true"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  minWidth: 180,
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 14,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
                  zIndex: 61,
                  overflow: 'hidden',
                }}
              >
                {studioModeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onStudioModeChange(opt.id)
                      setDropdownOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: activeStudioModeId === opt.id ? 600 : 500,
                      background:
                        activeStudioModeId === opt.id ? 'rgba(232,119,34,0.14)' : 'transparent',
                      border: 'none',
                      color: activeStudioModeId === opt.id ? brand.orange : 'rgba(255,255,255,0.88)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {headerAccessory}

        <span style={{ fontSize: 11, color: glassChrome.textMuted, fontWeight: 500 }}>
          {status}
        </span>
        <button type="button" onClick={onThemeToggle} style={iconBtn()} title="Toggle theme">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </header>

      {/* Body: left card | center | right panel */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left panel card — facade controls only when Facade Maker; otherwise full palette panel */}
        <aside
          style={{
            width: LEFT_PANEL_WIDTH,
            minWidth: LEFT_PANEL_WIDTH,
            flexShrink: 0,
            padding: 18,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'transparent',
            borderRight: `1px solid ${glassChrome.borderSoft}`,
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              minWidth: 0,
              background: glassChrome.surface,
              backdropFilter: glassChrome.blur,
              WebkitBackdropFilter: glassChrome.blur,
              borderRadius: 20,
              border: `1px solid ${glassChrome.border}`,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `${glassChrome.shadowFloat}, ${glassChrome.specular}`,
            }}
          >
            {currentLeftPanel}
          </div>
        </aside>

        {/* Center: 3D view — gets all remaining space; never smaller than CENTER_MIN_WIDTH */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: CENTER_MIN_WIDTH,
            flexBasis: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: workspace.sceneBg,
            paddingBottom: useSplitDock ? 340 : 72,
            paddingTop: useSplitDock ? (showTopFloatingToolbar ? 84 : 12) : 0,
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.25)',
          }}
        >
          {children}
          {bottomBar}
          {useSplitDock ? (
            <div
              style={{
                position: 'absolute',
                left: 12,
                right: 12,
                bottom: 12,
                zIndex: 50,
                maxHeight: 'min(55vh, 520px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '12px 14px 14px',
                background: glassChrome.toolbar,
                backdropFilter: glassChrome.blurHeavy,
                WebkitBackdropFilter: glassChrome.blurHeavy,
                border: `1px solid ${glassChrome.border}`,
                borderRadius: 20,
                boxShadow: `0 16px 48px rgba(0,0,0,0.5), ${glassChrome.specular}, 0 0 0 1px rgba(232,119,34,0.08)`,
                boxSizing: 'border-box',
                pointerEvents: 'auto',
              }}
            >
              {bottomFilmDock}
            </div>
          ) : null}
        </main>

        {showRightPanel ? (
          <aside
            style={{
              flex: `0 1 ${RIGHT_PANEL_WIDTH}px`,
              width: RIGHT_PANEL_WIDTH,
              minWidth: RIGHT_PANEL_MIN_WIDTH,
              maxWidth: RIGHT_PANEL_WIDTH,
              boxSizing: 'border-box',
              background: glassChrome.rail,
              backdropFilter: glassChrome.blurMedium,
              WebkitBackdropFilter: glassChrome.blurMedium,
              borderLeft: `1px solid ${glassChrome.borderSoft}`,
              boxShadow: `${glassChrome.specularSoft}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {rightPanel}
          </aside>
        ) : null}
      </div>

      {workspaceToolbar != null ? (
        <div
          style={{
            ...dockChrome,
            ...(useSplitDock
              ? { top: 58, bottom: 'auto', gap: 6 }
              : { bottom: 22, top: 'auto', gap: 6 }),
          }}
        >
          {workspaceToolbar}
        </div>
      ) : null}

    </div>
  )
}
