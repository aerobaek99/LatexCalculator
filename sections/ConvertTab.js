// ═══════════════════════════════════════════════════════════════
//  UNIT CONVERTER COMPONENT (Convert 탭)
// ═══════════════════════════════════════════════════════════════
function UnitConverter() {
  const { useState, useMemo } = React;
  const [mode, setMode] = useState("energy");
  const [inputVal, setInputVal] = useState(1);
  const [inputExp, setInputExp] = useState(0);
  const val = inputVal * Math.pow(10, inputExp);
  const conversions = useMemo(() => {
    switch (mode) {
      case "energy": { const J=val*eVtoJ; return [
        { label:"eV",val },{ label:"meV",value:val*1e3 },{ label:"keV",value:val*1e-3 },
        { label:"MeV",value:val*1e-6 },{ label:"GeV",value:val*1e-9 },{ label:"J",value:J },
        { label:"kJ/mol",value:J*6.0221413e23/1000 },{ label:"cm⁻¹",value:val/(1239.8419e-7) },
        { label:"K",value:val/8.617332e-5 },{ label:"Hz",value:val/4.13566752e-15 },
      ]; }
      case "energy_J": { const ev=val/eVtoJ; return [
        { label:"J",value:val },{ label:"eV",value:ev },{ label:"meV",value:ev*1e3 },
        { label:"keV",value:ev*1e-3 },{ label:"MeV",value:ev*1e-6 },{ label:"GeV",value:ev*1e-9 },
        { label:"kJ/mol",value:val*6.0221413e23/1000 },{ label:"cm⁻¹",value:ev/(1239.8419e-7) },
        { label:"K",value:ev/8.617332e-5 },{ label:"Hz",value:ev/4.13566752e-15 },
      ]; }
      case "length": return [
        { label:"m",value:val },{ label:"nm",value:val*1e9 },{ label:"Å",value:val*1e10 },
        { label:"pm",value:val*1e12 },{ label:"fm",value:val*1e15 },{ label:"μm",value:val*1e6 },
        { label:"mm",value:val*1e3 },{ label:"cm",value:val*1e2 },{ label:"a₀",value:val/5.291772109e-11 },
      ];
      case "mass": return [
        { label:"kg",value:val },{ label:"g",value:val*1e3 },{ label:"u",value:val/1.66053892e-27 },
        { label:"MeV/c²",value:(val/1.66053892e-27)*931.49406 },{ label:"mₑ",value:val/9.1093829e-31 },
      ];
      case "temperature": return [
        { label:"K",value:val },{ label:"°C",value:val-273.15 },{ label:"°F",value:(val-273.15)*9/5+32 },
        { label:"kT (eV)",value:8.617332e-5*val },{ label:"kT (J)",value:1.380649e-23*val },
      ];
      default: return [];
    }
  }, [mode, val]);

  const tSt = (a) => ({ background:mode===a?"rgba(40,80,140,0.5)":"transparent", border:mode===a?"1px solid rgba(100,160,255,0.4)":"1px solid rgba(60,80,120,0.15)", borderRadius:6, padding:"6px 12px", cursor:"pointer", color:mode===a?"#a0ccff":"#5577aa", fontSize:12, fontWeight:600 });
  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        {[["energy","Energy (eV)"],["energy_J","Energy (J)"],["length","Length (m)"],["mass","Mass (kg)"],["temperature","Temp (K)"]].map(([m,l]) =>
          <button key={m} onClick={() => setMode(m)} style={tSt(m)}>{l}</button>
        )}
      </div>
      <div style={{ background:cardBg, borderRadius:8, border:cardBorder, padding:14, marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <label style={{ color:"#8899bb", fontSize:12 }}>Value:</label>
          <input type="number" step="any" value={inputVal} onChange={(e) => setInputVal(parseFloat(e.target.value)||0)} style={{width:120,...inputStyle,fontSize:14}} />
          <span style={{ color:"#5577aa", fontSize:13 }}>×10^</span>
          <input type="number" value={inputExp} onChange={(e) => setInputExp(parseInt(e.target.value)||0)} style={{width:60,...inputStyle,fontSize:14}} />
        </div>
        <div style={{ color:"#4a6a90", fontSize:11, marginTop:6, fontFamily:monoFont }}>= {fmt(val)}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:6 }}>
        {conversions.map(c => (
          <div key={c.label} style={{ background:cardBg, borderRadius:6, border:"1px solid rgba(60,90,140,0.15)", padding:"8px 10px" }}>
            <div style={{ color:"#5a8abb", fontSize:11, marginBottom:2 }}>{c.label}</div>
            <div style={{ color:"#c8daf0", fontSize:13, fontFamily:monoFont, fontWeight:500 }}>{fmt(c.value ?? c.val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
