import { useState } from 'react'
import { ANNOTATIONS, AREAS, type Annotation, type ComponentStatus } from './annotations'
import './index.css'

const PROTOTYPE_URL = 'https://raminehvisseh.github.io/booking-flow-accessibility-unified/'

const STATUS_META: Record<ComponentStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  burrito:          { label: 'Burrito',          color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)',  dot: '#16a34a' },
  'burrito-modified': { label: 'Burrito + Custom', color: 'var(--orange)', bg: 'var(--orange-bg)', border: 'var(--orange-border)', dot: '#d97706' },
  custom:           { label: 'Custom',           color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)',    dot: '#dc2626' },
}

function StatusBadge({ status }: { status: ComponentStatus }) {
  const m = STATUS_META[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  )
}

function Tag({ children, color = 'var(--teal)', bg = 'var(--teal-light)' }: { children: string; color?: string; bg?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, color, background: bg,
      border: `1px solid ${color}22`,
    }}>{children}</span>
  )
}

function KeyChip({ children }: { children: string }) {
  return (
    <kbd style={{
      display: 'inline-block', padding: '2px 6px', borderRadius: 4,
      fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
      background: '#f1f5f9', border: '1px solid #cbd5e1',
      boxShadow: '0 1px 0 #cbd5e1', color: '#334155',
    }}>{children}</kbd>
  )
}

function SRRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  const color = label === 'VoiceOver' ? '#5b21b6' : label === 'JAWS' ? '#1e40af' : '#065f46'
  const bg = label === 'VoiceOver' ? '#ede9fe' : label === 'JAWS' ? '#dbeafe' : '#d1fae5'
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{
        flexShrink: 0, width: 80, fontSize: 11, fontWeight: 700,
        padding: '2px 6px', borderRadius: 4, background: bg, color,
        textAlign: 'center', marginTop: 1,
      }}>{label}</span>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{value}</p>
    </div>
  )
}

