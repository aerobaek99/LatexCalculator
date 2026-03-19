// ═══════════════════════════════════════════════════════════════
//  UTILITIES & EVALUATOR (nerdamer CAS symbolic + math.js numeric)
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

// ═══════════════════════════════════════════════════════════════
//  NERDAMER CAS — Symbolic simplification layer
//  Simplifies trig expressions symbolically (sin(pi)→0, etc.)
//  then returns a simplified expression string for math.js to
//  evaluate numerically. This avoids nerdamer's precision issues
//  with very small/large floating-point numbers.
// ═══════════════════════════════════════════════════════════════
function casSimplify(expr) {
  if (typeof nerdamer === 'undefined') return expr;

  try {
    var s = expr;

    // Normalize syntax for nerdamer
    s = s.replaceAll('**', '^');
    s = s.replaceAll('×', '*');
    s = s.replaceAll('π', 'pi');
    s = s.replace(/\bln\(/g, 'log(');
    s = s.replaceAll('Math.', '');

    // Protect 'e' (elementary charge) from nerdamer's built-in Euler e:
    // 1. Protect scientific notation e (1.602e-19)
    s = s.replace(/([0-9])[eE]([+-]?\d)/g, '$1_SCI_$2');
    // 2. e_n → _EULER_ placeholder
    s = s.replace(/\be_n\b/g, '_EULER_');
    // 3. bare e → _EC_ (so nerdamer doesn't treat it as Euler)
    s = s.replace(/\be\b(?!_)/g, '_EC_');
    // 4. _EULER_ → _EULR_ (keep as variable, don't use nerdamer's e)
    s = s.replace(/_EULER_/g, '_EULR_');
    // 5. Restore scientific notation
    s = s.replace(/_SCI_/g, 'e');

    // Also protect other known physics variables from nerdamer interpretation
    // by keeping them as-is (nerdamer treats unknown names as symbolic variables)

    s = balanceParens(s);

    // Nerdamer simplifies symbolically: sin(pi)→0, cos(pi)→-1, etc.
    // Variables like _EC_, eps_0, etc. remain symbolic.
    var simplified = nerdamer(s).text();

    // Convert nerdamer output back to math.js compatible format:
    // nerdamer outputs: x^(-1) → needs to stay as is (math.js handles it)
    // Restore our variable names
    simplified = simplified.replace(/_EC_/g, 'e');
    simplified = simplified.replace(/_EULR_/g, 'e_n');

    return simplified;
  } catch (err) {
    return expr;
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXPRESSION EVALUATOR — Hybrid CAS + numeric approach:
//  1. nerdamer CAS simplifies symbolically (sin(pi)→0)
//  2. math.js evaluates numerically (handles small numbers)
//  3. Function() as legacy fallback
// ═══════════════════════════════════════════════════════════════
function evalExpr(expr, unitSys, varValues = {}) {
  // ── Step 1: Symbolic simplification with nerdamer CAS ──
  var simplified = casSimplify(expr);

  // ── Step 2: Numeric evaluation with math.js ──
  if (typeof math !== 'undefined') {
    try {
      var s = simplified;

      // Build scope: physics constants + user variables
      var scope = buildReplacements(unitSys);
      for (var k in varValues) {
        var v = varValues[k];
        if (v !== null && v !== undefined && !isNaN(v)) scope[k] = Number(v);
      }

      // Unit tokens
      scope.eV  = unitSys === "si" ? eVtoJ : 1;
      scope.keV = unitSys === "si" ? 1e3 * eVtoJ : 1e3;
      scope.MeV = unitSys === "si" ? 1e6 * eVtoJ : 1e6;
      scope.GeV = unitSys === "si" ? 1e9 * eVtoJ : 1e9;

      // Syntax conversions for math.js
      s = s.replaceAll('**', '^');
      s = s.replaceAll('×', '*');
      s = s.replaceAll('π', 'pi');
      s = s.replace(/\bln\(/g, 'log(');
      s = s.replaceAll('Math.', '');

      s = balanceParens(s);

      var result = math.evaluate(s, scope);

      var numResult;
      if (typeof result === 'number') {
        numResult = result;
      } else if (result && typeof result.toNumber === 'function') {
        numResult = result.toNumber();
      } else {
        return null;
      }

      if (isNaN(numResult)) return null;
      return numResult;
    } catch (err) {
      // fall through to legacy evaluator
    }
  }

  // ── Step 3: Legacy fallback (Function-based) ──
  try {
    var s = simplified;
    var reps = buildReplacements(unitSys);
    var allReps = Object.assign({}, reps, varValues);

    s = s.replace(/([0-9]*\.?[0-9]+[eE][+-]?[0-9]+)|([a-zA-Z_\u210F\u03C0\u03B1][a-zA-Z0-9_]*)/g, function(match, isNum, isVar) {
      if (isNum) return match;
      if (isVar && allReps.hasOwnProperty(isVar)) return '(' + allReps[isVar] + ')';
      return match;
    });

    s = s.replace(/\bMeV\b/g, '(' + (unitSys === "si" ? 1e6*eVtoJ : 1e6) + ')');
    s = s.replace(/\bkeV\b/g, '(' + (unitSys === "si" ? 1e3*eVtoJ : 1e3) + ')');
    s = s.replace(/\bGeV\b/g, '(' + (unitSys === "si" ? 1e9*eVtoJ : 1e9) + ')');
    s = s.replace(/\beV\b/g,  '(' + (unitSys === "si" ? eVtoJ : 1) + ')');

    s = s.replaceAll('\u03C0', '(' + Math.PI + ')');
    s = s.replace(/\bpi\b/g, '(' + Math.PI + ')');
    s = s.replaceAll('^', '**');
    s = s.replace(/\*\*\s*-\s*([a-zA-Z0-9_.]+)/g, '**(-$1)');
    s = s.replace(/\*\*\s*\+\s*([a-zA-Z0-9_.]+)/g, '**($1)');
    s = s.replaceAll('\u00D7', '*');

    var fns = ['sqrt','cbrt','exp','log','abs','pow','sin','cos','tan','asin','acos','atan','floor','ceil','round','max','min'];
    for (var i = 0; i < fns.length; i++) {
      s = s.replace(new RegExp('\\b' + fns[i] + '\\(', 'g'), 'Math.' + fns[i] + '(');
    }
    s = s.replace(/\bln\(/g, 'Math.log(');
    s = s.replaceAll('Math.Math.', 'Math.');
    s = balanceParens(s);

    var result = Function('"use strict"; return (' + s + ')')();
    if (typeof result === 'number' && !isNaN(result)) return result;
    return null;
  } catch (err) {
    return null;
  }
}
