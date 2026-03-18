// ═══════════════════════════════════════════════════════════════
//  LATEX → EXPRESSION CONVERTER
// ═══════════════════════════════════════════════════════════════

function isLatex(s) {
  return /\\[a-zA-Z]/.test(s) || /\\frac/.test(s) || /\^\{/.test(s) || /_\{/.test(s) || /\\begin/.test(s) || /&\s*=/.test(s);
}

function isMultiLineLatex(s) {
  return /\\begin\{/.test(s) || (s.includes('\\\\') && s.includes('&'));
}

function balanceParens(str) {
  let open = 0, close = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') open++;
    else if (str[i] === ')') {
      if (open > 0) open--;
      else close++;
    }
  }
  return '('.repeat(close) + str + ')'.repeat(open);
}

function parseLatexBlock(tex) {
  let s = tex;
  s = s.replace(/\\begin\{[^}]*\}/g, '');
  s = s.replace(/\\end\{[^}]*\}/g, '');
  const rawLines = s.split(/\\\\/);
  const equations = [];
  let currentLhs = '';
  rawLines.forEach((line, idx) => {
    let l = line.trim();
    if (!l) return;
    const parts = l.split('&').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return;

    let lhs = '', rhs = '';
    if (parts.length >= 2) {
      lhs = parts[0];
      rhs = parts.slice(1).join(' ').replace(/^\s*=\s*/, '').trim();
    } else {
      const single = parts[0];
      const eqMatch = single.match(/^\s*=\s*(.*)/);
      if (eqMatch) {
        rhs = eqMatch[1].trim();
      } else {
        rhs = single;
      }
    }
    if (lhs) currentLhs = lhs;
    if (!rhs) return;

    equations.push({
      raw: (currentLhs ? currentLhs + ' = ' : '') + rhs,
      lhs: currentLhs || '',
      rhs: rhs,
      lineNum: idx + 1,
    });
  });
  return equations;
}

