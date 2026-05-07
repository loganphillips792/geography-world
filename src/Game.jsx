import { useEffect, useMemo } from 'react'
import { countries, CONTINENT_NAMES } from './lib/countries.js'
import { PLAYABLE_STATES } from './lib/states.js'

const FEEDBACK_MS = 1500

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildQuestions(countriesList, n) {
  return shuffle(countriesList).slice(0, n)
}

export default function Game({ game, setGame, availableCountries }) {
  useEffect(() => {
    if (game.status !== 'playing' || !game.feedback) return
    const t = setTimeout(() => {
      setGame((g) => {
        const next = g.currentRound + 1
        if (next >= g.totalRounds) {
          return { ...g, status: 'finished', feedback: null }
        }
        return { ...g, currentRound: next, feedback: null }
      })
    }, FEEDBACK_MS)
    return () => clearTimeout(t)
  }, [game.feedback, game.status, setGame])

  const close = () => setGame((g) => ({ ...g, status: 'closed', feedback: null }))

  if (game.status === 'closed') return null

  if (game.status === 'picker') {
    return (
      <Overlay onClose={close}>
        <h2 style={titleStyle}>Choose a game</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setGame((g) => ({ ...g, type: 'country', status: 'setup' }))}
            style={pickerItemStyle}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Identify the country</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              A random country is shown. Click it on the map.
            </div>
          </button>
          <button
            onClick={() => setGame((g) => ({ ...g, type: 'state', status: 'setup' }))}
            style={pickerItemStyle}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Identify the US state</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              A random US state is shown. Click it on the map.
            </div>
          </button>
        </div>
      </Overlay>
    )
  }

  if (game.status === 'setup') {
    if (game.type === 'state') {
      return <StateSetupView game={game} setGame={setGame} />
    }
    return <SetupView game={game} setGame={setGame} availableCountries={availableCountries} />
  }

  if (game.status === 'playing') {
    const target = game.questions[game.currentRound]
    if (!target) return null
    const showFlag = game.type === 'country' && (game.mode === 'flag' || game.mode === 'both')
    const showName = game.type === 'state' || game.mode === 'name' || game.mode === 'both'
    return (
      <div style={bannerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={progressStyle}>
            Round {game.currentRound + 1} / {game.totalRounds}
          </span>
          <span style={scoreStyle}>Score: {game.score}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, justifyContent: 'center' }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Find:</span>
          {showFlag && (
            <img
              src={`https://flagcdn.com/w80/${target.alpha2}.png`}
              alt=""
              width={56}
              height={40}
              style={{ borderRadius: 3, display: 'block' }}
            />
          )}
          {showName && (
            <span style={{ fontSize: 20, fontWeight: 600 }}>{target.name}</span>
          )}
        </div>

        <button onClick={close} style={ghostBtnStyle}>Quit</button>

        {game.feedback && (
          <div style={{ ...feedbackStyle, background: game.feedback.correct ? '#065f46' : '#7f1d1d' }}>
            {game.feedback.correct ? 'Correct!' : `Incorrect — that was ${target.name}`}
          </div>
        )}
      </div>
    )
  }

  if (game.status === 'finished') {
    const pct = Math.round((game.score / game.totalRounds) * 100)
    return (
      <Overlay onClose={close}>
        <h2 style={titleStyle}>Game over</h2>
        <div style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', margin: '8px 0' }}>
          {game.score} / {game.totalRounds}
        </div>
        <div style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 16 }}>
          {pct}% correct
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setGame((g) => ({ ...g, status: 'setup' }))}
            style={primaryBtnStyle}
          >
            Play again
          </button>
          <button onClick={close} style={ghostBtnStyle}>Close</button>
        </div>
      </Overlay>
    )
  }

  return null
}

function StateSetupView({ game, setGame }) {
  const close = () => setGame((g) => ({ ...g, status: 'closed', feedback: null }))
  const pool = PLAYABLE_STATES
  const effectiveRounds = Math.min(game.totalRounds, pool.length)

  return (
    <Overlay onClose={close}>
      <h2 style={titleStyle}>Identify the US state</h2>

      <Field label={`Pool: 50 states`}>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          Excludes DC and Puerto Rico. State name only (no flag).
        </div>
      </Field>

      <Field label="Rounds">
        <input
          type="number"
          min={1}
          max={50}
          value={game.totalRounds}
          onChange={(e) =>
            setGame((g) => ({
              ...g,
              totalRounds: Math.max(1, Math.min(50, Number(e.target.value) || 1)),
            }))
          }
          style={inputStyle}
        />
        {effectiveRounds < game.totalRounds && (
          <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Capped at {effectiveRounds} rounds.
          </span>
        )}
      </Field>

      <button
        onClick={() => {
          const questions = buildQuestions(pool, game.totalRounds)
          setGame((g) => ({
            ...g,
            status: 'playing',
            currentRound: 0,
            score: 0,
            questions,
            feedback: null,
          }))
        }}
        style={primaryBtnStyle}
      >
        Start
      </button>
    </Overlay>
  )
}

