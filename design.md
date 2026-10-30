# Design System: Diwali Killa Sandbox

## Overview

**Diwali Killa Sandbox** is an interactive, tactile 3D diorama workspace celebrating the cherished Maharashtrian Diwali folk tradition of building miniature mud forts (*Diwali Killa*). The base visual atmosphere is a **sun-baked courtyard canvas** (`{colors.canvas}` — `#F9F6F0`) framed by **warm terracotta, rich burnt clay, desert sand, and olive green**, bringing the grounded warmth of outdoor courtyard soil directly into the browser. 

Where modern creative tools default to sterile dark modes or cool-gray SaaS minimalism, Diwali Killa Sandbox draws inspiration from sun-drenched Mediterranean plaster, natural raw pigments (*tambdi maati*, *geru*, *chuna*), and hand-painted miniature folk craftsmanship. The UI balances physical earthiness with modern, joyful software ergonomics.

Type voice is anchored by **Yatra One** and **Modak**—expressive, hand-carved Devanagari/Marathi display typefaces inspired by classic Indian hand-painted signage, fort nameplates, and festive cinema banners—paired with **Inter** for clean, precise UI controls, sliders, and navigation.

Component voltage is driven by **saturated earth-tone tool and feature cards** in a curated 6-color palette drawn directly from natural terracotta, wet clay, and courtyard surroundings: **Terracotta**, **Burnt Clay**, **Sand**, **Camel**, **Olive**, and **Basalt Charcoal**, accentuated by festive **Bhagwa Saffron** and **Chuna White**.

**Key Characteristics:**
- **Sun-baked courtyard canvas** (`{colors.canvas}` — `#F9F6F0`). Warm, earthen, non-glare cream foundation reflecting daylight on plastered courtyard walls and dry silt.
- **Dark Brown / Basalt Ink** (`{colors.primary}` — `#4B382C`). Deep mineral brown-black for primary buttons and display headlines, warmer and softer than harsh synthetic `#000000`.
- **6-Color Earth Tone Palette:** `{colors.terracotta}` (`#B85F45`), `{colors.burnt-clay}` (`#8F4938`), `{colors.sand}` (`#D8C09D`), `{colors.camel}` (`#B58B63`), `{colors.olive}` (`#777A57`), and `{colors.dark-brown}` (`#4B382C`).
- **Festive Folk Accents:** Saffron `{colors.bhagwa}` (`#E85D04`) for royal insignia and flags; `{colors.chuna}` (`#FAF8F5`) for mortar lines; `{colors.halim}` (`#65A30D`) for sprouted grass; `{colors.sea-blue}` (`#0284C7`) for tarpaulin water sheets; and `{colors.diya-amber}` (`#F59E0B`) for evening oil lamps.
- **Devanagari Display Typeface Voice:** `Yatra One` and `Modak` bring authentic cultural soul to headlines, fort title placards, and generated festive posters, while `Inter` provides high-legibility UI micro-copy.
- **Generous Border Radii:** `{rounded.md}` (12px) for input fields and buttons, `{rounded.lg}` (16px) for property sheets and tool groups, `{rounded.xl}` (24px) for prominent mode selection and showcase cards. Soft curves mirror hand-molded clay.
- **Tactile Courtyard Brick Base:** Base perimeter retaining border rendered with red terracotta brick geometry, anchoring the 3D mud hill just like real neighborhood society builds.
- **Modern Retro / PS1 3D Art Direction (Flavor A):** 
  - Uses authentic 128×128 pixel-art retro textures (Binbun Retroground) sampled with `THREE.NearestFilter` (no mipmap blur) for crisp, crunchy tactile miniature terrain.
  - Combines classic 90s console nostalgia (PS1 / *Valheim* style) with modern dynamic Three.js directional sunlight, real-time shadow casting, texture-baked ARM cavity occlusion, and warm festive Diya radiance.
  - Texture roles: *Tambdi Maati* (Dirt_03 warm red laterite), *Deccan Basalt* (Rock_02 dark rugged cliff escarpments), *Hydrated Mud* (Dirt_02 dark glistening mud), and *Sprouted Mohari* (Grass_01 vibrant green mustard sprigs).
- **Section Rhythm & Floating HUD:** `{spacing.section}` (96px) rhythm for promotional/landing flows; floating ergonomic docks (`{spacing.md}` inset) for in-app 3D creation.
- **Warm Textured Footer & Pre-Footer:** Closes with warm plaster tones (`{colors.surface-soft}`) rather than cold black.

---

## Colors

