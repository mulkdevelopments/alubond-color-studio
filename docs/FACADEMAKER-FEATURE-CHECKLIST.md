# Alucobond Facademaker → Alubond Color Studio: Feature Checklist

**Note:** The screen recording (`Screen Recording 2026-03-03 at 11.39.46 AM.mov`) is a binary `.mov` file and could not be analyzed frame-by-frame. This checklist is derived from (1) Alucobond Facademaker references and documentation, and (2) a full review of the current Alubond Color Studio codebase, so it serves as an implementation checklist and gap analysis.

---

## 1. Screen-by-screen flow (reference + inferred)

| Screen | Description |
|--------|-------------|
| **Landing / Home** | Hero with value proposition; entry cards: Explore Gallery (3D studio), Upload IFC Model, Upload Image. Header with logo and “Color Studio” label; footer with tagline. |
| **Main 3D Studio** | Three-column layout: **Left** = Facade Library (color palette panel with tabs and grid). **Center** = 3D canvas (Facade Maker or Building/Zaha Hadid model), model tabs above canvas, bottom toolbar (facade controls when Facade Maker). **Right** = Renders panel (Generate, Compare, gallery, fullscreen, download). Top = app header (back, logo, tools, theme). |
| **Facade Maker mode** | Procedural facade grid (columns × rows), style (Landscape/Portrait/Square), transform (Flat, Alternate, Wave, Fold, Diagonal), tilt 0–45°, Apply All. Click-to-paint with selection tool. |
| **Dialogs** | AI Generate options (aspect ratio, resolution, format, custom prompt); Compare Renders (side-by-side); Fullscreen image; cookie/account on reference site (not in-app). |

---

## 2. UI elements (comprehensive list)

- **Header:** Back button, logo, “Studio” label, divider; Select, Undo, Redo, “N surfaces” label, Compare, Snap, PDF, theme toggle (sun/moon).
- **Left sidebar:** “Facade Library” title + icon; tabs (Solid colours, Metallic, Wood, Anodise, Patina, Fusion); selected color preview (swatch, name, SKU, finish, Clear); color grid (swatch + SKU + name per tile); compare mode: “Compare with palette” + dropdown.
- **Center:** Model tabs (Facade Maker, Building, Zaha Hadid); 3D canvas (OrbitControls, shadows, env); split-view divider when Compare = split.
- **Bottom toolbar (Facade Maker only):** Section labels: Style, Columns, Rows, Transform, Tilt, Surface. Style: Landscape / Portrait / Square. Columns: −, value, +. Rows: −, value, +. Transform: Flat, Alternate, Wave, Fold, Diagonal. Tilt: range 0–45°, value °. Surface: current color swatch, “Apply All” button (or “Select colour” when none).
- **Right sidebar:** “Renders” title + icon; AI Enhancement toggle; “Generate Render” button; “Compare (n/2)” button; scrollable gallery of render cards; per card: thumbnail, palette name, timestamp, Fullscreen, Download, Remove; selection checkmarks for Compare.
- **Dialogs:** Modal overlay, title, form fields or content, Cancel/Close, primary action (Generate/Close).

---

## 3. Interactions (what the user can do)

- From landing: choose **Explore Gallery**, **Upload IFC**, or **Upload Image**.
- In studio: switch **model** (Facade Maker, Building, Zaha Hadid).
- Change **panel style**: Landscape, Portrait, Square.
- Adjust **columns** and **rows** with steppers (min/max bounds).
- Change **transform**: Flat, Alternate, Wave, Fold, Diagonal.
- Adjust **tilt** slider 0–45°.
- **Select color** from left panel (tabs → grid → click); **Clear** selection.
- **Apply to surface:** enable Select tool, click panel → apply selected color; or **Apply All** to apply selected color to all facade panels.
- **Undo / Redo** paint actions.
- **Compare mode:** Single vs Split view; optionally “Compare with palette” in left panel.
- **Generate render:** capture current canvas; optional AI (opens dialog: aspect ratio, resolution, format, custom prompt).
- **Compare renders:** select two renders, open Compare dialog (side-by-side).
- **Fullscreen** and **Download** per render; **Delete** render.
- **Snap:** download current canvas. **PDF:** export spec PDF.
- **Theme:** light/dark toggle.

