// ═══════════════════════════════════════════════════════════════
//  MAIN APP COMPONENT (상태 관리 및 라우팅)
// ═══════════════════════════════════════════════════════════════
function App() {
  const { useState, useCallback, useMemo, useRef, useEffect } = React;

  const [tab, setTab] = useState("expr");
  const [katexReady, setKatexReady] = useState(false);

  useEffect(() => {
    if (window.katex) { setKatexReady(true); return; }
    if (document.querySelector('#katex-script')) {
       const check = setInterval(() => { if(window.katex) { setKatexReady(true); clearInterval(check); } }, 100);
       return () => clearInterval(check);
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "katex-script";
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
    script.onload = () => setKatexReady(true);
    document.head.appendChild(script);
  }, []);

  const [expr, setExpr] = useState("");
  const [exprResult, setExprResult] = useState(null);
  const [unitSys, setUnitSys] = useState("si");
  const [resultDim, setResultDim] = useState("energy");
  const [varValues, setVarValues] = useState({});
  const [varMultipliers, setVarMultipliers] = useState({});

  const [parsed, setParsed] = useState(null);
  const [convertedExpr, setConvertedExpr] = useState(null);
  const [latexLines, setLatexLines] = useState([]);
  const [selectedLineIdx, setSelectedLineIdx] = useState(-1);
  const [displayLhs, setDisplayLhs] = useState("");

  const getPresetForVar = useCallback((name) => {
    if (!name) return null;
    const norm = name.replace(/\\/g, '').replace(/[{}]/g, '').trim();
    if (norm === 'E_F') return EXPR_PRESETS.find(p => p.label.includes("Fermi Energy"));
    if (norm === 'lambda' || norm === 'lamda') return EXPR_PRESETS.find(p => p.label.includes("de Broglie Wavelength (by p)"));
    if (norm === 'p') return EXPR_PRESETS.find(p => p.label.includes("Momentum p"));
    if (norm === 'N') return EXPR_PRESETS.find(p => p.label.includes("Total Neutron Number"));
    if (norm === 'V') return EXPR_PRESETS.find(p => p.label.includes("Volume of Sphere"));
    if (norm === 'R') return EXPR_PRESETS.find(p => p.label.includes("Neutron Star Radius"));

    if (norm === 'E_n') return EXPR_PRESETS.find(p => p.label.includes("Bohr Energy"));
    if (norm === 'd') return EXPR_PRESETS.find(p => p.label.includes("Avg Particle Distance"));
    if (norm === 'mu') return EXPR_PRESETS.find(p => p.label.includes("Reduced Mass"));
    if (norm === 'E_L') return EXPR_PRESETS.find(p => p.label.includes("Rotational Energy"));
    if (norm === 'I') return EXPR_PRESETS.find(p => p.label.includes("Moment of Inertia"));
    if (norm === 'omega') return EXPR_PRESETS.find(p => p.label.includes("Vibrational Angular Freq"));
    return null;
  }, []);

  const topPreset = useMemo(() => getPresetForVar(displayLhs), [displayLhs, getPresetForVar]);

  const [selectedFormula, setSelectedFormula] = useState(FORMULAS[0].id);
  const [formulaParams, setFormulaParams] = useState(() => {
    const i = {}; FORMULAS.forEach(f => { i[f.id] = {}; f.params.forEach(p => { i[f.id][p.key] = p.default; }); }); return i;
  });
  const [constFilter, setConstFilter] = useState("");
  const inputRef = useRef(null);

  const formula = useMemo(() => FORMULAS.find(f => f.id === selectedFormula), [selectedFormula]);
  const formulaResult = useMemo(() => {
    if (!formula) return null;
    return formula.calc(formulaParams[formula.id] || {});
  }, [formula, formulaParams, selectedFormula]);

  // 1. Top-level Parsing
  useEffect(() => {
    if (!expr.trim()) {
      setParsed(null); setConvertedExpr(null); setLatexLines([]); setSelectedLineIdx(-1); setDisplayLhs("");
      return;
    }
    const latex = isLatex(expr);
    const multi = latex && isMultiLineLatex(expr);

    if (multi) {
      const lines = parseLatexBlock(expr);
      setLatexLines(lines);
      const symbIdx = lines.findIndex(l => /[a-zA-Z\\]/.test(l.rhs));
      const idx = symbIdx >= 0 ? symbIdx : 0;
      setSelectedLineIdx(lines.length > 0 ? idx : -1);
      if (lines.length > 0) {
        const conv = latexToExpr(lines[idx].rhs);
        setConvertedExpr(conv);
        setDisplayLhs(lines[idx].lhs || "");
        const p = parseExprTokens(conv);
        setParsed(p);
        setVarValues(prev => {
          const next = { ...prev };
          p.vars.forEach(v => { if (!(v in next)) next[v] = ""; });
          return next;
        });
      }
    } else {
      setLatexLines([]);
      setSelectedLineIdx(-1);

      let rawStr = expr.trim();
      let extractedLhs = "";
      let extractedRhs = rawStr;

      let depth = 0, topLevelEq = -1;
      for (let i = 0; i < rawStr.length; i++) {
        if (rawStr[i] === '(' || rawStr[i] === '{' || rawStr[i] === '[') depth++;
        else if (rawStr[i] === ')' || rawStr[i] === '}' || rawStr[i] === ']') depth--;
        else if (rawStr[i] === '=' && depth === 0 && rawStr[i-1] !== '<' && rawStr[i-1] !== '>' && rawStr[i-1] !== '!' && rawStr[i+1] !== '=') {
          topLevelEq = i;
          break;
        }
      }
      if (topLevelEq > 0) {
        extractedLhs = rawStr.slice(0, topLevelEq).trim();
        extractedRhs = rawStr.slice(topLevelEq + 1).trim();
      }
      setDisplayLhs(extractedLhs);

      const isRhsLatex = isLatex(extractedRhs);
      const exprToAnalyze = isRhsLatex ? latexToExpr(extractedRhs) : extractedRhs;
      setConvertedExpr(isRhsLatex ? exprToAnalyze : null);
      const p = parseExprTokens(exprToAnalyze);
      setParsed(p);
      setVarValues(prev => {
        const next = { ...prev };
        p.vars.forEach(v => { if (!(v in next)) next[v] = ""; });
        return next;
      });
    }
  }, [expr]);

  // 2. Build Dependency Tree & Evaluate Recursively
  const { displayList, evaluatedVars, finalResult } = useMemo(() => {
    if (!parsed || !parsed.vars) return { displayList: [], evaluatedVars: {}, finalResult: null };

    const list = [];
    const visitedUI = new Set();

    const buildUI = (vName, depth) => {
        if (visitedUI.has(vName)) return;
        visitedUI.add(vName);

        const rawInput = varValues[vName] || "";
        let cleanRaw = rawInput;
        if (cleanRaw.startsWith(vName + '=') || cleanRaw.startsWith(vName + ' =')) {
            cleanRaw = cleanRaw.substring(cleanRaw.indexOf('=')+1).trim();
        }

        const processedRaw = latexToExpr(cleanRaw);
        const tokens = parseExprTokens(processedRaw);

        list.push({
            name: vName,
            depth,
            tokens,
            previewTex: isLatex(cleanRaw) ? cleanRaw : null,
            cleanRaw,
            processedRaw
        });

        tokens.vars.forEach(dep => buildUI(dep, depth + 1));
    };

    parsed.vars.forEach(v => buildUI(v, 0));

    const evaluated = {};
    const evaluating = new Set();

    const evaluateVar = (vName) => {
        if (evaluated[vName] !== undefined) return evaluated[vName];
        if (evaluating.has(vName)) return null;
        evaluating.add(vName);

        const item = list.find(x => x.name === vName);
        if (!item || !item.cleanRaw.trim()) {
            evaluated[vName] = null;
            return null;
        }

        const depValues = {};
        let depsValid = true;
        for (const dep of item.tokens.vars) {
            const dVal = evaluateVar(dep);
            if (dVal === null || isNaN(dVal)) depsValid = false;
            depValues[dep] = dVal;
        }

        let val = null;
        if (depsValid || Object.keys(depValues).length === item.tokens.vars.length) {
            val = evalExpr(item.processedRaw, unitSys, depValues);
            if (val !== null && varMultipliers[vName]) {
                val *= varMultipliers[vName];
            }
        }

        evaluated[vName] = val;
        evaluating.delete(vName);
        return val;
    };

    const mainDepValues = {};
    let isMainValid = true;
    parsed.vars.forEach(v => {
        const val = evaluateVar(v);
        if (val === null || isNaN(val)) isMainValid = false;
        mainDepValues[v] = val;
    });

    let mainRes = null;
    const finalExprTarget = convertedExpr || (displayLhs ? expr.substring(expr.indexOf('=')+1) : expr);
    if (isMainValid && finalExprTarget) {
        mainRes = evalExpr(finalExprTarget, unitSys, mainDepValues);
    }

    return { displayList: list, evaluatedVars: evaluated, finalResult: mainRes };

  }, [parsed, varValues, varMultipliers, unitSys, convertedExpr, expr, displayLhs]);

  useEffect(() => {
    setExprResult(finalResult);
  }, [finalResult]);

  const handleConstInsert = useCallback((insertKey) => {
    setExpr(prev => prev + insertKey);
    inputRef.current?.focus();
  }, []);

  const handleLineSelect = useCallback((idx) => {
    setSelectedLineIdx(idx);
    setExprResult(null);
    if (latexLines[idx]) {
      const conv = latexToExpr(latexLines[idx].rhs);
      setConvertedExpr(conv);
      setDisplayLhs(latexLines[idx].lhs || "");
      const p = parseExprTokens(conv);
      setParsed(p);
      setVarValues(prev => {
        const next = {};
        p.vars.forEach(v => { next[v] = prev[v] || ""; });
        return next;
      });
      setVarMultipliers({});
    }
  }, [latexLines]);

  const exprConversions = useMemo(() => {
    if (exprResult === null || !isFinite(exprResult)) return [];
    const dim = DIMENSIONS[resultDim];
    return dim ? dim.conversions(exprResult, unitSys) : [];
  }, [exprResult, resultDim, unitSys]);

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif", background: "linear-gradient(145deg, #0a0f1a 0%, #0f1a2e 50%, #0a1020 100%)", color: "#c8daf0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(80,120,180,0.3); border-radius: 4px; }
        select { background: rgba(5,12,25,0.9); border: 1px solid rgba(100,140,200,0.3); border-radius: 6px; padding: 8px 12px; color: #e0ecff; font-size: 13px; font-family: 'IBM Plex Sans', sans-serif; outline: none; cursor: pointer; }
        select option { background: #0f1a2e; color: #c8daf0; }
        textarea { font-family: 'IBM Plex Mono', monospace; }
        textarea::placeholder { color: rgba(90,120,160,0.5); }
        .katex-display { margin: 0 !important; }
      `}</style>

      {/* Header */}
      <Header tab={tab} setTab={setTab} />

      <div style={{ padding: "16px 20px", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>

        {/* FORMULAS TAB */}
        {tab === "formulas" && (
          <FormulasTab
            selectedFormula={selectedFormula} setSelectedFormula={setSelectedFormula}
            formula={formula} formulaParams={formulaParams} setFormulaParams={setFormulaParams}
            formulaResult={formulaResult}
          />
        )}

        {/* CONSTANTS TAB */}
        {tab === "constants" && (
          <ConstantsTab constFilter={constFilter} setConstFilter={setConstFilter} unitSys={unitSys} />
        )}

        {/* PARTICLES TAB */}
        {tab === "particles" && <ParticlesTab />}

        {/* EXPRESSION CALCULATOR */}
        {tab === "expr" && (
          <ExpressionTab
            unitSys={unitSys} setUnitSys={setUnitSys}
            resultDim={resultDim} setResultDim={setResultDim}
            expr={expr} setExpr={setExpr}
            parsed={parsed} convertedExpr={convertedExpr}
            latexLines={latexLines} selectedLineIdx={selectedLineIdx} handleLineSelect={handleLineSelect}
            displayLhs={displayLhs} displayList={displayList} evaluatedVars={evaluatedVars}
            exprResult={exprResult} exprConversions={exprConversions}
            varValues={varValues} setVarValues={setVarValues}
            varMultipliers={varMultipliers} setVarMultipliers={setVarMultipliers}
            handleConstInsert={handleConstInsert} inputRef={inputRef} katexReady={katexReady}
            topPreset={topPreset} getPresetForVar={getPresetForVar}
          />
        )}

        {/* CONVERT TAB */}
        {tab === "convert" && <UnitConverter />}
      </div>
    </div>
  );
}