### Brand & Earth-Tone Palette

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.terracotta}` | `#B85F45` | Warm baked clay, *Geru* pathways, temple roof tiles, terracotta diyas. |
| `{colors.burnt-clay}` | `#8F4938` | Deep fired brick, rich wet mud (*tambdi maati*), primary brand badges. |
| `{colors.sand}` | `#D8C09D` | Sun-baked stone, courtyard silt, secondary container background. |
| `{colors.camel}` | `#B58B63` | Earthy golden-tan, dry soil piles, reference photo cards. |
| `{colors.olive}` | `#777A57` | Earthy foliage green, mature greenery, nature brush indicator. |
| `{colors.dark-brown}` | `#4B382C` | Deep mineral earth, primary CTAs, high-contrast headings. |

### Cultural & Festive Accents

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.bhagwa}` | `#E85D04` | Maratha saffron swallowtail flag (*Bhagwa Dhwaj*), primary action highlights, royal seals. |
| `{colors.bhagwa-glow}` | `#FF7722` | Saffron hover state, active step glows, marigold festive trims. |
| `{colors.chuna}` | `#FAF8F5` | Lime white mortar lines (*chuna*), chalk blueprint guidelines, crisp borders. |
| `{colors.basalt}` | `#23211E` | Charcoal basalt rock, dark killa wall base coat, night sky diorama floor. |
| `{colors.halim}` | `#65A30D` | Sprouted garden cress / mustard sprouts freshly germinated on wet mud slopes. |
| `{colors.sea-blue}` | `#0284C7` | Nostalgic crinkled blue plastic sheet sea, water tanks (*taki*). |
| `{colors.diya-amber}` | `#F59E0B` | Flickering Diya oil lamp flame, gold canopy (*Meghdambari*) trim, poster sub-header. |

### Surface

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.canvas}` | `#F9F6F0` | Default application floor. Warm plaster / sun-bleached sandstone. |
| `{colors.surface-soft}` | `#F2EBE1` | Floating toolbars, drawer backdrops, footer background. |
| `{colors.surface-card}` | `#EADECF` | Default component cards, inactive tool buttons, preset cards. |
| `{colors.surface-strong}` | `#DFCDBD` | Highlighted panels, active segmented controls, hovered cards. |
| `{colors.surface-dark}` | `#23211E` | Night Mode viewport backing, dark basalt preset cards. |
| `{colors.surface-dark-elevated}` | `#322E2A` | Elevated night mode toolbars, dark popover floating panels. |
| `{colors.hairline}` | `#D9C9B4` | 1px subtle divider on cards, inputs, and floating controls. |
| `{colors.hairline-strong}` | `#BFA892` | 1px focused border, active tabs, crisp card boundaries. |

### Text

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.ink}` | `#2B1E16` | Main headlines, tool titles, high-emphasis text. |
| `{colors.body-strong}` | `#4B382C` | Section sub-heads, lead descriptions, primary button text. |
| `{colors.body}` | `#634E40` | Default body copy, tool descriptions, guide instructions. |
| `{colors.muted}` | `#8D7666` | Helper notes, slider labels, shortcut keys, disabled actions. |
| `{colors.muted-soft}` | `#B29E8E` | Subtle captions, watermarks, inactive icon strokes. |
| `{colors.on-primary}` | `#FFFFFF` | Text on primary dark buttons (`#4B382C`) and saffron tags (`#E85D04`). |
| `{colors.on-dark}` | `#FAF8F5` | Text on dark basalt cards and Night Mode overlays. |

### Semantic

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.success}` | `#588157` | Save complete, state compressed, link copied. Olive-tinted green. |
| `{colors.warning}` | `#D97706` | Mud drying warning, high polycount limit notification. |
| `{colors.error}` | `#B91C1C` | WebGL context loss, failed network save, invalid file format. |
| `{colors.info}` | `#0284C7` | Blueprint guide tooltip, step hints, water tool suggestion. |

---

## Typography

### Font Families
1. **Primary Festive Display:** **`Yatra One`** (Google Fonts, OFL)
   * Inspired by the hand-painted signboards and Devanagari script tradition of Maharashtra. 
   * Features sharp, chisel-like cut strokes, high stroke contrast, and architectural discipline reminiscent of fort masonry.
   * Handles bilingual English and Marathi/Devanagari headlines with commanding presence.
2. **Playful Rounded Display (Alternative/Celebratory):** **`Modak`** (Google Fonts, OFL)
   * Chunky, plump, joyful Devanagari display font used for festive greetings (*"दिवाळीच्या हार्दिक शुभेच्छा"*), mode banners, and celebrations.
