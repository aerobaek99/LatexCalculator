// ═══════════════════════════════════════════════════════════════
//  PARTICLES TAB COMPONENT
// ═══════════════════════════════════════════════════════════════
function ParticlesTab() {
  const secTitle = { color: "#4a7ab5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 4 };

  return (
    <div>
      <div style={secTitle}>Particle Masses</div>
      <div style={{ background: cardBg, borderRadius: 8, border: cardBorder, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: monoFont, fontSize: 12 }}>
          <thead><tr style={{ background: "rgba(20,35,60,0.6)" }}>
            {["Particle","kg","u","MeV/c²","Formula Key"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#5a8abb", fontWeight: 600, borderBottom: cardBorder }}>{h}</th>)}
          </tr></thead>
          <tbody>{Object.entries(PARTICLES).map(([k,p]) => (
            <tr key={k} style={{ borderBottom: "1px solid rgba(60,90,140,0.1)" }}>
              <td style={{ padding: "7px 10px", color: "#7eb8ff", fontWeight: 600 }}>{p.symbol}</td>
              <td style={{ padding: "7px 10px", color: "#c8daf0" }}>{p.si.toExponential(7)}</td>
              <td style={{ padding: "7px 10px", color: "#c8daf0" }}>{p.u}</td>
              <td style={{ padding: "7px 10px", color: "#c8daf0" }}>{p.mev}</td>
              <td style={{ padding: "7px 10px", color: "#3a5a7a", fontSize: 10 }}>{p.keys.join(", ")}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{ ...secTitle, marginTop: 16 }}>Prefixes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 4 }}>
        {PREFIXES.map(p => (
          <div key={p.name} style={{ background: cardBg, borderRadius: 6, border: "1px solid rgba(60,90,140,0.15)", padding: "6px 10px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8899bb", fontSize: 12 }}>{p.name} ({p.abbr})</span>
            <span style={{ color: "#7eb8ff", fontSize: 12, fontFamily: monoFont }}>10^{p.exp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
