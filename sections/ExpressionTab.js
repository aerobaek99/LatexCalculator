// ═══════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════
function LatexRenderer({ tex, displayMode = false, style, katexReady }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (katexReady && window.katex && containerRef.current) {
      try {
        window.katex.render(tex, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode,
          errorColor: "#e86a6a"
        });
      } catch (e) {
        containerRef.current.textContent = tex;
      }
    } else if (containerRef.current && !katexReady) {
      containerRef.current.textContent = tex;
    }
  }, [tex, katexReady, displayMode]);

  return <span ref={containerRef} style={{ ...style, fontFamily: katexReady ? undefined : monoFont }} />;
}

function ConstantButton({ label, subLabel, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "rgba(20,30,50,0.6)", border: "1px solid rgba(100,140,200,0.25)",
      borderRadius: 6, padding: "6px 8px", cursor: "pointer", textAlign: "left",
      transition: "all 0.15s", minWidth: 0,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(40,70,120,0.6)"; e.currentTarget.style.borderColor = "rgba(100,160,255,0.5)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20,30,50,0.6)"; e.currentTarget.style.borderColor = "rgba(100,140,200,0.25)"; }}
    >
      <div style={{ color: "#7eb8ff", fontSize: 13, fontWeight: 600, fontFamily: monoFont }}>{label}</div>
      <div style={{ color: "#8899bb", fontSize: 10, marginTop: 1 }}>{subLabel}</div>
    </button>
  );
}

function Chip({ active, label, onClick, accent }) {
  const bg = active ? (accent==="green"?"rgba(40,100,60,0.55)":accent==="purple"?"rgba(80,50,130,0.55)":"rgba(40,80,140,0.55)") : "rgba(20,30,50,0.4)";
  const bdr = active ? (accent==="green"?"1px solid rgba(80,200,120,0.45)":accent==="purple"?"1px solid rgba(160,120,255,0.45)":"1px solid rgba(100,160,255,0.45)") : "1px solid rgba(60,80,120,0.2)";
  return <button onClick={onClick} style={{ background: bg, border: bdr, borderRadius: 20, padding: "5px 12px", cursor: "pointer", color: active ? "#d0e4ff" : "#5577aa", fontSize: 11, fontWeight: 600, transition: "all 0.15s", whiteSpace: "nowrap" }}>{label}</button>;
}

