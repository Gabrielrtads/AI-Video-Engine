# Visual References Library (Knowledge Corpus)

This directory stores technical deconstructions, metadata, and evidence for visual video references processed by the **Self-Evolving Learning Loop**.

## Structure

- `inbox/`: New reference submissions waiting for technical analysis and cross-model review.
- `accepted/`: References that successfully passed the `/cli-revisao-cruzada` with Scorecard $\ge 8.0/10$ and Confidence $\ge 85\%$.
- `rejected/`: References evaluated and rejected (with technical rationale, e.g., low-quality, duplicative, or irreproducible).
- `evidence/`: Keyframe stills (PNGs) and contact sheets documenting the technical observations.

## Governance & Privacy

1. **Zero Raw Video Bloat:** Full video media files are never checked into Git. Only structured metadata (`.json`), frame timestamps, and lightweight keyframe stills are retained.
2. **Attribution:** Submissions preserve original author credits when provided.
3. **Fair Use Synthesis:** Techniques are abstracted into reusable spring math, easing functions, and typography rules without copying proprietary copyrighted character assets.
