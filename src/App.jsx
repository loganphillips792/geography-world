import { useEffect, useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import WorldMap from './WorldMap.jsx'
import Sidebar from './Sidebar.jsx'
import CountryModal from './CountryModal.jsx'
import StateModal from './StateModal.jsx'
import Game from './Game.jsx'
import GameButton from './GameButton.jsx'
import Settings from './Settings.jsx'
import SettingsButton from './SettingsButton.jsx'
import { extractCountriesFromTopology } from './lib/countries.js'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const US_STATES_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const INITIAL_GAME = {
  status: 'closed',
  type: 'country',
  mode: 'name',
  totalRounds: 10,
  currentRound: 0,
  score: 0,
  questions: [],
  feedback: null,
  continents: ['AF', 'AS', 'EU', 'NA', 'OC', 'SA'],
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [highlighted, setHighlighted] = useState(null)
  const [topology, setTopology] = useState(null)
  const [game, setGame] = useState(INITIAL_GAME)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({ showUSStates: false })
  const [usStatesTopology, setUsStatesTopology] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((t) => {
        if (!cancelled) setTopology(t)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!settings.showUSStates || usStatesTopology) return
    let cancelled = false
    fetch(US_STATES_URL)
      .then((r) => r.json())
      .then((t) => {
        if (!cancelled) setUsStatesTopology(t)
      })
    return () => {
      cancelled = true
    }
  }, [settings.showUSStates, usStatesTopology])

  const availableCountries = useMemo(() => extractCountriesFromTopology(topology), [topology])

  const gameActive = game.status === 'playing'

  useEffect(() => {
    if (gameActive && game.type === 'state' && !settings.showUSStates) {
      setSettings((s) => ({ ...s, showUSStates: true }))
    }
  }, [gameActive, game.type, settings.showUSStates])

  const handleCountryClick = (alpha2) => {
    if (!gameActive || game.feedback || game.type !== 'country') return
    const target = game.questions[game.currentRound]
    if (!target) return
    const correct = alpha2 === target.alpha2
    setGame((g) => ({
      ...g,
      score: correct ? g.score + 1 : g.score,
      feedback: { correct, clickedAlpha2: alpha2 },
    }))
  }

  const handleStateClick = (postal) => {
    if (!gameActive || game.feedback) return
    if (game.type === 'country') {
      handleCountryClick('us')
      return
    }
    if (game.type !== 'state' || !postal) return
    const target = game.questions[game.currentRound]
    if (!target) return
    const correct = postal === target.postal
    setGame((g) => ({
      ...g,
      score: correct ? g.score + 1 : g.score,
      feedback: { correct, clickedPostal: postal },
    }))
  }

  const target = game.feedback ? game.questions[game.currentRound] : null
  const feedbackAlpha2 = target?.alpha2 ?? null
  const feedbackPostal = target?.postal ?? null
  const feedbackKind = game.feedback?.correct ? 'correct' : 'incorrect'

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <WorldMap
          highlightedAlpha2={highlighted}
          topology={topology}
          gameActive={gameActive}
          onCountryClick={handleCountryClick}
          onStateClick={handleStateClick}
          feedbackAlpha2={feedbackAlpha2}
          feedbackPostal={feedbackPostal}
          feedbackKind={feedbackKind}
          usStatesTopology={settings.showUSStates ? usStatesTopology : null}
        />
        <GameButton
          onClick={() => setGame((g) => ({ ...g, status: 'picker' }))}
          hidden={game.status === 'playing'}
        />
        <SettingsButton onClick={() => setSettingsOpen(true)} />
        <Game game={game} setGame={setGame} availableCountries={availableCountries} />
        {settingsOpen && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onHoverCountry={setHighlighted}
        disabled={gameActive}
      />
      <Routes>
        <Route path="/country/:alpha2" element={<CountryModal />} />
        <Route path="/state/:stateCode" element={<StateModal />} />
      </Routes>
    </div>
  )
}
