---
name: vibe-design-studio
description: Headless Motion Studio & Self-Evolving Video Knowledge Engine for AI Agents (Antigravity, Claude Code, Cursor, Codex). Combines Remotion, Spring Physics, Word-by-Word Whisper sync, Static Anti-Slop Linter, Automated Frame Review (Contact Sheet + Scorecard >= 8/10), and a Reference Absorption Learning Loop.
---

# 🎨🎬 Vibe Design Studio: Headless Motion & Creative Studio for AI Agents

Transform voice narrations and briefings into agency-tier kinetic motion videos without "AI Slop".

## 🛑 What is "AI Slop" in Video?

When instructed to generate video code (e.g. Remotion), LLMs naturally default to amateur patterns:
1. Centered uppercase text (`UPPERCASE`) with no spatial hierarchy.
2. Generic linear easing (`opacity: 0 -> 1`) with zero physical inertia.
3. Harsh audio foley (sound effects > 0.45 volume drowning the speaker).
4. Generic purple/blue background gradients with zero noise or texture.
5. Blind declarations of "done" without visual inspection.

**Vibe Design Studio kills this through deterministic code constraints, automated visual feedback loops, and continuous reference learning.**

---

## 🪜 Architectural Philosophy: Floor, Not a Ceiling

Vibe Design Studio is designed as a **guaranteed floor**, never an artistic ceiling:
- **For Economical Models (Gemini Flash, Haiku):** Guarantees pre-validated templates, safe zones (4:5 and 9:16), two-pass loudness mastering (-14 LUFS), and anti-slop checks so the output never looks amateur.
- **For Creative Powerhouses (Claude Opus 5.5 MAX / Sonnet):** Acts as an unconstrained launchpad. Creative models are encouraged to bypass basic templates using route **`[2] Criar do Zero`**, orchestrating bespoke 3D perspectives, `@react-three/fiber` scenes, GLSL shaders, and nuanced motion typography.

---

## 🏗️ Architecture

```
Vibe Design Studio/
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── visual-reference.yml       # Community reference submission form
├── schemas/
│   └── reference-manifest.schema.json # JSON schema for references
├── references/
│   ├── inbox/                         # Pending submissions
│   ├── accepted/                      # Approved reference manifests
│   └── evidence/                      # Keyframe stills & contact sheets
├── scripts/
│   ├── references/
│   │   ├── absorver_referencia.mjs    # Reference intake & scaffolding
│   │   └── promover_aprendizado.mjs   # Promotion gate (Score >= 8.0, Conf >= 85%)
│   ├── lint-motion-slop.mjs           # Static AST / regex linter blocking slop patterns
│   ├── auto_revisar_frames.mjs        # Keyframe still extraction + Contact Sheet + Scorecard (>= 8/10)
│   ├── produzir_video_bancada.mjs     # 1-Click production orchestrator
│   └── transcrever-palavras.mjs       # Millisecond word-level timestamps via Whisper
├── src/
│   ├── FlowMotionMaster.tsx           # Benchmark production composition (Apple-tier motion)
│   ├── AppleCameraRig.tsx             # Organic camera drift & inertia
│   ├── AppleKineticCards.tsx          # 3D perspective floating glass cards
│   ├── KineticWordCaption.tsx         # Word-by-word highlighted captions
│   ├── kit.tsx                        # Shared spring math, measured eases & typography
│   └── index.tsx                      # Remotion root entry
```

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Audit Code against AI Slop
```bash
node scripts/lint-motion-slop.mjs src/FlowMotionMaster.tsx
```

### 3. Run Automated Frame Review
```bash
node scripts/auto_revisar_frames.mjs FlowMotionMaster --stills 6
```
Generates:
- `out/contact-sheet.jpg`: Visual grid of keyframe stills.
- `out/review_scorecard.json`: Automated evaluation of contrast, density, and dead frames with target score $\ge 8.0/10$.

### 4. Absorb a New Reference (Learning Loop)
```bash
node scripts/references/absorver_referencia.mjs --url "https://instagram.com/reel/..." --title "3D Card Tilt" --author "@creator"
```

---

## 🌐 Headless API & OpenRouter Feeding

The studio is 100% headless and can be driven by any external API (OpenRouter, OpenAI, Anthropic):
- **Dynamic Props:** Pass JSON props directly to Remotion via `--props='{"title":"...", "cards":[...]}'`.
- **Automated Voice + Sync:** Trigger `node scripts/narrar.mjs "<script>" --transcrever` followed by `npm run render:mastered`.

---

## 🤖 Swarm / Multi-Agent Role Division

- **Gemini / Infrastructure Agents:** TTS generation (`scripts/narrar.mjs`), Whisper millisecond alignment (`words.json`), Chromium headless rendering, and audio mastering (-14 LUFS EBU R128).
- **Claude / Creative Agents (Diretor de Arte - Opus 5.5 MAX):** Choreography of `spring()` curves, CSS 3D perspectives, typographic kerning, Three.js shaders, and visual storytelling under **"Criar do Zero"** without template constraints.
- **Codex / Robustness Agents:** Pure mathematical logic (`auto_ducking_math.ts`), Bézier curves, boundary input sanitization, and adversarial stress test suites.
