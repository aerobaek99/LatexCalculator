// ═══════════════════════════════════════════════════════════════
//  FORMULAS TAB COMPONENT
// ═══════════════════════════════════════════════════════════════
function ParamInput({ param, value, onChange }) {
  const [mantissa, setMantissa] = React.useState("");
  const [exponent, setExponent] = React.useState("");
  const init = React.useRef(false);
  React.useEffect(() => {
    if (!init.current) { init.current = true; if (param.scientific && value) { const exp = Math.floor(Math.log10(Math.abs(value))); setMantissa((value / Math.pow(10, exp)).toPrecision(4)); setExponent(String(exp)); } }
  }, []);
  if (param.scientific) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <label style={{ color: "#8899bb", fontSize: 12, minWidth: 80 }}>{param.label}</label>
        <input type="text" value={mantissa} onChange={(ev) => { setMantissa(ev.target.value); const m=parseFloat(ev.target.value),e=parseInt(exponent)||0; if(!isNaN(m)) onChange(m*Math.pow(10,e)); }} style={{width:70,...inputStyle}} />
        <span style={{ color: "#5577aa", fontSize: 13 }}>×10^</span>
        <input type="text" value={exponent} onChange={(ev) => { setExponent(ev.target.value); const m=parseFloat(mantissa)||0,e=parseInt(ev.target.value); if(!isNaN(e)) onChange(m*Math.pow(10,e)); }} style={{width:44,...inputStyle}} />
        <span style={{ color: "#5577aa", fontSize: 11, marginLeft: 4 }}>{param.unit}</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <label style={{ color: "#8899bb", fontSize: 12, minWidth: 80 }}>{param.label}</label>
      <input type="number" value={value} step="any" onChange={(ev) => onChange(parseFloat(ev.target.value)||0)} style={{width:110,...inputStyle}} />
      <span style={{ color: "#5577aa", fontSize: 11 }}>{param.unit}</span>
    </div>
  );
}

function FormulasTab({ selectedFormula, setSelectedFormula, formula, formulaParams, setFormulaParams, formulaResult }) {
  const secTitle = { color: "#4a7ab5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 4 };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 200, flex: "0 0 220px" }}>
        <div style={secTitle}>Preset Formulas</div>
        {FORMULAS.map(f => (
          <button key={f.id} onClick={() => setSelectedFormula(f.id)} style={{
            display: "block", width: "100%", textAlign: "left",
            background: selectedFormula===f.id?"rgba(30,60,110,0.6)":"rgba(15,25,45,0.4)",
            border: selectedFormula===f.id?"1px solid rgba(100,160,255,0.3)":"1px solid rgba(60,80,120,0.15)",
            borderRadius: 6, padding: "8px 10px", marginBottom: 4, cursor: "pointer",
          }}>
            <div style={{ color: selectedFormula===f.id?"#a0ccff":"#7899bb", fontSize: 13, fontWeight: 600 }}>{f.name}</div>
            <div style={{ color: "#4a6a90", fontSize: 11, fontFamily: monoFont, marginTop: 2 }}>{f.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        {formula && (<>
          <div style={secTitle}>Input Parameters</div>
          <div style={{ background: cardBg, borderRadius: 8, border: cardBorder, padding: 14, marginBottom: 12 }}>
            <div style={{ color: "#7eb8ff", fontSize: 14, fontWeight: 600, marginBottom: 10, fontFamily: monoFont }}>{formula.desc}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {formula.params.map(p => <ParamInput key={`${formula.id}-${p.key}`} param={p} value={formulaParams[formula.id]?.[p.key] ?? p.default}
                onChange={(v) => setFormulaParams(prev => ({ ...prev, [formula.id]: { ...prev[formula.id], [p.key]: v } }))} />)}
            </div>
          </div>
          {formulaResult && (<>
            <div style={secTitle}>Result</div>
            <div style={{ background: "rgba(20,40,80,0.4)", borderRadius: 8, border: "1px solid rgba(80,130,220,0.3)", padding: 14 }}>
              <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 600, color: "#7eb8ff", marginBottom: 4 }}>{fmt(formulaResult.value)} {formulaResult.unit}</div>
              {formulaResult.alt && <div style={{ fontFamily: monoFont, fontSize: 16, color: "#5fa0e0", marginBottom: 8 }}>= {formulaResult.alt}</div>}
              <div style={{ fontFamily: monoFont, fontSize: 11, color: "#4a6a90", whiteSpace: "pre-line", lineHeight: 1.6, borderTop: "1px solid rgba(60,90,140,0.2)", paddingTop: 8 }}>{formulaResult.detail}</div>
            </div>
          </>)}
        </>)}
      </div>
    </div>
  );
}
