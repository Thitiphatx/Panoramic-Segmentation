# Repository Guidelines

## Project Structure

This repository is an early-stage monorepo for panoramic semantic segmentation. `backend/src/backend/` contains the Python API package (currently a minimal stub); `training/src/training/` contains training code (currently `inference.py`). Their dependencies are managed separately by `backend/pyproject.toml` and `training/pyproject.toml` with `uv`. The React/TypeScript Vite app lives under `frontend/frontend/`, with application code in `src/` and static files in `public/`. KITTI-360 data and download scripts are under `datasets/KITTI-360/`; treat dataset content as input data, not application source. Read the directory-specific README before changing data workflows.

## Build, Test, and Development

Run frontend commands from `frontend/`:

- `npm install` installs JavaScript dependencies (use `npm ci` for a clean install when a lockfile is present).
- `npm run dev` starts the Vite development server.
- `npm run build` type-checks and creates a production build in `dist/`.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

For either Python package, run `uv sync` from its directory to install declared dependencies. There is currently no configured Python test suite or implemented backend server/training entry point; do not assume the example commands in the top-level README are runnable yet.

## Style and Naming

Follow the existing TypeScript conventions: two-space indentation, single quotes, semicolon-free statements, and React components in PascalCase. Use camelCase for TypeScript variables/functions and Python `snake_case` for modules, functions, and variables. Keep Python formatted consistently with four-space indentation. Run `npm run lint` after frontend changes; no Python formatter or linter is configured.

## Testing

No automated test framework or coverage threshold is configured. For frontend changes, run `npm run lint` and `npm run build`. For Python changes, at minimum run the affected module or command directly once a runnable entry point exists, and include reproducible validation steps in the PR.

## Commits and Pull Requests

There is no commit history yet to establish a repository-specific message convention. Use short imperative subjects (for example, `Add frame metadata loader`). PRs should explain the change and its motivation, list validation performed, link related issues when available, and include screenshots for visible UI changes. Keep datasets, generated outputs, and model checkpoints out of source changes unless specifically required.

## Data and Configuration

Do not commit downloaded KITTI-360 data, model weights, secrets, or local environment files. Keep configuration reproducible and document any new required environment variables or data paths in the relevant package README.
