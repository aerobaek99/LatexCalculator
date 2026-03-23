// ═══════════════════════════════════════════════════════════════
//  CONSTANTS DATABASE (dual SI / eV unit systems)
// ═══════════════════════════════════════════════════════════════
const CONSTANTS = {
  c:     { name: "Speed of light",      symbol: "c",       si: 2.99792458e8,       siU: "m/s",       ev: 2.99792458e8,       evU: "m/s",       keys: ["c_light","c"] },
  e:     { name: "Elementary charge",    symbol: "e",       si: 1.60217657e-19,     siU: "C",         ev: 1.60217657e-19,     evU: "C",         keys: ["e_charge","e"] },
  e_n:   { name: "Euler's number",       symbol: "e_n",     si: Math.E,             siU: "",          ev: Math.E,             evU: "",          keys: ["e_n"] },
  k:     { name: "Boltzmann constant",   symbol: "k_B",     si: 1.380649e-23,       siU: "J/K",       ev: 8.617332e-5,        evU: "eV/K",      keys: ["k_B","k","k_eV"] },
  h:     { name: "Planck's constant",    symbol: "h",       si: 6.62606957e-34,     siU: "J·s",       ev: 4.13566752e-15,     evU: "eV·s",      keys: ["h_planck","h"] },
  hbar:  { name: "ℏ = h/2π",            symbol: "ℏ",       si: 1.054571726e-34,    siU: "J·s",       ev: 6.58211928e-16,     evU: "eV·s",      keys: ["hbar","ℏ","h_bar"] },
  G:     { name: "Gravitational const",  symbol: "G",       si: 6.67384e-11,        siU: "N·m²/kg²",  ev: 6.67384e-11,        evU: "N·m²/kg²",  keys: ["G"] },
  NA:    { name: "Avogadro's constant",  symbol: "Nₐ",      si: 6.0221413e23,       siU: "mol⁻¹",     ev: 6.0221413e23,       evU: "mol⁻¹",     keys: ["N_A","NA"] },
  R:     { name: "Gas constant",         symbol: "R",       si: 8.314462,           siU: "J/(mol·K)", ev: 8.314462,           evU: "J/(mol·K)", keys: ["R_gas"] },
  sigma: { name: "Stefan-Boltzmann",     symbol: "σ",       si: 5.67037e-8,         siU: "W/(m²·K⁴)", ev: 5.67037e-8,         evU: "W/(m²·K⁴)", keys: ["sigma_SB","sigma"] },
  Rinf:  { name: "Rydberg constant",     symbol: "R∞",      si: 1.097373156854e7,   siU: "m⁻¹",       ev: 1.097373156854e7,   evU: "m⁻¹",       keys: ["R_inf"] },
  E1:    { name: "H ionization energy",  symbol: "|E₁|",    si: 2.17987217e-18,     siU: "J",         ev: 13.6056925,         evU: "eV",        keys: ["E_1"] },
  a0:    { name: "Bohr radius",          symbol: "a₀",      si: 5.291772109e-11,    siU: "m",         ev: 0.0529177,          evU: "nm",        keys: ["a_0","a0"] },
  muB:   { name: "Bohr magneton",        symbol: "μ_B",     si: 9.2740097e-24,      siU: "J/T",       ev: 5.78838181e-5,      evU: "eV/T",      keys: ["mu_B"] },
  muN:   { name: "Nuclear magneton",     symbol: "μ_N",     si: 5.0507835e-27,      siU: "J/T",       ev: 3.15245126e-8,      evU: "eV/T",      keys: ["mu_N"] },
  alpha: { name: "Fine structure const", symbol: "α",       si: 1/137.03599907,     siU: "",          ev: 1/137.03599907,     evU: "",          keys: ["alpha_fs","alpha"] },
  eps0:  { name: "Vacuum permittivity",  symbol: "ε₀",      si: 8.8541878128e-12,   siU: "F/m",       ev: 8.8541878128e-12,   evU: "F/m",       keys: ["eps_0","eps0"] },
  ke:    { name: "Coulomb constant",     symbol: "e²/4πε₀", si: 2.30708e-28,        siU: "J·m",       ev: 1.4399645,          evU: "eV·nm",     keys: ["ke_coulomb"] },
  hc:    { name: "hc",                   symbol: "hc",      si: 1.98645e-25,        siU: "J·m",       ev: 1239.8419,          evU: "eV·nm",     keys: ["hc_const","hc"] },
  hbarc: { name: "ℏc",                   symbol: "ℏc",      si: 3.16153e-26,        siU: "J·m",       ev: 197.326972,         evU: "eV·nm",     keys: ["hbarc_const"] },
};

