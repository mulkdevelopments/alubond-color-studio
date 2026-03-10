import { useState } from 'react'
import { workspace, brand } from '../theme'

export interface WorkspaceOption {
  id: string
  name: string
}

export type LeftStripTab = 'palette' | 'facade'

interface WorkspaceLayoutProps {
  workspaceOptions: WorkspaceOption[]
  activeWorkspaceId: string
  onWorkspaceChange: (id: string) => void
  onBack: () => void
  onThemeToggle: () => void
  leftPanel: React.ReactNode
  /** When set, show Facade tab in left strip and this panel when Facade is selected */
  facadePanel?: React.ReactNode
  /** Whether the Facade tab is available (e.g. when Facade Maker model is selected) */
  showFacadeTab?: boolean
  rightPanel: React.ReactNode
  children: React.ReactNode
  /** Optional bar below 3D view */
  bottomBar?: React.ReactNode
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
}

const LEFT_STRIP_WIDTH = 56
const LEFT_PANEL_WIDTH = 300
const RIGHT_PANEL_WIDTH = 280
const RIGHT_PANEL_MIN_WIDTH = 220
const CENTER_MIN_WIDTH = 400

export function WorkspaceLayout({
  workspaceOptions,
  activeWorkspaceId,
  onWorkspaceChange,
  onBack,
  onThemeToggle,
  leftPanel,
  facadePanel,
  showFacadeTab = false,
  rightPanel,
  children,
  bottomBar,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  compareMode,
  onCompareModeChange,
  onSnapshot,
  onExportPdf,
  paintedCount,
}: WorkspaceLayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [leftTab, setLeftTab] = useState<LeftStripTab>('facade')
  const activeName = workspaceOptions.find((o) => o.id === activeWorkspaceId)?.name ?? 'Workspace'
  const showFacade = showFacadeTab && facadePanel != null
  const currentLeftPanel = showFacade && leftTab === 'facade' ? facadePanel : leftPanel

  const iconBtn = (active?: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: 'none',
    background: active ? workspace.iconBgActive : workspace.iconBg,
    color: active ? brand.orange : workspace.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: workspace.canvas,
      }}
    >
      {/* Minimal top header */}
      <header
        style={{
          flexShrink: 0,
          height: 48,
          minHeight: 48,
          padding: '0 12px 0 8px',
          background: workspace.panel,
          borderBottom: `1px solid ${workspace.border}`,
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
        <div style={{ width: 1, height: 20, background: workspace.borderLight }} />

        {/* Workspace dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              background: 'transparent',
              border: `1px solid ${workspace.borderLight}`,
              borderRadius: 8,
              color: workspace.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
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
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setDropdownOpen(false)}
                aria-hidden="true"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  minWidth: 160,
                  background: workspace.card,
                  border: `1px solid ${workspace.borderLight}`,
                  borderRadius: 12,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  zIndex: 11,
                  overflow: 'hidden',
                }}
              >
                {workspaceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { onWorkspaceChange(opt.id); setDropdownOpen(false) }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: activeWorkspaceId === opt.id ? 600 : 500,
                      background: activeWorkspaceId === opt.id ? workspace.iconBgActive : 'transparent',
                      border: 'none',
                      color: activeWorkspaceId === opt.id ? brand.orange : workspace.text,
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

        <span style={{ fontSize: 11, color: workspace.textMuted }}>
          {paintedCount} surface{paintedCount !== 1 ? 's' : ''}
        </span>
        <button type="button" onClick={onThemeToggle} style={iconBtn()} title="Toggle theme">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </header>

      {/* Body: strip | left card | center | right panel */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left icon strip */}
        <div
          style={{
            width: LEFT_STRIP_WIDTH,
            flexShrink: 0,
            background: workspace.panel,
            borderRight: `1px solid ${workspace.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 12,
            gap: 4,
          }}
        >
          {showFacade && (
            <button
              type="button"
              onClick={() => setLeftTab('facade')}
              style={{
                ...iconBtn(leftTab === 'facade'),
                width: 40,
                height: 40,
              }}
              title="Facade controls"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setLeftTab('palette')}
            style={{
              ...iconBtn(leftTab === 'palette'),
              width: 40,
              height: 40,
            }}
            title="Facade Library"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5" />
              <circle cx="19" cy="13.5" r="2.5" />
              <circle cx="8" cy="13.5" r="2.5" />
              <circle cx="13.5" cy="20" r="2.5" />
              <path d="M12 2v4M4.93 10.93l2.83 2.83M19.07 10.93l2.83-2.83" />
            </svg>
          </button>
        </div>

        {/* Left panel card */}
        <aside
          style={{
            width: LEFT_PANEL_WIDTH,
            minWidth: LEFT_PANEL_WIDTH,
            flexShrink: 0,
            padding: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: workspace.panel,
            borderRight: `1px solid ${workspace.border}`,
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              background: workspace.card,
              borderRadius: 16,
              border: `1px solid ${workspace.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
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
            paddingBottom: 72,
          }}
        >
          {children}
          {bottomBar}
        </main>

        {/* Right panel — fixed 280px, never grows; center gets all remaining space */}
        <aside
          style={{
            flex: `0 1 ${RIGHT_PANEL_WIDTH}px`,
            width: RIGHT_PANEL_WIDTH,
            minWidth: RIGHT_PANEL_MIN_WIDTH,
            maxWidth: RIGHT_PANEL_WIDTH,
            boxSizing: 'border-box',
            background: workspace.panel,
            borderLeft: `1px solid ${workspace.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {rightPanel}
        </aside>
      </div>

      {/* Floating bottom toolbar */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 10px',
          background: workspace.toolbarBg,
          border: `1px solid ${workspace.toolbarBorder}`,
          borderRadius: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <button type="button" onClick={onUndo} disabled={!canUndo} style={{ ...iconBtn(false), opacity: canUndo ? 1 : 0.4 }} title="Undo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} style={{ ...iconBtn(false), opacity: canRedo ? 1 : 0.4 }} title="Redo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
        </button>
        <div style={{ width: 1, height: 20, background: workspace.borderLight, margin: '0 4px' }} />
        <button
          type="button"
          onClick={() => onCompareModeChange(compareMode === 'single' ? 'split' : 'single')}
          style={iconBtn(compareMode === 'split')}
          title="Compare split view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /></svg>
        </button>
        <div style={{ width: 1, height: 20, background: workspace.borderLight, margin: '0 4px' }} />
        <button type="button" onClick={onSnapshot} style={iconBtn()} title="Snapshot">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          style={{
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 600,
            background: brand.orange,
            border: 'none',
            borderRadius: 20,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginLeft: 4,
          }}
          title="Export PDF"
        >
          Export
        </button>
      </div>
    </div>
  )
}
