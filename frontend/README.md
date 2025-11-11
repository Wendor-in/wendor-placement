# Frontend (React + Vite + TypeScript)

React 19 + Vite 7 + TypeScript setup for the Wendor application UI.

## Tech Stack
- React 19
- Vite 7 (ESBuild + Rollup hybrid)
- TypeScript 5
- ESLint (flat config) + React Hooks & Refresh plugins

## Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Type check then production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint over the project |

## Getting Started
```bash
cd frontend
npm install    # if not already
npm run dev
```
Dev server (default): http://localhost:5173

## Build
```bash
npm run build
npm run preview   # serve dist build
```

## Project Structure
```
frontend/
  src/
    main.tsx       # App bootstrap
    App.tsx        # Root component
    index.css
    App.css
  public/          # Static assets
  vite.config.ts
  tsconfig*.json
  eslint.config.js
```

## Environment Variables
Create a `.env` or `.env.local` file for custom values (example):
```
VITE_API_BASE=http://localhost:3001
VITE_VMC_WS=ws://localhost:3002
```
Access in code via `import.meta.env.VITE_API_BASE`.

## Suggested Next Steps
- Add routing (e.g. React Router)
- Add API client layer (fetch wrapper)
- Integrate real-time vending status via WebSocket
- Introduce component-level tests (Vitest + React Testing Library)

## Linking to Backend/VMC
Ensure backend runs on port 3001 and VMC mock on 3002, then use the env values above.
