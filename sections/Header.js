// ═══════════════════════════════════════════════════════════════
//  HEADER COMPONENT (타이틀 + 탭 버튼 UI)
// ═══════════════════════════════════════════════════════════════
function Header({ tab, setTab }) {
  const tabSt = (a) => ({
    background: a ? "rgba(40,80,140,0.5)" : "transparent",
    border: a ? "1px solid rgba(100,160,255,0.4)" : "1px solid transparent",
    borderRadius: 6, padding: "7px 14px", cursor: "pointer",
    color: a ? "#a0ccff" : "#5577aa", fontSize: 12, fontWeight: 600,
    transition: "all 0.15s", letterSpacing: 0.5,
  });

  return (
    <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(60,90,140,0.2)", background: "rgba(10,15,30,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1a3a6a, #2a5090)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#7eb8ff", border: "1px solid rgba(100,160,255,0.3)" }}>φ</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#d0e4ff" }}>Physics Calculator</div>
          <div style={{ fontSize: 10, color: "#4a6a90", letterSpacing: 1 }}>MODERN PHYSICS · APPENDIX A</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[{ id:"formulas",l:"Formulas" },{ id:"constants",l:"Constants" },{ id:"particles",l:"Particles" },{ id:"expr",l:"Expression" },{ id:"convert",l:"Convert" }].map(t =>
          <button key={t.id} onClick={() => setTab(t.id)} style={tabSt(tab===t.id)}>{t.l}</button>
        )}
      </div>
    </div>
  );
}
