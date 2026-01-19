# Where’s Willie 🐋

**Where’s Willie** is a web application that visualises marine mammal sightings
(whales, dolphins, seals) around the UK on an interactive map.

Users can explore sightings geographically, filter by species, and view
accessible, family-friendly information about each animal — including images,
names, locations, and interesting facts.

The project currently uses mock data, with the intention to integrate
real-world sighting data at a later stage.

---

## What this project is

At its core, *Where’s Willie* is:

- A **React + Leaflet** web app
- Focused on **clarity, maintainability, and incremental development**
- Currently built around **static data ingestion** (JSON) rather than a live backend
- Designed to be **educational and approachable** for non-expert users

Key features include:
- Interactive map with species markers
- Species-based filtering
- Zoom-dependent visibility logic
- Right-hand information panel with animal details
- Clear separation between data, layout, and presentation

---

## Agentic software development experiment

This repository is also an **experiment in agentic software development**.

Rather than using AI tools purely for code generation, this project explores:
- How AI agents can collaborate within clear architectural constraints
- How explicit guidance (`AGENTS.md`) affects code quality and consistency
- How agent-assisted development can coexist with human decision-making
- How guardrails around testing, structure, and behaviour reduce churn

The goal is not automation for its own sake, but to understand:
- when agents are helpful,
- where they introduce risk,
- and how they can be directed to behave like a thoughtful collaborator
  rather than an unchecked code generator.

All agents interacting with this repository are expected to follow the
rules and expectations defined in `AGENTS.md`.

---

## Tech stack

- **Frontend:** React (Vite)
- **Mapping:** Leaflet via `react-leaflet`
- **Styling:** CSS Grid (no CSS framework)
- **Data:** Static JSON (mock data first)
- **Planned ingestion:** Python utilities for scraping / normalisation

---

## Project structure

