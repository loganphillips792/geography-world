export default function GameButton({ onClick, hidden }) {
  if (hidden) return null
  return (
    <button
      onClick={onClick}
      aria-label="Open games"
      title="Games"
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        background: '#3b82f6',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  )
}
