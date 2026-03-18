# ⚛️ LatexCalculator

**A specialized physics calculator based on Modern Physics Appendix A constants.**

LatexCalculator is a web-based tool designed to streamline complex physics calculations. It allows users to paste LaTeX expressions directly and evaluate them using built-in physical constants from both SI and eV unit systems.

---

## 🚀 Live Demo

Check out the tool here: **[https://calc.gopilot.blog/](https://calc.gopilot.blog/)**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **LaTeX Parsing** | Automatically extracts variables from LaTeX expressions (e.g., `\frac`, `\sqrt`, `\hbar`). |
| **Hierarchical Variable Evaluation** | Supports nested equations. Enter another formula directly into a variable's input field, and the calculator will automatically resolve the entire dependency tree. |
| **Live LaTeX Preview** | Renders your equations in real-time using KaTeX so you can visually verify your input as you type. |
| **Smart Preset Suggestions** | Automatically detects standard physics symbols (e.g., $E_F$, $\lambda$, $p$) and suggests the appropriate formula to auto-fill with a single click. |
| **Dual Unit Systems** | Supports both SI units and electron-volt (eV) systems for seamless modern physics calculations. Mass constants in eV mode are precisely scaled to $\text{eV}/c^2$. |
| **Unit Multipliers** | Easily apply scale prefixes like `n` (nano), `M` (Mega), or `u` (Atomic Mass Unit) via dropdown menus next to variable inputs. |
| **Built-in Constants** | Includes essential constants like the speed of light ($c$), Planck's constant ($h$), elementary charge ($e$), and more. |
| **Multi-line Support** | Paste `\begin{align*}` blocks to parse and evaluate equations line by line. |
| **Instant Variable Mapping** | Automatically generates input fields for any detected variables in your formula. |

---

## 🛠 Tech Stack

- **React 18** — Responsive and dynamic user interface
- **KaTeX** — Fast, math-mode equation rendering in the browser
- **Babel (Standalone)** — Run modern JavaScript directly in the browser
- **GitHub Pages** — Fast and reliable hosting

---

## 📝 Usage Tips

> **Parentheses Matter**
> `a/b*c` is evaluated as `(a/b)*c`. To group the denominator, use `a/(b*c)`.

> **Euler's Number**
> Use `e_n` (2.71828...) for exponential functions (e.g., `e_n^(-lambda * t)`) to differentiate from the elementary charge $e$.

> **Insert Constants**
> Click any constant or particle mass from the tables to instantly insert its symbol at your cursor's position.

---

*Created by Philip Baek*
