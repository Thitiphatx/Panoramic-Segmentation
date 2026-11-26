# Frontend

React, TypeScript, and Vite app configured with Tailwind CSS v4, shadcn/ui, and Axios.

## Development

From this directory, install dependencies and start Vite:

```bash
npm install
npm run dev
```

The Vite development server proxies `/api` and `/health` to `http://127.0.0.1:8000`. Start the backend separately for API requests. Copy `.env.example` to `.env.local` to override `VITE_API_BASE_URL`.

React Router serves the sequence library at `/` and a sequence detail at `/sequences/:sequenceId`.

## UI components

The shadcn configuration is in `components.json`. Components are added as source under `src/components/ui/`:

```bash
npx shadcn add button
```

Use `cn` from `src/lib/utils.ts` to combine Tailwind classes. Use the shared Axios instance from `src/lib/api-client.ts` for backend requests.
