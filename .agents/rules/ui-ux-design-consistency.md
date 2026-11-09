# UI/UX Design Consistency & HUD Authoring Rules

## Core Directive
Whenever UI components, tool sidebars, docks, cards, modals, or HUD elements are created or updated, the authoring agent **MUST** inspect [`design.md`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/design.md) and examine existing sibling components (specifically canonical panels in [`LeftToolSidebar.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/hud/LeftToolSidebar.tsx) such as the Spline and Terrain tools) before authoring code. UI revisions must never regress into ad-hoc wrappers, duplicated buttons, or inconsistent token usage.

---

## 1. Container & Card Usage Discipline

Never default to wrapping every control in a card:
- **Direct Level 2 Panel Background Mounting:**
  - Property sliders, numerical readouts, and simple toggles **MUST sit directly on the sidebar background (`bg-[#EBE6DC]`)**.
  - **NEVER** wrap individual property sliders inside separate white card containers.
  - Standard slider pattern:
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
- **Strictly Reserved Nested Containers (`bg-[#FAF8F5]` / `border-[#D8D1C5]` rounded-xl):**
  - Nested white container cards are reserved exclusively for:
    1. **Top Section Header Badge** (e.g., `Texture Studio`, `Path Drafting`, `Wall Architecture`).
    2. **Active Item / Target Preview Cards** (e.g., Active Texture preview with thumbnail, name, and layer badge).
    3. **Primary Action Group Containers** (e.g., Finish/Cancel draft or Flood/Clear buttons).

---

## 2. Zero Duplication of Tool Mode Selectors

- **Single Source of Truth:**
  - Operational mode switching (e.g. `Paint` / `Erase` for Texture; `Select` / `Draw` / `Transform` for Spline; `Select` / `Draw` / `Fortify` for Walls) belongs **strictly and exclusively** in the vertical floating strip: [`ToolModeSidebar.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/hud/ToolModeSidebar.tsx).
  - **NEVER duplicate mode selector buttons inside the Left Tool Properties Sidebar.**
  - The Left Sidebar should only display a tiny uppercase status badge in its header card reflecting the current active mode (e.g., `<span className="text-[10px] uppercase font-semibold text-[#8D7666]">{subTool} mode</span>`).

---

## 3. Mode-Specific Parameter Scoping

- A property panel must dynamically adapt its contents to show **only** controls strictly relevant to the currently active subtool mode:
  - In `Erase` mode: display radius and strength (omit falloff or tiling repeat).
  - In `Transform` mode: display translation/rotation/scale controls (omit path drafting buttons).
- Never render disabled, redundant, or nonsensical sliders for the active mode.

---

## 4. Standardized Naming Conventions & Zero Decorative Filler

- **Concise Naming:**
  - Use **`Strength`** instead of compound or convoluted terms like `"Opacity & Flow"`.
  - Use **`Brush Radius`** instead of `"Brush Size (Meters)"`.
  - Use **`Edge Falloff`** instead of `"Hardness / Softness"`.
  - Use **`Tiling Repeat`** instead of `"UV Scale Multiplier"`.
- **Zero Filler Cards:**
  - Never insert generic filler or tip boxes (e.g., `"Tabletop Diorama Tip"` or `"Pro Tip"`) into tool property panels. Every pixel in the properties drawer must serve active diorama authoring.

---

## 5. Internationalization & Language Purity

- **No Transliterated Parentheses in English UI:**
  - ❌ *Incorrect:* `"Tambdi Maati (Red Laterite)"`, `"Mohari (Mustard Sprouts)"`, `"Buruj (Watchtower)"`
  - ✅ *Correct:* `"Red Laterite"`, `"Mustard Sprouts"`, `"Watchtower"`
- Always retrieve user-facing text from `translations.ts` via `const { t } = useTranslation()`.
- Marathi (`म`) and Hindi (`हि`) localizations handle regional terminology natively. English UI copy must remain clean, direct, and universally accessible.

---

## 6. Universal Mouse Wheel & Keyboard Shortcut Contracts

All interactive 3D tools must implement standard ergonomic wheel gestures, intercepted in the capture phase to suppress accidental camera zoom:
- `Shift + Scroll Wheel`: Adjust primary tool / brush radius (`paintBrushRadius`, `brushRadius`).
- `Ctrl + Scroll Wheel`: Adjust strength / speed slider (`paintBrushStrength`, `brushStrength`).
- `Alt + Scroll Wheel`: Adjust falloff / secondary parameter (`paintBrushFalloff`, `plateauHeight`, `slopeAngle`).
- `[` and `]`: Decrement / increment brush radius by `0.1m`.

---

## 7. Tool Taxonomy & Separation

- **Tool 4:** **`Texture`** (`id: 'texture'`) — terrain surface texture painting studio using the 52-texture retro PBR catalog.
- **Tool 7:** **`Paint`** (`id: 'paint'`) — reserved for the upcoming organic soil crafting pipeline (for painting raw pigments / colors onto sculpted mud shapes).
- Never conflate or mix surface texture splatting with soil pigment coloring.

---

## 8. Unified Pill-in-Pill Language Selector

- **Single Source of Truth:** All language selection across the application MUST use [`LanguageSelector.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/common/LanguageSelector.tsx). Never write ad-hoc inline language button arrays.
- **Pill-in-Pill Geometry:** Both outer container and active language buttons MUST be `rounded-full` pills with Level 3 basalt active highlight (`bg-[#2B2621] text-[#FAF8F5]`). Never render square or box highlights inside rounded containers.

---

## 9. Mandatory UI Consistency Verification Protocol

Before completing any task that adds or edits UI components:
1. **Compare Sibling Panels:** Confirm that slider spacing, label typography, font sizes, and container styles match the canonical `Spline` and `Terrain` panels in [`LeftToolSidebar.tsx`](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/src/components/hud/LeftToolSidebar.tsx).
2. **Consult `design.md`:** Validate 3-tier surface hierarchy (Level 1 `#F4F1EA`, Level 2 `#EBE6DC`, Level 3 `#2B2621`), hairline borders (`#D8D1C5`), Lucide icon standards (`size={16}`, `strokeWidth={1.75}`), and accent colors (`#B85F45`, `#E85D04`).
3. **Visual Verification:** Use browser tools (`chrome-devtools` or `take_screenshot`) to visually inspect the rendered UI in the browser and attach evidence before declaring completion.