function AnnotationDetail({ annotation, onClose }: { annotation: Annotation; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'keyboard' | 'screenreader' | 'aria' | 'decisions'>('overview')

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'keyboard', label: 'Keyboard' },
    { id: 'screenreader', label: 'Screen Reader' },
    { id: 'aria', label: 'ARIA' },
    { id: 'decisions', label: 'Decisions' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 12, width: '100%', maxWidth: 680,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <StatusBadge status={annotation.status} />
                <Tag>{AREAS.find(a => a.id === annotation.area)?.label ?? annotation.area}</Tag>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{annotation.label}</h2>
              {annotation.statusNote && (
                <p style={{ fontSize: 12, color: 'var(--text-subdued)', marginTop: 4 }}>{annotation.statusNote}</p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)',
                background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--text-subdued)', flexShrink: 0,
              }}
              aria-label="Close"
            >×</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 14px', fontSize: 13, fontWeight: 500,
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: tab === t.id ? 'var(--teal)' : 'var(--text-subdued)',
                  borderBottom: tab === t.id ? '2px solid var(--teal)' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {tab === 'overview' && (
            <div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20 }}>{annotation.what}</p>
              {annotation.gaps && annotation.gaps.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gaps / What Burrito needs</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {annotation.gaps.map((g, i) => (
                      <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: '#78350f', marginBottom: 4 }}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === 'keyboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {annotation.keyboard.map((k, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: 'var(--bg)', borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <KeyChip>{k.key}</KeyChip>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{k.action}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'screenreader' && (
            <div>
              <SRRow label="JAWS" value={annotation.screenReader.jaws} />
              <SRRow label="NVDA" value={annotation.screenReader.nvda} />
              <SRRow label="VoiceOver" value={annotation.screenReader.voiceover} />
            </div>
          )}

          {tab === 'aria' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {annotation.aria.map((a, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: '#f8fafc', borderRadius: 6,
                  border: '1px solid var(--border)', borderLeft: '3px solid var(--teal)',
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0, fontFamily: 'monospace' }}>{a}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'decisions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(annotation.decisions ?? []).length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-subdued)' }}>No documented decisions for this component.</p>
              )}
              {(annotation.decisions ?? []).map((d, i) => (
                <div key={i} style={{
                  padding: '12px 16px', background: '#f0fdf4', borderRadius: 8,
                  border: '1px solid var(--green-border)',
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnnotationCard({ annotation, onClick }: { annotation: Annotation; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'var(--white)',
        border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--teal-light)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{annotation.label}</span>
        <StatusBadge status={annotation.status} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-subdued)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {annotation.what}
      </p>
      {annotation.gaps && annotation.gaps.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Tag color="var(--orange)" bg="var(--orange-bg)">{`${annotation.gaps.length} gap${annotation.gaps.length > 1 ? 's' : ''}`}</Tag>
        </div>
      )}
    </button>
  )
}

export default function App() {
  const [activeArea, setActiveArea] = useState<string>('all')
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null)
  const [view, setView] = useState<'split' | 'spec'>('split')

  const filtered = activeArea === 'all'
    ? ANNOTATIONS
    : ANNOTATIONS.filter(a => a.area === activeArea)

  const statusCounts = {
    burrito: ANNOTATIONS.filter(a => a.status === 'burrito').length,
    modified: ANNOTATIONS.filter(a => a.status === 'burrito-modified').length,
    custom: ANNOTATIONS.filter(a => a.status === 'custom').length,
    gaps: ANNOTATIONS.filter(a => a.gaps && a.gaps.length > 0).length,
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{
        height: 52, background: 'var(--teal)', display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 16, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 14 }}>A</span>
          </div>
          <div>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Accessibility Handoff</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginLeft: 8 }}>Booking Flow · Jane App</span>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {(['split', 'spec'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: view === v ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: view === v ? '#fff' : 'rgba(255,255,255,0.7)',
              }}
            >
              {v === 'split' ? 'Prototype + Spec' : 'Spec Only'}
            </button>
          ))}
        </div>

        <a
          href={PROTOTYPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          Open prototype ↗
        </a>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Prototype iframe */}
        {view === 'split' && (
          <div style={{ flex: 1, borderRight: '1px solid var(--border)', position: 'relative', minWidth: 0 }}>
            <iframe
              src={PROTOTYPE_URL}
              title="Booking Flow Accessibility Prototype"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        )}

        {/* Spec panel */}
        <div style={{
          width: view === 'spec' ? '100%' : 420,
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--bg)',
        }}>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
            background: 'var(--white)', flexShrink: 0,
          }}>
            {[
              { label: 'Burrito', count: statusCounts.burrito, color: '#166534', bg: '#dcfce7' },
              { label: 'Burrito + Custom', count: statusCounts.modified, color: '#92400e', bg: '#fef3c7' },
              { label: 'Custom', count: statusCounts.custom, color: '#991b1b', bg: '#fee2e2' },
              { label: 'Gaps', count: statusCounts.gaps, color: '#7c3aed', bg: '#ede9fe' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, padding: '10px 8px', textAlign: 'center',
                borderRight: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 10, color: 'var(--text-subdued)', fontWeight: 500, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Area filter */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--white)', flexShrink: 0,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subdued)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Filter by area</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button
                onClick={() => setActiveArea('all')}
                style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${activeArea === 'all' ? 'var(--teal)' : 'var(--border)'}`,
                  background: activeArea === 'all' ? 'var(--teal-light)' : 'var(--white)',
                  color: activeArea === 'all' ? 'var(--teal)' : 'var(--text-subdued)', cursor: 'pointer',
                }}
              >All</button>
              {AREAS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setActiveArea(a.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                    border: `1px solid ${activeArea === a.id ? 'var(--teal)' : 'var(--border)'}`,
                    background: activeArea === a.id ? 'var(--teal-light)' : 'var(--white)',
                    color: activeArea === a.id ? 'var(--teal)' : 'var(--text-subdued)', cursor: 'pointer',
                  }}
                >{a.label}</button>
              ))}
            </div>
          </div>

          {/* Card list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeArea !== 'all' && (
              <div style={{
                padding: '10px 14px', background: 'var(--teal-light)', borderRadius: 8,
                border: '1px solid #b2dfdf', marginBottom: 4,
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>
                  {AREAS.find(a => a.id === activeArea)?.label}
                </p>
                <p style={{ fontSize: 12, color: '#2d7a7a', margin: '2px 0 0' }}>
                  {AREAS.find(a => a.id === activeArea)?.description}
                </p>
              </div>
            )}
            {filtered.map(a => (
              <AnnotationCard key={a.id} annotation={a} onClick={() => setActiveAnnotation(a)} />
            ))}
          </div>

          {/* Legend */}
          <div style={{
            padding: '10px 16px', borderTop: '1px solid var(--border)',
            background: 'var(--white)', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0,
          }}>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: v.dot }} />
                <span style={{ fontSize: 11, color: 'var(--text-subdued)' }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeAnnotation && (
        <AnnotationDetail annotation={activeAnnotation} onClose={() => setActiveAnnotation(null)} />
      )}
    </div>
  )
}
