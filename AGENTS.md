# AGENTS.md — Where’s Willie 🐋

This document defines how AI agents, code assistants, and contributors should
interact with this repository.

The goal is to maintain a **clean, readable, testable React codebase** while
building an interactive map-based application for UK marine mammal sightings.

---

## 🎯 Project overview

**Where’s Willie** is a React web application that visualises recent marine mammal
sightings (whales, dolphins, seals) around the UK.

Key characteristics:
- Interactive map (Leaflet via react-leaflet)
- Species-based filtering
- Zoom-dependent visualisation
- Informational side panels with species metadata
- Mock data-first, with the intention to swap in real data later

---

## 🧱 Project structure (source of truth)

src/
    components/
        Header.jsx # App title + global toggles
        Sidebar.jsx # Species filters
        MapShell.jsx # Leaflet map + markers
        InfoBar.jsx # Selected animal details (right-hand panel)
        Footer.jsx # Status + attribution
    data/
        mockSightings.js # Mock sighting data + rarity map
        speciesMeta.js # Species facts, images, friendly descriptions
    assets/
        species/ # Animal images (jpg/png/webp)
    styles/
    layout.css # CSS Grid layout (single source of layout truth)
    App.jsx # Top-level state and composition
    main.jsx # React entry point

Agents should **respect this structure** and avoid reorganising files without
explicit instruction.

---

## ⚛️ React architecture guidelines

### State ownership
- **Shared application state lives in `App.jsx`**
  - e.g. selected sighting, zoom level, filters
- Child components receive data via props
- Child components emit changes via callbacks (e.g. `onSelect`, `onToggle`)

### Components
- Components should be **small and focused**
- Each component should have a single, clear responsibility
- If a component becomes complex, split it rather than adding indirection

### Props & callbacks
- Prefer explicit props over spreading
- Callback naming convention:
  - `onSelect`
  - `onToggle`
  - `onChange`
  - `onClear`

---

## 🗺️ Map-specific rules

- Map logic lives exclusively in `MapShell.jsx`
- Use `divIcon` or simple icons unless otherwise requested
- Latitude/longitude must be numeric and in `[lat, lng]` order
- Do not introduce clustering, layers, or performance optimisations
  unless explicitly requested

---

## 🧪 Testing rules

### General
- **Do not change behaviour without updating tests**
- **Do not change tests unless behaviour is intentionally changing**
- If behaviour changes, tests must change *first* or *alongside* the code

### Adding new functionality
- Any new function or non-trivial logic **must have tests**
- Prefer **editing existing test files** over creating new ones
- Only create new test files if there is no logical home for the tests

### Modifying existing functionality
- If existing tests fail, determine whether:
  - the code is wrong → fix the code
  - the behaviour is intentionally changing → update the tests

### Current testing state
- Formal test framework may be minimal or absent
- Until a full test suite exists:
  - lightweight assertions (`console.assert`) are acceptable
  - logic should remain easy to unit-test later
- Agents should not introduce heavy testing frameworks without approval

---

## 🧹 Code quality expectations

- Prefer readability over cleverness
- Avoid unnecessary abstraction
- Avoid premature optimisation
- Use clear variable names
- Keep conditional logic explicit
- Minor duplication is acceptable if it improves clarity

---

## 🚫 Do not introduce without asking

- TypeScript migration
- State management libraries (Redux, Zustand, etc.)
- Context API for global state
- Tailwind or CSS framework replacements
- Backend services or APIs
- Automated scraping or live data ingestion

If any of the above are relevant, **ask before implementing**.

---

## ✅ Encouraged practices

- Small, incremental changes
- Clear commit-sized diffs
- Comments explaining non-obvious decisions
- Defensive coding around external data
- Maintaining mock data compatibility

---

## 🧭 Collaboration expectations

- Assume multiple contributors
- Keep changes predictable
- Avoid sweeping refactors
- Respect existing conventions
- When in doubt, ask before changing architecture

---

## 📌 Final note

This repository prioritises:
- correctness
- maintainability
- clarity

All automated agents should act accordingly.