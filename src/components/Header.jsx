export default function Header({ rareOnly, onToggleRare }) {
  return (
    <header className="header">
      <div style={{display:'flex', alignItems:'center', gap:16, justifyContent:'space-between'}}>
        <h1 style={{margin:0}}>Where’s Willie 🐋</h1>
        <label style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={rareOnly} onChange={e=>onToggleRare(e.target.checked)} />
          Rare only
        </label>
      </div>
    </header>
  );
}
