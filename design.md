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

### Surface Tokens & 3-Tier Studio Hierarchy

The studio interface implements a rigorous **3-tier surface hierarchy** (de-beiging overhaul) inspired by professional DCC environments (Blender, Unreal Engine 5, ZBrush) adapted with authentic Indian mineral earth tones:

| Tier / Token | Hex | Role & Visual Expression |
|---|---|---|
| **Level 1 Canvas** `{colors.canvas}` | `#F4F1EA` | Viewport backdrop, application floor, sun-bleached courtyard ground. (`#1A1816` in Night Diya mode). |
| **Level 2 Panels & Docks** `{colors.surface-base}` | `#EBE6DC` | Docked tool sidebars, floating mode rails, App Menu Bar, Top Tool Bar, Bottom Dock, and Modal containers. Framed by a precise 1px hairline border (`#D8D1C5`) and `shadow-xs`. |
| **Level 3 Active Surfaces** `{colors.surface-dark}` | `#2B2621` | High-contrast basalt dark stone for active tool modes, selected tabs, pressed pill buttons, and focused items, paired with crisp white text (`#FAF8F5`). |
| **Nested Cards** `{colors.surface-card}` | `#FAF8F5` | Secondary content cards, asset tiles, and inspector property boxes, bordered by `#D8D1C5` hairline. |
| **Elevated Surfaces** `{colors.surface-strong}` | `#D8D1C5` | Hovered items, active button hover states, dragged handles. |
| **Hairline Dividers** `{colors.border-subtle}` | `#D8D1C5` | Subtle 1px dividers within headers, docks, and property groups. Replaces muddy beige borders. |

### Accent & Semantic Tokens

| Token | Hex | Role & Visual Expression |
|---|---|---|
| `{colors.terracotta}` | `#B85F45` | Primary CTA, active selection ring, finished wall indicator, primary slider thumb accent. |
| `{colors.terracotta-hover}` | `#A24F37` | Hovered state for primary terracotta CTAs. |
| `{colors.bhagwa}` | `#E85D04` | Festive saffron highlight, celebratory badge, royal flag accent. |
| `{colors.bhagwa-glow}` | `#FF7722` | Saffron hover state and glowing marigold highlights. |
| `{colors.success}` | `#15803D` | Valid snap placement, safe 3D position, saved project indicator. |
| `{colors.warning}` | `#D97706` | Unsnapped hovering preview, non-destructive caution, drying mud advisory. |
| `{colors.error}` / Destructive | `#DC2626` | Destructive actions (Delete wall/component/project, wipe terrain), error notifications. |
| `{colors.info}` | `#0284C7` | Blueprint guide tooltip, step hints, water tool suggestion. |

### Normalized Border Radii

| Tier | Radius | Target Components |
|---|---|---|
| **Controls** | `8px` (`rounded-lg` / `rounded-md`) | Buttons, inputs, dropdown items, slider tracks/thumbs, status chips. |
| **Cards** | `12px` (`rounded-xl`) | Content containers, asset preview tiles, floating quick bars, outliner rows. |
| **Panels** | `16px` (`rounded-2xl`) | Left and right docked tool drawers, bottom tool shelf, contextual docks. |
| **Modals** | `20px` (`rounded-[20px]`) | Centered modal windows (Startup, Project Hub, Shortcuts, About, Confirmation dialogs). |

---

## Typography & Iconography

### Font Families & Roles
1. **Primary UI Engine:** **`Inter`**
   * Standardized across all UI menus, toolbars, sidebar panels, modals, outliner trees, buttons, dropdowns, and micro-copy.
   * Delivers crisp legibility, tight tracking, and optical neutrality across high-density DCC layouts.
   * **Tabular Numerals for Numeric Readouts:** All dimension displays, coordinates, percentages, and slider values use `tabular-nums font-mono text-[11px]` to eliminate layout jitter during active dragging.
