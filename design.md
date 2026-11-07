# Design System: Diwali Killa Sandbox

## Overview

**Diwali Killa Sandbox** is an interactive, tactile 3D diorama workspace celebrating the cherished Maharashtrian Diwali folk tradition of building miniature mud forts (*Diwali Killa*). The base visual atmosphere is a **sun-baked courtyard canvas** (`{colors.canvas}` — `#F9F6F0`) framed by **warm terracotta, rich burnt clay, desert sand, and olive green**, bringing the grounded warmth of outdoor courtyard soil directly into the browser. 

Where modern creative tools default to sterile dark modes or cool-gray SaaS minimalism, Diwali Killa Sandbox draws inspiration from sun-drenched Mediterranean plaster, natural raw pigments (*tambdi maati*, *geru*, *chuna*), and hand-painted miniature folk craftsmanship. The UI balances physical earthiness with modern, joyful software ergonomics inspired by 3D authoring applications (Blender, ZBrush) adapted for playful, non-CAD consumer accessibility.

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
  - Uses authentic 128×128 pixel-art retro textures (Binbun Retroground) configured with `THREE.SRGBColorSpace` and `THREE.LinearMipmapLinearFilter` on diffuse basecolor maps to faithfully preserve the original dark earthen, basalt, and mossy stone tones without double-gamma washouts or bright specular aliasing.
  - Linear maps (normal, roughness, AO) maintain `THREE.NoColorSpace` with zero metalness for authentic matte stone.
  - Combines classic 90s console nostalgia (PS1 / *Valheim* style) with modern dynamic Three.js directional sunlight, real-time shadow casting, texture-baked ARM cavity occlusion, and warm festive Diya radiance.
  - Texture roles: *Tambdi Maati* (Dirt_03 warm red laterite), *Deccan Basalt* (Rock_02 dark rugged cliff escarpments), *Hydrated Mud* (Dirt_02 dark glistening mud), *Sprouted Mohari* (Grass_01 vibrant green mustard sprigs), *Mossy Stone Brick* (mossy_stone_brick_128x128_pbr wall facings), and *Dark Stone Floor* (dark_stone_floor_128x128_pbr rampart walkways and tower decks).
- **Decoupled 5-Zone HUD Ergonomics:** Pinned menu bar, minimizable secondary toolbar, dedicated left property drawer, vertical tool mode strip, and right scene outliner/inspector.
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

### Surface Tokens

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.canvas}` | `#F9F6F0` | Default application floor. Warm plaster / sun-bleached sandstone. |
| `{colors.surface-base}` | `#F3EBE0` | Docked sidebars (Left Tool Properties, Right Outliner, Mode Strip). |
| `{colors.surface-soft}` | `#E4D8CB` | Top secondary tool bar, hanging folder guide tabs, control pills. |
| `{colors.surface-card}` | `#FAF8F5` | Inner cards, outliner tree items, object inspector sheets, text inputs. |
| `{colors.surface-strong}` | `#EADECF` | Hovered items, active secondary buttons, selected rows in outliner. |
| `{colors.surface-elevated}` | `#DFCDBD` | Active tabs, pressed pills, drag handles. |
| `{colors.surface-dark}` | `#23211E` | Night Mode viewport backing, dark basalt preset cards. |
| `{colors.surface-dark-elevated}` | `#322E2A` | Elevated night mode toolbars, dark popover floating panels. |
| `{colors.border-panel}` | `#CDBCAB` | 1px perimeter border for docked sidebars, top bars, and hanging tabs. |
| `{colors.border-card}` | `#D9C9B4` | 1px internal divider on cards, inputs, and section splitters. |
| `{colors.border-subtle}` | `#D8C7B5` | Hairline separators within headers, rows, and input groups. |
| `{colors.border-focus}` | `#BFA892` | Focused input border, active outliner selection border. |

### Text Tokens

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.ink}` | `#2B1E16` | Main headlines, tool titles, high-emphasis text. |
| `{colors.body-strong}` | `#4B382C` | Section sub-heads, lead descriptions, primary button text, tab labels. |
| `{colors.body}` | `#5C4638` | Default body copy, tool descriptions, guide instructions, chevron icons. |
| `{colors.muted}` | `#8D7666` | Helper notes, slider labels, shortcut keys, category uppercase labels. |
| `{colors.muted-soft}` | `#B29E8E` | Subtle captions, watermarks, inactive icon strokes, disabled states. |
| `{colors.on-primary}` | `#FFFFFF` | Text on primary dark buttons (`#4B382C`) and saffron tags (`#E85D04`). |
| `{colors.on-dark}` | `#FAF8F5` | Text on dark basalt cards and Night Mode overlays. |

### Semantic Tokens

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.success}` | `#10B981` | Safe snap hologram, confirmed action, active selection ring, 3D handle highlight. |
| `{colors.warning}` | `#F59E0B` | Unsnapped hovering hologram, selection wireframe edge, mud drying advisory. |
| `{colors.error}` | `#DC2626` | Destructive actions (Delete wall/component/spline), error notifications. |
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
3. **Primary UI & Technical Body:** **`Inter`**
   * Clean, hyper-legible sans-serif for numbers, dimension readouts (`cm`), sliders, dropdowns, and button microcopy.

### Scale & Hierarchy

