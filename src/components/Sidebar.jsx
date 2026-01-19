export default function Sidebar({ speciesList, selected, onToggle }) {
  return (
    <aside className="sidebar">
      <h2 style={{marginTop:0}}>Filters</h2>
      <h3>Species</h3>
      <div style={{display:'grid', gap:8}}>
        {speciesList.map(sp => (
          <label key={sp} style={{display:'flex', gap:8, alignItems:'center'}}>
            <input type="checkbox" checked={selected.has(sp)} onChange={()=>onToggle(sp)} />
            <span>{sp}</span>
          </label>
        ))}
      <h3>Recency</h3>
      </div>

      <hr style={{margin:'12px 0'}} />
      <p style={{fontSize:12, opacity:.7}}>
        Using mock sightings while we wait for SeaWatch data. We’ll swap to live data via an adapter later.
      </p>
    </aside>
  );
}
