export default function CanvasLoader({ stageText }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'grid', placeItems: 'center',
      background: 'rgba(245,243,239,0.82)',
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
          width: '28px', height: '28px',
          border: '2px solid #E5E2DA',
          borderTopColor: '#1A1916',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: '0.78rem', color: '#5A5650', fontWeight: 500 }}>{stageText}</span>
      </div>
    </div>
  );
}
