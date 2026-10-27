# Product Specification: Diwali Killa Sandbox

## 1. Product Vision & Overview
**Diwali Killa Sandbox** is an interactive, tactile 3D browser experience that lets anyone participate in the traditional Maharashtrian Diwali custom of building miniature mud forts (*Diwali Killa*)[cite: 1, 2]. 

Rather than snapping pre-made 3D castle blocks together like a generic level editor, this product replicates the authentic backyard craft experience: dumping raw soil, pouring water to turn it into workable wet mud, hand-shaping walls and bastions by pushing and patting the mud from the top and sides, hand-painting black basalt stones with white lime mortar lines, sprouting green cress (*halim*) grass, and arranging colorful miniature clay figurines[cite: 1, 2].

It is designed for both nostalgic adults who never got to build a killa growing up (or now live in apartments without access to soil and courtyard space) and younger players who want to craft, paint, and share their own tribute fort with friends and family.

---

## 2. Target Audience & Core Value Proposition
* **First-Time & Nostalgic Builders:** Adults who watched neighborhood kids build killas and want to experience the tactile joy of shaping mud and decorating a fort from their browser[cite: 1].
* **Apartment & Diaspora Families:** People who want to celebrate the tradition during Diwali without hauling sacks of red soil and bricks up an elevator.
* **Zero-Friction Creative Play:** No sign-ups, no complex CAD controls, and no interior architectural headaches—just pure exterior diorama sculpting, hand-painting, and festive staging.

---

## 3. End-to-End User Journey


```

[1. Mode Selection]
├── A. Historical Killa Blueprint (Pre-made Terrain + Chalk Wall Outlines)
└── B. Freeform / From Scratch (Random Terrain Generator + Blank Ground)
│
▼
[2. Soil, Water & Mud Shaping]
└── Dump Dry Soil -> Pour Water -> Push/Flatten from Top & Sides -> Solid Exterior Blocks
│
▼
[3. Spline Pathing & Battlements]
└── Draw Line on Terrain -> Convert to Walkways, Stone Steps, or Battlement Walls
│
▼
[4. Freehand Surface Painting]
└── Base Coat (Large Brush: Charcoal/Stone/Red Ochre) -> Detail Coat (Thin Brush: White Brick Lines)
│
▼
[5. Greenery & Water Bodies]
└── Paint Sprouted Grass (Halim) on Slopes -> Carve/Tint Water Tanks & Sea Borders
│
▼
[6. Figurine & Prop Placement]
└── Drag & Drop from Asset Browser (Maharaj Throne, Mavale, Cannons, Flags, Paper Boats, Diyas)
│
▼
[7. Showcase, Multi-Angle Poster & Share]
└── Interactive 3D Link OR Auto-Captured Multi-Angle Festive Poster with Marathi/English Title Header

```

---

## 4. Detailed Feature Specifications

### Phase 1: Foundation & Mode Selection
Upon opening the tool, the user starts inside a cozy backyard/courtyard diorama workspace (bordered by red clay bricks or a corner wall, just like a real society courtyard build)[cite: 1, 2] and chooses one of two starting modes:

#### Option A: Historical Killa Blueprint Mode
* **Curated Fort Selection:** User selects from iconic Maratha forts (e.g., *Raigad*, *Pratapgad*, *Sinhagad*, *Shivneri*, *Murud-Janjira*, *Vijaydurg*)[cite: 2].
* **Pre-Molded Topography:** The base hill or coastal island terrain is already sculpted to match the real fort's elevation profile (e.g., an oval island surrounded by shallow water for *Murud-Janjira*[cite: 2], or a steep multi-tiered ridge for *Raigad*).
* **Guided Wall Outlines:** Faint white chalk/rangoli-style footprint lines are drawn directly onto the terrain showing exactly where the outer ramparts (*tatbandi*), round bastions (*buruj*), gates (*Maha Darwaza*), and water cisterns (*taki*) belong.
* **Reference Card:** A toggleable corner photo card shows how neighborhood builders traditionally style that specific fort[cite: 1, 2].

#### Option B: Blank / Custom Killa Mode
* **Random Terrain Generator:** Users click a **"Roll New Terrain"** button to generate organic base landscapes with a single click, along with simple sliders for:
  * *Flat Courtyard vs. Steep Mountain Ridge*
  * *Coastal/Island Setting vs. Inland Hilltop*
  * *Base Perimeter Brick Border* (toggles the classic row of red construction bricks holding the mud pile together at the base)[cite: 1].
* **No Guidelines:** Completely open canvas with zero pre-drawn wall outlines, allowing pure improvisation.

---

### Phase 2: Tactile Mud & Block Construction (No Interiors)
All structures—walls, towers, gates, bridges, and buildings—are **solid exterior mud masses** with no hollow interiors. Construction mimics real backyard mud-building physics in three sequential steps:

#### Step 2.1: Dumping Dry Soil
* **Soil Pour Tool:** Clicking and holding on the ground pours mounds of loose, dry brown/red soil onto the target area.
* Holding longer increases the height and spread of the loose pile.

