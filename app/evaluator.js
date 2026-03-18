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

// ═══════════════════════════════════════════════════════════════
//  EXACT TRIG VALUES — Override math.js trig functions
//  so that sin(nπ)=0, cos(nπ/2)=0, etc. are computed exactly
//  instead of returning floating-point noise like 1.22e-16.
//  This avoids absolute-threshold hacks that would clobber
//  legitimate small SI values (e.g. 1 eV ≈ 1.6e-19 J).
// ═══════════════════════════════════════════════════════════════
(function overrideTrigForExactValues() {
  if (typeof math === 'undefined') return;

  var _sin = math.sin.bind(math);
  var _cos = math.cos.bind(math);
  var _tan = math.tan.bind(math);
  var PI  = Math.PI;
  var EPS = 1e-12; // tolerance for detecting multiples of π/2

  function nearInt(x) {
    var r = Math.round(x);
    return Math.abs(x - r) < EPS ? r : null;
  }

  math.import({
    sin: function exactSin(x) {
      if (typeof x !== 'number') return _sin(x);
      // Check if x ≈ k·π/2 for some integer k
      var k = nearInt(x / (PI / 2));
      if (k !== null) {
        // sin cycles: 0, 1, 0, -1  (for k = 0,1,2,3)
        var m = ((k % 4) + 4) % 4;
        return [0, 1, 0, -1][m];
      }
      // Check if x ≈ k·π/6 for common exact values
      var k6 = nearInt(x / (PI / 6));
      if (k6 !== null) {
        var m6 = ((k6 % 12) + 12) % 12;
        var SQRT3_2 = Math.sqrt(3) / 2;
        var table = [0, 0.5, SQRT3_2, 1, SQRT3_2, 0.5, 0, -0.5, -SQRT3_2, -1, -SQRT3_2, -0.5];
        return table[m6];
      }
      return _sin(x);
    },
    cos: function exactCos(x) {
      if (typeof x !== 'number') return _cos(x);
      var k = nearInt(x / (PI / 2));
      if (k !== null) {
        var m = ((k % 4) + 4) % 4;
        return [1, 0, -1, 0][m];
      }
      var k6 = nearInt(x / (PI / 6));
      if (k6 !== null) {
        var m6 = ((k6 % 12) + 12) % 12;
        var SQRT3_2 = Math.sqrt(3) / 2;
        var table = [1, SQRT3_2, 0.5, 0, -0.5, -SQRT3_2, -1, -SQRT3_2, -0.5, 0, 0.5, SQRT3_2];
        return table[m6];
      }
      return _cos(x);
    },
    tan: function exactTan(x) {
      if (typeof x !== 'number') return _tan(x);
      var k = nearInt(x / (PI / 2));
      if (k !== null) {
        var m = ((k % 4) + 4) % 4;
        if (m === 0 || m === 2) return 0;
        return (m === 1) ? Infinity : -Infinity;
      }
      return _tan(x);
    }
  }, { override: true });
})();

// ═══════════════════════════════════════════════════════════════
//  EXPRESSION EVALUATOR — uses math.js with scope-based
//  constant injection. No absolute-threshold cleanup so that
//  legitimate small SI values (eV, ℏ, etc.) are preserved.
// ═══════════════════════════════════════════════════════════════
function evalExpr(expr, unitSys, varValues = {}) {
  // ── math.js path ──
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

  // ── Legacy fallback (Function-based) if math.js is unavailable ──
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
