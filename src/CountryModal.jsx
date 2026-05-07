import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

export default function CountryModal() {
  const { alpha2 } = useParams()
  const navigate = useNavigate()
  const close = () => navigate('/')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const code = alpha2?.toLowerCase()
  const name = code ? countries.getName(code.toUpperCase(), 'en') : null
  const found = Boolean(name)

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={name || 'Country detail'}
        style={{
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
          gap: 16,
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
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
          }}
        >
          ×
        </button>

        {found ? (
          <>
            <img
              src={`https://flagcdn.com/w160/${code}.png`}
              alt=""
              width={160}
              height={120}
              style={{ borderRadius: 4, display: 'block', objectFit: 'cover' }}
            />
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, textAlign: 'center' }}>{name}</h2>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 16, color: '#9ca3af' }}>
            Country not found: <code>{alpha2}</code>
          </p>
        )}
      </div>
    </div>
  )
}