| Token | Size / Line Height | Weight | Font | Usage |
|---|---|---|---|---|
| `{typography.display-xl}` | 48px / 1.1 | Bold (700) | Yatra One | Poster main fort title, splash banner |
| `{typography.display-lg}` | 36px / 1.15 | Regular (400) | Yatra One | Landmark modals, victory headers |
| `{typography.display-md}` | 24px / 1.2 | Regular (400) | Yatra One | Fort blueprint placards, modal titles |
| `{typography.display-sm}` | 18px / 1.25 | Regular (400) | Yatra One | In-flow brand title, feature card headers |
| `{typography.category-header}` | 9px / 1.0 | Bold (700) | Inter | Uppercase tracking category labels (`text-[9px] font-bold text-[#8D7666] uppercase tracking-wider`) |
| `{typography.title-sm}` | 12px / 1.3 | SemiBold (600) | Inter | Tool properties titles, outliner row names |
| `{typography.body-md}` | 14px / 1.4 | Regular (400) | Inter | General descriptions, help guidance |
| `{typography.body-sm}` | 12px / 1.4 | Regular / Medium | Inter | Slider labels, toggle text, helper hints |
| `{typography.caption}` | 10px / 1.3 | Medium (500) | Inter | Dimension readouts (`25 cm`), key badges (`Z`, `Y`, `X`) |

---

## The 5-Zone Decoupled HUD Architecture

To eliminate visual clutter and match the ergonomic standards of professional 3D authoring tools (Blender, ZBrush) while remaining approachable to casual builders, the screen is structured into **5 distinct, decoupled interface zones**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: PRIMARY APP MENU BAR (AppMenuBar.tsx) — Pinned Top-0 (H: 41px)                            │
├───────────────────────────────────────────────────────────────────────────────────┬────────────────┤
│ ZONE 2: SECONDARY TOP BAR (TopToolBar.tsx) — Pinned Top-[41px] (Minimizable)     │ Camera Presets │
├──────────────────────────┬───────────┬────────────────────────────────────────────┴────────────────┤
│ ZONE 3:                  │ ZONE 4:   │                                             │ ZONE 5:       │
│ LEFT TOOL PROPERTIES     │ VERTICAL  │                                             │ RIGHT SCENE   │
│ (LeftToolSidebar.tsx)    │ MODE BAR  │                                             │ OUTLINER &    │
│                          │ (ToolMode │            3D DIORAMA VIEWPORT              │ INSPECTOR     │
│ • Universal pre-use      │  Sidebar) │                                             │ (RightTool    │
│   properties             │           │                                             │  Sidebar.tsx) │
│ • Height/thickness/scale │ • Select  │                                             │               │
│ • Drafting controls      │ • Draw    │                                             │ • Scene Tree  │
│ • Unplaced feature specs │ • Fortify/│                                             │ • Selected    │
│ (Resizable 250-480px,    │   Transform│                                            │   Component   │
│  Minimizable)            │   Sculpt  │                                             │   Properties  │
│                          │ (W: 68px) │                                             │ (Resizable,   │
│                          │           │                                             │  Minimizable) │
├──────────────────────────┴───────────┴─────────────────────────────────────────────┴───────────────┤
│ ZONE 6: BOTTOM VIEWPORT STATUS & TIPS STRIP (BottomStatusBar.tsx) — Centered Floating Pill         │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Zone 1: Primary App Menu Bar (`AppMenuBar.tsx`)
- **Position**: Pinned to screen top (`top-0`, `left-0`, `right-0`). Height: **41px**.
- **Role**: Global application controls, brand anchor, document commands, language, undo/redo, night mode toggle, and export.
- **Components**:
  - *Brand Anchor*: Emblem shield + "The Killa Playground" (`Yatra One` 16px).
  - *Blueprint Selector*: Fort preset selector dropdown (Raigad, Janjira, Sinhagad, Custom).
  - *Desktop Menu*: `File`, `Edit`, `View`, `Language`, `Help` dropdown menus (collapses to slide-out drawer on `< xl`).
  - *Language Switcher*: Quick `EN` | `म` | `हि` pill selector.
  - *Undo / Redo*: Synchronous 15-slot history triggers (`Ctrl+Z`, `Ctrl+Y`).
  - *Diwali Night Diya Mode*: One-click toggle switching between sunny daytime courtyard and starlit night diorama illuminated by warm oil lamps.
  - *Toast Center*: Pinned auto-dismissing notifications with manual close (`✕`) button.

### 2. Zone 2: Secondary Top Tool Bar (`TopToolBar.tsx`)
- **Position**: Pinned below menu bar (`top-[41px]`). Height: **~40px** on desktop (single row), **~71px** on mobile/tablet (two rows).
- **Role**: Primary tool selection (Tools 1–6) and Soil pipeline tools (7–0), plus camera view angle presets and zoom.
- **Minimizable**: Yes. Clicking the minimize chevron (`▲`) collapses the bar and deploys the hanging folder guide tab (`[⛰️ Tools & Views ▾]`) at `top-[41px]`, expanding vertical viewport space.

### 3. Zone 3: Left Tool Properties Sidebar (`LeftToolSidebar.tsx`)
- **Position**: Docked left (`left-0`, `bottom-0`). Width: **250px to 480px** (default: `320px`), saved to `localStorage`.
- **Role**: Hosts **universal properties** affecting tools before usage, initial drafting settings, and unplaced feature parameters:
  - *Walls*: Wall height, thickness, corner auto-bastions, crenellations toggle, and active draft points with "Finish Wall" CTA.
  - *Spline*: Feature conversion type (`Stone Steps`, `Bhagwa Flags`, `Festive Diyas`), step rise/run/offset/spacing, and active draft controls.
  - *Terrain*: Global mud lock toggle and universal brush settings.
- **Tactile Resizing**: Right edge contains an 8px hoverable handle with 6 embossed grip dots (`w-1 h-1 rounded-full bg-[#8D7666]`).
- **Minimizable**: Yes. Header button (`[ ◂ ]`) collapses panel to `-translate-x-full` and deploys the hanging tab (`[⚙️ Properties ▾]`).

