export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="skeleton-text" style={{ width: 80, height: 14 }} />
        <div className="skeleton-text" style={{ width: 24, height: 24, borderRadius: '50%' }} />
      </div>
      <div className="skeleton-text" style={{ width: '80%', height: 18, marginBottom: 10 }} />
      <div className="skeleton-text" style={{ width: '100%', height: 12, marginBottom: 6 }} />
      <div className="skeleton-text" style={{ width: '60%', height: 12, marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <div className="skeleton-text" style={{ width: 50, height: 22, borderRadius: 20 }} />
        <div className="skeleton-text" style={{ width: 40, height: 22, borderRadius: 20 }} />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <div className="skeleton-text" style={{ width: 60, height: 12 }} />
      </div>
    </div>
  );
}
