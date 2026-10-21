# Contributing to Vibe Design Studio 🎨🎬

First off, thank you for considering contributing to Vibe Design Studio!  
Whether you are a motion designer, a React developer, an AI engineer, or a creator who wants to stop the flood of low-effort "AI Slop" on social media, your help is welcome.

---

## 🧭 Core Principles (Our Anti-Slop Manifesto)

Before writing code or opening a PR, keep our 5 core pillars in mind:

1. **Deterministic Code Over Black-Box Pixels:** Everything rendered in this engine is pure React, TypeScript, SVG, or Three.js.
2. **Physical Spring Physics:** No linear transitions. Everything moves with mass, damping, and inertia (`spring()` or `measured_eases.ts`).
3. **Audio is 50% of the Experience:** Sound effects must be timed to physical ease curves (`sound_impact_engine.tsx`), ducked during speech (`AutoDuckingAudio.tsx`), and mastered to EBU R128 (`-14 LUFS`).
4. **Zero Media Bloat:** Do not commit gigabytes of MP4s or heavy binaries to the Git repository. Store code, schemas, and mathematical presets.
5. **Safe Zones are Sacred:** Never place text or essential UI elements where platform overlays (Instagram buttons, TikTok menus) will block them.

---

## 🛠️ Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/vibe-design-studio.git
   cd vibe-design-studio
   pnpm install
   ```

2. **Verify that the test suite passes:**
   ```bash
   npm run test:unit
   npm run check
   ```

3. **Launch the Remotion Studio preview:**
   ```bash
   npm run studio
   ```
   Open `http://localhost:3000` to see real-time updates as you edit React components.

---

## 💡 Ways to Contribute

### 1. Adding a New Remotion Template
* Place your component in `src/templates/<YourTemplateName>.tsx`.
* Register your template specification in `src/templates/catalogo_templates.json`.
* Register the Remotion `<Composition />` inside `src/index.tsx`.
* Ensure your template respects safe zones (`safeZones['4:5']` or `safeZones['9:16']`).
* Run the linter: `node scripts/lint-motion-slop.mjs src/templates/<YourTemplateName>.tsx`.

### 2. Proposing a Visual Reference
* If you see an extraordinary motion design technique on Instagram Reels, TikTok, or Dribbble, open a **[Visual Reference Issue](https://github.com/Gabrielrtads/vibe-design-studio/issues/new?template=visual-reference.yml)**.
* Our automated ingest loop (`scripts/references/absorver_referencia.mjs`) will extract the palette, analyze keyframes, and prepare a prototype.

### 3. Adding Sound Effects
* Sound effects must be placed in `public/audio/`.
* Supported formats: MP3 or WAV (< 2MB each).
* Map your new effect into `src/sound_impact_engine.tsx`.

---

## 🧪 Testing Checklist

Before opening a Pull Request, ensure:

- [ ] `npm run check` (TypeScript compilation) passes with 0 errors.
- [ ] `npm run test:unit` passes with all tests green.
- [ ] No `-webkit-background-clip: text` with animated gradients (use native SVG gradients to prevent Chromium rendering bugs).
- [ ] No hardcoded secrets, API keys, or absolute file paths.
- [ ] Git commit message includes trailer: `--trailer "Agent=<agent-or-username>"`.

---

## 📜 Code of Conduct

Be kind, constructive, and collaborative. We are building the next generation of generative design together!
