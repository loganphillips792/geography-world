import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { countries, resolveAlpha2 } from './lib/countries.js'
import { getStateByFips } from './lib/states.js'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const MIN_ZOOM = 1
const MAX_ZOOM = 8

const zoomBtnStyle = {
  width: 32,
  height: 32,
  background: '#111827',
  border: '1px solid #374151',
  borderRadius: 4,
  color: '#e0e6ed',
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function WorldMap({
  highlightedAlpha2,
  topology,
  gameActive = false,
  onCountryClick,
  onStateClick,
  feedbackAlpha2,
  feedbackPostal,
  feedbackKind,
  usStatesTopology,
}) {
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState(null)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })

  const zoomBy = (factor) =>
    setPosition((p) => ({
      ...p,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p.zoom * factor)),
    }))
  const reset = () => setPosition({ coordinates: [0, 0], zoom: 1 })

  useEffect(() => {
    const codes = Object.keys(countries.getAlpha2Codes()).map((c) => c.toLowerCase())
    codes.forEach((code) => {
      const img = new Image()
      img.src = `https://flagcdn.com/w40/${code}.png`
    })
  }, [])

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 170 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={setPosition}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          translateExtent={[[0, 0], [800, 600]]}
        >
          <Geographies geography={topology || GEO_URL} key="world">
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = resolveAlpha2(geo)
                const name = geo.properties.name
                const isHighlighted = !gameActive && alpha2 && alpha2 === highlightedAlpha2
                const isFeedback = alpha2 && alpha2 === feedbackAlpha2
                let baseFill = '#1f2937'
                if (isFeedback) baseFill = feedbackKind === 'correct' ? '#10b981' : '#ef4444'
                else if (isHighlighted) baseFill = '#3b82f6'
                const hoverFill = gameActive ? '#374151' : '#3b82f6'
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      if (gameActive) return
                      setTooltip({ name, alpha2, x: e.clientX, y: e.clientY })
                    }}
                    onMouseMove={(e) => {
                      if (gameActive) return
                      setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t))
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (!alpha2) return
                      if (gameActive) {
                        onCountryClick?.(alpha2)
                      } else {
                        navigate(`/country/${alpha2}`)
                      }
                    }}
                    style={{
                      default: { fill: baseFill, stroke: '#0a0e1a', strokeWidth: 0.5, outline: 'none' },
                      hover: { fill: hoverFill, stroke: '#0a0e1a', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
                      pressed: { fill: '#2563eb', stroke: '#0a0e1a', strokeWidth: 0.5, outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {usStatesTopology && (
            <Geographies geography={usStatesTopology} key="us-states">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const state = getStateByFips(geo.id)
                  const stateName = state?.name || geo.properties.name
                  const isFeedback = state && state.postal === feedbackPostal
                  let baseFill = '#1f2937'
                  if (isFeedback) baseFill = feedbackKind === 'correct' ? '#10b981' : '#ef4444'
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        if (gameActive) return
                        setTooltip({ name: stateName, alpha2: null, x: e.clientX, y: e.clientY })
                      }}
                      onMouseMove={(e) => {
                        if (gameActive) return
                        setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t))
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => {
                        if (gameActive) {
                          onStateClick?.(state?.postal)
                        } else if (state) {
                          navigate(`/state/${state.postal}`)
                        }
                      }}
                      style={{
                        default: { fill: baseFill, stroke: '#0a0e1a', strokeWidth: 0.6, outline: 'none' },
                        hover: { fill: gameActive ? '#374151' : '#3b82f6', stroke: '#0a0e1a', strokeWidth: 0.6, outline: 'none', cursor: 'pointer' },
                        pressed: { fill: '#2563eb', stroke: '#0a0e1a', strokeWidth: 0.6, outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>

      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          zIndex: 5,
        }}
      >
        <button onClick={() => zoomBy(1.5)} aria-label="Zoom in" style={zoomBtnStyle}>+</button>
        <button onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out" style={zoomBtnStyle}>−</button>
        <button onClick={reset} aria-label="Reset view" style={{ ...zoomBtnStyle, fontSize: 12 }}>⟳</button>
      </div>

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: 6,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.alpha2 && (
            <img
              src={`https://flagcdn.com/w40/${tooltip.alpha2}.png`}
              alt=""
              width={28}
              height={20}
              style={{ borderRadius: 2, display: 'block' }}
            />
          )}
          <span style={{ fontWeight: 500 }}>{tooltip.name}</span>
        </div>
      )}
    </div>
  )
}