2. **Authentic Cultural Display:** **`Yatra One`** (Google Fonts, OFL)
   * Hand-carved Devanagari/Latin architectural voice inspired by traditional Maharashtra fort signage and temple masonry.
   * **Strict Usage Discipline:** Reserved exclusively for high-impact brand/display elements:
     - AppMenuBar brand mark ("The Killa Playground")
     - Large modal hero headers and landmark title placards
     - Generated festive poster title plaques
   * *Never used for buttons, menu items, sidebar tabs, or property controls.*
3. **Playful Celebratory Display:** **`Modak`** (Google Fonts, OFL)
   * Celebratory chunky display font reserved exclusively for festive greeting banners and Diwali celebratory popovers.

### 5-Tier Typography Scale

| Tier | Size / Line Height | Weight | Font | Primary Usage |
|---|---|---|---|---|
| **Display XL** | 48px / 1.1 | Bold (700) | Yatra One | Exported festive poster main fort title, splash hero |
| **Display LG** | 32px / 1.15 | Regular (400) | Yatra One | Landmark modals, victory headers, celebratory splash |
| **Display MD** | 20px / 1.2 | Regular (400) | Yatra One | Fort blueprint placards, modal dialog titles |
| **Title SM** | 13px / 1.3 | SemiBold (600) | Inter | Panel section headers, modal card titles, outliner groups |
| **Body SM** | 12px / 1.4 | Medium (500) | Inter | Buttons, tool options, labels, dropdown menu items |
| **Micro / Readout** | 11px / 1.2 | Regular (400) | Inter / Mono | Helper hints, shortcuts, slider values (`tabular-nums font-mono`) |
| **Category Header** | 9-10px / 1.0 | SemiBold (600) | Inter | Uppercase section tracking tags (`tracking-wider uppercase text-[#7C7267]`) |

### Iconography: Standardized Lucide Icons
All HUD components, toolbars, sidebars, and modals use **`lucide-react`** exclusively:
- **Geometry & Stroke**: Standard controls use `size={16}` (16×16px) with `strokeWidth={1.75}` for crisp, balanced line weights on both standard and Retina displays.
- **Docks & Primary Tools**: Main tool shelves and bottom docks use `size={18}` with `strokeWidth={1.75}`.
- **Hero Icons**: Modal headers use `size={20}` or `size={24}` with `strokeWidth={1.5}` or `1.75`.
- **Zero Legacy Icons**: No `react-icons/tb` (Tabler) or ad-hoc emoji icons remain in the HUD architecture. Third-party brand logos (WhatsApp, X) are implemented as clean 16px inline SVG path components using `currentColor`.

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
│ ZONE 6: UNIFIED VIEWPORT BOTTOM TOOLBAR (ViewportBottomBar.tsx) & CONTEXTUAL KEYCAPS               │
│ • Floating In-Canvas Modifier Keycaps (ContextualKeycaps.tsx, bottom-16)                           │
│ • Unified Viewport Dock: Camera Presets (Iso, Top, Rampart, Home) + Actions (Day/Night, Play, etc)│
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
  - *Undo / Redo / Reset Quick Actions*: Synchronous history triggers (`Ctrl+Z`, `Ctrl+Y`) and canvas reset.
  - *Minimize All / Maximize All Quick Actions*: Instant panel collapse (`Minimize2`) and panel expand (`Maximize2`) buttons for distraction-free diorama drafting.
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

### 6. Zone 6: Unified Viewport Bottom Toolbar & Contextual Keycaps
- **`ViewportBottomBar.tsx`**:
  - *Position*: Anchored bottom-center (`bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30`).
  - *Cluster 1 (Camera Perspectives)*: `[Isometric (45°)]` • `[Bird's Eye / Top (90°)]` • `[Rampart Eye (15°)]` • `[Home (Focus)]`.
  - *Cluster 2 (Environment & Actions)*: `[Day / Night (N)]` • `[Play / Pause (Space)]` • `[360° Turntable Spin]` • `[Instant Snapshot (F12)]` • `[Present (P)]` (highlighted in `#B85F45` terracotta).
  - *Micro-Tooltips & Localization*: Trilingual support (`en`, `mr`, `hi`) with keyboard shortcut badges.
  - *Re-export*: Re-exported as `DioramaQuickBar` for 100% backward compatibility across existing call sites.