// ═══════════════════════════════════════════════════════════════
//  EXPRESSION TAB COMPONENT (수식 입력 및 계산 UI)
// ═══════════════════════════════════════════════════════════════
function ExpressionTab({
  unitSys, setUnitSys, resultDim, setResultDim,
  expr, setExpr, parsed, convertedExpr,
  latexLines, selectedLineIdx, handleLineSelect,
  displayLhs, displayList, evaluatedVars,
  exprResult, exprConversions,
  varValues, setVarValues, varMultipliers, setVarMultipliers,
  handleConstInsert, inputRef, katexReady,
  topPreset, getPresetForVar,
}) {
  const secTitle = { color: "#4a7ab5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 4 };
  const cv = (c) => unitSys==="si"?c.si:c.ev;
  const cu = (c) => unitSys==="si"?c.siU:c.evU;

  return (
    <div>
      {/* Row 1: Unit system + Dimension */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ ...secTitle, marginBottom: 6 }}>Unit System</div>
          <div style={{ display: "flex", gap: 4 }}>
            <Chip active={unitSys==="ev"} label="eV System" onClick={() => setUnitSys("ev")} accent="green" />
            <Chip active={unitSys==="si"} label="SI System" onClick={() => setUnitSys("si")} />
          </div>
        </div>
        <div>
          <div style={{ ...secTitle, marginBottom: 6 }}>Result Dimension (Auto Convert)</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(DIMENSIONS).map(([k,d]) => <Chip key={k} active={resultDim===k} label={d.label} onClick={() => setResultDim(k)} accent="purple" />)}
          </div>
        </div>
      </div>

      {/* Row 2: Preset dropdown */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ ...secTitle, marginBottom: 6 }}>Preset Expressions (Optional)</div>
        <select
          value=""
          onChange={(ev) => {
            if (ev.target.value !== "") {
              const sel = EXPR_PRESETS[parseInt(ev.target.value)];
              setExpr(sel.expr);
              setVarValues(sel.varValues || {});
              setVarMultipliers({});
            } else {
              setExpr("");
              setVarValues({});
              setVarMultipliers({});
            }
          }}
          style={{ width: "100%", maxWidth: 500 }}
        >
          <option value="">-- Select a preset --</option>
          {EXPR_PRESETS.map((p, i) => (
            <option key={i} value={i}>{p.label} — {p.expr}</option>
          ))}
        </select>
      </div>

      {/* Unit system info */}
      <div style={{
        background: unitSys==="ev"?"rgba(40,80,50,0.22)":"rgba(40,60,100,0.22)",
        border: unitSys==="ev"?"1px solid rgba(80,180,100,0.22)":"1px solid rgba(80,120,200,0.22)",
        borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: "#8899bb", lineHeight: 1.6,
      }}>
        {unitSys==="ev" ? (<>
          <strong style={{ color: "#7ecc8f" }}>eV System Note:</strong> Mass constants are precisely applied in <strong>eV/c²</strong> ($m_e \approx 5.11 \times 10^5$). When calculating energy, using $\hbar c$ or $hc$ (eV·nm) rather than $h$ (eV·s) aligns lengths perfectly in nm.
        </>) : (<>
          <strong style={{ color: "#7eb8ff" }}>SI System</strong> — k_B→1.381×10⁻²³ J/K | ℏ→1.055×10⁻³⁴ J·s | m_e→9.109×10⁻³¹ kg | eV→1.602×10⁻¹⁹ (Conversion factor)
        </>)}
      </div>

      {/* Expression input */}
      <div style={{ background: cardBg, borderRadius: 8, border: cardBorder, padding: 14, marginBottom: 12 }}>
        <div style={{ ...secTitle, marginTop: 0, marginBottom: 8 }}>Expression Input <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#5a7a9a" }}>— Normal expression, LaTeX, or align block</span></div>

        {/* Smart preset suggestion (main) */}
        {topPreset && (!expr.includes(topPreset.expr)) && (
          <div style={{ background: "rgba(160,120,60,0.15)", border: "1px solid rgba(180,140,60,0.4)", borderRadius: 6, padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: "#ddbb66", fontSize: 12 }}>
              Found matching preset: <strong>'{topPreset.label}'</strong>
            </div>
            <button onClick={() => { setExpr(displayLhs ? displayLhs + " = " + topPreset.expr : topPreset.expr); setVarValues(topPreset.varValues || {}); setVarMultipliers({}); }} style={{ background: "rgba(180,140,60,0.3)", border: "1px solid rgba(200,160,80,0.4)", borderRadius: 4, padding: "4px 8px", color: "#eedd99", fontSize: 11, cursor: "pointer" }}>
              Load Preset
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "flex-start" }}>
          <textarea ref={inputRef} value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder={"e.g.: E_F = \\frac{\\hbar^{2}}{2 m_e} (3\\pi^{2} n)^{2/3}\nOr paste complex equation block"}
            rows={expr.includes('\n') || expr.includes('\\begin') ? 6 : 2}
            style={{ flex: 1, ...inputStyle, borderRadius: 6, padding: "8px 12px", fontSize: 13, resize: "vertical", lineHeight: 1.5, minHeight: 38 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button onClick={() => { setExpr(""); setVarValues({}); setVarMultipliers({}); }} style={{
              background: "rgba(60,30,30,0.4)", border: "1px solid rgba(200,100,100,0.2)",
              borderRadius: 6, padding: "8px 12px", color: "#cc8888", fontSize: 13, cursor: "pointer",
            }}>Clear</button>
          </div>
        </div>

        {/* Live LaTeX Preview */}
        {expr.trim() && isLatex(expr) && (
          <div style={{ background: "rgba(20,30,40,0.6)", padding: "10px 14px", borderRadius: 6, marginTop: 10, border: "1px solid rgba(100,140,200,0.2)", overflowX: "auto" }}>
            <div style={{ fontSize: 10, color: "#8899bb", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Live LaTeX Preview</div>
            <div style={{ color: "#e0ecff", paddingBottom: 4 }}>
              <LatexRenderer tex={expr.replace(/align\*/g, 'aligned')} displayMode={true} katexReady={katexReady} />
            </div>
          </div>
        )}

        {/* Multi-line equation selector */}
        {latexLines.length > 1 && (
          <div style={{ background: "rgba(40,50,30,0.25)", borderRadius: 6, border: "1px solid rgba(140,160,80,0.25)", padding: "10px 10px", marginTop: 10, marginBottom: 10 }}>
            <div style={{ color: "#aacc55", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Multi-line Equation Detected — Select a line to evaluate ({latexLines.length} lines)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {latexLines.map((line, idx) => {
                const isSelected = idx === selectedLineIdx;
                const convPreview = latexToExpr(line.rhs);
                const tokens = parseExprTokens(convPreview);
                const isSymbolic = tokens.vars.length > 0 || tokens.consts.length > 0;
                return (
                  <button key={idx} onClick={() => handleLineSelect(idx)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: isSelected ? "rgba(60,80,30,0.5)" : "rgba(20,25,15,0.3)",
                    border: isSelected ? "1px solid rgba(140,180,60,0.5)" : "1px solid rgba(80,90,50,0.15)",
                    borderRadius: 5, padding: "6px 10px", cursor: "pointer", transition: "all 0.12s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        background: isSelected ? "rgba(140,180,60,0.5)" : "rgba(80,90,50,0.3)",
                        color: isSelected ? "#e0f0a0" : "#889966",
                        fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, minWidth: 18, textAlign: "center",
                      }}>{idx + 1}</span>
                      {isSymbolic && <span style={{ background: "rgba(80,140,200,0.3)", color: "#90bbee", fontSize: 8, padding: "1px 4px", borderRadius: 2, fontWeight: 600 }}>Symbolic</span>}
                      {!isSymbolic && <span style={{ background: "rgba(100,100,80,0.3)", color: "#999977", fontSize: 8, padding: "1px 4px", borderRadius: 2, fontWeight: 600 }}>Numeric</span>}
                    </div>
                    <div style={{ fontFamily: monoFont, fontSize: 11, color: isSelected ? "#d0e8a0" : "#8899aa", marginTop: 3, lineHeight: 1.4, wordBreak: "break-all" }}>
                      {line.lhs && <span style={{ color: isSelected ? "#c0d880" : "#7a8866" }}>{line.lhs} = </span>}
                      {line.rhs.length > 100 ? line.rhs.slice(0, 100) + '...' : line.rhs}
                    </div>
                    {isSelected && (
                      <div style={{ fontFamily: monoFont, fontSize: 10, color: "#99aa77", marginTop: 2 }}>
                        → {convPreview.length > 120 ? convPreview.slice(0, 120) + '...' : convPreview}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LaTeX detected: show converted expression */}
        {convertedExpr && (
          <div style={{ background: "rgba(60,40,80,0.25)", borderRadius: 6, border: "1px solid rgba(140,100,200,0.3)", padding: "8px 12px", marginTop: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ background: "rgba(140,100,200,0.4)", color: "#d0b8ff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 1 }}>LaTeX Detected</span>
              <span style={{ color: "#9a80cc", fontSize: 10 }}>Automatically converted to evaluable expression</span>
            </div>
            <div style={{ fontFamily: monoFont, fontSize: 12, color: "#c8b0ee", lineHeight: 1.6, wordBreak: "break-all" }}>
              → {convertedExpr}
            </div>
          </div>
        )}

        {/* Auto-detected: constants */}
        {parsed && parsed.consts.length > 0 && (
          <div style={{ background: "rgba(20,50,60,0.3)", borderRadius: 6, border: "1px solid rgba(60,140,120,0.2)", padding: "8px 10px", marginBottom: 10 }}>
            <div style={{ color: "#5aaa88", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Detected Constants</div>
            {parsed.consts.map(c => {
              const val = unitSys === "si" ? c.data.si : c.data.ev;
              const unit = unitSys === "si" ? c.data.siU : c.data.evU;
              return (
                <div key={c.token} style={{ fontFamily: monoFont, fontSize: 11, color: "#7ecbaa", lineHeight: 1.6 }}>
                  <strong>{c.token}</strong> = {fmt(val, 6)} {unit} <span style={{ color: "#4a7a6a" }}>({c.data.name})</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Auto-detected: Hierarchical variables */}
        {displayList.length > 0 && (
          <div style={{ background: "rgba(50,40,20,0.3)", borderRadius: 6, border: "1px solid rgba(180,140,60,0.2)", padding: "10px 10px", marginBottom: 10 }}>
            <div style={{ color: "#ccaa55", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Variables (Auto-detects nested variables)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {displayList.map(item => {
                const evaluatedVal = evaluatedVars[item.name];
                const isValid = evaluatedVal !== null && typeof evaluatedVal === 'number' && !isNaN(evaluatedVal) && isFinite(evaluatedVal);
                const indent = Math.min(item.depth * 24, 140);
                const activeMultiplier = varMultipliers[item.name] || 1;

                const varPreset = getPresetForVar(item.name);
                const showVarPreset = varPreset && !(varValues[item.name] && varValues[item.name].includes(varPreset.expr));

                return (
                  <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: indent, borderLeft: item.depth > 0 ? "2px solid rgba(180,140,60,0.4)" : "none", paddingLeft: item.depth > 0 ? 12 : 0, marginTop: item.depth > 0 ? 6 : 0 }}>

                    {showVarPreset && (
                      <div style={{ background: "rgba(160,120,60,0.15)", border: "1px solid rgba(180,140,60,0.3)", borderRadius: 6, padding: "6px 10px", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ color: "#ddbb66", fontSize: 11 }}>
                          Suggested Preset: <strong>{varPreset.label}</strong>
                        </div>
                        <button onClick={() => { setVarValues(prev => ({ ...prev, [item.name]: varPreset.expr, ...(varPreset.varValues || {}) })); }} style={{ background: "rgba(180,140,60,0.3)", border: "1px solid rgba(200,160,80,0.3)", borderRadius: 4, padding: "3px 8px", color: "#eedd99", fontSize: 11, cursor: "pointer" }}>
                          Apply
                        </button>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <label style={{ color: "#ddbb66", fontSize: 13, fontWeight: 600, fontFamily: monoFont, minWidth: 40, textAlign: "right" }}>
                        <LatexRenderer tex={item.name} katexReady={katexReady} displayMode={false} /> =
                      </label>
                      <input
                        type="text"
                        value={varValues[item.name] || ""}
                        onChange={(ev) => setVarValues(prev => ({ ...prev, [item.name]: ev.target.value }))}
                        placeholder="Input constant or expression (LaTeX supported)"
                        style={{ flex: 1, minWidth: 180, ...inputStyle, borderRadius: 6, padding: "6px 10px", borderColor: "rgba(180,140,60,0.3)" }}
                      />
                      <select
                        value={activeMultiplier}
                        onChange={(ev) => setVarMultipliers(prev => ({ ...prev, [item.name]: parseFloat(ev.target.value) }))}
                        style={{ background: "rgba(30,20,10,0.5)", border: "1px solid rgba(180,140,60,0.3)", color: "#cca060", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontFamily: monoFont, minWidth: 140 }}
                      >
                        {MAGNITUDES.map(mag => (
                          <option key={mag.label} value={mag.val}>{mag.label}</option>
                        ))}
                      </select>
                    </div>
                    {(item.previewTex || isValid) && (
                      <div style={{ paddingLeft: 68, display: "flex", flexDirection: "column", gap: 4 }}>
                        {item.previewTex && (
                          <div style={{ color: "#c8b0ee", fontSize: 12, overflowX: "auto" }}>
                            <LatexRenderer tex={item.previewTex} katexReady={katexReady} displayMode={false} />
                          </div>
                        )}
                        {isValid && (
                          <div style={{ color: "#8899aa", fontSize: 11, fontFamily: monoFont }}>
                            {item.previewTex ? "↳ " : "= "}{fmt(evaluatedVal)}
                            {activeMultiplier !== 1 && <span style={{color: "#bba866"}}> (Prefix applied)</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {displayList.length === 0 && expr.trim() && (
          <div style={{ color: "#5577aa", fontSize: 11, marginBottom: 6 }}>All tokens are built-in constants — Ready to evaluate</div>
        )}

        {/* Result */}
        {exprResult !== null && (
          <div style={{ background: "rgba(20,40,80,0.4)", borderRadius: 6, border: "1px solid rgba(80,130,220,0.3)", padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {displayLhs ? (
                <LatexRenderer
                  tex={displayLhs + " ="}
                  katexReady={katexReady}
                  style={{ fontSize: 20, color: "#a0ccff", display: "inline-block" }}
                />
              ) : (
                <span style={{ color: "#5a8abb", fontSize: 20 }}>= </span>
              )}
              <span style={{ fontFamily: monoFont, fontSize: 26, fontWeight: 600, color: "#7eb8ff" }}>{fmt(exprResult)}</span>
              {(exprResult !== 0 && isFinite(exprResult) && (Math.abs(exprResult) < 1e-3 || Math.abs(exprResult) >= 1e5)) ? (
                <span style={{ fontFamily: monoFont, fontSize: 14, color: "#5a8abb", marginLeft: 4 }}>({formatReadableSci(exprResult)})</span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Auto conversions */}
      {exprResult !== null && isFinite(exprResult) && resultDim !== "none" && exprConversions.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={secTitle}>Auto Conversions — {DIMENSIONS[resultDim].label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 5 }}>
            {exprConversions.map(c => (
              <div key={c.label} style={{ background: "rgba(20,35,60,0.45)", borderRadius: 6, border: "1px solid rgba(60,90,140,0.2)", padding: "7px 10px" }}>
                <div style={{ color: "#5a8abb", fontSize: 10, marginBottom: 2, fontWeight: 600 }}>{c.label}</div>
                <div style={{ color: "#c8daf0", fontSize: 13, fontFamily: monoFont, fontWeight: 500 }}>{fmt(c.val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick insert buttons */}
      <div style={secTitle}>Click constant to insert — <span style={{ color: unitSys==="ev"?"#7ecc8f":"#7eb8ff" }}>{unitSys==="ev"?"eV":"SI"} Value</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 4, marginBottom: 12 }}>
        {Object.entries(CONSTANTS).map(([k, c]) => (
          <ConstantButton key={k} label={c.symbol} subLabel={`${fmt(cv(c), 5)} ${cu(c)}`} onClick={() => handleConstInsert(c.keys[0])} />
        ))}
      </div>
      <div style={secTitle}>Particle Masses</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 4, marginBottom: 12 }}>
        {Object.entries(PARTICLES).map(([k, c]) => (
          <ConstantButton key={k} label={c.symbol} subLabel={`${fmt(unitSys==="si"?c.si:c.ev, 5)} ${unitSys==="si"?c.siU:c.evU}`} onClick={() => handleConstInsert(c.keys[0])} />
        ))}
      </div>

      {/* Help */}
      <div style={{ background: "rgba(15,25,45,0.3)", borderRadius: 6, padding: 10, border: "1px solid rgba(60,90,140,0.15)" }}>
        <div style={{ color: "#4a6a90", fontSize: 11, lineHeight: 1.8 }}>
          <strong style={{ color: "#5a8abb" }}>Workflow:</strong> 1. Select unit system → 2. Input expression (Normal/LaTeX/align) → 3. Enter variables → 4. Auto calculation<br/>
          <strong style={{ color: "#5a8abb" }}>Operators:</strong> + - * / ^(exponent) sqrt() cbrt() exp() ln() sin() cos() tan() π<br/>
          <strong style={{ color: "#5a8abb" }}>Euler's Number:</strong> e_n (= 2.71828...) — e.g., e_n**(-lambda * t)<br/>
          <strong style={{ color: "#b090dd" }}>LaTeX:</strong> \frac, \sqrt, \sqrt[n], \hbar, \pi, ^{'{}'}, _{'{}'}, \times, \cdot, \left/\right<br/>
          <strong style={{ color: "#aacc55" }}>Multi-line:</strong> Paste \begin{'{'}align*{'}'}... block → Parsed line by line → Select a line → Enter variables → Auto calculation<br/>
          <strong style={{ color: "#e86a6a" }}>Caution:</strong> According to programming rules, <code style={{background:"rgba(200,50,50,0.2)", padding:"2px 4px", borderRadius:4}}>a/b*c</code> is evaluated as <code style={{color:"#ff9999"}}>(a/b)*c</code>. <strong>To group the denominator, you MUST use parentheses like <code style={{background:"rgba(50,200,50,0.2)", color:"#99ff99", padding:"2px 4px", borderRadius:4}}>a/(b*c)</code>!</strong>
        </div>
      </div>
    </div>
  );
}