3. **Primary UI & Body:** **`Inter`**
   * Neutral, highly legible neo-grotesque sans-serif for UI menus, slider numerical readouts, HUD buttons, and documentation.
   * Fallback stack: `Inter, "Noto Sans Devanagari", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

### Hierarchy

| Token | Font Family | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|---|
| `{typography.display-xl}` | `Yatra One` | 56px | 400 | 1.1 | -0.5px | Homepage hero ("आपला दिवाळी किल्ला"), Main Poster Title |
| `{typography.display-lg}` | `Yatra One` | 44px | 400 | 1.15 | -0.3px | Mode selection header, Major celebratory banners |
| `{typography.display-md}` | `Yatra One` | 32px | 400 | 1.2 | 0 | Modal titles, Fort nameplates (*रायगड*, *मुरुड जंजिरा*) |
| `{typography.display-sm}` | `Yatra One` | 24px | 400 | 1.25 | 0 | Tool category titles, Showcase section heads |
| `{typography.title-lg}` | `Inter` | 20px | 600 | 1.3 | -0.2px | Drawer section titles, Inspector card headers |
| `{typography.title-md}` | `Inter` | 16px | 600 | 1.4 | 0 | Tool group labels, Preset card titles |
| `{typography.title-sm}` | `Inter` | 14px | 600 | 1.4 | 0 | Sub-tool buttons, Active tool name, Figurine names |
| `{typography.body-md}` | `Inter` | 15px | 400 | 1.55 | 0 | Onboarding guidance, tool instructions |
| `{typography.body-sm}` | `Inter` | 13px | 400 | 1.5 | 0 | Helper text, keyboard shortcut indicators |
| `{typography.caption}` | `Inter` | 12px | 500 | 1.4 | 0.2px | Slider numerical readouts, badge labels |
| `{typography.caption-uppercase}`| `Inter` | 11px | 700 | 1.4 | 1.2px | Category headers ("TOOLS", "FIGURINES", "TERRAIN") |
| `{typography.button}` | `Inter` | 14px | 600 | 1.0 | 0.2px | Primary action buttons, Floating toolbar buttons |
| `{typography.festive-greeting}`| `Modak` | 28px | 400 | 1.2 | 0.5px | Poster greeting banner ("दिवाळीच्या हार्दिक शुभेच्छा") |

### Principles
- **Cultural Authenticity Without Clutter:** Headlines in `Yatra One` immediately establish historical and festive context. The font is never used for dense UI menus or small numerical readouts; `Inter` maintains crisp precision.
- **Devanagari First-Class Support:** All typography tokens strictly verify harmonious line-height (`1.2`–`1.55`) so Devanagari vowel marks (*matras*, *velanti*, *anusvara*) never clip.
- **Display Weights Remain Natural:** `Yatra One` has an intrinsic single weight (400) whose calligraphic stroke contrast carries natural weight without synthetic bolding. `Inter` stays between 400 and 600.

---

## Layout

### Spacing System
- **Base unit:** 4px
- **Tokens:** 
  - `{spacing.xxs}`: 4px
  - `{spacing.xs}`: 8px
  - `{spacing.sm}`: 12px
  - `{spacing.md}`: 16px
  - `{spacing.lg}`: 24px
  - `{spacing.xl}`: 32px
  - `{spacing.xxl}`: 48px
  - `{spacing.section}`: 96px
- **In-App HUD Floating Margin:** `{spacing.md}` (16px) off viewport edges on desktop; `{spacing.xs}` (8px) on mobile.
- **Panel Internal Padding:** `{spacing.md}` (16px) for compact docks; `{spacing.lg}` (24px) for side drawers and preset modals.

### Grid & Viewport Architecture
1. **The 3D Canvas Viewport (Full Bleed):**
   * The WebGL `<Canvas>` spans 100vw × 100vh.
   * Surrounding user interface components float cleanly on top as non-blocking HUD overlays.
2. **Top Application Desktop Menu Bar (`{component.app-menu-bar}`):**
   * Anchored to the top edge (height 41px, `z-50`).
   * Left cluster: Shield logo + in-flow brand title ("The Killa Playground") + Fort Blueprint selector + Menus (`File`, `Edit`, `View`, `Language`, `Help`).
   * Right cluster: Quick language switcher, Undo/Redo/Reset cluster, Diwali Night Diya toggle, and "Finish Killa" CTA.
   * On screens `< 1280px` (`< xl`), horizontal menus collapse into a Hamburger menu drawer starting below the bar (`top-[41px]`) with dynamic `X` toggle icon.
3. **Secondary Tool Modes & Camera Sub-Bar (`{component.top-tool-bar}`):**
   * Pinned immediately below the menu bar at `top-[41px]`.
   * On wide screens (`>= 1280px`): Single-row layout housing 6 Primary Killa Tools (`Terrain`, `Walls`, `Spline`, `Paint`, `Foliage`, `Figurines`), Soil Pipeline Tools (`Soil`, `Water`, `Shape`, `Dry`), and dedicated Camera Viewport controls (`Top Z`, `Front Y`, `Side X`, `Center`, `Zoom In/Out`).
   * On screens `< 1280px` (`< xl`): Automatically switches to a 2-row symbols-only layout with right-pinned minimize toggle (`Tools & Views ▾` at `right-2 top-[41px]`), preventing horizontal scrollbars and cutoffs.
4. **Left Tool Properties Sidebar (`{component.left-tool-sidebar}`):**
   * Anchored to the left edge with resizable width (default 290px). Dedicated 100% to active tool properties, sliders, sculpt modes, and earth pigments with full vertical scrolling height.
   * On screens `< 1280px` (`< xl`): Supports one-tap minimize (`-translate-x-full`) with a left-pinned toggle tab (`Properties ▾` at `left-2`) hanging off the top bar when minimized or off the secondary toolbar when expanded.
5. **Bottom Viewport Navigation Strip (`{component.bottom-status-bar}`):**
   * Centered floating pill displaying active mouse/pen gesture tips (`Left Click: Action • Right Drag: Orbit • Scroll: Zoom`).
   * Automatically hidden on mobile and tablet viewports (`hidden md:flex`) to conserve screen space.
6. **Right Drawer / Asset Browser (`{component.prop-drawer}`):**
   * Slides in smoothly from the right edge (width 360px on desktop, full-width sheet on mobile) to display the library of *Mavale*, cannons, flags, and shrines.
7. **Multi-Angle Poster Studio Modal:**
   * Centered 9:16 or 4:5 preview frame surrounded by angle selectors, custom title inputs, and download buttons.

### Whitespace Philosophy
The interface gives the 3D diorama maximum breathing room. Floating panels use warm cream translucent surfaces (`rgba(249, 246, 240, 0.94)`) with backdrop blur (`backdrop-filter: blur(12px)`), casting gentle warm shadows to feel like lightweight wooden boards resting above courtyard sand.

---

## Elevation & Depth

| Level | Treatment | Use Case |
|---|---|---|
| **Flat** | No shadow, transparent or hairline border | Canvas viewport backdrop, passive labels |
| **Soft Hairline** | 1px `{colors.hairline}` border | Inactive tool buttons, closed drawers, inputs |
| **Earthy Card** | `{colors.surface-card}`, 1px `{colors.hairline}`, soft shadow `0 2px 6px rgba(43,30,22,0.06)` | Preset fort cards, reference photo popup |
| **Floating HUD** | `{colors.surface-soft}`, backdrop blur 12px, shadow `0 8px 24px rgba(43,30,22,0.12)`, 1px `{colors.hairline}` | Bottom tool dock, top navigation bar |
| **Active / Popover**| `{colors.surface-card}`, shadow `0 16px 36px rgba(43,30,22,0.18)`, border 1.5px `{colors.hairline-strong}` | Spline context menu, brush size slider popup |
| **Modal Showcase** | `{colors.surface-soft}`, shadow `0 24px 64px rgba(43,30,22,0.25)` | Poster studio dialog, mode selection modal |

### Decorative Tactile Depth
- **Basalt Stone Relief:** 3D mud ramparts and bastions feature beveled masonry contours accented with hand-painted white mortar.
- **Red Brick Retaining Wall:** A physical 3D ring of red clay masonry bricks encircles the mud base, grounding the miniature landscape in reality.
- **Diya Glow & Flame Sprites:** Night Mode introduces warm additive radial light decals (`#F59E0B`) at 0.1ms GPU cost, mimicking genuine earthen oil lamps.

