export default function InfoBar({ zoom, center }) {
  return (
    <div className="footer" style={{display:'flex', gap:16, justifyContent:'space-between', alignItems:'center'}}>
      <div>Zoom: {zoom} • Center: {center[0].toFixed(2)}, {center[1].toFixed(2)}</div>
      <div style={{fontSize:12, opacity:.7}}>&copy; OpenStreetMap contributors</div>
    </div>
  );
}