### 4. Zone 4: Vertical Tool Mode Strip (`ToolModeSidebar.tsx`)
- **Position**: Docked directly adjacent to the right edge of the Left Sidebar (`left: ${leftSidebarWidth}px` when open, `left: 0` when Left Sidebar is minimized). Width: **68px**.
- **Role**: Switches the active tool's operational mode in vertical icon + label orientation:
  - *Building*: `Select` (inspect & highlight), `Walls` (draft ramparts), `Foundation` (drag-to-build rectangular stone plinths), `Stairs` (draft walkable stepped stone masonry), `Fortifications` (snap bastions, towers, gates).
  - *Lighting*: `Place` (stamp diyas & fireworks), `Select` (inspect & test fireworks), `Transform` (camera-relative 3D nudge pad & heading), `Erase` (radius & outliner batch deletion).
  - *Figurines*: `Place` (stamp assets), `Select` (inspect & tweak), `Transform` (3D nudge & rotate), `Erase` (radius & outliner deletion).
  - *Texture*: `Paint` (apply texture), `Erase` (restore base soil).
  - *Foliage*: `Scatter` (cluster painting), `Single` (hero planting), `Erase` (radius pruning).
  - *Terrain*: 8 sculpting subtools (`Peak`, `Plateau`, `Ramp`, `Gorge`, `Trench`, `Smooth`, `Pond`, `Retexture`).
  - *View*: Mode strip automatically hides for clean, unobstructed diorama viewing.
- **Minimizable**: Yes. Header minimize button (`[ ◂ ]`) collapses strip and deploys hanging tab (`[🎯 Modes ▾]`).

### 5. Zone 5: Right Scene Outliner & Contextual Inspector (`RightToolSidebar.tsx`)
- **Position**: Docked right (`right-0`, `bottom-0`). Width: **260px to 460px** (default: `310px`), saved to `localStorage`.
- **Role**: Dual-pane scene organization and asset browsing:
  - **Upper Pane (`DIORAMA ELEMENTS`)**: Hierarchical tree listing placed structures and items:
    - *Building Tool*: Walls (with child bastions/towers/gates), Foundations, and Stairs.
    - *Lighting Tool*: Placed Diyas and Diwali Fireworks with counts and test actions.
    - *Figurine Tool*: Historical figurines, garrisons, architecture, and ordnance.
  - **Lower Pane (`ELEMENT PROPERTIES` or Asset Browser)**: Contextual inspector or catalog:
    - *Select & Transform Modes*: Displays unified `ELEMENT PROPERTIES` inspector (dimensions, height, offset, tiling, scale, heading, burst height for fireworks, duplicate, snap surface, focus camera, delete, and 3D nudge pad).
    - *Place Mode (Lighting)*: Displays the **Lighting Vault Asset Browser** (18 diyas, 10 fireworks, 3 categories, search, cards).
    - *Place Mode (Figurines)*: Displays the **Figurine Vault Asset Browser** (22 models across royalty, garrisons, architecture, and artillery).
    - *Texture & Foliage Tools*: Displays dedicated asset catalogs (52 textures, 117 flora species).
    - *Erase Mode*: Upper pane lists Placed Elements outliner for rapid single/batch deletion; lower pane renders clean inspector.
    - *View Tool*: Right sidebar is completely hidden for unobstructed viewing.
- **Tactile Resizing**: Left edge contains an 8px hoverable handle with 6 embossed grip dots.
- **Minimizable**: Yes. Header button (`[ ▸ ]`) collapses panel to `translate-x-full` and deploys hanging tab (`[🏰 Outliner ▾]`).

---

## UI Component Construction & Consistency Guidelines (For All New Elements)

To ensure that every new HUD element, panel, card, button, slider, or 3D handle matches the rest of the application seamlessly throughout development, all authoring agents and engineers must adhere to the following rules:

### Rule 1: Surface & Border Hierarchy
Never use pure white (`#FFFFFF`) or cold gray (`#F3F4F6`) for panels or containers:
- **Docked Sidebars**: Background `#F3EBE0`, outer border `1px solid #CDBCAB`, shadow `shadow-lg`.
- **Top Bars & Hanging Tabs**: Background `#E4D8CB`, border `1px solid #CDBCAB`, shadow `shadow-xs` / `shadow-sm`.
- **Inner Containers & Outliner Cards**: Background `#FAF8F5`, border `1px solid #D9C9B4`, rounded `rounded-xl`.
- **Selected Outliner Row / Active Item**: Background `#B85F45` (Terracotta) with text `#FAF8F5`, or subtle hover background `#EADECF`.
- **Panel Edge Tactile Resizing Grip**: Always include the 6-dot embossed grip on resizable edges:
  ```tsx
  <div className="flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="w-1 h-1 rounded-full bg-[#8D7666]" />
    ))}
  </div>
  ```

### Rule 2: Non-Colliding Minimized Hanging Guide Tabs
When panels or top bars are minimized, they MUST deploy hanging folder guide tabs that never overlap each other or open panels under any permutation. Follow this exact positioning matrix:

```
Permutation A: All Minimized
[⚙️ Properties ▾] (left: 8px)  [🎯 Modes ▾] (left: 114px)  ...  [⛰️ Tools & Views ▾] (right: 104px)  [🏰 Outliner ▾] (right: 8px)

Permutation B: Outliner Open + Top Bar Minimized
...  [⛰️ Tools & Views ▾] (right: ${rightSidebarWidth + 8}px)  │ [Right Outliner Panel]

Permutation C: Left Sidebar Minimized + Modes Strip Open
│ [Modes Strip (0-68px)] │  [⚙️ Properties ▾] (left: 76px) ...
```

- **Vertical Offset**:
  - If Secondary Top Bar is **open**: `top-[112px] xl:top-[81px]`
  - If Secondary Top Bar is **minimized**: `top-[41px]`
- **Tab Dimensions & Anatomy**:
  - Background: `#E4D8CB`, border: `border-x border-b border-[#CDBCAB] rounded-b-lg shadow-sm`.
  - Icon in `#8F4938`, label in `text-[11px] font-bold text-[#4B382C]`, chevron down in `#5C4638`.
  - Click feedback: `active:scale-95 transition-transform cursor-pointer`.

