export default function CanvasLoader({ stageText }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'grid', placeItems: 'center',
      background: 'rgba(9, 13, 20, 0.78)',
      backdropFilter: 'blur(4px)',
      zIndex: 10,
    }}>
      <div style={{ textAlign: 'center', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{
          width: '2.5rem', height: '2.5rem',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#34d399',
          borderRadius: '50%',
          animation: 'spin 0.85s linear infinite',
        }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399' }}>Rendering preview</span>
        <span style={{
          background: 'rgba(15,23,42,0.88)',
          border: '1px solid rgba(148,163,184,0.1)',
          borderRadius: '999px',
          padding: '0.3rem 0.9rem',
          fontSize: '0.8rem',
          color: '#94a3b8',
        }}>{stageText}</span>
      </div>
    </div>
  );
}