- **`ContextualKeycaps.tsx`**:
  - *Position*: Floating keycap capsule anchored at `bottom-16` (`z-30`) directly above the viewport toolbar.
  - *Dynamic Context*:
    - Sculpting: `[Drag] Elevate • [Ctrl+Drag] Lower • [Shift+Scroll] Radius`
    - Foliage: `[Drag] Scatter • [Alt+Drag] Erase • [Shift+Scroll] Radius`
    - Walls & Spline: `[Click] Add Node • [Enter] Finish Wall • [Esc] Cancel`
    - Figurines & Lights: `[Click] Place Figurine • [Shift+Scroll] Scale • [Ctrl+Scroll] Rotate`
    - View Tool: `[Drag] Orbit • [Middle Drag] Pan • [Scroll] Zoom`
  - *Dismissibility*: Auto-dismisses during presentation mode, screenshots, or open modals; includes an inline `✕` button.
- **`PresentationGlassBar.tsx`**:
  - *Position*: Floating minimalist dark stone glass capsule (`bg-[#2B2621]/85 backdrop-blur-xl border border-white/20`) active during 1-click presentation mode (`P`).
  - *Capabilities*: Camera presets, turntable spin, diurnal toggle, high-res snapshot, poster studio shortcut, and `[Esc] Exit Presentation` pill.
  - *Interaction Guard*: Controls auto-switch to View mode; left drag strictly orbits camera; tool pointer actions are disabled; exiting restores origin tool.

---

## UI Component Construction & Consistency Guidelines (For All New Elements)

To ensure that every new HUD element, panel, card, button, slider, or 3D handle matches the rest of the application seamlessly throughout development, all authoring agents and engineers must adhere to the following rules:

### Rule 1: Surface & Border Hierarchy (3-Tier Discipline)
Never use pure stark white (`#FFFFFF`) or cold artificial gray (`#F3F4F6`) for panels or containers:
- **Level 2 Docked Sidebars & HUD**: Background `#EBE6DC`, outer border `1px solid #D8D1C5`, shadow `shadow-xs`.
- **Top Bars & Hanging Tabs**: Background `#EBE6DC`, border `1px solid #D8D1C5`, shadow `shadow-xs`.
- **Inner Containers & Outliner Cards**: Background `#FAF8F5`, border `1px solid #D8D1C5`, rounded `rounded-xl`.
- **Level 3 Active Surfaces & Selections**: Background `#2B2621` (Basalt) with text `#FAF8F5`, or `#B85F45` (Terracotta) for primary actions and active selection rings. Subtle hover uses `#D8D1C5`.
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
- **Reserved White Box Containers (`bg-[#FAF8F5]` / `border-[#D8D1C5]` rounded-xl):**
  - White container cards are strictly reserved for:
    1. **Top Section Header Badge** (e.g. `Texture Studio`, `Path Drafting`, `Wall Architecture`).
    2. **Active Item / Target Preview Cards** (e.g. Active Texture preview with image, name, and category; Selected Wall summary).
    3. **Primary Action Group Containers** (e.g. Finish / Cancel buttons, Flood / Clear buttons).