---

## 4. Feature list for implementation (numbered checklist)

Use this list to implement or verify each feature. Items marked **[HAVE]** are already present in Alubond Color Studio (see §5).

### Layout & navigation
1. [ ] **Landing page** with hero, headline, subtext, and three entry cards (Explore Gallery, Upload IFC, Upload Image). **[HAVE]**
2. [ ] **App header** (full width) with back, logo, “Studio” label, center toolstrip, right theme toggle. **[HAVE]**
3. [ ] **Three-column layout:** left sidebar (fixed width), center (flex), right sidebar (fixed width). **[HAVE]**
4. [ ] **Model tabs** above 3D canvas: Facade Maker, Building, Zaha Hadid (or equivalent). **[HAVE]**
5. [ ] **Bottom toolbar** only when Facade Maker is selected; horizontal strip with sections separated by dividers. **[HAVE]**

### Left sidebar – Facade Library
6. [ ] **Left sidebar** title “Facade Library” with icon. **[HAVE]**
7. [ ] **Tabs** for color categories (e.g. Solid colours, Metallic, Wood, Anodise, Patina, Fusion). **[HAVE]**
8. [ ] **Color grid** in left panel: each cell = swatch + SKU + name; click to select/deselect. **[HAVE]**
9. [ ] **Selected color preview** below tabs: swatch, name, SKU · finish, “Clear” button. **[HAVE]**
10. [ ] **Compare with palette** (when Compare = split): label + dropdown to pick a palette. **[HAVE]**

### Bottom toolbar – Facade controls
11. [ ] **Style** section: label “Style”; options **Landscape**, **Portrait**, **Square**. **[HAVE]**
12. [ ] **Columns** section: label “Columns”; stepper (− / value / +); range e.g. 2–16. **[HAVE]**
13. [ ] **Rows** section: label “Rows”; stepper (− / value / +); range e.g. 1–12. **[HAVE]**
14. [ ] **Transform** section: label “Transform”; options **Flat**, **Alternate**, **Wave**, **Fold**, **Diagonal**. **[HAVE]**
15. [ ] **Tilt** section: label “Tilt”; slider **0–45°** with current value displayed (e.g. “15°”). **[HAVE]**
16. [ ] **Surface** section: label “Surface”; show current color swatch; **“Apply All”** button to apply selected color to all facade panels; when no color selected, show “Select colour” (or similar). **[HAVE]**

### 3D canvas & facade
17. [ ] **3D facade** procedural grid (columns × rows) with panel style and transform applied. **[HAVE]**
18. [ ] **OrbitControls**: rotate, pan, zoom; sensible min/max distance and polar angle. **[HAVE]**
19. [ ] **Shadows** and **environment** (e.g. city) for metallic/anodise. **[HAVE]**
20. [ ] **Selection tool** toggle in header; when on, click panel to apply selected color to that surface. **[HAVE]**
21. [ ] **Per-panel material** overrides (color, metalness, roughness, finish) with undo/redo. **[HAVE]**
22. [ ] **Hover feedback** on panels when selection tool is on (e.g. cursor, emissive). **[HAVE]**
23. [ ] **Compare split view**: vertical divider down the center of the canvas when Compare = split. **[HAVE]**
24. [ ] **Canvas export**: preserveDrawingBuffer for screenshot/Generate Render. **[HAVE]**

### Header tools
25. [ ] **Select** button (selection tool on/off). **[HAVE]**
26. [ ] **Undo** / **Redo** for paint actions; disabled when no history. **[HAVE]**
27. [ ] **“N surface(s)”** label reflecting number of painted panels. **[HAVE]**
28. [ ] **Compare** button to toggle single/split view. **[HAVE]**
29. [ ] **Snap** button to download current canvas as image. **[HAVE]**
30. [ ] **PDF** button to export specification PDF (name, collection, colors, snapshot). **[HAVE]**
31. [ ] **Theme** toggle (light/dark). **[HAVE]**

