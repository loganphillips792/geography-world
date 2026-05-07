import { useEffect } from 'react'

export default function Settings({ settings, setSettings, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div onClick={onClose} style={backdropStyle}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <button onClick={onClose} aria-label="Close" style={closeBtnStyle}>×</button>
        <h2 style={titleStyle}>Settings</h2>

        <Toggle
          label="Show US states"
          description="Subdivide the United States into individual states on the map."
          checked={settings.showUSStates}
          onChange={(v) => setSettings((s) => ({ ...s, showUSStates: v }))}
        />
      </div>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label style={rowStyle}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: 'none',
          background: checked ? '#3b82f6' : '#374151',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 120ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: '#fff',
            transition: 'left 120ms ease',
          }}
        />
      </button>
    </label>
  )
}

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
}

const panelStyle = {
  position: 'relative',
  background: '#111827',
  border: '1px solid #374151',
  borderRadius: 10,
  padding: '24px 28px',
  minWidth: 360,
  maxWidth: 460,
  color: '#e0e6ed',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
}

const titleStyle = { margin: '0 0 16px', fontSize: 18, fontWeight: 600 }

const closeBtnStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 32,
  height: 32,
  background: 'transparent',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  fontSize: 22,
  lineHeight: 1,
  borderRadius: 4,
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '10px 0',
}