### Rule 3: Category Headers & Subsections
- **Category Header Label**: Always uppercase, small tracking, muted color:
  `text-[9px] font-bold text-[#8D7666] uppercase tracking-wider`
- **Main Tool Section Header**:
  ```tsx
  <div className="flex items-center justify-between pb-2 border-b border-[#D8C7B5]">
    <div className="flex items-center gap-1.5">
      <Icon className="w-4 h-4 text-[#8F4938]" />
      <span className="text-xs font-bold text-[#4B382C]">{title}</span>
    </div>
    <span className="text-[10px] font-bold text-[#8D7666] uppercase tracking-wider bg-[#E8DDD0] px-2 py-0.5 rounded-full">
      {badge}
    </span>
  </div>
  ```

### Rule 4: Parameter Sliders & Value Readouts
- Label: `text-[11px] font-medium text-[#5C4638]`.
- Readout: `text-[#8D7666] font-mono font-medium text-[11px]` formatted in physical diorama units (`cm`, `m`, `x`, `°`).
- Range Input Track:
  ```tsx
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={onChange}
    className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
  />
  ```

### Rule 5: Buttons & Action Hierarchy
- **Primary Creative Action** (e.g. "Finish Wall", "Confirm"):
  - Background: `#B85F45` (Terracotta) or `#4B382C` (Dark Brown), text: `#FAF8F5`, rounded: `rounded-xl`, shadow: `shadow-sm`.
- **Festive Final CTA** (e.g. "Finish Killa & Share", "Light Diyas"):
  - Background: `#E85D04` (Bhagwa Saffron), text: `#FFFFFF`, ring / glow: `ring-1 ring-[#D97706]`.
- **Secondary / Utility Button** (e.g. "Deselect", "Focus Camera"):
  - Background: `#FAF8F5`, border: `1px solid #D9C9B4`, text: `#4B382C`, hover: `hover:bg-[#EADECF]`.
- **Destructive Button** (e.g. "Delete Wall", "Delete Spline"):
  - Background: `#FEE2E2`, border: `1px solid #FCA5A5`, text: `#DC2626`, hover: `hover:bg-[#FEE2E2]/80`.

### Rule 6: Internationalization & Language Purity
- **CRITICAL**: NEVER hardcode Marathi words in parentheses inside English UI labels!
  - ❌ *Incorrect*: `"Battlements (Kangare)"`, `"Stone Steps (Payrya)"`, `"Watchtower (Buruj)"`
  - ✅ *Correct*: `"Battlements"`, `"Stone Steps"`, `"Watchtower"`
- Always retrieve user-facing text from `translations.ts` via `const { t } = useTranslation()`.
- Users who select Marathi (`म`) will receive authentic Marathi terminology (*"कांगरे"*, *"पायऱ्या"*, *"बुरूज"*), and Hindi users (`हि`) receive Hindi text. English must remain clean and universally accessible.

### Rule 7: 3D Interaction, Control Scheme & Pointer Guards
- **Permanent Left-Click Tool Dedication (`OrbitControls.mouseButtons.LEFT = -1`)**:
  - In all tool modes, left-click is strictly dedicated as the primary action (sculpting terrain, drafting wall paths, placing bastions, painting textures, scattering nature flora, selecting structures).
  - OrbitControls never intercepts left-click drag events (`mouseButtons.LEFT = -1`).
  - Right-click drag is permanently dedicated to camera orbiting/rotation (`mouseButtons.RIGHT = THREE.MOUSE.ROTATE`).
  - Middle-click drag is dedicated to camera panning (`mouseButtons.MIDDLE = THREE.MOUSE.PAN`).
  - Scroll wheel is dedicated to camera zooming.
- **Strict Pointer Button Guards on 3D Meshes**:
  Every 3D pointer handler on interactive geometry MUST start with:
  ```typescript
  if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
  ```
  before checking tool state, stopping propagation, or modifying selection.
- **Direct 3D Structure Interaction (`surfaceToolInteraction.ts`)**:
  - Drawing splines, painting textures, and scattering foliage directly on fort walls and spline structures must stop propagation (`e.stopPropagation()`) and temporarily disable OrbitControls during drag strokes, routing mutations to surface coordinates.
  - Non-interactive decorative meshes (billboards, water plane, courtyard bricks) must declare `raycast={() => null}` to prevent stealing pointer raycasts.
- **Hover Highlighting in Select and Transform Modes**:
  Interactive 3D geometry must highlight when hovered over in `select` and `transform` modes:
  - Cursor changes to `pointer` (`document.body.style.cursor = 'pointer'`).
  - Contour / edges geometry renders with `#E85D04` (Saffron glow) or amber hover ring (`HoverRing`).
  - Corresponding outliner row highlights bidirectionally with `#EADECF` background and `#B85F45` ring.
  - **CRITICAL**: Hover highlighting and cursor changes MUST BE DISABLED during `place` and `erase` modes to avoid distracting artifacts and tool confusion while stamping or sweeping the erase brush.
- **Physical Raycasting Only (Zero Ground Proximity Hijacking)**:
  Never check arbitrary radial proximity against empty terrain vertices to select structures. Raycast directly against the structure's physical 3D mesh (`mesh` / `instancedMesh`) so adjacent objects never cross-contaminate.
- **Selection Retention Across Modes**:
  Switching between `select` and edit modes (`fortify` on walls, `transform` on splines/figurines) must PRESERVE the active object ID, and immediately pre-activate the appropriate tool/stamp (e.g., default `Watchtower` stamp).

### Rule 8: Toast Notification Lifecycle
- Toast notifications deployed via `setToastMessage()` must automatically dismiss after **3.5 seconds**.
- The toast pill must feature an explicit close button (`✕`) so users can dismiss transient alerts immediately.

