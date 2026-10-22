# 🎬 Creative Prompting & High-End Motion Guide

> **How to eliminate "AI Slop", orchestrate high-retention social media content, and produce agency-grade motion design at scale using cost-effective models (Gemini Flash, Haiku, GPT-4o-mini).**

---

## 🧭 Why Prompting Matters: A Force Multiplier, Not a Miracle Worker

**Vibe Design Studio** guarantees an unshakeable **technical floor**:
- Safe zones (4:5 and 9:16) enforced automatically.
- Broadcast loudness mastered to EBU R128 (`-14 LUFS` / `-1 dBTP`).
- Dynamic Auto-Ducking (music gently drops to 10% during speech).
- Millisecond word-by-word Whisper synchronization (`words.json`).
- Physical spring easing and camera inertia.

However, **the engine cannot invent your narrative soul, emotional tension, or core value proposition**. 
If you feed a hollow prompt like *"make a cool video about technology"*, you will receive a technically flawless video that says nothing memorable.

### 💰 The Scaling Secret: 10x Quality at 1/10th the Token Cost
When you combine **rich, intentional briefings** with Vibe Design Studio's deterministic code floor, **fast and economical models (such as Gemini Flash or Claude Haiku)** produce output matching frontier creative models (like Claude Opus). 
The studio absorbs the heavy engineering, leaving budget-friendly models to focus purely on executing the creative brief.

---

## 🎯 1. The 3-Second Rule: Engineering High-Retention Hooks

On TikTok, Instagram Reels, and YouTube Shorts, **80% of viewers drop off in the first 3 seconds** if the hook is generic or self-absorbed.

### ❌ The "AI Slop" Anti-Patterns (Blocked by Linter)
Never start a script or prompt with these low-effort clichés:
- ❌ *"Hello everyone, in today's video we will talk about..."* (Immediate swipe away)
- ❌ *"In today's fast-paced digital world..."* (Robotic corporate jargon)
- ❌ *"Unlock the secret to 10x your business..."* (Spammy, generic marketing)
- ❌ *"Did you know that technology is changing rapidly?"* (Vague question with zero stakes)

### ✅ The 3 Proven High-Retention Hook Architectures

| Archetype | Psychology / Mechanism | Example Hook (First 3 Seconds) |
|:---|:---|:---|
| **1. Urgent Pain / Pattern Interrupt** | Identifies an invisible loss or painful habit the viewer has right now. | *"You are losing 4 hours every single week by doing [X] the manual way."* |
| **2. Counter-Intuitive Mystery** | Challenges an industry consensus with a surprising, contrarian truth. | *"Why top motion designers completely stopped using After Effects for social reels."* |
| **3. Direct Proof / Concrete Case** | Leads with a hard, verified metric and an undeniable transformation. | *"How this small barbershop automated 85% of bookings with zero human receptionists."* |

---

## 💎 2. High-End Visual Heuristics (Apple-Style Design Rules)

Vibe Design Studio includes pre-built components designed after Apple VisionOS and high-end agency portfolios (`src/kit.tsx`, `src/styles_kit.tsx`, `src/AppleKineticCards.tsx`).

When designing or instructing agents, enforce these visual principles:

### 1. Spatial Breathing Room (Safe Zones)
- **Instagram 4:5:** Minimum **48px lateral margins** and **80px top/bottom margins**. Never place critical text near the edge.
- **Reels/TikTok 9:16:** Respect the **Top 20%** (search bar/header) and **Bottom 25%** (caption, sound, like button) safe zones.

### 2. Depth & Lighting over Flat Colors
- ❌ **Avoid:** Flat solid backgrounds (`#000000`) or harsh, untextured purple/cyan gradients.
- ✅ **Use:** Deep graphite bases (`#0a0a0d`, `#111116`), subtle ambient radial glow (`radial-gradient`), noise textures, and frosted glass cards (`backdrop-blur(20px)`, border `rgba(255, 255, 255, 0.08)`).

### 3. Physical Spring Kinematics (No Linear Motion)
- ❌ **Avoid:** Linear easing (`animation: linear`, `opacity: 0 -> 1` without momentum).
- ✅ **Use:** Spring physics with mass, stiffness, and damping. Use the studio's calibrated curves (`snapSettle`, `crashIn`, `bounceHard`, `popOver`).

### 4. Typographic Restraint
- Maximum of **2 font families** per composition (e.g., `Inter` or `SF Pro Display` for clean modern tech, `Instrument Serif` for editorial prestige).
- Maintain strict optical hierarchy: Headline (Bold/Semibold) $\rightarrow$ Eyebrow/Tag (Uppercase with wide tracking `0.15em`) $\rightarrow$ Subtext (Muted `#94a3b8`).

