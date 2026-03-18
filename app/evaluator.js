// ═══════════════════════════════════════════════════════════════
//  UTILITIES & EVALUATOR (math.js CAS backend)
// ═══════════════════════════════════════════════════════════════
function fmt(val, sig = 8) {
  if (typeof val !== 'number' || isNaN(val)) return "Error";
  if (!isFinite(val)) return val > 0 ? "Infinity" : "-Infinity";
  if (val === 0) return "0";
  const abs = Math.abs(val);
  if (abs >= 1e-3 && abs < 1e6) return parseFloat(val.toPrecision(sig)).toString();
  return val.toExponential(sig - 1);
}

const supMap = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function toSuperscript(numStr) {
  return String(numStr).split('').map(c => supMap[c] || c).join('');
}

function formatReadableSci(val) {
  if (typeof val !== 'number' || isNaN(val)) return "Error";
  if (!isFinite(val)) return val > 0 ? "Infinity" : "-Infinity";
  if (val === 0) return "0";
  const abs = Math.abs(val);
  if (abs >= 1e-3 && abs < 1e5) return parseFloat(val.toPrecision(5)).toString();
  const exp = Math.floor(Math.log10(abs));
  const mantissa = val / Math.pow(10, exp);
  return `${mantissa.toFixed(2)} × 10${toSuperscript(exp)}`;
}

// ── Floating-point epsilon cleanup ──
// Catches artifacts like sin(pi)≈1.22e-16 → 0,
// cos(pi/3)≈0.4999999999999994 is displayed as 0.5 by fmt()
function cleanFloat(val) {
  if (!isFinite(val) || val === 0) return val;
  // Relative near-integer: catches cos(2π)≈0.9999999999999998 → 1
  const rounded = Math.round(val);
  if (rounded !== 0 && Math.abs(val - rounded) / Math.abs(rounded) < 1e-14) return rounded;
  return val;
}

// ── Expression evaluator using math.js ──
function evalExpr(expr, unitSys, varValues = {}) {
  try {
    let s = expr;

    // Build scope: physics constants + user variables
    const scope = buildReplacements(unitSys);
    // User variable values override constants
    for (const [k, v] of Object.entries(varValues)) {
      if (v !== null && v !== undefined && !isNaN(v)) scope[k] = Number(v);
    }

    // Unit tokens in scope
    scope.eV  = unitSys === "si" ? eVtoJ : 1;
    scope.keV = unitSys === "si" ? 1e3 * eVtoJ : 1e3;
    scope.MeV = unitSys === "si" ? 1e6 * eVtoJ : 1e6;
    scope.GeV = unitSys === "si" ? 1e9 * eVtoJ : 1e9;

    // Syntax conversions for math.js
    s = s.replaceAll('**', '^');
    s = s.replaceAll('×', '*');
    s = s.replaceAll('π', 'pi');
    // math.js uses log() for natural log; our parser outputs ln()
    s = s.replace(/\bln\(/g, 'log(');
    // Remove any accidental Math. prefixes
    s = s.replaceAll('Math.', '');

    s = balanceParens(s);

    // Evaluate using math.js (has built-in pi, e, sin, cos, sqrt, etc.)
    const result = math.evaluate(s, scope);

    // Extract numeric value (math.js may return BigNumber or Matrix)
    let numResult;
    if (typeof result === 'number') {
      numResult = result;
    } else if (result && typeof result.toNumber === 'function') {
      numResult = result.toNumber();
    } else {
      return null;
    }

    if (isNaN(numResult)) return null;
    return cleanFloat(numResult);
  } catch(err) {
    return null;
  }
}