const PARTICLES = {
  me:     { name: "Electron mass",  symbol: "mₑ",  si: 9.1093829e-31,  siU: "kg",  ev: 5.1099895e5,   evU: "eV/c²", u: 5.485799095e-4, mev: 0.51099893, keys: ["m_e","me"] },
  mp:     { name: "Proton mass",    symbol: "mₚ",  si: 1.67262178e-27, siU: "kg",  ev: 9.38272081e8,  evU: "eV/c²", u: 1.0072764668,   mev: 938.27205,  keys: ["m_p","mp"] },
  mn:     { name: "Neutron mass",   symbol: "mₙ",  si: 1.67492735e-27, siU: "kg",  ev: 9.39565413e8,  evU: "eV/c²", u: 1.0086649160,   mev: 939.56538,  keys: ["m_n","mn"] },
  md:     { name: "Deuteron mass",  symbol: "m_d",  si: 3.3435835e-27,  siU: "kg",  ev: 1.875612928e9, evU: "eV/c²", u: 2.0135532127,   mev: 1875.61286, keys: ["m_d"] },
  malpha: { name: "Alpha mass",     symbol: "mα",   si: 6.6446568e-27,  siU: "kg",  ev: 3.727379378e9, evU: "eV/c²", u: 4.001506179,    mev: 3727.3792,  keys: ["m_alpha"] },
};

const CONVERSIONS = {
  eV_J: { name: "1 eV", value: 1.60217657e-19, unit: "J" },
  u_MeV: { name: "1 u", value: 931.49406, unit: "MeV/c²" },
  u_kg: { name: "1 u", value: 1.66053892e-27, unit: "kg" },
  barn: { name: "1 barn", value: 1e-28, unit: "m²" },
  curie: { name: "1 Ci", value: 3.7e10, unit: "decays/s" },
  ly: { name: "1 light-year", value: 9.46e15, unit: "m" },
  year: { name: "1 year", value: 3.156e7, unit: "s" },
};

const PREFIXES = [
  { name: "atto", abbr: "a", exp: -18 }, { name: "femto", abbr: "f", exp: -15 },
  { name: "pico", abbr: "p", exp: -12 }, { name: "nano", abbr: "n", exp: -9 },
  { name: "micro", abbr: "μ", exp: -6 }, { name: "milli", abbr: "m", exp: -3 },
  { name: "centi", abbr: "c", exp: -2 }, { name: "kilo", abbr: "K", exp: 3 },
  { name: "mega", abbr: "M", exp: 6 },   { name: "giga", abbr: "G", exp: 9 },
  { name: "tera", abbr: "T", exp: 12 },  { name: "peta", abbr: "P", exp: 15 },
];

const MAGNITUDES = [
  { label: "Direct Input (×1)", val: 1 },
  { label: "n (nano, 10⁻⁹)", val: 1e-9 },
  { label: "μ (micro, 10⁻⁶)", val: 1e-6 },
  { label: "m (milli, 10⁻³)", val: 1e-3 },
  { label: "c (centi, 10⁻²)", val: 1e-2 },
  { label: "k (kilo, 10³)", val: 1e3 },
  { label: "M (Mega, 10⁶)", val: 1e6 },
  { label: "G (Giga, 10⁹)", val: 1e9 },
  { label: "u (Atomic Mass Unit)", val: 1.6605390666e-27 }
];

function buildKeywordMap() {
  const map = {};
  for (const [ck, c] of Object.entries(CONSTANTS)) {
    for (const k of c.keys) map[k] = { constKey: ck, source: "const" };
  }
  for (const [pk, p] of Object.entries(PARTICLES)) {
    for (const k of p.keys) map[k] = { constKey: pk, source: "particle" };
  }
  return map;
}
const KEYWORD_MAP = buildKeywordMap();

const MATH_FUNCS = new Set(["sqrt","cbrt","exp","ln","log","abs","pow","sin","cos","tan","asin","acos","atan","floor","ceil","round","max","min"]);
const UNIT_TOKENS = new Set(["eV","keV","MeV","GeV","pi","π"]);

