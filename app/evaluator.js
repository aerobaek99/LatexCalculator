// ═══════════════════════════════════════════════════════════════
//  UTILITIES & EVALUATOR
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

function evalExpr(expr, unitSys, varValues = {}) {
  try {
    let s = expr;
    const reps = buildReplacements(unitSys);
    const allReps = { ...reps, ...varValues };

    s = s.replace(/([0-9]*\.?[0-9]+[eE][+-]?[0-9]+)|([a-zA-Z_ℏπα][a-zA-Z0-9_]*)/g, (match, isNum, isVar) => {
      if (isNum) return match;
      if (isVar && allReps.hasOwnProperty(isVar)) {
        return `(${allReps[isVar]})`;
      }
      return match;
    });

    s = s.replace(/\bMeV\b/g, `(${unitSys === "si" ? 1e6*eVtoJ : 1e6})`);
    s = s.replace(/\bkeV\b/g, `(${unitSys === "si" ? 1e3*eVtoJ : 1e3})`);
    s = s.replace(/\bGeV\b/g, `(${unitSys === "si" ? 1e9*eVtoJ : 1e9})`);
    s = s.replace(/\beV\b/g,  `(${unitSys === "si" ? eVtoJ : 1})`);

    s = s.replaceAll('π', `(${Math.PI})`);
    s = s.replace(/\bpi\b/g, `(${Math.PI})`);
    s = s.replaceAll('^', '**');

    s = s.replace(/\*\*\s*-\s*([a-zA-Z0-9_.]+)/g, '**(-$1)');
    s = s.replace(/\*\*\s*\+\s*([a-zA-Z0-9_.]+)/g, '**($1)');

    s = s.replaceAll('×', '*');

    for (const fn of ['sqrt','cbrt','exp','log','abs','pow','sin','cos','tan','asin','acos','atan','floor','ceil','round','max','min']) {
      s = s.replace(new RegExp(`\\b${fn}\\(`, 'g'), 'Math.' + fn + '(');
    }
    s = s.replace(/\bln\(/g, 'Math.log(');

    s = s.replaceAll('Math.Math.', 'Math.');
    s = balanceParens(s);

    const result = Function('"use strict"; return (' + s + ')')();

    if (typeof result === 'number' && !isNaN(result)) return result;
    return null;
  } catch(err) {
    return null;
  }
}