---

## Shapes

### Border Radius Scale

| Token | Value | Applied To |
|---|---|---|
| `{rounded.xs}` | 6px | Small color swatches, slider thumbs, tooltip badges |
| `{rounded.sm}` | 8px | Sub-tool buttons, keyboard shortcut tags, thumbnail cards |
| `{rounded.md}` | 12px | Primary action buttons, text input fields, tool buttons |
| `{rounded.lg}` | 16px | Contextual popovers, figurine catalog cards, reference photos |
| `{rounded.xl}` | 24px | Floating bottom dock, side drawer corners, mode selection cards |
| `{rounded.pill}` | 9999px | Category tabs, undo/redo cluster, mode toggle pills |
| `{rounded.full}` | 50% | Circular brush preview cursor, icon-only toggle buttons |

---

## Components

### Top Navigation

**`top-nav-bar`**
- Pinned to the top with a 16px floating inset. Height: 54px.
- Background: `{colors.surface-soft}` (88% alpha with 12px blur). Border: 1px `{colors.hairline}`. Radius: `{rounded.pill}`.
- Left cluster: Miniature Maratha shield emblem + Fort Nameplate (`Yatra One` 18px).
- Center cluster: Active Mode Pill (e.g., *"रायगड किल्ला - Blueprint Mode"*).
- Right cluster:
  - **Undo / Redo** button group (`{rounded.pill}`, hairline border).
  - **Diwali Night Diya Mode** toggle (amber flame icon when active).
  - **Finish & Share** `{component.button-bhagwa}`.

