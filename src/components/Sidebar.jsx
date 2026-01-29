export default function Sidebar({ speciesList, selected, onToggle, recencyDays, onRecencyChange }) {
  const recencyOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 31, label: 'Last 31 days' },
    { value: 60, label: 'Last 60 days' },
    { value: 90, label: 'Last 90 days' },
  ];

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
      </div>

      <h3 style={{marginTop: 16}}>Recency</h3>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        <input 
          type="range" 
          min="0" 
          max={recencyOptions.length - 1} 
          value={recencyOptions.findIndex(opt => opt.value === recencyDays)}
          onChange={(e) => onRecencyChange(recencyOptions[Number(e.target.value)].value)}
          style={{width: '100%'}}
        />
        <div style={{display:'flex', justifyContent:'space-between', fontSize:12}}>
          <span>{recencyOptions[0].label}</span>
          <span style={{fontWeight: 'bold'}}>{recencyOptions.find(opt => opt.value === recencyDays)?.label}</span>
          <span>{recencyOptions[recencyOptions.length - 1].label}</span>
        </div>
      </div>

      <hr style={{margin:'16px 0'}} />
      <p style={{fontSize:12, opacity:.7}}>
        Live data from Seawatch Foundation. Only sightings with GPS coordinates are shown.
      </p>
    </aside>
  );
}