// ═══════════════════════════════════════════════════════════════
//  PRESET FORMULAS
// ═══════════════════════════════════════════════════════════════
const FORMULAS = [
  { id: "kT", name: "kT (Thermal Energy)", desc: "kT = k_B × T",
    params: [{ key: "T", label: "Temperature T", unit: "K", default: 293 }],
    calc: (p) => { const vJ=1.380649e-23*p.T, vE=8.617332e-5*p.T; return { value: vJ, unit: "J", alt: `${vE.toPrecision(6)} eV`, detail: `k_B = 1.380649×10⁻²³ J/K = 8.617332×10⁻⁵ eV/K\nT = ${p.T} K` }; },
  },
  { id: "EF", name: "E_F (Fermi Energy)", desc: "E_F = (ℏ²/2m)(3π²n)^(2/3)",
    params: [{ key: "n", label: "Number density n", unit: "m⁻³", default: 8.49e28, scientific: true },{ key: "m", label: "Effective mass m*", unit: "× mₑ", default: 1 }],
    calc: (p) => { const hb=1.054571726e-34, mf=p.m*9.1093829e-31, EF=(hb*hb/(2*mf))*Math.pow(3*Math.PI*Math.PI*p.n,2/3), Ee=EF/1.60217657e-19; return { value: EF, unit: "J", alt: `${Ee.toPrecision(6)} eV`, detail: `ℏ = ${hb.toExponential(6)} J·s\nm* = ${mf.toExponential(4)} kg\nn = ${p.n.toExponential(4)} m⁻³` }; },
  },
  { id: "deBroglie", name: "λ (de Broglie Wavelength)", desc: "λ = h / √(2mE)",
    params: [{ key: "E", label: "Kinetic energy E", unit: "eV", default: 1 },{ key: "m", label: "Mass", unit: "× mₑ", default: 1 }],
    calc: (p) => { const h=6.62606957e-34, EJ=p.E*1.60217657e-19, mf=p.m*9.1093829e-31, l=h/Math.sqrt(2*mf*EJ); return { value: l, unit: "m", alt: `${(l*1e9).toPrecision(6)} nm`, detail: `h = ${h.toExponential(6)} J·s\nE = ${p.E} eV\nm = ${mf.toExponential(4)} kg` }; },
  },
  { id: "photonE", name: "E = hc/λ (Photon Energy)", desc: "E = hc / λ",
    params: [{ key: "lam", label: "Wavelength λ", unit: "nm", default: 500 }],
    calc: (p) => { const Ee=1239.8419/p.lam; return { value: Ee*1.60217657e-19, unit: "J", alt: `${Ee.toPrecision(6)} eV`, detail: `hc = 1239.8419 eV·nm\nλ = ${p.lam} nm` }; },
  },
  { id: "photonLam", name: "λ = hc/E (Energy→Wavelength)", desc: "λ = hc / E",
    params: [{ key: "E", label: "Energy E", unit: "eV", default: 2.48 }],
    calc: (p) => { const l=1239.8419/p.E; return { value: l*1e-9, unit: "m", alt: `${l.toPrecision(6)} nm`, detail: `hc = 1239.8419 eV·nm\nE = ${p.E} eV` }; },
  },
  { id: "bohrE", name: "E_n (Hydrogen Energy Levels)", desc: "E_n = -13.6 / n² eV",
    params: [{ key: "n", label: "Principal quantum n", unit: "", default: 1 }],
    calc: (p) => { const En=-13.6056925/(p.n*p.n); return { value: En*1.60217657e-19, unit: "J", alt: `${En.toPrecision(8)} eV`, detail: `E₁ = -13.6056925 eV\nn = ${p.n}` }; },
  },
  { id: "stefanBoltz", name: "P (Blackbody Radiation)", desc: "P/A = σT⁴",
    params: [{ key: "T", label: "Temperature T", unit: "K", default: 5778 }],
    calc: (p) => { const P=5.67037e-8*Math.pow(p.T,4); return { value: P, unit: "W/m²", alt: null, detail: `σ = 5.67037×10⁻⁸ W/(m²·K⁴)\nT = ${p.T} K` }; },
  },
  { id: "coulomb", name: "V (Coulomb Potential)", desc: "V = (e²/4πε₀) × Z/r",
    params: [{ key: "Z", label: "Charge Z", unit: "", default: 1 },{ key: "r", label: "Distance r", unit: "nm", default: 0.0529 }],
    calc: (p) => { const V=1.4399645*p.Z/p.r; return { value: V*1.60217657e-19, unit: "J", alt: `${V.toPrecision(6)} eV`, detail: `e²/4πε₀ = 1.4399645 eV·nm\nZ = ${p.Z}\nr = ${p.r} nm` }; },
  },
];

