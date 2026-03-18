# ⚛️ LatexCalculator
**A specialized physics calculator based on Modern Physics Appendix A constants.**

LatexCalculator is a web-based tool designed to streamline complex physics calculations. It allows users to paste LaTeX expressions directly and evaluate them using built-in physical constants from both SI and eV unit systems.

## 🚀 Live Demo
Check out the tool here: [https://aerobaek99.github.io/LatexCalculator/](https://aerobaek99.github.io/LatexCalculator/)

## ✨ Key Features
- **LaTeX Parsing:** Automatically extracts variables from LaTeX expressions (e.g., `\frac`, `\sqrt`, `\hbar`).
- **Dual Unit Systems:** Supports both **SI units** and **electron-volt (eV)** systems for seamless modern physics calculations.
- **Built-in Constants:** Includes essential constants like the speed of light ($c$), Planck's constant ($h$), elementary charge ($e$), and more.
- **Multi-line Support:** Paste `\begin{align*}` blocks to parse and evaluate equations line by line.
- **Instant Variable Mapping:** Automatically generates input fields for any detected variables in your formula.

## 🛠 Tech Stack
- **React 18**: For a responsive and dynamic user interface.
- **Babel (Standalone)**: To run modern JavaScript directly in the browser.
- **GitHub Pages**: For fast and reliable hosting.

## 📝 Usage Tips
- **Parentheses Matter:** Remember that `a/b*c` is evaluated as `(a/b)*c`. To group the denominator, use `a/(b*c)`.
- **Euler's Number:** Use `e_n` (2.71828...) for exponential functions (e.g., `e_n^(-lambda * t)`).

---
*Created by Philip Baek*