function matchBrace(s, pos) {
  if (s[pos] !== '{') return -1;
  let depth = 1;
  for (let i = pos + 1; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function convertFracs(s) {
  let safety = 1000;
  while (s.includes('\\frac') && safety-- > 0) {
    const idx = s.indexOf('\\frac');
    let i = idx + 5;
    while (i < s.length && s[i] === ' ') i++;
    if (s[i] !== '{') break;
    const numStart = i;
    const numEnd = matchBrace(s, numStart);
    if (numEnd === -1) break;
    let j = numEnd + 1;
    while (j < s.length && s[j] === ' ') j++;
    if (s[j] !== '{') break;
    const denStart = j;
    const denEnd = matchBrace(s, denStart);
    if (denEnd === -1) break;
    const num = s.slice(numStart + 1, numEnd);
    const den = s.slice(denStart + 1, denEnd);
    s = s.slice(0, idx) + '((' + num + ')/(' + den + '))' + s.slice(denEnd + 1);
  }
  return s;
}

function convertSqrts(s) {
  let safety = 1000;
  while (/\\sqrt\[/.test(s) && safety-- > 0) {
    const m = s.match(/\\sqrt\[/);
    if (!m) break;
    const idx = s.indexOf('\\sqrt[');
    const bracketEnd = s.indexOf(']', idx + 6);
    if (bracketEnd === -1) break;
    const n = s.slice(idx + 6, bracketEnd);
    let bi = bracketEnd + 1;
    while (bi < s.length && s[bi] === ' ') bi++;
    if (s[bi] === '{') {
      const braceEnd = matchBrace(s, bi);
      if (braceEnd === -1) break;
      const body = s.slice(bi + 1, braceEnd);
      s = s.slice(0, idx) + '((' + body + ')**(1/(' + n + ')))' + s.slice(braceEnd + 1);
    } else break;
  }
  safety = 1000;
  while (s.includes('\\sqrt{') && safety-- > 0) {
    const idx = s.indexOf('\\sqrt{');
    const braceEnd = matchBrace(s, idx + 5);
    if (braceEnd === -1) break;
    const body = s.slice(idx + 6, braceEnd);
    s = s.slice(0, idx) + 'sqrt(' + body + ')' + s.slice(braceEnd + 1);
  }
  return s;
}

function latexToExpr(tex) {
  let s = tex;

  s = s.replace(/[−–—]/g, '-');

  s = s.replace(/^\$\$?|\$\$?$/g, '').trim();
  s = s.replace(/^\\\[|\\\]$/g, '').trim();
  s = s.replace(/^\\\(|\\\)$/g, '').trim();
  s = s.replace(/\\begin\{[^}]*\}/g, ' ');
  s = s.replace(/\\end\{[^}]*\}/g, ' ');
  s = s.replaceAll('&', ' ');
  s = s.replace(/\\\\/g, ' ');
  s = s.replace(/\{\\(?:rm|bf|it|cal|sf)\s+[^}]*\}/g, ' ');
  s = s.replace(/\\(?:rm|bf|it|cal|sf)\{[^}]*\}/g, ' ');

  s = s.replaceAll('\\times', ' * ');
  s = s.replaceAll('\\cdot', ' * ');

  s = s.replace(/([\d.]+)\s*\*\s*10\s*\^\{([^}]+)\}/g, (_, num, exp) => `${num} * 10**(${exp})`);
  s = s.replace(/([\d.]+)\s*\*\s*10\s*\^(-?\d+)/g, (_, num, exp) => `${num} * 10**(${exp})`);
  s = s.replace(/([\d.]+)\s*\*\s*10\s*\*\*\s*\(([^)]+)\)/g, (_, num, exp) => `${num} * 10**(${exp})`);

  s = s.replace(/(^|[^a-zA-Z_])e\s*\^\{/g, '$1e_n^{');
  s = s.replace(/(^|[^a-zA-Z_])e\s*\^([^{])/g, '$1e_n^$2');

  s = s.replaceAll('\\left(', '(').replaceAll('\\right)', ')');
  s = s.replaceAll('\\left[', '(').replaceAll('\\right]', ')');
  s = s.replaceAll('\\left\\{', '(').replaceAll('\\right\\}', ')');
  s = s.replaceAll('\\left|', 'abs(').replaceAll('\\right|', ')');
  s = s.replaceAll('\\bigl(', '(').replaceAll('\\bigr)', ')');
  s = s.replaceAll('\\Bigl(', '(').replaceAll('\\Bigr)', ')');

  s = s.replaceAll('\\div', ' / ');
  s = s.replaceAll('\\pm', '+');
  s = s.replaceAll('\\mp', '-');
  s = s.replaceAll('\\leq', '<=').replaceAll('\\geq', '>=');
  s = s.replaceAll('\\neq', '!=').replaceAll('\\approx', '==');

  s = s.replace(/\\(?:mathrm|text|textrm|textit|mathit|mathbf|textbf|operatorname)\{([^}]*)\}/g, '$1');

  const latexFuncs = ['ln','log','exp','sin','cos','tan','arcsin','arccos','arctan','sinh','cosh','tanh','sec','csc','cot'];
  for (const fn of latexFuncs) {
    s = s.replaceAll('\\' + fn, fn);
  }
  s = s.replaceAll('arcsin', 'asin').replaceAll('arccos', 'acos').replaceAll('arctan', 'atan');

  const greekMap = [
    ['\\varepsilon_0', 'eps_0'], ['\\epsilon_0', 'eps_0'], ['\\varepsilon_{0}', 'eps_0'], ['\\epsilon_{0}', 'eps_0'],
    ['\\hbar', 'hbar'], ['\\lambdabar', 'hbar'],
    ['\\mu_B', 'mu_B'], ['\\mu_{B}', 'mu_B'], ['\\mu_N', 'mu_N'], ['\\mu_{N}', 'mu_N'],
    ['\\alpha', 'alpha_fs'],
    ['\\sigma', 'sigma_SB'],
    ['\\lambda', 'lambda'],
    ['\\Lambda', 'Lambda'],
    ['\\omega', 'omega'], ['\\Omega', 'Omega'],
    ['\\phi', 'phi'], ['\\Phi', 'Phi'], ['\\varphi', 'phi'],
    ['\\theta', 'theta'], ['\\Theta', 'Theta'],
    ['\\beta', 'beta'], ['\\gamma', 'gamma'], ['\\Gamma', 'Gamma'],
    ['\\delta', 'delta'], ['\\Delta', 'Delta'],
    ['\\epsilon', 'epsilon'], ['\\varepsilon', 'epsilon'],
    ['\\zeta', 'zeta'], ['\\eta', 'eta'],
    ['\\kappa', 'kappa'], ['\\nu', 'nu'], ['\\mu', 'mu'],
    ['\\rho', 'rho'], ['\\tau', 'tau'], ['\\chi', 'chi'], ['\\psi', 'psi'],
    ['\\pi', 'pi'],
    ['\\infty', 'Infinity'],
  ];
  for (const [tex, rep] of greekMap) {
    s = s.replaceAll(tex, rep);
  }

  const physMap = [
    ['k_B', 'k_B'], ['k_{B}', 'k_B'], ['k_{\\mathrm{B}}', 'k_B'], ['k_\\mathrm{B}', 'k_B'],
    ['m_e', 'm_e'], ['m_{e}', 'm_e'], ['m_p', 'm_p'], ['m_{p}', 'm_p'],
    ['m_n', 'm_n'], ['m_{n}', 'm_n'], ['m_d', 'm_d'], ['m_{d}', 'm_d'],
    ['m_{\\alpha}', 'm_alpha'], ['N_A', 'N_A'], ['N_{A}', 'N_A'],
    ['a_0', 'a_0'], ['a_{0}', 'a_0'], ['R_{\\infty}', 'R_inf'], ['R_\\infty', 'R_inf'],
    ['E_1', 'E_1'], ['E_{1}', 'E_1'],
    ['e_n', 'e_n'], ['e_{n}', 'e_n'],
  ];
  for (const [tex, rep] of physMap) {
    s = s.replaceAll(tex, rep);
  }

  s = convertFracs(s);
  s = convertSqrts(s);

  let safety = 1000;
  while (/\^\{/.test(s) && safety-- > 0) {
    const idx = s.indexOf('^{');
    const braceEnd = matchBrace(s, idx + 1);
    if (braceEnd === -1) break;
    const body = s.slice(idx + 2, braceEnd);
    s = s.slice(0, idx) + '**(' + body + ')' + s.slice(braceEnd + 1);
  }
  s = s.replace(/\^([0-9])/g, '**$1');
  s = s.replace(/\^([a-zA-Z])/g, '**$1');

  safety = 1000;
  while (/_\{/.test(s) && safety-- > 0) {
    const idx = s.indexOf('_{');
    const braceEnd = matchBrace(s, idx + 1);
    if (braceEnd === -1) break;
    const body = s.slice(idx + 2, braceEnd);
    s = s.slice(0, idx) + '_' + body + s.slice(braceEnd + 1);
  }

  s = s.replace(/\\[,;!> ]/g, ' ');
  s = s.replace(/\\quad/g, ' ').replace(/\\qquad/g, ' ');
  s = s.replace(/\\(?:displaystyle|textstyle|scriptstyle)/g, '');
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');

  s = s.replace(/\{([^{}]*)\}/g, '($1)');

  s = s.replace(/([0-9)])(\s*)(?![eE][+\-]?\d)([a-zA-Z_ℏπα])/g, '$1 * $3');

  s = s.replace(/([a-zA-Z_][a-zA-Z0-9_]*|[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?|\))(\s*)\(/g, (match, p1, p2) => {
    if (MATH_FUNCS.has(p1)) return match;
    return p1 + ' * (';
  });

  let prevS;
  do { prevS = s; s = s.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z_ℏπα][a-zA-Z0-9_]*)/g, '$1 * $2'); } while (s !== prevS);
  s = s.replace(/\)\s*([0-9])/g, ') * $1');

  for (const fn of ['ln']) {
    s = s.replaceAll(fn + ' * (', fn + '(');
  }

  s = s.replace(/\s+/g, ' ').trim();
  s = balanceParens(s);

  return s;
}

function parseExprTokens(expr) {
  const cleaned = expr.replace(/[\d.]+[eE][+\-]?\d+/g, '');
  const words = cleaned.match(/[a-zA-Z_ℏπα][a-zA-Z0-9_]*/g) || [];
  const unique = [...new Set(words)];
  const consts = [];
  const vars = [];
  unique.forEach(w => {
    if (MATH_FUNCS.has(w) || UNIT_TOKENS.has(w)) return;
    if (w === "pi" || w === "π") return;
    const km = KEYWORD_MAP[w];
    if (km) {
      const data = km.source === "const" ? CONSTANTS[km.constKey] : PARTICLES[km.constKey];
      consts.push({ token: w, ...km, data });
    } else {
      vars.push(w);
    }
  });
  return { consts, vars };
}

function buildReplacements(unitSys) {
  const map = {};
  const s = unitSys;
  for (const [, c] of Object.entries(CONSTANTS)) {
    const v = s === "si" ? c.si : c.ev;
    for (const k of c.keys) map[k] = v;
  }
  for (const [, p] of Object.entries(PARTICLES)) {
    const v = s === "si" ? p.si : p.ev;
    for (const k of p.keys) map[k] = v;
  }
  return map;
}
