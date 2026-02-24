# Alubond Color Studio – MVP

Web app for architects and specifiers: upload a 3D building model, apply Alubond color palettes, and visualize facade finishes. Built to the [Alubond Color Studio MVP specification](docs/../Alubond_Color_Studio_MVP.pdf).

## Features

- **3D viewer** – Load GLB/GLTF building model (default sample included), orbit/zoom/pan
- **Surface selection** – Click facade elements to select; apply colors to selection
- **Curated palettes** – Modern, Metallic, Fusion, Anodise, Wood, Patina (8 palettes, 4 roles: Primary, Accent, Frame, Feature)
- **One-click apply** – Choose palette and role (Primary/Accent/Frame/Feature), selection updates in real time
- **Snapshot** – Download current view as PNG
- **Spec PDF** – Export a specification PDF (palette, colors, surface count) with optional snapshot

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # optional: preview production build
```

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** for 3D
- **jspdf** for PDF export

## Project layout

- `src/` – App, viewer, palette panel, toolbar, types, palette data
- `public/models/building/` – Sample building model (GLTF + bin + textures)
- `building-model/` – Original source model (reference)

## MVP scope (done)

- [x] GLB/GLTF upload path and default model
- [x] 3D viewer with rotate, zoom, lighting
- [x] Surface selection (click to select/deselect)
- [x] Curated Alubond palettes by style
- [x] Apply palette role to selected surfaces
- [x] Compare mode toggle (UI; full split view can be extended)
- [x] Snapshot export (PNG download)
- [x] Specification PDF export

Shareable project link and backend/API are out of scope for this MVP.