### Toolbars & Floating Docks

**`bottom-floating-dock`**
- Floats centered horizontally, 20px above bottom edge. Height: 68px.
- Background: `{colors.surface-soft}` (92% alpha, blur 16px), 1px `{colors.hairline}` border, radius: `{rounded.xl}`.
- Internal layout: Horizontal flex row with `{spacing.xs}` (8px) gap.
- Houses 6 primary fort construction tool buttons:
  1. **Terrain** (Mountain / Elevation icon)
  2. **Walls** (Fort Wall / Ramparts icon)
  3. **Spline** (Curved Steps / Path icon)
  4. **Terrain Paint** (Texture brush / Palette icon)
  5. **Foliage Paint** (Tree / Shrub scatter icon)
  6. **Figurines & Buildings** (Mavala / Temple icon)
*(Advanced Tactile Soil Pipeline tools are accessed via secondary workflow mode).*

**`tool-button`**
- Size: 52px × 52px square, rounded `{rounded.md}`.
- States:
  - **Default:** Transparent background, icon in `{colors.ink}`, subtle hover fill `{colors.surface-strong}`.
  - **Active:** Background `{colors.dark-brown}`, icon in `{colors.on-primary}`, shadow `0 4px 12px rgba(75,56,44,0.25)`.
  - **Notification Dot:** 6px Bhagwa saffron dot indicating unsaved brush changes or unlocked modes.

**`contextual-subdock`**
- Floats directly above the active master tool button. Radius: `{rounded.lg}`.
- Displays tool-specific parameter sliders and toggles:
  - **Terrain:** Mode pills (`Elevate`, `Lower`, `Plateau`, `Smooth`, `Pond`) + Radius & Strength sliders.
  - **Walls:** 3-Step Stepper (`1. Layout` -> `2. Fortify` -> `3. Solidify`), Wall Height slider (10cm–100cm), Thickness slider (5cm–40cm), Magnetic Snap Shelf (`Buruj`, `Maha Buruj`, `Maha Darwaza`, `Balekilla Citadel`), Crenellations toggle, and Brick Texture Scale slider.
  - **Spline:** Structure conversion pills (`Stone Steps / Payrya`, `Bhagwa Saffron Flags`, `Glowing Divas`), spacing slider, and size slider. *(Note: Walking paths are painted using Terrain Paint).*
  - **Terrain Paint:** Texture swatches (`Dirt / Tambdi Maati`, `Sand`, `Grass`, `Gravel`, `Rock / Basalt`, `Rocky Ground`) + Brush Radius & Opacity/Strength sliders.
  - **Foliage Paint:** Asset selector (`Trees`, `Rocks`, `Shrubs`, `3D Grass Models`) + Scatter Radius, Density, and Scale Jitter sliders.
  - **Figurines & Buildings:** Trigger for the sliding Prop Drawer + Rotation angle wheel & Ground Alignment toggle.

### Buttons

**`button-primary`**
- Background: `{colors.dark-brown}` (`#4B382C`), text: `{colors.on-primary}` (`#FFFFFF`).
- Font: `{typography.button}` (Inter 14px / 600), padding: 12px × 20px, height: 44px, radius: `{rounded.md}`.
- Active feedback: Scale down to 0.98, shadow softens.