const EXPR_PRESETS = [
  { label: "Thermal Energy kT (eV)", expr: "k_B * T", hint: "T: Temperature (K)" },
  { label: "Photon Energy E = hc/λ", expr: "hc_const / lambda", hint: "lambda: Wavelength (nm, eV mode)" },
  { label: "Rest Mass Energy mc²", expr: "m * c_light**2", hint: "m: Mass (kg)" },
  { label: "Fermi Energy (3D free electron)", expr: "(hbar**2 / (2 * m_e)) * (3 * pi**2 * n)**(2/3)", hint: "n: Number density (m⁻³)" },
  { label: "Coulomb Force F = kq₁q₂/r²", expr: "(1 / (4 * pi * eps_0)) * (q1 * q2 / r**2)", hint: "q1,q2: Charge(C), r: Distance(m)" },
  { label: "Radioactive Decay N(t)", expr: "N_0 * e_n**(-lambda_decay * t)", hint: "N_0: Initial, lambda_decay: decay constant(s⁻¹), t: time(s)" },
  { label: "de Broglie Wavelength", expr: "h_planck / sqrt(2 * m_e * E)", hint: "E: Energy (SI: J, eV: multiply by eV)" },
  { label: "Blackbody Radiation Power Density σT⁴", expr: "sigma_SB * T**4", hint: "T: Temperature (K)" },
  { label: "Bohr Model E_n", expr: "-E_1 / n**2", hint: "n: Principal quantum number" },
  { label: "── LaTeX Format ──", expr: "", hint: "" },
  { label: "[LaTeX] Fermi Energy", expr: "\\frac{\\hbar^{2}}{2 m_{e}} (3\\pi^{2} n)^{2/3}", hint: "n: Number density" },
  { label: "[LaTeX] Photon Energy hc/λ", expr: "\\frac{hc}{\\lambda}", hint: "λ: Wavelength" },
  { label: "[LaTeX] Coulomb Potential", expr: "\\frac{e^{2}}{4\\pi\\varepsilon_{0}} \\frac{Z}{r}", hint: "Z: Charge, r: Distance" },
  { label: "[LaTeX] Thermal Energy kT/2", expr: "\\frac{k_{B} T}{2}", hint: "T: Temperature" },
  { label: "[LaTeX] Radioactive Decay", expr: "N_0 e_n^{-\\lambda t}", hint: "N_0, λ, t" },
  { label: "[LaTeX] Bohr Energy", expr: "-\\frac{E_{1}}{n^{2}}", hint: "n: Principal quantum number" },
  { label: "[LaTeX] de Broglie Wavelength (by E)", expr: "\\frac{h}{\\sqrt{2 m_{e} E}}", hint: "E: Energy" },
  { label: "[LaTeX] de Broglie Wavelength (by p)", expr: "\\frac{h}{p}", hint: "p: Momentum" },
  { label: "[LaTeX] Number Density ρN_A/M", expr: "\\frac{\\rho N_{A}}{M}", hint: "ρ: Density(kg/m³), M: Molar mass(kg/mol)" },
  { label: "[LaTeX] Avg Particle Distance d", expr: "n^{-1/3}", hint: "n: Number density" },
  { label: "[LaTeX] Reduced Mass \\mu", expr: "\\frac{m_1 m_2}{m_1 + m_2}", hint: "m_1, m_2: Particle masses" },
  { label: "[LaTeX] Rotational Energy E_L", expr: "\\frac{\\hbar^2}{2I}L(L+1)", hint: "I: Moment of inertia, L: Quantum number" },
  { label: "[LaTeX] Moment of Inertia I", expr: "\\mu R^2", hint: "\\mu: Reduced mass, R: Distance" },
  { label: "[LaTeX] Vibrational Angular Freq \\omega", expr: "\\sqrt{\\frac{k}{\\mu}}", hint: "k: Spring constant, \\mu: Reduced mass" },
  { label: "[LaTeX] Boltzmann Dist Ratio N_2/N_1", expr: "\\frac{d_2}{d_1} e_n^{-(E_2-E_1)/(k_B T)}", hint: "d_1,d_2: Degeneracy, E: Energy, T: Temperature" },
  { label: "[LaTeX] Avg Fermi Energy E_{av}", expr: "\\frac{3}{5}E_F", hint: "E_F: Fermi energy" },
  { label: "[LaTeX] Momentum p", expr: "\\sqrt{2m_n \\times E_F}", hint: "m_n: Neutron mass, E_F: Fermi energy" },
  { label: "[LaTeX] Total Neutron Number N", expr: "\\frac{3.978 \\times 10^{30}}{1.675 \\times 10^{-27}}", hint: "M_n / m_n" },
  { label: "[LaTeX] Volume of Sphere V", expr: "\\frac{4}{3}\\pi R^3", hint: "R: Radius" },
  { label: "[LaTeX] Neutron Star Radius R", expr: "\\frac{h^2}{G N^{1/3} m_n^3} (\\frac{9}{32\\pi^2})^{2/3}", hint: "N: Number of neutrons, m_n: Neutron mass" },
  { label: "[LaTeX] Neutron Fermi Energy", expr: "\\frac{h^2}{2m_n}(\\frac{3N}{8\\pi V})^{2/3}", hint: "m_n: Neutron mass, N: Number of neutrons, V: Volume" },
  { label: "[LaTeX] E_F (with &)", expr: "E_F & = \\frac{h^{2}}{2m}(\\frac{3N}{8\\pi V})^{2/3}", hint: "m,N,V" },
];