- **Direct Background Mounting for Property Sliders & Inputs:**
  - Sliders, number readouts, and toggles **MUST sit directly on the Level 2 panel background (`bg-[#EBE6DC]`)**.
  - **NEVER** wrap individual property sliders inside separate white card containers.
  - Standard slider layout:
    ```tsx
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
        <span>Brush Radius</span>
        <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{radius.toFixed(1)}m</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={radius}
        onChange={(e) => setRadius(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
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

### Rule 19: Unified Pill-in-Pill Language Selector (`LanguageSelector.tsx`)
To maintain visual consistency and eliminate fragmented implementations across the studio:
- **Single Source of Truth:** All language selection across the application MUST use the unified [`LanguageSelector.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/common/LanguageSelector.tsx) component. Never write ad-hoc inline language button arrays.
- **Pill-in-Pill Geometry:**
  - Outer container: `inline-flex items-center bg-[#EBE6DC] p-0.5 rounded-full border border-[#D8D1C5] select-none shadow-xs font-sans`.
  - Inner language buttons: True pills (`rounded-full`) formatted with `px-2.5 py-0.5 text-[11px] font-semibold`.
  - Active button: Level 3 basalt dark stone (`bg-[#2B2621] text-[#FAF8F5] shadow-xs`).
  - Inactive button: `text-[#7C7267] hover:text-[#2B2621] hover:bg-[#D8D1C5]/60`.
  - Both container and selection highlight MUST be `rounded-full` (eliminating the "square in pill" visual defect).
- **Mounted Locations:** Standardized across App Menu Bar, Startup Modal, Poster Studio Modal, and Top Navigation Bar.
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

### Rule 24: Zero-Jank Viewport Interaction & Demand Frameloop Ergonomics
- **Camera Navigation & Magnetic Isolation:**
  - Pointer moves with active buttons (`e.buttons !== 0`) MUST bypass magnetic snapping, hover detection, and raycast projection (e.g. `if (e.buttons !== 0) return;` in fortify mode and terrain handlers), ensuring right-click and middle-click camera orbiting and panning remain completely fluid at 60 FPS without calculation spikes.
  - Sub-centimeter delta and snap equality guards (`Math.abs(prev[i] - next[i]) < 0.005`) MUST gate preview state changes to prevent unnecessary React and Zustand notifications.
- **Static Shared Hologram & Marker Geometry Tokens:**
  - Drafting markers and holographic snap previews MUST use pre-allocated static shared geometries and materials:
    - Snapped Wall Hologram: `{colors.success}` (`#10B981`) with static wireframe geometry (`holoRingGeo`, `holoTowerGeo`, `holoBoxGeo`).
    - Unsnapped / Free Hologram: `{colors.warning}` (`#F59E0B`) with static wireframe geometry.
    - Draft Path Node: Static `#10B981` (start loop) and `#F59E0B` (intermediate) shared spheres.
  - Geometry and material instances MUST NEVER be dynamically created (`new THREE.CylinderGeometry(...)`) inside per-frame render passes or pointermove callbacks.
- **Decoupled Frameloop & Auto-Pause on Tool Switch:**
  - To preserve ultra-responsive tactile editing and eliminate GPU/battery drain during construction, the viewport operates under `<Canvas frameloop="demand">` during normal editing.
  - Switching primary tools (e.g. from Terrain to Building, Texture, Foliage, Figurine, or Lighting) MUST automatically pause animation playback (`isPlaying = false`), restoring demand rendering.
  - Switching subtools or operational modes within the same tool (e.g. Draw to Fortify, Peak to Plateau, Place to Transform) MUST preserve active playback continuity without interrupting user preview.
  - Continuous rendering (`frameloop="always"`) is strictly reserved for active playback (`isPlaying = true`), turntable auto-spin, and festive night exhibition viewing.
- **Continuous Drag Cadence Throttling:**
  - High-frequency drag tools (foliage scatter, foliage erase, terrain sculpt) MUST throttle continuous updates to a calibrated 35ms / 0.05m movement cadence, preventing redundant geometry modifications, spatial queries, or GC spikes during rapid sweeps.

