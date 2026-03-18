// ═══════════════════════════════════════════════════════════════
//  UTILITIES & EVALUATOR (nerdamer CAS + math.js fallback)
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
//  SAFE NUMBER FORMATTING — Convert scientific notation numbers
//  to nerdamer-safe format so that `e` in 1.602e-19 is not
//  confused with Euler's number.
//  Example: 1.602e-19 → (1.602*10^(-19))
// ═══════════════════════════════════════════════════════════════
function safeNumStr(num) {
  if (typeof num !== 'number' || !isFinite(num)) return String(num);
  if (num === 0) return '0';

  var str = num.toPrecision(15);
  // If it contains 'e' notation, convert to (mantissa*10^(exp))
  if (/[eE]/.test(str)) {
    var parts = str.split(/[eE]/);
    var mantissa = parseFloat(parts[0]);
    var exp = parseInt(parts[1], 10);
    return '(' + mantissa + '*10^(' + exp + '))';
  }
  return str;
}

// ═══════════════════════════════════════════════════════════════
//  NERDAMER CAS EVALUATOR — Symbolic evaluation engine
//  Handles sin(pi)=0, cos(pi)=-1, etc. symbolically.
//  Uses nerdamer for symbolic simplification, then extracts
//  the numeric result.
// ═══════════════════════════════════════════════════════════════
function evalWithNerdamer(expr, unitSys, varValues) {
  if (typeof nerdamer === 'undefined') return null;

  try {
    var s = expr;

    // Syntax normalization
    s = s.replaceAll('**', '^');
    s = s.replaceAll('×', '*');
    s = s.replaceAll('π', 'pi');
    s = s.replace(/\bln\(/g, 'log(');
    s = s.replaceAll('Math.', '');

    // Build variable substitution map with safe number formatting
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

    // Handle the e/e_n conflict:
    // In our physics data: e = elementary charge, e_n = Euler's number
    // In nerdamer: e = Euler's number
    // Strategy: rename our physics `e` to `_ec_` before CAS evaluation,
    // and `e_n` maps to nerdamer's built-in `e` (Euler's number).

    // Replace e_n references with nerdamer's built-in e (Euler's number)
    // Must be done BEFORE replacing bare 'e' to avoid double-replacement
    s = s.replace(/\be_n\b/g, 'e');
    // Remove e_n from scope — let nerdamer use its built-in Euler e
    delete scope['e_n'];

    // Rename bare 'e' (elementary charge) to a safe placeholder
    // Use word boundary but exclude e_n (already handled above) and scientific notation
    s = s.replace(/([0-9])[eE]([+-]?\d)/g, '$1_SCI_$2'); // protect sci notation
    s = s.replace(/\be\b(?!_)/g, '_ec_');
    s = s.replace(/_SCI_/g, 'e'); // restore sci notation

    // Move 'e' scope entry to '_ec_'
    if (scope['e'] !== undefined) {
      scope['_ec_'] = scope['e'];
      delete scope['e'];
    }
    // Also handle e_charge key
    if (scope['e_charge'] !== undefined) {
      scope['_ec_'] = scope['e_charge'];
      delete scope['e_charge'];
    }

    // Now replace all known variables in the expression with their safe numeric values.
    // We need to do textual substitution because nerdamer.setVar has issues with
    // very small/large numbers in scientific notation.

    // Sort variable names by length (longest first) to avoid partial replacement
    var varNames = Object.keys(scope).sort(function(a, b) { return b.length - a.length; });

    for (var i = 0; i < varNames.length; i++) {
      var vn = varNames[i];
      var vv = scope[vn];
      if (vv === undefined || vv === null) continue;
      // Skip pi — let nerdamer handle it symbolically
      if (vn === 'pi') continue;

      var safeVal = safeNumStr(vv);
      // Replace variable with its safe numeric value using word boundaries
      var re = new RegExp('\\b' + vn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
      s = s.replace(re, '(' + safeVal + ')');
    }

    // Also replace scientific notation numbers in the expression itself
    s = s.replace(/([0-9]*\.?[0-9]+)[eE]([+-]?[0-9]+)/g, function(match, mantissa, exp) {
      return '(' + mantissa + '*10^(' + exp + '))';
    });

    s = balanceParens(s);

    // Use nerdamer to symbolically evaluate, then extract numeric value
    var result = nerdamer(s).evaluate();
    var numResult = result.valueOf();

    if (typeof numResult === 'string') {
      // nerdamer sometimes returns string for special values
      numResult = parseFloat(numResult);
    }

    if (typeof numResult === 'number' && !isNaN(numResult)) {
      return numResult;
    }

    return null;
  } catch (err) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXPRESSION EVALUATOR — Three-tier evaluation:
//  1. nerdamer CAS (symbolic, handles sin(pi)=0 exactly)
//  2. math.js (numeric, good fallback)
//  3. Function() (legacy fallback)
// ═══════════════════════════════════════════════════════════════
function evalExpr(expr, unitSys, varValues = {}) {
  // ── Tier 1: nerdamer CAS (symbolic) ──
  var casResult = evalWithNerdamer(expr, unitSys, varValues);
  if (casResult !== null) return casResult;

  // ── Tier 2: math.js (numeric) ──
  if (typeof math !== 'undefined') {
    try {
      var s = expr;

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

  // ── Tier 3: Legacy fallback (Function-based) ──
  try {
    var s = expr;
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