const eVtoJ = 1.60217657e-19;

const DIMENSIONS = {
  none:   { label: "Dimensionless", mainUnit: null, conversions: (v) => [{ label: "Value", val: v }] },
  energy: { label: "Energy", mainUnit: (sys) => sys === "si" ? "J" : "eV", conversions: (v, sys) => {
    const inJ  = sys === "si" ? v : v * eVtoJ;
    const inEv = sys === "si" ? v / eVtoJ : v;
    return [
      { label: "eV", val: inEv }, { label: "meV", val: inEv*1e3 }, { label: "keV", val: inEv*1e-3 },
      { label: "MeV", val: inEv*1e-6 }, { label: "GeV", val: inEv*1e-9 }, { label: "J", val: inJ },
      { label: "cm⁻¹", val: inEv/(1239.8419e-7) }, { label: "K (E/k_B)", val: inEv/8.617332e-5 },
      { label: "Hz (E/h)", val: inEv/4.13566752e-15 }, { label: "kJ/mol", val: inJ*6.0221413e23/1000 },
    ];
  }},
  length: { label: "Length", mainUnit: () => "m", conversions: (v, sys) => {
    const inM = sys === "si" ? v : v * 1e-9;
    return [
      { label: "m", val: inM }, { label: "nm", val: inM*1e9 }, { label: "Å", val: inM*1e10 },
      { label: "pm", val: inM*1e12 }, { label: "fm", val: inM*1e15 }, { label: "μm", val: inM*1e6 },
      { label: "mm", val: inM*1e3 }, { label: "cm", val: inM*1e2 }, { label: "a₀", val: inM/5.291772109e-11 },
    ];
  }},
  mass: { label: "Mass", mainUnit: () => "kg", conversions: (v, sys) => {
    const inKg = sys === "si" ? v : v*1e6*eVtoJ/(2.99792458e8**2);
    return [
      { label: "kg", val: inKg }, { label: "g", val: inKg*1e3 }, { label: "u", val: inKg/1.66053892e-27 },
      { label: "MeV/c²", val: (inKg/1.66053892e-27)*931.49406 }, { label: "mₑ", val: inKg/9.1093829e-31 },
    ];
  }},
  time: { label: "Time", mainUnit: () => "s", conversions: (v) => [
    { label: "s", val: v }, { label: "ms", val: v*1e3 }, { label: "μs", val: v*1e6 },
    { label: "ns", val: v*1e9 }, { label: "ps", val: v*1e12 }, { label: "fs", val: v*1e15 },
  ]},
  temperature: { label: "Temperature", mainUnit: () => "K", conversions: (v) => [
    { label: "K", val: v }, { label: "°C", val: v-273.15 },
    { label: "°F", val: (v-273.15)*9/5+32 },
    { label: "kT (eV)", val: 8.617332e-5*v }, { label: "kT (J)", val: 1.380649e-23*v },
  ]},
  frequency: { label: "Frequency", mainUnit: () => "Hz", conversions: (v) => [
    { label: "Hz", val: v }, { label: "kHz", val: v*1e-3 }, { label: "MHz", val: v*1e-6 },
    { label: "GHz", val: v*1e-9 }, { label: "THz", val: v*1e-12 }, { label: "E (eV)", val: v*4.13566752e-15 },
  ]},
};

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
const cardBg = "rgba(15,25,45,0.5)";
const cardBorder = "1px solid rgba(60,90,140,0.2)";
const inputStyle = {
  background: "rgba(5,12,25,0.9)", border: "1px solid rgba(100,140,200,0.3)",
  borderRadius: 4, padding: "6px 8px", color: "#e0ecff", fontSize: 13,
  fontFamily: "'IBM Plex Mono', monospace", outline: "none",
};
const monoFont = "'IBM Plex Mono', monospace";
