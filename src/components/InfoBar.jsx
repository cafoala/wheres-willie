export default function InfoBar({ selected, meta }) {
  if (!selected) {
    return (
      <aside className="info">
        <h2 style={{ marginTop: 0 }}>Sighting details</h2>
        <p style={{ marginBottom: 8 }}>Click a marker to see the animal profile.</p>
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          We use species notes from our mock metadata for now.
        </p>
      </aside>
    );
  }

  return (
    <aside className="info">
      <h2 style={{ marginTop: 0 }}>{selected.species}</h2>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        {selected.when} • {selected.where} • count: {selected.count ?? 'n/a'}
      </p>
      {selected.observer ? (
        <p style={{ marginTop: 0, fontSize: 12, opacity: 0.7 }}>
          Reported by {selected.observer}
          {selected.org ? ` (${selected.org})` : ''}
        </p>
      ) : null}
      {meta?.image ? (
        <img
          src={meta.image}
          alt={meta.commonName || selected.species}
          style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
        />
      ) : null}
      {meta ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <div>
            <strong>Latin name:</strong> {meta.latin}
          </div>
          <div>
            <strong>Size:</strong> {meta.size}
          </div>
          <div>
            <strong>Diet:</strong> {meta.diet}
          </div>
          <div>
            <strong>Migrates:</strong> {meta.migrates}
          </div>
          <div>
            <strong>Fun fact:</strong> {meta.funFact}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          No species profile yet for this sighting.
        </p>
      )}
    </aside>
  );
}