### Rule 25: Festive Poster Studio Modal Anatomy (`PosterStudioModal.tsx`)
- **Modal Container & Surfaces:**
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none`.
  - Outer Container: `bg-[#EBE6DC] border-2 border-[#D8D1C5] rounded-2xl shadow-2xl max-w-6xl w-full h-[92vh] max-h-[960px] overflow-hidden flex flex-col text-[#2B2621]`.
  - Header: Clean, unified top banner with "Festive Fort Poster Studio" (`text-base font-bold text-[#2B2621]`), language switcher pill (`EN` | `म` | `हि`) matching `AppMenuBar`, and `[✕]` close button. Header MUST NOT include decorative subtitles or technical pixel dimensions (e.g. `1080 x 1350 HD`).
- **2-Column / Responsive Split Studio Workspace:**
  - **Desktop (≥ 768px)**: 2-column horizontal split workspace with left preview canvas and right inspector panel.
  - **Mobile (< 768px)**: Responsive vertical split workspace (`flex-col`):
    - Upper half (`h-[40vh]` / `h-[42vh]`): Dedicated dark basalt viewing mat (`bg-[#1E1915]`) centering the 4:5 portrait poster frame (`aspectRatio: '1080 / 1350'`, `height: 100%`, `maxWidth: 100%`, `width: auto`), guaranteeing 100% visibility of the entire poster without vertical scrolling.
    - Lower half (`flex-1 min-h-0`): Houses the segmented tab switcher (`[ Slots & Layout ]`, `[ Poster Style ]`), scrollable controls, and sticky bottom action dock.
  - **Preview Floor & Synchronized Canvas**:
    - Dedicated dark basalt viewing mat (`bg-[#1E1915] p-3 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden min-h-0`).
    - Strict 4:5 aspect portrait poster frame (`aspectRatio: '1080 / 1350'`) with 100% visible bounds and smooth canvas containment.
    - **Synchronized Slot Selection Overlay**:
      - Renders an interactive CSS/DOM overlay aligned precisely to normalized slot rectangles (`calculateGridSlotRects`).
      - Active slot displays prominent terracotta corner brackets (`border-t-2 border-l-2`, `border-t-2 border-r-2`, `border-b-2 border-l-2`, `border-b-2 border-r-2` in `#E85D04` with drop shadow) and a floating `SLOT X` badge.
      - **Direct Canvas Interaction**: Each slot is directly clickable, focusing that slot in the inspector.
      - **Zero Export Contamination**: Brackets and hotzones live strictly in the DOM overlay and never touch the canvas buffer, guaranteeing 100% clean poster exports.
  - **Right Studio Column (Streamlined Studio Inspector & Pinned Dock)**:
    - Fixed-width panel (`w-full md:w-[380px] lg:w-[420px] bg-[#EBE6DC] border-t md:border-t-0 md:border-l border-[#D8D1C5] flex flex-col h-full overflow-hidden shrink-0`).
    - **Top Tab Switcher**: Segmented toggle between `[ Slots & Layout ]` (`LayoutGrid` icon) and `[ Poster Style ]` (`Palette` icon), eliminating the previous 1,879px vertical scrolling list.
    - **Middle Scrollable Content Panel** (`flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 min-h-0`):
      - *When Tab = Slots & Layout*:
        - Image count selector: 1 to 4 images.
        - Layout Grid Pills: 4-Row Strips (Default), 2×2 Quad Grid, Hero Top + 3 Strips, 3-Row, 2-Row, 2-Columns, and Single View.
        - **Transparent Grid Spacing Standard**: Diorama photo grids MUST use completely transparent gaps (`gap-1.5` or `gap-2`, `border: none`, zero drop shadow, zero dark box background), allowing the warm festive background art to frame the fort views naturally.
        - **Compact Horizontal 4-Slot Navigator Strip**: Fast 1-click slot switcher (`Slot 1 45°`, `Slot 2 15°`, `Slot 3 30°`, `Slot 4 90°`) displaying live diurnal lighting icons and camera perspective badges. Active slot has a warm amber background (`#FFFBEB`) and terracotta border (`#E85D04`).
        - **Focused Single-Slot Inspector**: Scoped strictly to the selected slot with image source tabs (`3D Angles`, `Live Viewport`, `Screenshot Vault`), 4 camera perspective buttons with degree markings, 4 diurnal lighting buttons (Dawn, Noon, Golden Hour, Diwali Night), inline screenshot vault thumbnail picker, and an individual "Recapture Slot" action alongside global "Recapture All".
      - *When Tab = Poster Style*:
        - 4 Curated Historical Festival Themes in a 2×2 grid: *Citadel Archway* (किल्ला महाद्वार), *Royal Courtyard* (राजदरबार उत्सव), *Moonlit Fortress* (चंद्रप्रकाशित किल्ला), and *Sahyadri Sunrise* (सह्याद्री सूर्योदय).
        - Thumbnails MUST display the complete uncropped poster layout (`object-contain`).
        - **Royal Stone Plaque (*Shilalekh* / राजकीय शिलालेख)**: Carved dark basalt gradient (`#26201B` to `#151210`) with double gold border trim (`#D4AF37`) and gold Devanagari typography (`#FDE68A`) in `Yatra One`.
        - Presets for Fort Title, Builder Credit, and Festive Wish with strict multilingual locale isolation (no bracketed Marathi in English mode).
        - Display Builder Credits checkbox toggle.
    - **Pinned Bottom Action Dock** (`shrink-0 bg-[#FAF8F5] border-t border-[#D8D1C5] p-3 sm:p-3.5 space-y-2.5 shadow-lg`):
      - Always pinned and accessible at the bottom of the studio panel across all tabs and screen heights.
      - Export Format Toggle: Lossless PNG (1080 × 1350) vs compact JPG.
      - Primary CTA: Full-width download button (`bg-[#E85D04] hover:bg-[#D04E00] text-white font-bold py-2.5 rounded-xl shadow-md`).
      - Secondary Actions: Share Poster (`navigator.share`), Copy Image (clipboard), WhatsApp intent, X (Twitter) intent.

### Rule 26: In-App Confirmation Modal & Screenshot Vault Anatomy (`ConfirmDialog.tsx` & `screenshotVault.ts`)
- **Tactile In-App Confirmation Modal (`ConfirmDialog.tsx`):**
  - NEVER use native browser `window.confirm()` or alerts.
  - Backdrop: `fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4`.
  - Container: `bg-[#FAF8F5] border border-[#CDBCAB] rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center`.
  - Title: `font-['Yatra_One'] text-lg text-[#2B1E16]`.
  - Body: `text-sm text-[#5C4638] my-3 leading-relaxed`.
  - Action CTAs:
    - Destructive Confirm CTA: `bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded-xl px-4 py-2 text-sm font-medium shadow-xs`.
    - Cancel CTA: `bg-[#F3EBE0] border border-[#D9C9B4] text-[#4B382C] hover:bg-[#EADECF] rounded-xl px-4 py-2 text-sm`.
- **Dual-Save Screenshot Vault Protocol:**
  - Viewport screenshot action in `DioramaQuickBar.tsx` captures headless 1920 × 1080 snapshots with diurnal sky and lighting.
  - Dual-saves simultaneously:
    1. Triggers direct browser file download (`killa-diorama-<timestamp>.png`).
    2. Persists to browser IndexedDB Screenshot Vault (`killa_screenshots_db`, store `screenshots`).
  - Supports individual screenshot deletion and batch clearing with in-app confirmation guards.

### Rule 27: Mobile Studio Viewport Layout & Touch Navigation (< 1024px)
- **Two-Row Mobile Navigation Bar (`MobileTopNav.tsx`):**
  - Container: Pinned top header (`fixed top-0 left-0 right-0 z-40 select-none`).
  - Row 1 (38px Primary Bar): `bg-[#EBE6DC] border-b border-[#D8D1C5] px-2 flex items-center justify-between text-[#2B2621]`.
    - Hamburger button (`☰`): Touch target `32×32px`, `rounded-lg hover:bg-[#D8D1C5]/50`.
    - Camera Perspective cycle pill: Displays active view (`Iso`, `Top`, `Rampart`, `Home`) with contextual icon (`Box`, `Eye`, `Castle`, `Focus`), `bg-[#FAF8F5] border border-[#D8D1C5] text-[11px] font-medium px-2 py-1 rounded-lg`.
    - Axis Snap cycle pill: Single button cycling `Z`, `Y`, `X` orientations.
    - History Cluster: Undo, Redo, and Reset icon buttons with tactile hover feedback.
    - Viewport Zoom Controls: `[+]` and `[-]` buttons for immediate optical zoom.
    - Festive Poster Studio CTA: High-contrast terracotta pill (`bg-[#B85F45] text-white hover:bg-[#A24F37] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs`).
  - Row 2 (28px Diurnal & Playback Bar): `bg-[#F4F1EA] border-b border-[#D8D1C5] px-2 flex items-center justify-between text-[#4B382C] text-[10px]`.
    - Play/Pause toggle, 360° Turntable spin, 1-Tap Present button (`TbMaximize`), Snapshot camera, and Day/Night diurnal solar toggle.
  - Hamburger Slide-Over Sheet: Width `300px`, max-width `85vw`, `bg-[#FAF8F5] border-r border-[#D8D1C5] shadow-2xl z-50 p-4 space-y-3`. Hosts File / Open / Switch Fort, HD Poster Studio, 1-Tap Presentation View, Overlays, Language Switcher, and Help.
- **Thumb-Corner Floating Action Buttons & Individual Radial Menus (`VirtualJoystick.tsx`):**
  - Viewport Clearance: The central 140px virtual joystick is completely omitted on mobile screens (< 1024px) to prevent diorama occlusion. Full 3D camera navigation (orbit, pan, pinch-zoom) is handled natively by the gesture engine across the open canvas.
  - Left FOB (`fixed left-4 sm:left-6 z-30`): Sub-Tool Mode Selector button (`w-11 h-11 rounded-full bg-[#FAF8F5] text-[#B85F45] border-2 border-[#B85F45] shadow-lg flex items-center justify-center active:scale-90`). Displays the active mode icon. Tapping opens the Mode Circle Menu anchored on the left.
  - Right FOB (`fixed right-4 sm:right-6 z-30`): Primary Tool Selector button (`w-11 h-11 rounded-full bg-[#2B2621] text-[#FAF8F5] border-2 border-[#D8D1C5] shadow-lg flex items-center justify-center active:scale-90`). Displays the active tool icon. Tapping opens the Tool Circle Menu anchored on the right.
  - Individual Radial Pie Wheel (`RadialPieWheel`): Rendered directly in place of the tapped FOB.
    - Dimensions: SVG canvas `156×156px`, inner radius $r_{in} = 28\text{px}$, outer radius $r_{out} = 76\text{px}$.
    - Slices: Default `#FAF8F5` with `#D8D1C5` stroke; active slice `#2B2621` with terracotta `#B85F45` icon tint.
    - Typography & Icons: Centered at mid-radius $r_{mid} = 52\text{px}$ with 14px Lucide icon and `text-[7.5px] font-bold tracking-tight`.
    - Center Close Button: Accessible 40×40px circle (`w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#D8D1C5] text-[#5A5248] hover:text-[#2B2621] hover:bg-[#E0D9CE] shadow-md z-10 active:scale-90`).
    - Dismiss Backdrop: Dimmed fixed overlay (`bg-black/20 backdrop-blur-[1px]`) for 1-tap outside dismissal.
  - Drawer Coordination: Both FOBs elevate smoothly via `bottom: isDrawerOpen ? 'calc(50vh + 14px)' : '54px'` with `transition-[bottom] duration-300 ease-out`, remaining comfortably accessible above the drawer.
- **Single-Stage Mobile Bottom Drawer (`MobileBottomDrawer.tsx`):**
  - Closed Peek: Height `44px` with pill grab handle (`w-12 h-1.5 bg-[#D8D1C5] rounded-full`).
  - Open Elevation: Height `50vh`, `bg-[#EBE6DC] border-t border-[#D8D1C5] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)]`. Enforces single pull-up with zero multi-stage bouncing.
  - 4 Dynamic Drawer Tabs: `[ Properties ]`, `[ Assets ]`, `[ Outliner ]`, `[ Element ]`. Mounted directly on a `#FAF8F5` surface card with `#B85F45` active indicator and `text-[11px] font-medium`.
  - Section Separation Standard: The upper Outliner section is strictly separated from lower Element Properties. Selecting any item in Outliner automatically switches the drawer to the `[ Element ]` tab.
- **Mobile Vertical Presentation Glass Bar (`PresentationGlassBar.tsx`):**
  - Pinned vertically on screens < 1024px along the left viewport edge (`fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 p-2 bg-[#2B2621]/90 backdrop-blur-md rounded-2xl border border-[#D8D1C5]/30 shadow-2xl`).
  - Houses camera perspective cycling (synced with `activeCameraPreset`), 360° turntable, day/night diurnal lighting, snapshot camera, poster studio launch, and exit button. Redundant presentation buttons are removed.

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
- **Bypass snap and hover calculations when `e.buttons !== 0` during camera orbit and pan.**
- **Use module-level static shared geometries and materials for snap holograms and draft markers.**
- **Auto-pause playback on primary tool switch while preserving playback continuity on subtool/mode switch.**
- **Throttle continuous drag tools (foliage paint/erase) to 35ms and 0.05m distance increments.**
- **Use `Yatra One` for all display titles and fort names.** Pair with `Inter` for technical UI controls.
- **Use `dark_stone_floor_128x128_pbr` for all structure walkways and floor decks.**
- **Use `useTranslation()` for all UI strings.** Keep English UI clean without Marathi parenthetical labels.
- **Use `Strength` instead of `Opacity & Flow`.**
- **Support `Shift/Ctrl/Alt + Scroll Wheel` shortcuts on all 3D tools.**
- **Check existing sibling panels (e.g. Spline tool) and `design.md` before authoring any new UI.**
- **Use real sliding toggle switches with smooth sliding knobs for binary feature states (like water plane).**
- **Prompt confirmation before destructive base terrain changes if existing structures are present.**
- **Keep photo grid gaps completely transparent (`border: none`, transparent spacing) in the Poster Studio so the base vector artwork shines through cleanly.**
- **Render Royal Stone Plaque (*Shilalekh*) with dark basalt stone gradient, double gold trim (`#D4AF37`), gold diamond accents (`✦`), and gold Devanagari typography.**
- **Mount inline screenshot galleries immediately below the selected slot rather than at the bottom of all slots.**
- **Use custom in-app confirmation modals (`ConfirmDialog.tsx`) instead of browser `window.confirm()`.**
- **Isolate languages strictly based on active locale without leaking Marathi into English mode.**

### Don't
- **Don't use cold corporate gray (`#F3F4F6`, `#E5E7EB`) or pure black (`#000000`).**
- **Don't wrap individual property sliders in white card containers.**
- **Don't duplicate mode selectors inside the Left Tool Sidebar.**
- **Don't show mode-irrelevant sliders (e.g. Tiling Repeat on an Eraser).**
- **Don't insert decorative filler or tip cards into tool property panels.**
- **Don't use ambiguous text buttons (e.g., Active/Inactive) for binary toggles.**
- **Don't silently clear or displace existing placed structures when base terrain changes.**
- **Don't let minimized tabs overlap each other or open sidebars.**
- **Don't select 3D objects with right-click or middle-click.**
- **Don't calculate magnetic snapping or wall raycasting while the user is orbiting or panning the camera.**
- **Don't allocate new geometries or materials dynamically in render loops or pointermove callbacks.**
- **Don't leave continuous animation playback running when switching between primary construction tools.**
- **Don't use coarse ground proximity radius checks that hijack clicks near splines or walls.**
- **Don't hardcode Marathi in parentheses in English labels.**
- **Don't place solid borders, white containers, or drop shadows around diorama photos in the festive poster grid.**
- **Don't use browser `window.confirm()` or native alerts.**
- **Don't show redundant subtitles, font selection pickers, or pixel badges in the Poster Studio header.**
- **Don't lose active object selection when transitioning from Select to Fortify or Transform.**
- **Don't introduce mipmap blurring on retro textures.** Always configure `tex.minFilter = THREE.NearestFilter; tex.magFilter = THREE.NearestFilter`.
