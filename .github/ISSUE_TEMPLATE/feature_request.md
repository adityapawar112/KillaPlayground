---
name: Feature Request
about: Suggest an idea or enhancement for Diwali Killa Sandbox
title: '[FEAT] '
labels: ['enhancement', 'triage']
assignees: ''
---

## Problem Statement
A clear and concise description of the user need or problem. (e.g., *I'm always frustrated when trying to sculpt rounded bastions on steep hills...*)

## Proposed Solution
A clear and concise description of what you want to happen.

## Architectural & Technical Impact
- **Affected Subsystem:**
  - [ ] 3D Mesh & Heightmap State Buffer (`stateBuffer` 256x256x4)
  - [ ] Paint Canvas & Triplanar Shaders (`paintCanvas` 1024x1024)
  - [ ] Spline & Extrusion Tools (`CatmullRomCurve3` / `ExtrudeGeometry`)
  - [ ] Figurine Instancing (`<Instances>` batching)
  - [ ] Client-Side Poster Studio (`OffscreenCanvas` 1080x1920)
  - [ ] Supabase Persistence & Serialization (`fflate` binary compression)
- **Memory & Draw-Call Impact:** Does this maintain the 60 FPS / single-draw-call constraint?
- **Server Cost Impact:** Must remain ₹0 (Client-side compute first).

## Ponytail / YAGNI Check
Can this be achieved using native platform APIs or existing Three.js capabilities without adding third-party dependencies?

## Alternatives Considered
A clear and concise description of any alternative solutions or features you've considered.

## Additional Context & Sketches
Add any visual mockups, cultural references, or historic fort sketches here.
