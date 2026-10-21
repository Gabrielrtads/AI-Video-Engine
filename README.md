# Vibe Design Studio 🎨🎬

> **The Headless Creative & Motion Design Studio for AI Agents.**  
> Deterministic Code, Anti-Slop Linters, Physical Easing Curves & Dynamic Sound Design for [Claude Code](https://github.com/anthropics/claude-code), [OpenAI Codex](https://github.com/openai/codex), [Google Antigravity](https://github.com/google/antigravity), and [Remotion](https://www.remotion.dev).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Remotion](https://img.shields.io/badge/Remotion-v4.0-blueviolet)](https://www.remotion.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![EBU R128 Mastered](https://img.shields.io/badge/Audio-EBU%20R128%20--14%20LUFS-red)](#-sound-design--audio-mastering-suite)
[![AI Agent Ready](https://img.shields.io/badge/AI%20Agent-Skill%20Ready-green)](#-agent-integration)
[![Zero Media Bloat](https://img.shields.io/badge/Zero%20Media%20Bloat-Pure%20Knowledge%20%26%20Code-orange)](#-zero-media-bloat-philosophy)

---

## 🛑 The Problem: "AI Slop" in Video & Social Media

When creators ask LLMs to generate videos or carousels, models default to amateur, low-effort patterns:

- ❌ Centered uppercase text floating on blank, flat backgrounds.
- ❌ Generic purple/cyan gradients with zero noise, depth, or tactile texture.
- ❌ Stiff linear animations (`opacity: 0 -> 1`) with zero physical inertia or spring physics.
- ❌ Ear-splitting audio foley (sound impacts $> 0.45$ volume drowning the narrator).
- ❌ Stock footage collage that looks like an obvious bot farm.

**Vibe Design Studio replaces naive prompting with a deterministic Headless Code Studio enforced by linters, mathematical physics, and an automated visual audit loop.**

---

## 📊 Market Comparison: Why Vibe Design Studio is Different

| Feature | MoneyPrinter / ShortGPT | Default Remotion | Closed SaaS (Typeframes / Captions) | **Vibe Design Studio** |
|:---|:---|:---|:---|:---|
| **Aesthetic Quality** | 🔴 Low (cropped stock videos) | 🟡 Neutral (depends on prompt) | 🟢 Good (pre-made templates) | **💎 High-End (Apple-Style, Glassmorphism, 3D Tilt)** |
| **Dual Format** | ❌ 9:16 Video only | 🟡 Manual code | ❌ Separate products | **✅ 4:5 Carousels + 9:16 Reels in One Engine** |
| **Reference Ingestion** | ❌ None | ❌ None | ❌ None | **✅ K-Means Palette & Safe Zone Extraction from Link/Print** |
| **Physical Sound Design** | 🔴 Generic background loop | 🟡 Manual audio tags | 🟡 Preset sound effects | **✅ SFX tied to Spring Overshoot Peaks + Auto-Ducking** |
| **Audio Loudness** | 🔴 Inconsistent / Clipped | 🟡 Raw audio | 🟡 Basic compression | **✅ Native EBU R128 (-14 LUFS / -1 dBTP for Reels/TikTok)** |
| **Agent Autonomy** | 🔴 Monolithic Python script | 🟡 Bare framework | 🔴 Closed UI (No CLI/Agents) | **🤖 Native Swarm (Claude, Codex, Gemini via CLI & Mesas)** |
| **Open Source & Extensible** | 🟢 Open source | 🟢 Open source | 🔴 Closed (US$ 30-100/mo) | **🚀 100% Free & Open Source (MIT)** |

---

## 💡 Dual-Engine Capabilities

### 1. 📱 Vertical Motion Videos (9:16 — 1080×1920)
* **Kinetic Typography:** Word-by-word synced highlighting via Whisper (`src/KineticWordCaption.tsx`).
* **3D Camera Rig & Inertia:** Floating isometric cards with simulated lighting (`src/AppleCameraRig.tsx`, `src/AppleKineticCards.tsx`).
* **Physics-Driven Easing:** Calibrated Bézier curves (`snapSettle`, `crashIn`, `popOver`, `bounceHard`, `whip`, `softLand`).

### 2. 📰 Editorial Carousels (4:5 — 1080×1350)
* **Multi-Slide Layout:** Instagram & LinkedIn editorial design (`src/CarrosselEditorial.tsx`).
* **Continuous Marquee Loop:** 0° horizontal conveyor belts for tags and credentials.
* **Native Iridescent SVG:** True gradient typography immune to Chromium multi-thread clipping bugs.
* **Safe Zone Guardrails:** Strict 48px lateral and 80px vertical margins to guarantee zero UI overlap on mobile.

---

## 🔊 Sound Design & Audio Mastering Suite

Great video is 50% audio. Vibe Design Studio treats sound as a first-class citizen:

1. **Physical Impact SFX Engine (`src/sound_impact_engine.tsx`):**
   Calculates the exact frame where a spring animation reaches its velocity peak or overshoot (`t ~ 0.15` to `0.27`) and triggers warm sub-impacts, haptic clicks, digital transitions, or whooshes.
2. **Dynamic Auto-Ducking (`src/AutoDuckingAudio.tsx`):**
   Automatically ducks background music down to **10%** during speech and gently ramps it back up to **35%** during pauses, eliminating distracting music clashing.
3. **EBU R128 Mastering (`scripts/masterizar_audio.mjs`):**
   Applies professional two-pass loudness normalization (`-14 LUFS`, `LRA: 7`, `True-Peak: -1.0 dBTP`) via FFmpeg so your video sounds punchy and broadcast-ready on mobile speakers without distortion.
4. **1-Click Multi-TTS (`scripts/narrar.mjs`):**
   Zero-cost neural text-to-speech with studio-grade Brazilian Portuguese voices (`antonio`, `francisca`, `thalita`) plus automated Whisper word alignment.

---

## 🛠️ Interactive Studio CLI (`studio_engine.mjs`)

Operate the studio interactively or pipe commands from your AI agent:

```bash
node scripts/studio_engine.mjs
```

```
======================================================
           🎨 VIBE DESIGN STUDIO ENGINE 🎬            
  Headless Motion & Creative Studio for AI Agents     
======================================================

[1] Usar Template Pronto   -> CarrosselEditorial (4:5) ou FlowMotionMaster (9:16)
[2] Criar do Zero          -> Tela Limpa com Safe Zones (sem reciclagem de código)
[3] Ver Habilidades        -> Cromia K-Means, Tipografia Cinética, Cinemática 3D
[4] Ingerir Referência     -> Extrair paleta e geometria a partir de Link/Print
```

---

## 🚀 Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/Gabrielrtads/vibe-design-studio.git
cd vibe-design-studio
pnpm install
```

### 2. Generate Narration with 1-Click (Free Neural Voice)

```bash
node scripts/narrar.mjs "O futuro do design não é estático. É código vivo e movimento físico." --voz antonio --transcrever
```

### 3. Render with Mastered Audio (-14 LUFS)

```bash
npm run render:mastered
```

### 4. Run Full Test Suite

```bash
npm run test:unit
```

---

## 🤝 How the Community Can Help

We believe the future of content creation is **open, deterministic code**, not closed SaaS walled gardens. We need your help to make this the gold-standard headless studio for every AI agent on the planet!

Here is how you can contribute:

1. **Submit Viral References:** Found an incredible video on Reels, TikTok, or Dribbble?  
   👉 Open a **[Visual Reference Issue](https://github.com/Gabrielrtads/vibe-design-studio/issues/new?template=visual-reference.yml)** with the URL and keyframes.
2. **Contribute New Templates:**  
   👉 Propose or build a new Remotion composition (e.g., Podcast Clip, SaaS Changelog, Twitter/X thread animated, Pricing Table 3D) via a **[Template Proposal](https://github.com/Gabrielrtads/vibe-design-studio/issues/new?template=template-proposal.yml)**.
3. **Sound Design & Foley Packs:**  
   Help expand our royalty-free core SFX suite (`public/audio/`) with high-fidelity UI sounds and whooshes.
4. **Agent Testing:**  
   Stress-test the studio using Claude Code, Cursor, Codex, or Gemini CLI and report edge cases in our **[Bug Report Form](https://github.com/Gabrielrtads/vibe-design-studio/issues/new?template=bug_report.yml)**.

See our [CONTRIBUTING.md](CONTRIBUTING.md) for full developer guidelines.

---

## 🤖 Agent Integration

Vibe Design Studio includes a native `SKILL.md` compliant with [Claude Code](https://github.com/anthropics/claude-code), [OpenAI Codex](https://github.com/openai/codex), and [Google Antigravity](https://github.com/google/antigravity).

### Install as an Agent Skill:

```bash
git clone https://github.com/Gabrielrtads/vibe-design-studio.git .agents/skills/vibe-design-studio
```

---

## 📁 Repository Structure

```
vibe-design-studio/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── visual-reference.yml       # Community reference submission form
│   │   ├── template-proposal.yml      # New React template proposal
│   │   └── bug_report.yml             # Bug report form
│   └── PULL_REQUEST_TEMPLATE.md       # Quality checklist for PRs
├── public/
│   └── audio/                         # Hot Core SFX suite & narration
├── scripts/
│   ├── studio_engine.mjs              # Canonical CLI & Onboarding flow
│   ├── narrar.mjs                     # 1-Click Neural TTS (Edge-TTS pt-BR)
│   ├── masterizar_audio.mjs           # EBU R128 (-14 LUFS) post-processor
│   ├── transcrever-palavras.mjs       # Whisper millisecond word alignment
│   ├── lint-motion-slop.mjs           # Static Anti-Slop AST/regex linter
│   ├── auto_revisar_frames.mjs        # Automated frame review (score >= 8/10)
│   └── references/
│       └── amostrar_paleta.py         # K-Means palette extractor (-vframes 1)
├── src/
│   ├── FlowMotionMaster.tsx           # Vertical 9:16 kinetic benchmark video
│   ├── CarrosselEditorial.tsx         # Editorial 4:5 carousel composition
│   ├── AutoDuckingAudio.tsx           # Dynamic volume sidechain ducking
│   ├── auto_ducking_math.ts           # Zero-dependency volume calculation math
│   ├── sound_impact_engine.tsx        # Physical impact timing engine
│   ├── AppleCameraRig.tsx             # 3D perspective camera drift
│   ├── AppleKineticCards.tsx          # Floating isometric cards
│   ├── KineticWordCaption.tsx         # Synced word highlighting
│   ├── kit.tsx                        # Safe zones, spring physics & typography
│   ├── styles_kit.tsx                 # Shaders, sheens & glassmorphism
│   ├── measured_eases.ts              # Calibrated easing curves
│   └── index.tsx                      # Remotion root entry
├── tests/
│   ├── unit/                          # Zero-dependency node:test suite (89 PASS)
│   ├── e2e/                           # 4-Tier requirement-driven E2E tests (60 PASS)
│   └── python/                        # Palette extraction unit tests (12 PASS)
├── CONTRIBUTING.md                    # Community guidelines
├── package.json
├── PROJECT_TRUTH.md
├── AGENTS.md
├── SKILL.md
└── LICENSE
```

---

## 📜 License

[MIT](LICENSE) © 2026 [Gabriel Toledo](https://github.com/Gabrielrtads)