#### Step 2.2: Adding Water
* **Water Sprinkler / Jug Tool:** Users pour water over the dry soil mound.
* **Visual & Tactile State Change:** Dry, crumbly soil visibly darkens and turns glossy, transitioning into **Malleable Wet Mud**. Only wet mud can be shaped into crisp architectural forms.

#### Step 2.3: Pushing & Patting (Top & Side Manipulation)
Once soil is wet, the user switches to the **Hand / Trowel Shaper Tool** to mold the mud into solid blocks, walls, and platforms:
* **Side Pushing (Vertical Wall Formation):** Pushing against the sides of a wet mud mound compresses and flattens the sloped sides into sheer vertical faces—turning a sloppy mound into a crisp wall segment, rectangular building block, or cylindrical bastion (*buruj*)[cite: 2].
* **Top Patting (Leveling Planes):** Pressing or dragging across the top of a mud mass flattens it into a smooth horizontal plane—creating plateau courtyards, flat roof blocks, bastion tops, or bridge decks.
* **Pinch & Pull Bridges/Gates:** Users can shape solid rectangular blocks across gaps to act as bridges or thick gateway arches (*Darwaza*)[cite: 2].
* **Drying / Locking State:** Users can click **"Let Mud Set"** on a finished section (or simply select it for painting) so accidental brushes don't deform finished walls while working nearby.

---

### Phase 3: The Spline Builder Tool (Paths, Stairs & Battlements)
To prevent tedious repetitive sculpting over long distances, users can select the **Spline Tool** and draw a continuous curved or straight line directly across the terrain or along the top ridge of a mud wall.

Once a spline line is drawn, a floating context menu lets the user convert that path into one of four solid structures that automatically conform to the underlying slope:

| Spline Conversion Type | Visual & Functional Behavior |
| :--- | :--- |
| **1. Walkway / Road Path** | Flattens a smooth ribbon along the terrain and slightly indents it so users can paint red-ochre walkways connecting the main gate to the throne[cite: 2]. |
| **2. Stone Steps (*Payrya*)** | Generates stepped horizontal mud terraces climbing up a slope from a lower plateau to a higher peak (e.g., steps leading up to the *Balekilla* or throne)[cite: 2]. |
| **3. Continuous Rampart Wall** | Extrudes a uniform, solid mud wall along the drawn line with rounded bastions automatically placed at sharp corner vertices[cite: 2]. |
| **4. Crenellated Battlements** | Adds classic notched fort teeth (merlons and crenels) along the top edge of any existing wall or spline wall[cite: 2]. |

---

### Phase 4: Freehand Surface Painting Studio
Once a mud structure or block is shaped, the user selects it to enter **Paint Mode**. Just like real Diwali killas where kids paint dried mud using poster colors and chalk/lime (*chuna*), all stone textures are achieved through user brushwork rather than photo-realistic 3D shaders[cite: 1, 2].

#### Brush Controls
* **Variable Brush Sizes:**
  * **XL / Large Flat Brush:** For rapidly base-coating entire walls, bastions, buildings, or water beds in a single sweep.
  * **Medium Round Brush:** For painting pathway borders, archways, doors, and roof tiles.
  * **Fine / Detail Liner Brush:** Specifically designed for hand-drawing crisp white horizontal and vertical **brick/stone divider lines** over dark walls[cite: 1, 2].
* **Stroke Stabilization Toggle:** Optional "steady-hand" smoothing so mouse and trackpad users can draw clean, straight horizontal and vertical white brick grids around curved bastions without jitter[cite: 2].

#### Authentic Festive Color Palette
* **Charcoal Black / Dark Basalt Grey:** The classic base coat for Maratha fort walls and bastions[cite: 1, 2].
* **Chuna / Chalk White:** For drawing individual stone blocks, brick dividers, step edges, and archway outlines[cite: 1, 2].
* **Geru / Terracotta Red-Ochre:** For painting royal pathways, temple roofs, and throne platforms[cite: 2].
* **Vibrant Royal Blue / Cyan:** For painting the flooraround coastal forts (to mimic the Arabian Sea) or lining plastic-sheet water tanks (*taki*) dug into the mud[cite: 1, 2].
* **Earthy Mud & Ochre Tones:** For touching up exposed cliffs and natural rocks.

---

### Phase 5: Greenery, Water Tanks & Yard Details
After the mud and paint dry, users bring the landscape to life using the **Nature & Environment Brush**:

* **Greenery / Sprouted *Halim* Grass Brush:**
  * Painting on bare mud slopes grows dense patches of tiny, bright-green two-leaf sprouts (replicating real *halim* / garden cress and mustard seeds sprouted on wet mud)[cite: 1, 2].
  * Includes a brush density slider (from sparse mountain scrub to lush green courtyard lawns)[cite: 2].
* **Water Cisterns (*Taki*) & Sea Plastic Effect:**
  * Users can depress circular or rectangular pits into the terrain and fill them with water, or toggle the nostalgic **"Blue Plastic Sheet Pond"** look seen in backyard builds[cite: 1, 2].