### Right sidebar – Renders
32. [ ] **Right panel** title “Renders” with icon. **[HAVE]**
33. [ ] **AI Enhancement** toggle; when on, Generate opens options dialog. **[HAVE]**
34. [ ] **“Generate Render”** button; captures current view (and optionally runs AI). **[HAVE]**
35. [ ] **AI Generate options dialog**: Aspect ratio, Resolution, Output format, “Use Google search grounding” checkbox, Custom prompt; Cancel / Generate. **[HAVE]**
36. [ ] **Render gallery**: scrollable list of generated images; each card shows thumbnail, palette name, timestamp. **[HAVE]**
37. [ ] **Select up to 2** renders for compare (e.g. checkmarks or “1”/“2”). **[HAVE]**
38. [ ] **“Compare (n/2)”** button; opens **Compare** dialog when exactly 2 selected. **[HAVE]**
39. [ ] **Compare dialog**: side-by-side two renders with labels and Close. **[HAVE]**
40. [ ] **Fullscreen** control per render (icon or click image); fullscreen dialog with image and close. **[HAVE]**
41. [ ] **Download** per render (icon); filename e.g. `alubond-render-<id>.png`. **[HAVE]**
42. [ ] **Delete** per render. **[HAVE]**
43. [ ] **Empty state** when no renders: message like “No renders yet. Click ‘Generate Render’ to capture the current view.” **[HAVE]**
44. [ ] **Loading state** while generating (skeleton or spinner + “Generating…”). **[HAVE]**

### Optional / reference-only (not in current app)
45. [ ] **BIM/DWG export** (reference: Facademaker exports files for CAD). Not in app.
46. [ ] **86 stocking colors** or official Alucobond palette data. App uses custom palettes; can be replaced or extended.
47. [ ] **Color browser filters** (by finish, temperature, color group). App uses style tabs only.
48. [ ] **Sample ordering** or “Request a Quote” from reference site. Not in app.
49. [ ] **Proportion / aspect** of panels (e.g. explicit proportion input). App uses Style (Landscape/Portrait/Square) and columns/rows; no separate proportion stepper.

---

## 5. Gaps (what Alubond Color Studio already has)

The following are **already implemented** in Alubond Color Studio; check off in the list above as you verify.

- **Landing:** Hero, three cards (Explore Gallery, Upload IFC, Upload Image), header with logo and “Color Studio,” footer.  
- **Layout:** Three columns (left 320px, center flex, right 340px), model tabs, bottom toolbar only for Facade Maker.  
- **Left panel:** “Facade Library,” tabs (Solid colours, Metallic, Wood, Anodise, Patina, Fusion), color grid with SKU + name, selected preview + Clear, Compare with palette dropdown.  
- **Bottom toolbar:** Style (Landscape/Portrait/Square), Columns stepper (2–16), Rows stepper (1–12), Transform (Flat, Alternate, Wave, Fold, Diagonal), Tilt slider 0–45° with ° label, Surface swatch + “Apply All” / “Select colour.”  
- **3D:** Procedural facade, OrbitControls, shadows, Environment, selection tool, per-panel overrides, undo/redo, hover feedback, split-view divider, preserveDrawingBuffer.  
- **Header:** Select, Undo, Redo, “N surface(s),” Compare, Snap, PDF, theme toggle.  
- **Right panel:** Renders header, AI toggle, Generate Render, AI options dialog, gallery, select 2 for Compare, Compare dialog, Fullscreen, Download, Delete, empty and loading states.  

**Not in app (candidate enhancements):**

- BIM/DWG export.  
- Official 86-color (or full) Alucobond stocking palette.  
- Color filters (finish, temperature, color group) beyond style tabs.  
- Sample ordering / Request a Quote.  
- Explicit “proportion” control (separate from Style + columns/rows).  

---

## Output summary

- **Screen flow:** Landing → Studio (left library, center 3D + model tabs + bottom bar, right renders); Facade Maker uses bottom toolbar; dialogs for AI options, Compare, Fullscreen.  
- **Feature checklist:** 49 numbered items above; items 1–44 are either implemented or directly verifiable in the current app; 45–49 are reference-only or enhancements.  
- **Gaps:** Core Facademaker-style behavior (layout, library, facade controls, transforms, tilt, apply all, selection tool, undo/redo, compare, generate, fullscreen, download) is already in place. Remaining work is verification against the video (if you export frames or describe flows), plus optional BIM export, official palettes, and extra filters.

If you can provide **screenshots or a short description of each screen** from the recording, this checklist can be updated with exact wording and any missing UI elements.
