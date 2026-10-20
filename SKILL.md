---
name: ai-video-engine
description: Headless Motion Studio & Anti-Slop Video Generation Engine for AI Agents (Antigravity, Claude Code, Cursor, Codex). Combines Remotion, Spring Physics, Word-by-Word Whisper sync, Static Anti-Slop Linter, and Automated Frame Review (Contact Sheet + Scorecard >= 8/10).
---

# 🎬 AI-Video-Engine: Headless Motion Studio for AI Agents

Transform voice narrations and briefings into agency-tier kinetic motion videos without "AI Slop".

## 🛑 What is "AI Slop" in Video?

When instructed to generate video code (e.g. Remotion), LLMs naturally default to amateur patterns:
1. Centered uppercase text (`UPPERCASE`) with no spatial hierarchy.
2. Generic linear easing (`opacity: 0 -> 1`) with zero physical inertia.
3. Harsh audio foley (sound effects > 0.5 volume drowning the speaker).
4. Generic purple/blue background gradients with zero noise or texture.
5. Blind declarations of "done" without visual inspection.

**AI-Video-Engine kills this through deterministic code constraints and automated visual feedback loops.**

---

## 🏗️ Architecture

```
AI-Video-Engine/
├── scripts/
│   ├── lint-motion-slop.mjs       # Static AST / regex linter blocking slop patterns
│   ├── auto_revisar_frames.mjs    # Keyframe still extraction + Contact Sheet + Scorecard (>= 8/10)
│   ├── produzir_video_bancada.mjs # 1-Click production orchestrator
│   └── transcrever-palavras.mjs   # Millisecond word-level timestamps via Whisper
├── src/
│   ├── FlowMotionMaster.tsx       # Benchmark production composition (Apple-tier motion)
│   ├── AppleCameraRig.tsx         # Organic camera drift & inertia
│   ├── AppleKineticCards.tsx      # 3D perspective floating glass cards
│   ├── KineticWordCaption.tsx     # Word-by-word highlighted captions
│   ├── kit.tsx                    # Shared spring math, measured eases & typography
│   └── index.tsx                  # Remotion root entry
└── public/
    └── audio/                     # Sound design foley & speech tracks
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

### 3. Render Video
```bash
pnpm exec remotion render Video out/video.mp4 --codec=h264 --crf=16
```

### 4. Run Automated Frame Review
```bash
node scripts/auto_revisar_frames.mjs FlowMotionMaster --stills 6
```
Generates:
- `out/contact-sheet.jpg`: Visual grid of keyframe stills.
- `out/review_scorecard.json`: Automated evaluation of contrast, density, and dead frames with target score $\ge 8.0/10$.

---

## 🤖 Swarm / Multi-Agent Role Division

- **Gemini / Infrastructure Agents:** TTS generation, Whisper alignment (`words.json`), headless Chrome rendering, and file delivery.
- **Claude / Creative Agents:** Choreography of `spring()` curves, CSS 3D perspectives, typographic kerning, and visual motion storytelling.