**`button-bhagwa` (Festive Action CTA)**
- Background: `{colors.bhagwa}` (`#E85D04`), text: `#FFFFFF`.
- Paired with subtle golden glow: `box-shadow: 0 4px 14px rgba(232, 93, 4, 0.35)`.
- Used exclusively for **"Finish Killa"**, **"Share Poster"**, and **"Generate 3D Link"**.

**`button-secondary`**
- Background: `{colors.canvas}`, text: `{colors.ink}`, border: 1px `{colors.hairline-strong}`.
- Height: 44px, radius: `{rounded.md}`.

**`button-earth-terracotta`**
- Background: `{colors.terracotta}` (`#B85F45`), text: `#FFFFFF`, radius: `{rounded.md}`.
- Used for stamp approvals, wall conversions, and spline placement triggers.

### Cards & Drawers

**`mode-card-historical`**
- Card dimensions: 320px × 380px, radius: `{rounded.xl}`, background: `{colors.surface-card}`.
- Header image: Stylized topological isometric preview of the historical fort (Raigad, Janjira, Sinhagad).
- Badge: Saffron pill `"BLUEPRINT AVAILABLE"`.
- Heading: `{typography.display-md}` (`Yatra One`) e.g. *"किल्ले रायगड"*.
- Sub-text: Brief historical note, pre-drawn chalk wall guides toggle.

**`mode-card-scratch`**
- Same size as historical mode card, background `{colors.surface-card}`.
- Highlights random terrain generator button: **"Roll New Terrain"** + sliders for Mountain Ridge vs. Island.

**`feature-card-terracotta` / `feature-card-burntclay` / `feature-card-sand` / `feature-card-camel` / `feature-card-olive` / `feature-card-basalt`**
- Saturated single-color feature cards following the 6 brand earth tones.
- Radius: `{rounded.xl}` (24px), internal padding: `{spacing.xl}` (32px).
- Typography: Headline in `{typography.display-sm}` (`Yatra One`), description in `{typography.body-md}`.
- Text color rules:
  - On **Terracotta**, **Burnt Clay**, and **Basalt**: text is `{colors.on-dark}` (`#FAF8F5`).
  - On **Sand**, **Camel**, and **Olive**: text is `{colors.ink}` (`#2B1E16`).

**`prop-drawer-sheet`**
- Right-anchored sliding sheet (width: 360px). Background: `{colors.surface-soft}`.
- Category tabs at top:
  1. *Royalty & Sinhasan* (Maharaj, throne, canopy)
  2. *Mavale* (Swordsmen, spearmen, sentries)
  3. *Musicians* (Tutari blowers, dhol drummers)
  4. *Buildings & Fort Architecture* (Watchtowers, stone bastions, temple shrines, fort houses, stone arches)
  5. *Artillery & Yard Props* (Cannons, cannonballs, bullock carts, wooden barrels, paper boats, terracotta diyas)
- Grid: 2-column list of 3D asset thumbnail preview cards. Drag-and-drop enabled.

**`prop-item-card`**
- Dimensions: 140px × 140px, radius: `{rounded.lg}`, background: `{colors.surface-card}`.
- Interactive 3D preview on hover, asset title in `{typography.title-sm}`, polycount badge (`< 500 tris`).

### Spline & Walls Controls

**`walls-stepper-panel`**
- 3-Step Fort Crafting Stepper:
  - **Step 1 (Layout / Tracing):** Interactive draft tracing. Green start closing node (`#10b981`), yellow intermediate nodes (`#f59e0b`), amber line preview. Action buttons: Primary `"Proceed to Fortify"` (green `#10b981`) and Secondary `"Cancel Draft"`.
  - **Step 2 (Fortify & Decorate):** Fortifications Stamp Shelf featuring the 3 authentic fortification types:
    1. **Tower** (*Round tower*): Sliding continuous cylindrical bastions snapping along wall segments.
    2. **Rampart Platform** (*Inward platform*): Flush inward stone platform with 3D protective railings, keeping outer rampart crenellations intact.
    3. **Gate** (*Arched Gateway*): Arched portal flanked by stone towers with continuous walkway.
    - Flat 3D selection handles with emerald/cyan highlight surfaces (`BoxPlatformSelectionMesh` and tower top discs), eliminating floating pin spheres.
    - Contextual component inspectors with dimension sliders, inward/outer flip toggles, and delete buttons (`#dc2626`).
  - **Step 3 (Diorama Solidified):** Diorama lock-in state (`#059669`) hiding all wireframes and handles. Displays fort circuit summary cards (total length, wall count, gates) with `"Build Another Wall Circuit"` CTA.
