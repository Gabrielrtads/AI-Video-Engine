## Summary of Changes

A concise description of the new feature, template, sound effect, or bugfix introduced by this PR.

## Type of Change
- [ ] 🎨 New Remotion Template (Carousel 4:5 or Video 9:16)
- [ ] 🔊 Sound Design / Audio Engineering (Auto-Ducking, SFX, TTS)
- [ ] 🛡️ Anti-Slop Linter or Frame Reviewer Improvement
- [ ] 🐛 Bugfix / Stability Patch
- [ ] 📖 Documentation / Community Reference

## Verification Checklist

Please verify the following before requesting a review:
- [ ] `npm run check` passes with 0 TypeScript errors.
- [ ] `npm run test:unit` passes with all tests green.
- [ ] Safe zones respected (`4:5` or `9:16`).
- [ ] No `-webkit-background-clip: text` on animated gradients (used native SVG `<text fill="url(#id)">` instead).
- [ ] No audio clipping or harsh volumes (impacts $\le 0.45$).
- [ ] Commit includes trailer: `--trailer "Agent=<agent-or-author>"`.