function SetupView({ game, setGame, availableCountries }) {
  const close = () => setGame((g) => ({ ...g, status: 'closed', feedback: null }))

  const continentsAvailable = useMemo(() => {
    const set = new Set(availableCountries.map((c) => c.continent).filter(Boolean))
    return Object.keys(CONTINENT_NAMES).filter((code) => set.has(code))
  }, [availableCountries])

  const counts = useMemo(() => {
    const m = {}
    for (const c of availableCountries) if (c.continent) m[c.continent] = (m[c.continent] || 0) + 1
    return m
  }, [availableCountries])

  const selectedContinents = game.continents
  const filteredCount = availableCountries.filter(
    (c) => c.continent && selectedContinents.includes(c.continent),
  ).length

  const toggleContinent = (code) => {
    setGame((g) => {
      const has = g.continents.includes(code)
      return { ...g, continents: has ? g.continents.filter((x) => x !== code) : [...g.continents, code] }
    })
  }
  const setAll = (all) =>
    setGame((g) => ({ ...g, continents: all ? continentsAvailable : [] }))

  const canStart = filteredCount > 0
  const effectiveRounds = Math.min(game.totalRounds, filteredCount)

  return (
    <Overlay onClose={close}>
      <h2 style={titleStyle}>Identify the country</h2>

      <Field label="Show as">
        <ModeRadio value={game.mode} onChange={(mode) => setGame((g) => ({ ...g, mode }))} />
      </Field>

      <Field
        label={`Continents (${filteredCount} countries)`}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAll(true)} style={linkBtnStyle}>All</button>
            <button onClick={() => setAll(false)} style={linkBtnStyle}>None</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {continentsAvailable.map((code) => {
            const on = selectedContinents.includes(code)
            return (
              <button
                key={code}
                onClick={() => toggleContinent(code)}
                style={{
                  ...segmentBtnStyle,
                  textAlign: 'left',
                  background: on ? '#3b82f6' : '#1f2937',
                  color: on ? '#fff' : '#e0e6ed',
                }}
              >
                {CONTINENT_NAMES[code]} <span style={{ opacity: 0.7 }}>({counts[code]})</span>
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Rounds">
        <input
          type="number"
          min={1}
          max={50}
          value={game.totalRounds}
          onChange={(e) =>
            setGame((g) => ({
              ...g,
              totalRounds: Math.max(1, Math.min(50, Number(e.target.value) || 1)),
            }))
          }
          style={inputStyle}
        />
        {filteredCount > 0 && effectiveRounds < game.totalRounds && (
          <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Only {filteredCount} countries available — capped at {effectiveRounds} rounds.
          </span>
        )}
      </Field>

      <button
        onClick={() => {
          const pool = availableCountries.filter(
            (c) => c.continent && selectedContinents.includes(c.continent),
          )
          const rounds = Math.min(game.totalRounds, pool.length)
          const questions = buildQuestions(pool, rounds)
          setGame((g) => ({
            ...g,
            status: 'playing',
            currentRound: 0,
            score: 0,
            questions,
            feedback: null,
          }))
        }}
        disabled={!canStart}
        style={{ ...primaryBtnStyle, opacity: canStart ? 1 : 0.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        Start
      </button>
    </Overlay>
  )
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={backdropStyle}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, right }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
        {right}
      </div>
      {children}
    </label>
  )
}

function ModeRadio({ value, onChange }) {
  const options = [
    { v: 'name', label: 'Name' },
    { v: 'flag', label: 'Flag' },
    { v: 'both', label: 'Both' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            ...segmentBtnStyle,
            background: value === o.v ? '#3b82f6' : '#1f2937',
            color: value === o.v ? '#fff' : '#e0e6ed',
          }}
        >
          {o.label}
        </button>
      ))}
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
  zIndex: 50,
}

const panelStyle = {
  background: '#111827',
  border: '1px solid #374151',
  borderRadius: 10,
  padding: '24px 28px',
  minWidth: 320,
  maxWidth: 420,
  color: '#e0e6ed',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
}

const titleStyle = { margin: '0 0 16px', fontSize: 18, fontWeight: 600 }

const pickerItemStyle = {
  width: '100%',
  textAlign: 'left',
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 6,
  padding: '12px 14px',
  color: '#e0e6ed',
  cursor: 'pointer',
}

const inputStyle = {
  background: '#0a0e1a',
  border: '1px solid #1f2937',
  borderRadius: 4,
  padding: '6px 10px',
  color: '#e0e6ed',
  fontSize: 14,
  outline: 'none',
  width: 100,
}

const primaryBtnStyle = {
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '8px 18px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
}

const ghostBtnStyle = {
  background: 'transparent',
  color: '#9ca3af',
  border: '1px solid #374151',
  borderRadius: 6,
  padding: '8px 14px',
  cursor: 'pointer',
  fontSize: 14,
}

const segmentBtnStyle = {
  flex: 1,
  border: '1px solid #374151',
  borderRadius: 4,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 13,
}

const linkBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#3b82f6',
  cursor: 'pointer',
  fontSize: 12,
  padding: 0,
}

const bannerStyle = {
  position: 'absolute',
  top: 12,
  left: 56,
  right: 12,
  height: 56,
  background: 'rgba(17, 24, 39, 0.95)',
  border: '1px solid #374151',
  borderRadius: 8,
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  zIndex: 6,
  color: '#e0e6ed',
  backdropFilter: 'blur(4px)',
}

const progressStyle = { fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }
const scoreStyle = { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }

const feedbackStyle = {
  position: 'absolute',
  top: 64,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 16px',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  color: '#fff',
  whiteSpace: 'nowrap',
}
