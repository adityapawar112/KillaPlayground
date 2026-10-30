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
  - Uses authentic 128×128 pixel-art retro textures (Binbun Retroground) sampled with `THREE.NearestFilter` (no mipmap blur) for crisp, crunchy tactile miniature terrain.
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
  - *Walls*: `Select` (inspect & highlight), `Draw` (draft ramparts), `Fortify` (attach stamps).
  - *Spline*: `Select` (inspect paths), `Draw` (draft lines), `Transform` (camera-relative directional translate, rotate, scale).
  - *Terrain*: 8 sculpting subtools (`Peak`, `Plateau`, `Ramp`, `Gorge`, `Trench`, `Smooth`, `Pond`, `Retexture`).
- **Minimizable**: Yes. Header minimize button (`[ ◂ ]`) collapses strip and deploys hanging tab (`[🎯 Modes ▾]`).

### 5. Zone 5: Right Scene Outliner & Contextual Inspector (`RightToolSidebar.tsx`)
- **Position**: Docked right (`right-0`, `bottom-0`). Width: **260px to 460px** (default: `310px`), saved to `localStorage`.
- **Role**: Dual-pane scene organization (active for walls, spline, and prop tools):
  - **Upper Pane (`DIORAMA ELEMENTS`)**: Hierarchical tree listing all placed structures (e.g. Ramparts with expandable child bastions, watchtowers, and gates; or Placed Spline Paths). Features element count badge, hover highlighting, selection syncing, camera focus (`[ ⌖ ]`), and quick delete.
  - **Lower Pane (`ELEMENT PROPERTIES`)**: Contextual inspector displayed *only* when an object is selected. Enables renaming, deleting, and tweaking specific parameters (e.g., individual bastion radius, platform width/depth/flip, gate arch height, spline item scale).
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

### Rule 7: 3D Interaction & Pointer Guards
- **Strict Left-Click Only for Selection and Stamping**:
  In `@react-three/fiber`, pointer click handlers trigger on any button release. Right-click is strictly reserved for `OrbitControls` rotation/panning.
  **Every** mesh click handler MUST start with:
  ```typescript
  if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
  ```
  before checking tool state, stopping propagation, or modifying selection.
- **Hover Highlighting in Select Modes**:
  Interactive 3D geometry must highlight when hovered over in `select` mode:
  - Cursor changes to `pointer` (`document.body.style.cursor = 'pointer'`).
  - Contour / edges geometry renders with `#E85D04` (Saffron glow).
- **Physical Raycasting Only (Zero Ground Proximity Hijacking)**:
  Never check arbitrary radial proximity against empty terrain vertices to select structures. Raycast directly against the structure's physical 3D mesh (`mesh` / `instancedMesh`) so adjacent objects never cross-contaminate.
- **Selection Retention Across Modes**:
  Switching between `select` and edit modes (`fortify` on walls, `transform` on splines) must PRESERVE the active object ID, and immediately pre-activate the appropriate tool/stamp (e.g., default `Watchtower` stamp).

### Rule 8: Toast Notification Lifecycle
- Toast notifications deployed via `setToastMessage()` must automatically dismiss after **3.5 seconds**.
- The toast pill must feature an explicit close button (`✕`) so users can dismiss transient alerts immediately.

---

## 3D Textures & Material Tokens

All diorama assets follow the **Modern Retro / PS1 (Flavor A)** visual standard: crisp 128×128 pixel-art textures sampled with `THREE.NearestFilter` (no mipmap blur) under dynamic PBR sunlight:

| Structure Part | Texture Asset Directory | Material Group | PBR Maps | Visual Character |
|---|---|---|---|---|
| **Wall & Tower Sides** | `/textures/Bricks/mossy_stone_brick_128x128_pbr` | Group 0 | diffuse, normal, roughness, ao | Aged Deccan basalt masonry with subtle moss growth |
| **Walkways & Tower Floors** | `/textures/Bricks/dark_stone_floor_128x128_pbr` | Group 1 | diffuse, normal, roughness, ao | Dressed basalt paving slabs for ramparts and decks |
| **Crenellations (*Kangare*)** | `/textures/Bricks/dark_stone_texture_128x128_pbr` | Group 2 | diffuse, normal, roughness, ao | Solid carved dark stone merlons and arch soffits |
| **Courtyard Soil** | `/textures/Dirt/Dirt_03` | Terrain Splat 0 | diffuse, normal, roughness, ao | Sun-baked red laterite (*Tambdi Maati*) |
| **Rock Escarpments** | `/textures/Rock/Rock_02` | Terrain Splat 1 | diffuse, normal, roughness, ao | Sheer cliff rock face with triplanar vertical blend |
| **Pond & Moat Water** | `/textures/Water/blue_tarp_texture_128x128_pbr` | Water Shader | diffuse, normal, roughness, ao, metallic | Crinkled blue plastic sheet with specular ripples |

---

## Do's and Don'ts

### Do
- **Anchor on the warm courtyard canvas (`{colors.canvas}` — `#F9F6F0`).**
- **Follow the 5-zone decoupled HUD layout.** Universal settings in the Left Sidebar, modes in the vertical Mode Strip, scene tree and inspectors in the Right Sidebar.
- **Maintain non-colliding minimized tabs.** Coordinate dynamic positions using store-backed sidebar widths.
- **Check `e.button === 0` on every 3D interactive mesh.** Never let right-click pan trigger object selection.
- **Use `Yatra One` for all display titles and fort names.** Pair with `Inter` for technical UI controls.
- **Use `dark_stone_floor_128x128_pbr` for all structure walkways and floor decks.**
- **Use `useTranslation()` for all UI strings.** Keep English UI clean without Marathi parenthetical labels.

### Don't
- **Don't use cold corporate gray (`#F3F4F6`, `#E5E7EB`) or pure black (`#000000`).**
- **Don't let minimized tabs overlap each other or open sidebars.**
- **Don't select 3D objects with right-click or middle-click.**
- **Don't use coarse ground proximity radius checks that hijack clicks near splines or walls.**
- **Don't hardcode Marathi in parentheses in English labels.**
- **Don't lose active object selection when transitioning from Select to Fortify or Transform.**
- **Don't introduce mipmap blurring on retro textures.** Always configure `tex.minFilter = THREE.NearestFilter; tex.magFilter = THREE.NearestFilter`.
