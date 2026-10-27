# 07: Showcase, Multi-Angle Festive Poster Studio & Share

**What to build:**
Finishing flow and multi-angle festive poster generator:
- **Mode Selection & Blueprints**: Raigad, Murud-Janjira, Sinhagad pre-molded terrains with faint chalk outlines, plus Freeform Random Terrain Generator ("Roll New Terrain").
- **Automated 4-Angle Poster Generator**: Client-side `OffscreenCanvas(1080, 1920)` rendering 4 camera angles:
  1. *Hero Bird's-Eye Overview*.
  2. *Maha Darwaza & Bastion Low-Angle*.
  3. *Balekilla Throne Close-Up*.
  4. *Golden-Hour / Diwali Night Diya Angle*.
  Traditional Marathi calligraphic header (`Yatra One`) and festive greeting (`Modak`): *"दिवाळीच्या हार्दिक शुभेच्छा"*. Customizable fort name and builder name. Instant high-res PNG/JPG download + `navigator.share()` integration.
- **Shared 3D Viewer Route**: `/killa/[id]` reading serialized state from local store or mock link.

**Blocked by:** 06: State Serialization, Undo/Redo & Local Persistence Adapter

**Status:** ready-for-agent

- [ ] Mode selection launches historical blueprint scenes (Raigad, Janjira, Sinhagad) or random terrain
- [ ] "Finish Killa" opens the Poster Studio Modal and generates the 4-angle festive collage in $< 400\text{ms}$
- [ ] User can customize fort title and builder name in Devanagari or English
- [ ] "Download Poster" produces a crisp, high-resolution PNG file
- [ ] Shared link route `/killa/[id]` renders the 3D diorama in read-only orbit mode
