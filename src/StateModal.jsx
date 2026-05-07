import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStateByPostal } from './lib/states.js'

export default function StateModal() {
  const { stateCode } = useParams()
  const navigate = useNavigate()
  const close = () => navigate('/')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const state = getStateByPostal(stateCode)
  const found = Boolean(state)

  return (
    <div onClick={close} style={backdropStyle}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={state?.name || 'State detail'}
        style={panelStyle}
      >
        <button onClick={close} aria-label="Close" style={closeBtnStyle}>×</button>

        {found ? (
          <>
            <div style={postalStyle}>{state.postal.toUpperCase()}</div>
            <h2 style={nameStyle}>{state.name}</h2>
            <div style={metaStyle}>State of the United States</div>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 16, color: '#9ca3af' }}>
            State not found: <code>{stateCode}</code>
          </p>
        )}
      </div>
    </div>
  )
}

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}

const panelStyle = {
  position: 'relative',
  background: '#111827',
  border: '1px solid #374151',
  borderRadius: 10,
  padding: '32px 40px',
  minWidth: 320,
  maxWidth: 480,
  color: '#e0e6ed',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
}

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

const postalStyle = {
  fontSize: 56,
  fontWeight: 700,
  letterSpacing: 2,
  color: '#3b82f6',
  lineHeight: 1,
  marginTop: 8,
}

const nameStyle = { margin: 0, fontSize: 22, fontWeight: 600, textAlign: 'center' }

const metaStyle = { fontSize: 13, color: '#9ca3af' }