* **Crushed Stone / Gravel Scatter Brush:**
  * Sprinkles fine grey/black crushed gravel along the base of the outer walls and shoreline[cite: 2].

---

### Phase 6: Figurine & Festive Asset Browser
A categorized visual drawer lets users drag, drop, rotate, and scale miniature clay-painted figurines (*Mavale*) and festive props directly onto their fort plateaus, steps, and battlements[cite: 1, 2]:

1. **Royalty & Leadership:**
   * **Chhatrapati Shivaji Maharaj on the Royal Throne (*Sinhasan*):** Complete with ornate golden/red canopy (*Meghdambari*), steps, and pedestal[cite: 1, 2].
   * **Equestrian Statue:** Maharaj on horseback.
2. **Garrison & Citizens (*Mavale* Figurines):**
   * Standing spearman and swordsman guards in colorful bright tunics (yellow, green, blue, orange, red) and traditional *pagdis*[cite: 1, 2].
   * Horn/Tutari blowers and Dhol/Tasha drummers standing near the main gate.
   * Sentries aiming muskets/bows along the bastion walls[cite: 1, 2].
   * Traditional village women carrying water pots and fort blacksmiths/citizens.
3. **Artillery & Insignia:**
   * Black iron cannons (*Toph*) mounted on wheeled carriages to place atop circular bastions[cite: 2].
   * Towering saffron **Bhagwa Dhwaj** (swallowtail flags) on tall poles that gently sway[cite: 1, 2].
   * Miniature fort nameplates (e.g., hand-painted white signboards reading the fort's name in Marathi/Devanagari or English)[cite: 2].
4. **Shrines & Landmarks:**
   * Miniature Shiva Lingam shrine / Bhavani Mata temple block[cite: 2].
   * Deepstambh (stone lamp pillar).
5. **Nostalgic Yard Extras:**
   * **Origami Paper Boats (*Hodi*):** Colorful orange, white, and blue folded paper boats to place on the blue painted sea around coastal forts like *Murud-Janjira* or *Sindhudurg*[cite: 2].
   * **Terracotta Diyas (Oil Lamps):** Glowing festive lamps that illuminate the fort walls and steps when toggled to **Diwali Evening / Night Mode**.

---

### Phase 7: Finalization, Multi-Angle Poster Studio & Sharing
Once the user clicks **"Finish Killa"**, the tool transitions into the **Showcase & Poster Studio**:

#### 1. Automated Multi-Angle Poster Generator
Inspired by festive community greeting posters, the app automatically captures high-resolution snapshots of the user's finished killa from **4 cinematic angles**[cite: 1, 2]:
* **Hero Bird's-Eye Overview:** Full isometric view showing the entire fort layout, lawns, and walls[cite: 1, 2].
* **The *Maha Darwaza* & Bastion Low-Angle:** Looking up at the painted black-and-white brick ramparts, cannons, and guards[cite: 1, 2].
* **The *Balekilla* Throne Close-Up:** Focusing on Chhatrapati Shivaji Maharaj, the saffron flag, and the red-ochre pathways[cite: 2].
* **Golden-Hour / Diwali Night Diya View:** Warm festive lighting with glowing diyas along the battlements.

#### 2. Custom Poster Composition & Typography
* Consolidates the multi-angle views into a single, ready-to-share **Festive Collage Poster** (available in **9:16 Instagram Story / WhatsApp Status** and **4:5 Social Feed** aspect ratios)[cite: 2].
* **Custom Calligraphic Header:** Users can type their fort's name (e.g., *"मुरुड जंजिरा"*, *"विजयदुर्ग"*, *"रायगड"*, or their custom fort name) and their own name/team name, styled with classic Marathi decorative typography and a festive Diwali greeting (*"दिवाळीच्या हार्दिक शुभेच्छा"* / *"Happy Diwali"*)[cite: 2].

#### 3. Instant Sharing Options
* **Download Festive Poster (PNG/JPG):** One-tap download for WhatsApp family groups, Instagram Stories, X, and LinkedIn.
* **Share Interactive 3D Link:** Generates a permanent, zero-login view-only link where friends can orbit, zoom in, and inspect every hand-painted brick and figurine in 3D right in their browser.

---

## 5. Scope Boundaries & Non-Goals
To keep the experience focused, authentic, and fast to use:
* **No Building Interiors:** All forts, palaces, and towers are solid exterior mud forms. Users never enter rooms or manage indoor furniture.
* **No Photo-Realistic Auto-Texturing:** Walls do not automatically receive photorealistic castle shaders; the charm comes from the user painting the black base coat and white brick lines by hand (with optional stencil/brush assistance)[cite: 1, 2].
* **No Combat or RTS Gameplay:** This is a creative festive diorama and craft sandbox, not a tower-defense or strategy battle game.
* **No Mandatory Account Creation:** Users can sculpt, paint, generate their multi-angle poster, and share a link without hitting a login wall.

