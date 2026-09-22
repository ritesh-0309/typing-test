# TypeRush Studio ⌨️

A minimalist, ultra-smooth speed typing master web application inspired by Monkeytype, built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**, preconfigured for seamless deployment on **Catalyst Slate**.

---

## ✨ Features

- **Fluid Caret Mechanics**: Physics-based smooth sliding caret with exact letter-level alignment and natural line-shift scrolling.
- **Multiple Test Modes**:
  - **Time**: 15s, 30s, 60s
  - **Words**: 10, 25, 50, 100
  - **Quote**: Curated wisdom quotes
- **Live Typing Modifiers**: Toggle punctuation (`@`) and numbers (`#`).
- **Web Audio Mechanical Synthesizer**: Sub-millisecond mechanical switch sounds (Thock, Clicky, Beep, or Mute) using native Web Audio API — zero external audio assets.
- **Real-Time HUD**: High-refresh live speedometer (WPM), accuracy meter, error tracker, and progress track.
- **Detailed Scorecard**: Net WPM, Raw WPM, Accuracy, Consistency, character counts, and interactive SVG performance curves.
- **Curated Theme Presets**: Slate Dark, Serika Dark, Cyberpunk, Matrix, and Dracula.
- **Keyboard Shortcuts**: <kbd>Tab</kbd> to quick restart, <kbd>Esc</kbd> to reset.

---

## ⚡ Deployment on Catalyst Slate

This project is pre-configured for **Zoho Catalyst Slate** frontend hosting:

- `catalyst.json`: Root Slate service definition.
- `.catalyst/slate-config.toml`: Preset with `framework = "nextjs"`.

To deploy via Catalyst CLI:
```bash
catalyst deploy slate
```
Or connect this GitHub repository directly in the [Catalyst Console](https://catalyst.zoho.com) for automatic Git CI/CD deployments.

---

## 🛠️ Local Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```