- **Physical Diorama Scale Tokens:**
  - Wall Height: 10cm to 100cm (default: 25cm, formatted as `X cm`).
  - Wall Thickness: 5cm to 40cm (default: 15cm, formatted as `X cm`).
  - Foundation Embed: 12mm subterranean base skirt.
- **Hologram Tokens:**
  - Snapped Wall Target: Magnetic snap indicator ring (`#10b981` snapped, `#f59e0b` hovering).
  - Gate Hologram: Double flanking towers and portal arch volume aligned with outward-facing wall normal.
  - Rampart Platform Hologram: Rectangular box wireframe attached to wall, extending inward into courtyard along inward normal.

**`spline-context-menu`**
- Contextual properties drawer and dock for spline structures:
  1. **Stone Steps** (*Payrya* stepped stone blocks with 7x larger masonry texture, lateral offset slider `-15cm` to `+15cm`, and stair spacing slider `1cm` to `10cm`).
  2. **Bhagwa Flags** (Uniformly spaced waving swallowtail saffron flags with wooden mast poles, normalized 1.0x base scale).
  3. **Glowing Divas** (Terracotta oil lamps with warm amber flame teardrops, normalized 1.0x base scale).
- Full raycast occlusion support allowing continuous paths atop walls, towers, platforms, and terrain slopes without duplicate points on the ground underneath.

### Terrain Texture Palette

**`terrain-paint-palette-dock`**
- Floating texture swatch dock when Terrain Paint Mode is active.
- Texture Swatches (36px circular preview cards with 2px white ring):
  - **Dirt (*Tambdi Maati*)** — Red laterite soil
  - **Sand** — Sun-baked courtyard silt
  - **Grass** — Fresh hillside greenery
  - **Gravel** — Crushed stone for walking trails
  - **Rock** — Deccan Basalt cliff face
  - **Rocky Ground** — Pebble & hillside terrain
- Sliders: Brush Radius (0.2m–3.0m) and Brush Strength/Opacity.

### Multi-Angle Poster Studio & Showcase

**`poster-studio-modal`**
- Full-screen diorama presentation overlay with a dark warm backdrop (`rgba(35, 33, 30, 0.85)`).
- Centered **Festive Collage Poster Canvas** (OffscreenCanvas 1080 × 1920 rendered client-side):
  - **Slot 1 (Hero Top):** Bird's-eye isometric view of the full killa.
  - **Slot 2 (Bottom-Left):** *Maha Darwaza* low-angle looking up at painted stone bastions and cannons.
  - **Slot 3 (Bottom-Right):** *Balekilla* throne close-up with Maharaj, saffron flag, and red pathways.
  - **Slot 4 (Bottom-Wide):** Golden-hour / Night Diya illumination angle with glowing battlements.
- **Poster Header & Typography Banner:**
  - Killa Name written in `{typography.display-xl}` (`Yatra One`) in warm golden-amber (`#F59E0B`).
  - Sub-banner: *"निर्मिती: [Builder Name] • दिवाळीच्या हार्दिक शुभेच्छा"* in `{typography.festive-greeting}` (`Modak`).
- **Export Action Cluster:**
  - `{component.button-bhagwa}`: **Download Poster (PNG / JPG)**
  - `{component.button-secondary}`: **Copy Interactive 3D Link** (25 KB compressed payload)
  - **WhatsApp & Instagram Quick Share** buttons.

---

## Do's and Don'ts

### Do
- **Anchor on the warm courtyard canvas (`{colors.canvas}` — `#F9F6F0`).** The sun-baked earth atmosphere is non-negotiable.
- **Celebrate the authentic 6 earth tones.** Terracotta, Burnt Clay, Sand, Camel, Olive, and Basalt Charcoal reflect real soil and masonry.
- **Use `Yatra One` for all display titles and fort names.** Its architectural cut-letter shapes embody the spirit of Maharashtrian fort inscriptions.
- **Pair `Yatra One` with `Inter` for all UI controls.** Keep sliders, toolbars, and technical measurements clean and functional.
- **Maintain Devanagari script legibility.** Verify that accents and diacritics (*matras*) never collide with panel edges.
- **Include the red courtyard perimeter bricks.** The brick border grounding the mud pile is the visual signature of real backyard builds.
- **Provide steady-hand stabilization for white brick lines.** Enable users to draw clean horizontal/vertical *chuna* lines with zero mouse jitter.
- **Default the 4-angle poster to client-side generation.** Render directly via `OffscreenCanvas` to guarantee zero server cost and instant sharing.

