// ═══════════════════════════════════════════════════════════════
//  CONSTANTS TAB COMPONENT
// ═══════════════════════════════════════════════════════════════
function ConstantsTab({ constFilter, setConstFilter, unitSys }) {
  const secTitle = { color: "#4a7ab5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 4 };

  return (
    <div>
      <input type="text" placeholder="Search..." value={constFilter} onChange={(e) => setConstFilter(e.target.value)}
        style={{ width: "100%", maxWidth: 300, ...inputStyle, borderRadius: 6, padding: "6px 10px", marginBottom: 12 }} />
      <div style={secTitle}>Physical Constants</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6, marginBottom: 16 }}>
        {Object.entries(CONSTANTS).filter(([,c]) => !constFilter || c.name.toLowerCase().includes(constFilter.toLowerCase()) || c.symbol.includes(constFilter)).map(([k, c]) => (
          <div key={k} style={{ background: cardBg, borderRadius: 6, border: "1px solid rgba(60,90,140,0.15)", padding: "8px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ color: "#7eb8ff", fontSize: 14, fontWeight: 600, fontFamily: monoFont }}>{c.symbol}</span>
              <span style={{ color: "#4a6a90", fontSize: 10 }}>{c.name}</span>
            </div>
            <div style={{ color: "#c8daf0", fontSize: 12, fontFamily: monoFont, marginTop: 4 }}>{fmt(c.si, 8)} {c.siU}</div>
            {c.evU !== c.siU && <div style={{ color: "#5a8abb", fontSize: 11, fontFamily: monoFont, marginTop: 2 }}>= {fmt(c.ev, 8)} {c.evU}</div>}
            <div style={{ color: "#3a5a7a", fontSize: 9, marginTop: 3, fontFamily: monoFont }}>Key: {c.keys.join(", ")}</div>
          </div>
        ))}
      </div>
      <div style={secTitle}>Conversion Factors</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
        {Object.entries(CONVERSIONS).map(([k, c]) => (
          <div key={k} style={{ background: cardBg, borderRadius: 6, border: "1px solid rgba(60,90,140,0.15)", padding: "8px 10px" }}>
            <span style={{ color: "#7eb8ff", fontSize: 12, fontFamily: monoFont }}>{c.name}</span>
            <span style={{ color: "#4a6a90" }}> = </span>
            <span style={{ color: "#c8daf0", fontSize: 12, fontFamily: monoFont }}>{fmt(c.value, 6)} {c.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