### Rule 9: Tool Properties Panel Anatomy & Card Container Discipline
To prevent visual clutter and maintain ergonomic consistency across all tool panels:
- **Reserved White Box Containers (`bg-[#FAF8F5]` / `border-[#D9C9B4]` rounded-xl):**
  - White container cards are strictly reserved for:
    1. **Top Section Header Badge** (e.g. `Texture Studio`, `Path Drafting`, `Wall Architecture`).
    2. **Active Item / Target Preview Cards** (e.g. Active Texture preview with image, name, and category; Selected Wall summary).
    3. **Primary Action Group Containers** (e.g. Finish / Cancel buttons, Flood / Clear buttons).
- **Direct Background Mounting for Property Sliders & Inputs:**
  - Sliders, number readouts, and toggles **MUST sit directly on the panel background (`bg-[#F3EBE0]`)**.
  - **NEVER** wrap individual property sliders inside separate white card containers.
  - Standard slider layout:
    ```tsx
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
        <span>Brush Radius</span>
        <span className="text-[#8D7666]">{radius.toFixed(1)}m</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={radius}
        onChange={(e) => setRadius(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
      />
    </div>
    ```

### Rule 10: Zero Duplication of Tool Mode Selectors
- **Single Source of Truth for Operational Modes:**
  - Operational mode switching (e.g. `Paint` / `Erase` for Texture; `Select` / `Draw` / `Transform` for Spline; `Select` / `Draw` / `Fortify` for Walls) belongs **strictly and exclusively** in the dedicated vertical floating strip: [`ToolModeSidebar.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/hud/ToolModeSidebar.tsx).
  - **NEVER duplicate mode selector buttons inside the Left Tool Properties Sidebar.**
  - The Left Sidebar should only display a tiny uppercase status badge in its header card reflecting the current active mode (e.g. `<span className="text-[10px] uppercase font-semibold text-[#8D7666]">{paintSubTool} mode</span>`).

### Rule 11: Mode-Specific Parameter Scoping
- A property panel must dynamically adapt its contents to show **only** controls relevant to the currently active subtool mode:
  - **Texture Tool:**
    - `Paint`: Brush Radius, Strength, Edge Falloff, Tiling Repeat, Flood Terrain, Clear Paint.
    - `Erase`: Brush Radius, Strength, Clear Paint (no Edge Falloff or Tiling sliders).
  - **Lighting Tool:**
    - `Place`: Placement Scale, Rotation Heading, Randomize Heading, Align to Normal, Elevation Offset.
    - `Select`: Element Properties (Scale, Heading, Burst Height for fireworks), Test Firework Burst CTA, Duplicate, Snap Surface, Delete.
    - `Transform`: 3D Nudge Pad, Heading Rotation, Uniform Scale, Snap Surface.
    - `Erase`: Brush Radius slider directly on `bg-[#F3EBE0]` + Clear All Lights button.
  - **Spline Tool / Stairs:**
    - `Draw`: Active points count, Finish Path CTA, Feature Type, Step dimension sliders.
    - `Select`: Selected path details, delete CTA.
    - `Transform`: Translate, rotate, and scale controls.
- Never show disabled or meaningless sliders for an operation (e.g., Tiling Repeat on an Eraser).

### Rule 12: Standardized Naming Conventions (No Jargon or Compound Labels)
- Use standard, simple, single-word property labels:
  - Use **`Strength`** instead of compound terms like `"Opacity & Flow"` or `"Pressure & Opacity"`.
  - Use **`Brush Radius`** instead of `"Brush Size (Meters)"`.
  - Use **`Edge Falloff`** instead of `"Hardness / Softness"`.
  - Use **`Tiling Repeat`** instead of `"UV Scale Multiplier"`.
- **No Decorative Filler Cards:** Never inject arbitrary filler boxes such as "Tabletop Diorama Tip" or "Pro Tip" cards at the bottom of tool panels. Every pixel in the properties drawer must serve functional authoring.

### Rule 13: Universal Mouse Wheel & Keyboard Shortcut Contracts
All interactive 3D tools must implement standard ergonomic wheel gestures, intercepted in the capture phase to prevent accidental camera zoom:
- `Shift + Scroll Wheel`: Adjust primary tool / brush radius (`paintBrushRadius`, `brushRadius`).
- `Ctrl + Scroll Wheel`: Adjust strength / speed slider (`paintBrushStrength`, `brushStrength`).
- `Alt + Scroll Wheel`: Adjust falloff / secondary parameter (`paintBrushFalloff`, `plateauHeight`, `slopeAngle`).
- `[` and `]`: Decrement / increment brush radius by `0.1m`.

### Rule 14: Clear Tool Taxonomy & Naming Contracts
- **Tool 4:** **`Texture`** (`id: 'texture'`) — dedicated to direct surface texture painting on the terrain diorama using the 52-texture PBR retro catalog.
- **Tool 7:** **`Paint`** (`id: 'paint'`) — strictly reserved for the upcoming organic soil crafting pipeline (for painting raw pigments / colors onto hand-sculpted mud structures).
- Always ensure top toolbars, status hints, keybindings, and translation entries respect this clean distinction.

### Rule 15: Contextual Right Sidebar: Scene Outliner vs. Asset Browser
- The Right Sidebar ([`RightToolSidebar.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/hud/RightToolSidebar.tsx)) is contextual:
  - For structural tools (Walls, Splines): Renders the hierarchical **Diorama Elements Outliner** and **Element Properties Inspector**.
  - For pure asset tools (Texture, Foliage): Renders the **Asset Browser** (e.g. Texture Browser with 52 textures, Foliage Browser with 117 species).
  - For hybrid tools (Figurines & Architecture, Lighting Studio):
    - **Place Mode**: Upper pane displays placed count and summary, lower pane renders the **Asset Vault Browser** (e.g. Figurine Vault with 22 models across 6 categories; Lighting Vault with 28 lights and fireworks across 3 categories). In the Left Sidebar, fireworks feature a dedicated Burst Height slider and "Randomize Burst Height" toggle switch (`bg-[#15803D]` / `bg-[#D9C9B4]`).
    - **Select & Transform Modes**: Upper pane renders the **Placed Elements Outliner** with instant search and 2-way hover highlighting; lower pane renders the unified **Element Properties Inspector** (scale, heading, burst height for fireworks, "Test Firework Burst" button, duplicate, snap surface, focus camera, delete, and 3D nudge pad).
    - **Erase Mode**: Left sidebar provides the Brush Radius slider with crimson diorama brush circle; Right sidebar displays the Placed Elements Outliner for rapid single/batch deletion.
- The Left Sidebar retains subtool parameter controls; the Right Sidebar handles asset browsing, outliner organization, and contextual inspection.

### Rule 16: Mandatory UI Consistency Verification Protocol
Before authoring or modifying any HUD component or tool sidebar:
1. **Inspect Existing Sibling Panels:** Open and read [`LeftToolSidebar.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/hud/LeftToolSidebar.tsx), specifically comparing against the clean, canonical Spline and Terrain panels.
2. **Consult `design.md` First:** Verify surface colors, text tokens, slider structures, and container rules.
3. **Verify in Browser:** After editing, use browser automation (`chrome-devtools`) to take screenshots of the tool panel and confirm visual harmony before completing tasks.

### Rule 18: Centered Quick-Action Diorama Bar (`QuickActionBar.tsx`)
- **Position & Mounting:**
  - A tactile floating pill mounted centered directly above `BottomStatusBar.tsx` (`bottom-12 md:bottom-10 left-1/2 -translate-x-1/2 z-30`).
  - Contains 5 distinct action buttons:
    `[ ☀️ Day | ▶ Play | ⏸ Pause | 📷 Screenshot | 🌙 Night ]`
  - Uses the warm plaster background (`bg-[#F2EBE1]/95 border border-[#D9C9B4] rounded-full shadow-md`).
- **Interactive States & Highlights:**
  - `Day` active: Button highlighted in `#F59E0B` (Amber) or `#EADECF` pill background.
  - `Play` active: Button highlighted in `#E85D04` (Bhagwa Saffron) with subtle pulse ring.
  - `Night` active: Button highlighted in `#23211E` with `#F59E0B` flame icon.
- **Decoupled Ambient Animation:**
  - Tree wind sway and particle emitters MUST attach their clock updates strictly to the `isPlaying` state.
  - Pausing freezes all movement immediately; playing drives continuous 60 FPS motion without requiring mouse moves.
- **Direct Viewport Screenshot:**
  - Clicking `Screenshot` momentarily toggles a capture state that sets `opacity-0 pointer-events-none` on all UI overlays, captures the WebGL drawing buffer via `preserveDrawingBuffer`, triggers an immediate browser file download (`killa-diorama-<timestamp>.png`), and restores the HUD.

### Rule 19: Diorama & Sun View Tool (`view`) & Spectator Architecture
- **Unobstructed Spectator Viewport:**
  - Zero raycast hit detection on structures or terrain: clicking or dragging anywhere in the canvas navigates the camera without placing, selecting, or deleting components.
  - Infinite white grid `<Grid infiniteGrid />` permanently removed across all tools to provide an authentic tabletop courtyard diorama feel.
- **Dedicated View Tool Properties Panel:**
  - **Time Presets**: One-click quick-time buttons: Dawn (06:00), Noon (12:00), Golden Hour (17:30), and Diwali Night (21:00).
  - **Time of Day Slider**: Continuous 24-hr slider (0:00 to 24:00) controlling diurnal color grading, sun/moon trajectory, and automatic diya ignition.
  - **Sun / Moon Direction**: Sun Elevation (-10° to 90°) and Sun Azimuth (0° to 360°) sliders for real-time shadow direction across ramparts and courtyards.
  - **Camera Perspectives**: Quick angle buttons: Isometric (45°), Bird's Eye (90° Top-Down), Rampart Eye (15° Low Hero View), Bastion Hero (30° Citadel Corner), and Home Reset.
  - **Camera Lens FOV**: Slider adjusting focal length between 20° (Telephoto / isometric compression) and 80° (Wide-Angle / dramatic perspective), with 45° Standard default.
  - **Celebration Fireworks Salvo**: Dedicated 5-second salvo test button that triggers all placed fireworks across the diorama for 5 seconds regardless of time, with a 5-second disable cooldown.
- **Tool Mode Strip (View Tool):**
  - **Orbit Spectator Mode (`orbit`)**: Free 360° orbital rotation, panning, and zooming.
  - **Turntable Exhibition Mode (`spin`)**: Continuous 360° auto-spin exhibition for showcases and screen recording.
- **Consistent Iconography & Micro-Interactions:**
  - All left panel tool headers and actions use professional Tabler React icons (`react-icons/tb`) instead of inconsistent operating system emojis.

### Rule 20: 2-Phase Foundation Plinth Builder & Fortification Ergonomics
- **2-Phase Drafting Workflow:**
  - *Phase 1 (Footprint):* Drag diagonally across terrain to define length and width; a translucent amber ghost (`#F59E0B`, opacity: 0.4) renders the real-time bounds.
  - *Phase 2 (Normalized Height):* Upon releasing the base, the mouse vertically extrudes the slab height at normalized sensitivity (`0.008`). Primary click confirms and creates the slab.
  - *Negative Depth:* Supports negative height down to `-10.0m` (extending below the terrain surface for cistern basins and sunken foundation trenches).
  - *Draft Cancellation:* Tool properties header provides an inline `[✕]` button (`title="Cancel Draft"`) to abort active drafting cleanly.
- **Fortification Alignment:**
  - *Round Bastions (`round_bastion`):* Semicircular bastions must align their flat base diameter flush on the outer wall edge (`edgeX = attachX + outNorm.x * halfThick`), preserving rampart walkway transit while protruding defensively outward.
  - *Authentic Crenellations:* Round bastions must render 3D pointed Kangare battlements with shoulders matching watchtowers.

### Rule 21: Project Hub & Modal Launchpad Anatomy (`ProjectHubModal.tsx`)
- **Modal Container & Surfaces:**
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm`.
  - Outer Container: `bg-[#FAF8F5] border border-[#CDBCAB] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden`.
  - Header Banner: Warm gradient `bg-gradient-to-r from-[#8F4938] to-[#B85F45] text-[#FAF8F5] p-5`. Title rendered in `font-['Yatra_One'] text-2xl` with subtle subtitle.
- **Tabbed Navigation Strip:**
  - Background `bg-[#F3EBE0] border-b border-[#CDBCAB] p-2 flex gap-1.5`.
  - Active Tab: `bg-[#4B382C] text-[#FAF8F5] shadow-xs`.
  - Inactive Tab: `text-[#5C4638] hover:bg-[#E4D8CB]/80`.
- **Card Anatomy & Interactivity:**
  - Blueprint & project cards: `bg-[#F3EBE0]/60 border border-[#D9C9B4] hover:border-[#B85F45] rounded-xl p-3.5 transition-all`.
  - Selected / Active Card: `border-[#B85F45] bg-[#B85F45]/10 ring-1 ring-[#B85F45]`.

### Rule 22: Terrain Studio Drawer Anatomy & Direct Slider Mounting (`TerrainStudioDrawer.tsx`)
- **Live Viewport Drawer Mounting:**
  - Docked left edge drawer (`left-0 bottom-0 z-30`) allowing uninterrupted 3D diorama viewing while tweaking terrain parameters.
  - Background `bg-[#F3EBE0] border-r border-[#CDBCAB] shadow-xl`.
- **Direct Slider Mounting (Rule 9 Enforcement):**
  - All parameter sliders (Tableland Width, Peak Elevation, Cliff Steepness, Crags & Roughness, Stepped Mountain Tiers) **MUST sit directly on the panel background (`bg-[#F3EBE0]`)**.
  - **NEVER** wrap individual property sliders in white cards.
- **Interactive Sliding Toggle Switch Anatomy:**
  - Never use ambiguous text buttons ("Active" / "Inactive") for binary features like the water plane.
  - Always use an authentic sliding toggle track with smooth thumb translation:
    - Track (Active): `w-11 h-6 bg-[#15803D] rounded-full p-0.5 transition-colors duration-200 ease-in-out`.
    - Track (Inactive): `w-11 h-6 bg-[#D9C9B4] rounded-full p-0.5 transition-colors duration-200 ease-in-out`.
    - Sliding Thumb: `w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`.
- **Standard Concise Labels:**
  - Use clear, professional terminology: `Stepped Mountain Tiers`, `Water Plane`, `Tableland Width`.

### Rule 23: Terrain Change Confirmation Modal Anatomy (`TerrainChangeConfirmModal.tsx`)
- **Destructive Action Safety Guard:**
  - Changing base fort terrain while structures exist displays a high-visibility confirmation alert:
  - Header: Warning badge with amber icon (`TbAlertTriangle` in `#F59E0B`).
  - Itemized Summary: Displays counts of placed elements that will be cleared (walls, foundations, stairs, foliage, figurines, diyas, fireworks).
  - Actions:
    - Confirm Destructive CTA: `bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded-xl shadow-sm`.
    - Cancel CTA: `bg-[#FAF8F5] border border-[#D9C9B4] text-[#4B382C] hover:bg-[#EADECF] rounded-xl`.

---

## 3D Textures & Material Tokens

All diorama assets follow the **Modern Retro / PS1 (Flavor A)** visual standard: crisp 128×128 pixel-art textures with diffuse maps encoded in `THREE.SRGBColorSpace` and filtered with `THREE.LinearMipmapLinearFilter` under dynamic PBR sunlight (0.0 metalness, 0.90 roughness):

| Structure Part | Texture Asset Directory | Material Group | PBR Maps | Visual Character |
|---|---|---|---|---|
| **Wall & Tower Sides** | `/textures/Bricks/mossy_stone_brick_128x128_pbr` | Group 0 | diffuse, normal, roughness, ao | Aged Deccan basalt masonry with subtle moss growth |
| **Walkways & Tower Floors** | `/textures/Bricks/dark_stone_floor_128x128_pbr` | Group 1 | diffuse, normal, roughness, ao | Dressed basalt paving slabs for ramparts and decks |
| **Crenellations (*Kangare*)** | `/textures/Bricks/dark_stone_texture_128x128_pbr` | Group 2 | diffuse, normal, roughness, ao | Solid carved dark stone merlons and arch soffits |
| **Foundation Sides** | `/textures/Bricks/mossy_stone_brick_128x128_pbr` | Group 0 | diffuse, normal, roughness, ao | Solid stone brick foundation perimeter skirting |
| **Foundation Top Deck** | `/textures/Bricks/dark_stone_floor_128x128_pbr` | Group 1 | diffuse, normal, roughness, ao | Flat dressed basalt floor slab deck with UV repeat |
| **Stone Stairs (*Payrya*)** | `/textures/Bricks/mossy_stone_brick_128x128_pbr` | Procedural | diffuse, normal, roughness, ao | Stepped horizontal stone blocks ascending slopes |
| **Courtyard Soil** | `/textures/Dirt/Dirt_03` | Terrain Splat 0 | diffuse, normal, roughness, ao | Sun-baked red laterite (*Tambdi Maati*) |
| **Rock Escarpments** | `/textures/Rock/Rock_02` | Terrain Splat 1 | diffuse, normal, roughness, ao | Sheer cliff rock face with triplanar vertical blend |
| **Pond & Moat Water** | `/textures/Water/blue_tarp_texture_128x128_pbr` | Water Shader | diffuse, normal, roughness, ao, metallic | Crinkled blue plastic sheet with specular ripples |

---

## Atmospheric Lighting & Diurnal Solar Arc Tokens (`atmosphericLighting.ts`)

The diorama's lighting dynamically grades across the 24-hour solar arc with 7 master keyframes calibrated to authentic Sahyadri weather and festive Diwali nightfall:

| Diurnal Phase | Keyframe Time | Sun / Moon Color | Sun Intensity | Ambient Fill | Ambient Intensity | Hemi Sky / Ground | Tone Exposure | Atmosphere & Sky Character |
|---|---|---|---|---|---|---|---|---|
| **Dawn** | `06:00` | `#FDBA74` (Warm rose-gold) | `1.55` | `#64748B` (Cool morning slate) | `0.60` | `#94A3B8` / `#B45309` | `1.20` | Soft peach-rose morning sun with elongated ethereal shadows; peach horizon mist (`#FED7AA`). |
| **Solar Noon** | `12:00` | `#FFFDF0` (Crisp white-gold) | `1.65` | `#E0F2FE` (Open blue sky) | `0.68` | `#BAE6FD` / `#9A3412` | `1.20` | Maximum clarity, short vertical shadows, radiant courtyard mud radiance (`#FED7AA`). |
| **Golden Hour** | `17:30` | `#F59E0B` (Radiant golden amber) | `2.80` | `#FB923C` (Warm golden fill) | `0.85` | `#FDBA74` / `#C2410C` | `1.30` | Sun 30 mins before sunset (elevation `20°`, azimuth `255°`); saturated laterite mud GI bounce (`#EA580C`, 0.90); fiery sunset dust (`#9A3412`). Diyas ignite. |
| **Dusk** | `18:48` | `#FB7185` (Rose-gold afterglow) | `1.35` | `#4338CA` (Deep indigo twilight) | `0.55` | `#6366F1` / `#7C2D12` | `1.22` | Post-sunset violet afterglow; deep indigo mist fog (`#1E1B4B`). |
| **Full Moon Diwali Night** | `21:00` / `00:00` | `#E0F2FE` (Luminous silvery-white) | `1.35` | `#475569` (Slate/indigo ambient fill) | `0.85` | `#93C5FD` / `#1E293B` | `1.28` | Authentic full moon landscape: silvery-cyan moonlight, indigo shadow fill, no pitch-black voids. All terrain, cliffs, and walls clearly visible; warm diyas sparkle with 3D point light. |

### Diya Flame & Volumetric Glow Tokens
- **Flame Teardrop Mesh**: Color `#FFAA00`, Emissive `#FF7700` (`emissiveIntensity: 2.2` with organic wind sway and breathing flicker).
- **Flame Inner Core**: White-hot `#FFFBEB` (`opacity: 0.95`).
- **Volumetric Billboard Halo Sprite**: Camera-facing radial additive bloom (`scale: [0.16, 0.16, 0.16]`, gradient `rgba(255, 255, 230, 0.95)` to `rgba(200, 40, 0, 0.0)`).
- **3D Omnidirectional PointLight**: Pre-allocated `#FFA533` (`decay: 2.0`, `distance: 2.2m–4.8m`, `intensity: 1.65–2.5x`) providing real-time PBR illumination onto nearby fort walls, ramparts, bastions, figurines, and slopes.

---

## Do's and Don'ts

### Do
- **Anchor on the warm courtyard canvas (`{colors.canvas}` — `#F9F6F0`).**
- **Follow the 5-zone decoupled HUD layout.** Universal settings in the Left Sidebar, modes in the vertical Mode Strip, scene tree and inspectors in the Right Sidebar.
- **Mount property sliders directly on the panel background (`bg-[#F3EBE0]`).** Reserve white containers only for headers and active item preview cards.
- **Maintain non-colliding minimized tabs.** Coordinate dynamic positions using store-backed sidebar widths.
- **Check `e.button === 0` on every 3D interactive mesh.** Never let right-click pan trigger object selection.
- **Use `Yatra One` for all display titles and fort names.** Pair with `Inter` for technical UI controls.
- **Use `dark_stone_floor_128x128_pbr` for all structure walkways and floor decks.**
- **Use `useTranslation()` for all UI strings.** Keep English UI clean without Marathi parenthetical labels.
- **Use `Strength` instead of `Opacity & Flow`.**
- **Support `Shift/Ctrl/Alt + Scroll Wheel` shortcuts on all 3D tools.**
- **Check existing sibling panels (e.g. Spline tool) and `design.md` before authoring any new UI.**
- **Use real sliding toggle switches with smooth sliding knobs for binary feature states (like water plane).**
- **Prompt confirmation before destructive base terrain changes if existing structures are present.**

### Don't
- **Don't use cold corporate gray (`#F3F4F6`, `#E5E7EB`) or pure black (`#000000`).**
- **Don't wrap individual property sliders in white card containers.**
- **Don't duplicate mode selectors inside the Left Tool Sidebar.**
- **Don't show mode-irrelevant sliders (e.g. Tiling Repeat on an Eraser).**
- **Don't insert decorative filler or tip cards into tool property panels.**
- **Don't use ambiguous text buttons (e.g., Active/Inactive) for binary toggles.**
- **Don't silently clear or displace existing placed structures when base terrain changes.**
- **Don't let minimized tabs overlap each other or open sidebars.**
- **Don't let minimized tabs overlap each other or open sidebars.**
- **Don't select 3D objects with right-click or middle-click.**
- **Don't use coarse ground proximity radius checks that hijack clicks near splines or walls.**
- **Don't hardcode Marathi in parentheses in English labels.**
- **Don't lose active object selection when transitioning from Select to Fortify or Transform.**
- **Don't introduce mipmap blurring on retro textures.** Always configure `tex.minFilter = THREE.NearestFilter; tex.magFilter = THREE.NearestFilter`.
