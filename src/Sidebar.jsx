import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

export default function Sidebar({ collapsed, onToggle, onHoverCountry, disabled = false }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const names = countries.getNames('en')
    return Object.entries(names)
      .map(([alpha2, name]) => ({ alpha2: alpha2.toLowerCase(), name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.alpha2.includes(q))
  }, [list, query])

  return (
    <aside
      style={{
        width: collapsed ? 40 : 280,
        height: '100%',
        background: '#0f1420',
        borderLeft: '1px solid #1f2937',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 150ms ease',
        flexShrink: 0,
      }}
    >
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          height: 40,
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #1f2937',
          color: '#e0e6ed',
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {collapsed ? '◀' : '▶'}
      </button>

      {!collapsed && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries…"
            aria-label="Search countries"
            style={{
              width: '100%',
              background: '#0a0e1a',
              border: '1px solid #1f2937',
              borderRadius: 4,
              padding: '6px 10px',
              color: '#e0e6ed',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      )}

      {!collapsed && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {filtered.length === 0 && (
            <li style={{ padding: '12px', fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
              No matches
            </li>
          )}
          {filtered.map((c) => (
            <li
              key={c.alpha2}
              onMouseEnter={disabled ? undefined : () => onHoverCountry(c.alpha2)}
              onMouseLeave={disabled ? undefined : () => onHoverCountry(null)}
              onClick={disabled ? undefined : () => navigate(`/country/${c.alpha2}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px',
                cursor: disabled ? 'default' : 'pointer',
                fontSize: 13,
                borderBottom: '1px solid #161c2a',
                opacity: disabled ? 0.5 : 1,
              }}
              onMouseOver={disabled ? undefined : (e) => (e.currentTarget.style.background = '#1a2030')}
              onMouseOut={disabled ? undefined : (e) => (e.currentTarget.style.background = 'transparent')}
            >
              <img
                src={`https://flagcdn.com/w40/${c.alpha2}.png`}
                alt=""
                width={24}
                height={16}
                style={{ borderRadius: 2, display: 'block', flexShrink: 0 }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