### Don't
- **Don't use cold corporate gray (`#F3F4F6`, `#E5E7EB`).** Cold blues and grays ruin the nostalgic warmth of backyard soil.
- **Don't use pure digital black (`#000000`).** Use mineral `{colors.dark-brown}` (`#4B382C`) or `{colors.basalt}` (`#23211E`).
- **Don't use generic medieval fantasy castle blocks.** This is a *Diwali Killa*, not a European medieval sandbox. Emphasize rounded bastions (*buruj*), ramparts (*tatbandi*), and *Maha Darwaza* gates.
- **Don't hide interior floorplans or add indoor room furniture.** Killas are solid exterior mud monuments; keep interaction focused on sculpting, painting, and diorama staging.
- **Don't bold `Yatra One` or stretch Devanagari typefaces.** Respect the inherent proportion and calligraphic stroke weight.
- **Don't overwhelm the 3D viewport with permanent toolbars.** Collapse inactive tools into ergonomic floating docks with backdrop blur.
- **Don't introduce heavy photorealistic shader noise on walls.** Authentic killas rely on the user's hand-painted black coat and white brick lines.

---

## Responsive Behavior

### Breakpoints & Multi-Device HUD Modes

| Viewport Profile | Width | Layout Adaptations |
|---|---|---|
| **Mobile & Windowed / Tablet** | `< 1280px` (`< xl`) | **Primary Bar:** Brand title in-flow; horizontal menus collapse into a Hamburger menu drawer (`top-[41px]`) with dynamic `X` toggle icon.<br>**Secondary Bar:** Automatically switches to a 2-row symbols-only layout (Row 1: 10 Tools; Row 2: Camera presets & zoom) with right-pinned minimize toggle (`Tools & Views ▾` at `right-2 top-[41px]`), preventing all horizontal scrollbars and cutoffs.<br>**Left Sidebar:** 100% properties height; supports one-tap minimize (`-translate-x-full`) with a left-pinned toggle tab (`Properties ▾` at `left-2`) hanging off the top bar when minimized or off the secondary toolbar when expanded.<br>**Bottom Strip:** Viewport navigation tips strip hidden (`hidden md:flex`). |
| **Full Desktop** | `≥ 1280px` (`xl+`) | **Primary Bar:** Full horizontal menus (`File`, `Edit`, `View`, `Language`, `Help`), fort blueprint selector, in-flow branding next to logo (zero collisions).<br>**Secondary Bar:** Single-row toolbar with tool keys, icons, full names, and segmented camera controls on the right.<br>**Left Sidebar:** Full-height property panel with smooth vertical scrolling.<br>**Bottom Strip:** Visible centered floating pill. |

### Touch & Pointer Targets
- Tool symbol buttons are minimum **32px × 32px** touch targets on mobile/tablet and **40px × 32px** on desktop.
- Both HUD sections provide one-tap minimize toggles that hang symmetrically off the top bar (`left-2` and `right-2`), freeing 100% of the screen for the 3D viewport canvas.
- Touch orbit controls use two-finger rotation and pinch-zoom to prevent accidental soil sculpting during camera repositioning.
- Color swatches have a hit radius of **36px** with 8px padding.

---

## Iteration Guide

1. **Tokenized Hierarchy:** Always reference tokens via `{colors.terracotta}`, `{typography.display-md}`, `{spacing.md}` rather than inline hex or pixel values.
2. **Component Isolation:** Build and test components as modular HUD pieces (e.g., `bottom-floating-dock`, `spline-context-menu`, `poster-studio-modal`).
3. **Contrast Compliance:** Text on dark surfaces (`{colors.burnt-clay}`, `{colors.dark-brown}`, `{colors.basalt}`) must use `{colors.on-dark}` (`#FAF8F5`) to maintain WCAG AA readability.
4. **Devanagari String Testing:** Whenever updating component paddings, test with both English text (*"Raigad Fort"*) and Devanagari text (*"किल्ले रायगड"*).

---

## Known Gaps

- **WebGL Touch Conflicts on Mobile:** Multi-touch pinching to zoom can occasionally trigger single-touch brush raycasting on older Android devices; requires explicit `event.touches.length === 1` guards.
- **High-DPI OffscreenCanvas Limits:** Generating 4K poster collages on low-memory mobile Safari devices may cause canvas buffer restarts; posters are capped at standard 1080 × 1920.
- **Devanagari Web Font FOUT:** Google Fonts `Yatra One` and `Modak` must be preloaded in `<head>` via `font-display: swap` to prevent layout shifts during poster canvas rendering.
