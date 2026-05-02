---
name: copilot-instructions
description: |
  Repository-wide instructions for AI code assistance in this Academic Plus project.
  Use when: contributing, running, or modifying frontend/backend code; updating CI or developer workflows.
applyTo: "**/*"
---

# Academic Plus — Copilot Instructions

Purpose: provide concise guidance for AI assistants and contributors about project layout, build/run commands, conventions, and anti-patterns. Link to primary docs instead of copying large sections.

Key files:

- README: [README.md](README.md)
- Backend package.json: [backend/package.json](backend/package.json#L1-L50)
- Frontend package.json: [frontend/package.json](frontend/package.json#L1-L80)

Quick start commands (developer):

- Backend install & run:

  - Install: `cd backend && npm install`
  - Dev: `npm run dev` (nodemon)
  - Start: `npm start`
  - Seed demo data: `npm run seed`

- Frontend install & run:

  - Install: `cd frontend && npm install`
  - Dev server: `npm run dev`
  - Build: `npm run build`

Project structure (short): link to README for full tree and API surface. Prefer editing the README for major changes.

Conventions & Guidance for the assistant:

- JavaScript style: follow the code style already present (ES modules in frontend, CommonJS in backend). Keep changes minimal and consistent.
- Environment: backend expects `.env` with `PORT`, `MONGO_URI`, `JWT_SECRET` (see README).
- API base: frontend calls backend at `http://localhost:5000/api` by default (see `frontend/src/services/api.js`).
- Tests: there are no automated tests currently. Propose tests as a separate PR and document them in README.

Anti-patterns to avoid:

- Do not change API routes or payload shapes without updating both backend routes and frontend callers.
- Avoid committing secrets or `.env` to repo.
- Do not add global `applyTo: "**"` instruction files unless the instruction truly applies everywhere — prefer targeted globs.

If you're making a customization for a specific area (frontend/backend/tests), create a file with a targeted `applyTo` glob under `.github/instructions/` instead of editing this file.

Suggested example prompts to try with the agent:

- "Summarize the backend API routes and return a list of missing input validations."
- "Create an endpoint to export attendance CSV and add a frontend link to download it."
- "Add environment-based API base URL to the frontend and update README with how to run locally."

Next steps (if you'd like):

- I can open a PR with this file added, or update it with your preferred wording.
- I can also generate targeted per-area instruction files (e.g., `frontend.instructions.md`) — tell me which area.