---

## 📋 3. Copy-Paste Prompt Templates for AI Agents

Use these battle-tested briefing templates when operating with Claude Code, OpenAI Codex, Antigravity, or via the `studio_engine.mjs` CLI.

### Template A: 📱 9:16 SaaS / App Showcase Video (Product Launch)

```markdown
Create a 30-second 9:16 vertical motion video for [Product Name].

[GOAL & HOOK]
- Hook (0-3s): Attack the pain: "Every week, [Target Audience] wastes [Specific Metric] managing [Pain Point]."
- Core Message: Showcase how [Product Name] automates this in 1-click using [Feature].
- CTA (25-30s): "Test it free today at [website] or comment 'DEMO' below."

[VISUAL DIRECTION]
- Style: Apple-Style Dark Glassmorphism (VisionOS).
- Backdrop: Deep graphite (#09090b) with subtle deep indigo radial ambient glow.
- Elements: Floating 3D Phone with isometric tilt (AppleCameraRig), glassmorphic cards with spring popOver easing.
- Typography: Inter Display / SF Pro, high-contrast white text with muted slate captions.

[AUDIO & RHYTHM]
- Narration Voice: Edge-TTS pt-BR (antonio or francisca).
- Sound Design: Warm sub-impact on the 3D card entry (sound_impact_engine) and subtle haptic clicks.
- Music Ducking: AutoDuckingAudio active (music at 10% during speech, 35% during pauses).
```

---

### Template B: 📰 4:5 Editorial Carousel (Instagram / LinkedIn High Authority)

```markdown
Create a 5-slide 4:5 editorial carousel on the topic: "[Insert Topic]".

[SLIDE STRUCTURE]
- Slide 01 (Cover): Bold hook headline, category tag, and subtle iridescent SVG gradient highlight.
- Slide 02 (The Hidden Cost): Explain why the conventional approach fails (1 statistic + 1 concrete comparison).
- Slide 03 (The Architecture): 3 pillars or steps with structured bullet hierarchy.
- Slide 04 (Technical Benchmark): Before vs. After code or metrics comparison table.
- Slide 05 (Conclusion & Call to Action): Clear actionable takeaway + "Save this post for reference / Star on GitHub".

[GUARDRAILS]
- Format: 1080x1350 px, 4:5 ratio.
- Layout: Editorial swiss typography, marquee tag ribbon at 0°, zero webkit-background-clip bugs (use native SVG <text fill="url(#id)">).
- Margins: Strict 48px lateral and 80px vertical margins.
```

---

### Template C: 💈 9:16 Commercial / Local Business (Action & Offer)

```markdown
Create a 20-second high-energy 9:16 reel for [Business / Barber.fi].

[NARRATIVE STRUCTURE]
- 0-3s: "Your clients are waiting in line while you answer WhatsApp appointments by hand."
- 3-12s: Fast-paced B-roll cuts (1.8s rhythm) showing client scanning QR code, automated Pix payment, and confirmed chair booking.
- 12-20s: "Barber.fi: Zero missed appointments. Full chairs. Try 7 days free."

[AUDIO]
- EBU R128 loudness normalized to -14 LUFS.
- Whoosh transitions on scene cuts with snappy spring easing.
```

---

## 🌐 4. Programmatic API Integration (Headless JSON Pipeline)

When driving Vibe Design Studio via **OpenRouter**, **n8n**, or an automated backend, structure your LLM output prompt to return this JSON schema directly:

```json
{
  "title": "A Nova Era do Design com Código",
  "accentColor": "#6366f1",
  "theme": "glassmorphism",
  "narration": "O futuro do design não é estático. É código vivo e movimento físico.",
  "voice": "antonio",
  "cards": [
    { "eyebrow": "01. PRECISÃO", "title": "Zero AI Slop", "desc": "Curvas físicas em vez de animações lineares duras." },
    { "eyebrow": "02. PERFORMANCE", "title": "-14 LUFS", "desc": "Masterização EBU R128 profissional para mobile." }
  ]
}
```

Pipe it directly into Remotion:
```bash
node scripts/narrar.mjs "O futuro do design não é estático..." --voz antonio --transcrever
npx remotion render Video out/video.mp4 --props='<JSON>'
npm run render:mastered
```

---

*Authored by the Vibe Design Studio Team © 2026. Free and Open Source under the MIT License.*
